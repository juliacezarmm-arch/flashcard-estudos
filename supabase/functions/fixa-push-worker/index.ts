import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.111.0'
import webpush from 'npm:web-push@3.6.7'

type PushPref = {
  user_id: string
  enabled: boolean
  timezone: string
  reminder_time: string
  remind_not_studied_today: boolean
  remind_streak_risk: boolean
  remind_protection_progress: boolean
  protection_events: boolean
  competition_events: boolean
}

type PushSub = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

type InternalNotification = {
  id: string
  user_id: string
  notification_type: string
  title: string
  message: string
  created_at: string
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })
}

function localClock(timeZone: string, date = new Date()) {
  let zone = timeZone || 'UTC'
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone }).format(date)
  } catch (_) {
    zone = 'UTC'
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date)
  const get = (type: string) => parts.find(part => part.type === type)?.value || '00'
  const key = `${get('year')}-${get('month')}-${get('day')}`
  const minutes = Number(get('hour')) * 60 + Number(get('minute'))
  return { key, minutes }
}

function addDaysKey(key: string, delta: number) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + delta))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function reminderMinute(value: string) {
  const match = String(value || '19:00').match(/^(\d{2}):(\d{2})/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : 19 * 60
}

function categoryAllowed(pref: PushPref, type: string) {
  if (type === 'streak_freeze_earned' || type === 'streak_freeze_used') return pref.protection_events
  if (type.startsWith('competition_') || type.startsWith('shared_folder_')) return pref.competition_events
  return false
}

function maintainedStreakEndingYesterday(today: string, studied: Set<string>, protectedDays: Set<string>) {
  let count = 0
  let cursor = addDaysKey(today, -1)
  for (let i = 0; i < 400; i += 1) {
    if (!studied.has(cursor) && !protectedDays.has(cursor)) break
    count += 1
    cursor = addDaysKey(cursor, -1)
  }
  return count
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: 'supabase_not_configured' }, 500)

  const workerToken = req.headers.get('x-fixa-push-token') || ''
  if (!workerToken) return json({ error: 'unauthorized' }, 401)

  const { data: config, error: configError } = await supabase.rpc('get_push_worker_config', { p_token: workerToken })
  if (configError || !config?.authorized) return json({ error: 'unauthorized' }, 401)
  if (!config?.configured || !config?.private_key || !config?.public_key) return json({ error: 'vapid_not_configured' }, 503)

  webpush.setVapidDetails(config.subject, config.public_key, config.private_key)
  await supabase.rpc('sync_push_notification_sources', { p_token: workerToken })

  const { data: prefRows, error: prefError } = await supabase
    .from('user_push_preferences')
    .select('user_id,enabled,timezone,reminder_time,remind_not_studied_today,remind_streak_risk,remind_protection_progress,protection_events,competition_events')
    .eq('enabled', true)
  if (prefError) return json({ error: 'preferences_failed', detail: prefError.message }, 500)

  const prefs = (prefRows || []) as PushPref[]
  if (!prefs.length) return json({ sent: 0, disabled: 0, users: 0 })
  const userIds = prefs.map(pref => pref.user_id)
  const prefByUser = new Map(prefs.map(pref => [pref.user_id, pref]))

  const { data: subRows, error: subError } = await supabase
    .from('user_push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth,created_at')
    .eq('enabled', true)
    .in('user_id', userIds)
  if (subError) return json({ error: 'subscriptions_failed', detail: subError.message }, 500)
  const subscriptions = (subRows || []) as PushSub[]
  if (!subscriptions.length) return json({ sent: 0, disabled: 0, users: prefs.length })

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
  const fourHundredDaysAgo = addDaysKey(new Date().toISOString().slice(0, 10), -400)

  const [notificationsResult, eventsResult, protectedResult, deliveriesResult] = await Promise.all([
    supabase.from('user_notifications')
      .select('id,user_id,notification_type,title,message,created_at')
      .in('user_id', userIds).gte('created_at', ninetyDaysAgo).order('created_at', { ascending: true }),
    supabase.from('user_xp_events')
      .select('user_id,occurred_on').in('user_id', userIds)
      .eq('event_type', 'test_completed').gte('occurred_on', fourHundredDaysAgo),
    supabase.from('user_streak_protected_days')
      .select('user_id,protected_on').in('user_id', userIds).gte('protected_on', fourHundredDaysAgo),
    supabase.from('user_push_deliveries')
      .select('subscription_id,source_key').in('subscription_id', subscriptions.map(item => item.id))
      .gte('delivered_at', ninetyDaysAgo)
  ])

  if (notificationsResult.error || eventsResult.error || protectedResult.error || deliveriesResult.error) {
    return json({
      error: 'worker_data_failed',
      detail: notificationsResult.error?.message || eventsResult.error?.message || protectedResult.error?.message || deliveriesResult.error?.message
    }, 500)
  }

  const notifications = (notificationsResult.data || []) as InternalNotification[]
  const notificationByUser = new Map<string, InternalNotification[]>()
  for (const item of notifications) {
    const list = notificationByUser.get(item.user_id) || []
    list.push(item)
    notificationByUser.set(item.user_id, list)
  }

  const studiedByUser = new Map<string, Set<string>>()
  for (const row of eventsResult.data || []) {
    const set = studiedByUser.get(row.user_id) || new Set<string>()
    set.add(String(row.occurred_on))
    studiedByUser.set(row.user_id, set)
  }

  const protectedByUser = new Map<string, Set<string>>()
  for (const row of protectedResult.data || []) {
    const set = protectedByUser.get(row.user_id) || new Set<string>()
    set.add(String(row.protected_on))
    protectedByUser.set(row.user_id, set)
  }

  const delivered = new Set<string>((deliveriesResult.data || []).map(row => `${row.subscription_id}|${row.source_key}`))
  const deliveryRows: Array<{subscription_id:string,user_id:string,source_key:string,notification_type:string}> = []
  let sent = 0
  let disabled = 0
  let failed = 0

  async function send(sub: PushSub, sourceKey: string, type: string, title: string, body: string) {
    if (delivered.has(`${sub.id}|${sourceKey}`)) return
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, JSON.stringify({ title, body, tag: sourceKey, url: './' }), {
        TTL: 60 * 60 * 6,
        urgency: 'normal'
      })
      delivered.add(`${sub.id}|${sourceKey}`)
      deliveryRows.push({ subscription_id: sub.id, user_id: sub.user_id, source_key: sourceKey, notification_type: type })
      sent += 1
    } catch (error) {
      const statusCode = Number((error as { statusCode?: number })?.statusCode || 0)
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('user_push_subscriptions').update({ enabled: false, updated_at: new Date().toISOString() }).eq('id', sub.id)
        disabled += 1
      } else {
        console.error('[Fixa Push] Falha de envio', sub.id, statusCode, error)
        failed += 1
      }
    }
  }

  for (const sub of subscriptions) {
    const pref = prefByUser.get(sub.user_id)
    if (!pref) continue

    const createdAt = new Date(sub.created_at).getTime()
    for (const item of notificationByUser.get(sub.user_id) || []) {
      if (!categoryAllowed(pref, item.notification_type)) continue
      if (new Date(item.created_at).getTime() < createdAt) continue
      await send(sub, `notification:${item.id}`, item.notification_type, item.title, item.message)
    }

    const clock = localClock(pref.timezone)
    const target = reminderMinute(pref.reminder_time)
    const minutesAfter = clock.minutes - target
    if (minutesAfter < 0 || minutesAfter > 90) continue

    const studied = studiedByUser.get(sub.user_id) || new Set<string>()
    if (studied.has(clock.key)) continue

    const protectedDays = protectedByUser.get(sub.user_id) || new Set<string>()
    const streak = maintainedStreakEndingYesterday(clock.key, studied, protectedDays)

    let reminderType = ''
    const title = 'Hora de estudar no Fixa'
    let body = ''
    if (pref.remind_protection_progress && streak > 0 && (streak + 1) % 4 === 0) {
      reminderType = 'protection_progress'
      body = 'Falta pouco para ganhar uma proteção.'
    } else if (pref.remind_streak_risk && streak > 0) {
      reminderType = 'streak_risk'
      body = 'Não perca sua sequência.'
    } else if (pref.remind_not_studied_today) {
      reminderType = 'not_studied_today'
      body = 'Você ainda não estudou hoje.'
    }

    if (reminderType) {
      await send(sub, `reminder:${reminderType}:${clock.key}`, `reminder_${reminderType}`, title, body)
    }
  }

  if (deliveryRows.length) {
    const { error } = await supabase.from('user_push_deliveries').upsert(deliveryRows, { onConflict: 'subscription_id,source_key', ignoreDuplicates: true })
    if (error) console.error('[Fixa Push] Falha ao registrar entregas', error)
  }

  return json({ users: prefs.length, subscriptions: subscriptions.length, sent, disabled, failed })
})
