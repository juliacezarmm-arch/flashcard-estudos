(() => {
  'use strict';
  if (window.FixaWebPushV1?.active) return;

  const state = {
    settings: null,
    deviceSubscription: null,
    busy: false,
    message: '',
    messageType: 'info'
  };

  function client() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== 'undefined') return supabaseClient;
    } catch (_) {}
    return null;
  }

  function userId() {
    try {
      return window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : null) || null;
    } catch (_) {
      return null;
    }
  }

  async function rpc(name, args = {}) {
    const sb = client();
    if (!sb?.rpc) return { data: null, error: new Error('Supabase indisponível') };
    return sb.rpc(name, args);
  }

  function supported() {
    return window.isSecureContext
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  }

  function timezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (_) {
      return 'UTC';
    }
  }

  function ensureManifest() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = './manifest.webmanifest';
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#2563eb';
      document.head.appendChild(meta);
    }
  }

  function ensureStyle() {
    if (document.querySelector('#fixaWebPushV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaWebPushV1Style';
    style.textContent = `
      .fixa-push-settings{border-top:1px solid #e7ecf4;padding:13px 14px 14px;background:#fbfdff;display:grid;gap:11px}
      .fixa-push-settings-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      .fixa-push-settings-head span{display:grid;gap:2px}
      .fixa-push-settings-head strong{font-size:12px;color:#172033}
      .fixa-push-settings-head small{font-size:10px;line-height:1.4;color:#64748b}
      .fixa-push-action{min-height:32px;padding:7px 10px;border-radius:8px;font-size:11px;font-weight:800;white-space:nowrap}
      .fixa-push-action.is-disable{color:#475569;background:#eef2f7}
      .fixa-push-action.is-disable:hover{background:#e2e8f0}
      .fixa-push-options{display:grid;gap:8px}
      .fixa-push-option{display:flex;align-items:flex-start;gap:8px;color:#334155;font-size:10px;line-height:1.35;cursor:pointer}
      .fixa-push-option input{width:14px;height:14px;margin:0;flex:0 0 14px;accent-color:#2563eb}
      .fixa-push-time-row{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#334155;font-size:10px;font-weight:750}
      .fixa-push-time-row input{width:94px;min-height:30px;padding:4px 7px;border-radius:7px;font-size:11px}
      .fixa-push-save{justify-self:start;min-height:31px;padding:7px 10px;font-size:10px;font-weight:800}
      .fixa-push-note{margin:0;padding:8px 9px;border-radius:8px;background:#eff6ff;color:#1e40af;font-size:10px;line-height:1.4}
      .fixa-push-note.is-error{background:#fff1f2;color:#9f1239}
      .fixa-push-unsupported{margin:0;color:#64748b;font-size:10px;line-height:1.45}
      .fixa-push-settings button:disabled,.fixa-push-settings input:disabled{opacity:.55;cursor:not-allowed}
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
  }

  async function existingRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      return await navigator.serviceWorker.getRegistration('./');
    } catch (_) {
      return null;
    }
  }

  async function ensureRegistration() {
    let registration = await existingRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
      });
    }
    await navigator.serviceWorker.ready;
    return registration;
  }

  async function readDeviceSubscription() {
    const registration = await existingRegistration();
    state.deviceSubscription = registration ? await registration.pushManager.getSubscription() : null;
    return state.deviceSubscription;
  }

  async function loadSettings() {
    if (!userId() || !client()) return null;
    const { data, error } = await rpc('get_my_push_preferences', {});
    if (!error && data) state.settings = data;
    await readDeviceSubscription();
    return state.settings;
  }

  function setMessage(message, type = 'info') {
    state.message = message || '';
    state.messageType = type;
  }

  function panel() {
    return document.querySelector('#fixaNotificationPopover');
  }

  function renderSettings() {
    ensureStyle();
    const root = panel();
    if (!root || root.hidden) return;
    root.querySelector('.fixa-push-settings')?.remove();

    const section = document.createElement('section');
    section.className = 'fixa-push-settings';

    if (!supported()) {
      section.innerHTML = `
        <div class="fixa-push-settings-head"><span><strong>Notificações do navegador</strong><small>Web Push opcional</small></span></div>
        <p class="fixa-push-unsupported">Este navegador não oferece Web Push neste modo. A central de notificações do sino continua funcionando normalmente.</p>`;
      root.appendChild(section);
      return;
    }

    const settings = state.settings || {};
    const deviceEnabled = Boolean(state.deviceSubscription);
    const permission = Notification.permission;
    const disabled = state.busy ? ' disabled' : '';
    const optionsDisabled = (!settings.enabled || state.busy) ? ' disabled' : '';
    const actionLabel = deviceEnabled ? 'Desativar neste dispositivo' : 'Ativar neste dispositivo';
    const actionClass = deviceEnabled ? 'fixa-push-action is-disable' : 'fixa-push-action';
    const permissionText = permission === 'denied'
      ? 'A permissão está bloqueada nas configurações do navegador.'
      : deviceEnabled
        ? 'Este dispositivo pode receber avisos mesmo com o Fixa fechado.'
        : 'A ativação só acontece quando você toca no botão abaixo.';

    section.innerHTML = `
      <div class="fixa-push-settings-head">
        <span><strong>Notificações do navegador</strong><small>${escapeHtml(permissionText)}</small></span>
        <button type="button" class="${actionClass}" data-fixa-push-action="${deviceEnabled ? 'disable' : 'enable'}"${disabled}>${escapeHtml(actionLabel)}</button>
      </div>
      <div class="fixa-push-options">
        <label class="fixa-push-time-row"><span>Horário do lembrete diário</span><input type="time" data-fixa-push-time value="${escapeHtml(settings.reminder_time || '19:00')}"${optionsDisabled}></label>
        <label class="fixa-push-option"><input type="checkbox" data-fixa-push-pref="remind_not_studied_today"${settings.remind_not_studied_today !== false ? ' checked' : ''}${optionsDisabled}><span>“Você ainda não estudou hoje.”</span></label>
        <label class="fixa-push-option"><input type="checkbox" data-fixa-push-pref="remind_streak_risk"${settings.remind_streak_risk !== false ? ' checked' : ''}${optionsDisabled}><span>“Não perca sua sequência.”</span></label>
        <label class="fixa-push-option"><input type="checkbox" data-fixa-push-pref="remind_protection_progress"${settings.remind_protection_progress !== false ? ' checked' : ''}${optionsDisabled}><span>“Falta pouco para ganhar uma proteção.”</span></label>
        <label class="fixa-push-option"><input type="checkbox" data-fixa-push-pref="protection_events"${settings.protection_events !== false ? ' checked' : ''}${optionsDisabled}><span>Avisar quando uma proteção for ganha ou utilizada.</span></label>
        <label class="fixa-push-option"><input type="checkbox" data-fixa-push-pref="competition_events"${settings.competition_events !== false ? ' checked' : ''}${optionsDisabled}><span>Avisar sobre convites, início/fim de competição e pasta compartilhada.</span></label>
      </div>
      <button type="button" class="fixa-push-save" data-fixa-push-action="save"${optionsDisabled}>Salvar lembretes</button>
      ${state.message ? `<p class="fixa-push-note${state.messageType === 'error' ? ' is-error' : ''}">${escapeHtml(state.message)}</p>` : ''}
    `;
    root.appendChild(section);
  }

  async function enableDevice() {
    if (state.busy || !supported()) return;
    state.busy = true;
    setMessage('');
    renderSettings();
    try {
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('O navegador não autorizou notificações. Você pode alterar essa permissão nas configurações do site.', 'error');
        return;
      }

      const registration = await ensureRegistration();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const publicKey = state.settings?.public_key;
        if (!publicKey) throw new Error('Chave pública de Web Push indisponível.');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      const value = subscription.toJSON();
      const { data, error } = await rpc('register_my_push_subscription', {
        p_endpoint: value.endpoint,
        p_p256dh: value.keys?.p256dh || '',
        p_auth: value.keys?.auth || '',
        p_user_agent: navigator.userAgent,
        p_timezone: timezone()
      });
      if (error) throw error;
      state.settings = data || state.settings;
      state.deviceSubscription = subscription;
      setMessage('Web Push ativado neste dispositivo.');
    } catch (error) {
      console.error('[Fixa Web Push] Falha ao ativar:', error);
      setMessage(error?.message || 'Não foi possível ativar as notificações do navegador.', 'error');
    } finally {
      state.busy = false;
      renderSettings();
    }
  }

  async function disableDevice() {
    if (state.busy) return;
    state.busy = true;
    setMessage('');
    renderSettings();
    try {
      const subscription = state.deviceSubscription || await readDeviceSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        const { data, error } = await rpc('remove_my_push_subscription', { p_endpoint: endpoint });
        if (error) throw error;
        state.settings = data || state.settings;
        await subscription.unsubscribe();
      }
      state.deviceSubscription = null;
      setMessage('Web Push desativado neste dispositivo.');
    } catch (error) {
      console.error('[Fixa Web Push] Falha ao desativar:', error);
      setMessage(error?.message || 'Não foi possível desativar o Web Push.', 'error');
    } finally {
      state.busy = false;
      renderSettings();
    }
  }

  async function savePreferences() {
    if (state.busy || !state.settings?.enabled) return;
    const root = panel();
    if (!root) return;
    const checked = name => Boolean(root.querySelector(`[data-fixa-push-pref="${name}"]`)?.checked);
    const values = {
      reminderTime: root.querySelector('[data-fixa-push-time]')?.value || state.settings.reminder_time || '19:00',
      remindNotStudiedToday: checked('remind_not_studied_today'),
      remindStreakRisk: checked('remind_streak_risk'),
      remindProtectionProgress: checked('remind_protection_progress'),
      protectionEvents: checked('protection_events'),
      competitionEvents: checked('competition_events')
    };
    state.busy = true;
    setMessage('');
    renderSettings();
    try {
      const { data, error } = await rpc('update_my_push_preferences', {
        p_reminder_time: values.reminderTime,
        p_timezone: timezone(),
        p_remind_not_studied_today: values.remindNotStudiedToday,
        p_remind_streak_risk: values.remindStreakRisk,
        p_remind_protection_progress: values.remindProtectionProgress,
        p_protection_events: values.protectionEvents,
        p_competition_events: values.competitionEvents
      });
      if (error) throw error;
      state.settings = data || state.settings;
      setMessage('Preferências de Web Push salvas.');
    } catch (error) {
      console.error('[Fixa Web Push] Falha ao salvar:', error);
      setMessage(error?.message || 'Não foi possível salvar as preferências.', 'error');
    } finally {
      state.busy = false;
      renderSettings();
    }
  }

  async function openBellWithPush() {
    const api = window.FixaNotificationsV1;
    if (!api?.open) return false;
    await api.open();
    setMessage('');
    await loadSettings();
    renderSettings();
    return true;
  }

  document.addEventListener('click', event => {
    const bell = event.target.closest('#homeTopTools .home-top-bell');
    if (bell && window.FixaNotificationsV1) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const popover = panel();
      if (popover && !popover.hidden) window.FixaNotificationsV1.close();
      else openBellWithPush();
      return;
    }

    const action = event.target.closest('[data-fixa-push-action]');
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    if (action.dataset.fixaPushAction === 'enable') enableDevice();
    else if (action.dataset.fixaPushAction === 'disable') disableDevice();
    else if (action.dataset.fixaPushAction === 'save') savePreferences();
  }, true);

  window.FixaWebPushV1 = {
    active: true,
    refresh: async () => {
      await loadSettings();
      renderSettings();
    },
    enable: enableDevice,
    disable: disableDevice
  };

  ensureManifest();
  ensureStyle();
})();
