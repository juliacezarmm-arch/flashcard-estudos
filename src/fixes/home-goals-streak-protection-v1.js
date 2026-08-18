(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV1?.active) return;

  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const state = {
    protection: { available: 0, maximum: 3, protected_days: [] },
    weekXp: 0,
    syncingProtection: false,
    loadingXp: false,
    awardingGoals: false,
    toastQueue: [],
    toastActive: false
  };

  const api = window.FixaHomeGoalsStreakProtectionV1 = {
    active: true,
    refresh: refreshData,
    get weekXp() { return Math.max(0, Number(state.weekXp || 0)); },
    get protection() { return state.protection; }
  };

  function getClient() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== 'undefined') return supabaseClient;
    } catch (_) {}
    return null;
  }

  function getUserId() {
    try {
      return window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : null) || null;
    } catch (_) {
      return null;
    }
  }

  function startOfDay(base = new Date()) {
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function startOfWeek(base = new Date()) {
    const date = startOfDay(base);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return date;
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function normalizedDateKey(value) {
    const exact = typeof value === 'string' ? value.trim() : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(exact)) return exact;
    const date = value instanceof Date ? value : new Date(value || 0);
    return Number.isNaN(date.getTime()) ? '' : localDateKey(date);
  }

  function protectedDaySet() {
    const values = Array.isArray(state.protection?.protected_days) ? state.protection.protected_days : [];
    return new Set(values.map(normalizedDateKey).filter(Boolean));
  }

  function currentRange() {
    const period = document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
    const now = new Date();
    if (period === 'today') {
      const start = startOfDay(now);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { period, start, end };
    }
    if (period === 'month') {
      return {
        period,
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { period, start, end };
  }

  async function rpc(name, args = {}) {
    const client = getClient();
    if (!client) return { data: null, error: new Error('Supabase indisponível') };
    return client.rpc(name, args);
  }

  // O visual dos cards de XP pertence exclusivamente ao renderizador principal da Home.
  // Este módulo cuida apenas dos dados de XP/proteção e não reescreve mais títulos, cores ou números.
  function queueXpCardPolish() {}

  function removeGoalChooser() {
    document.querySelectorAll('[data-fixa-add-goals]').forEach(button => button.remove());
  }

  function applyProtectedCalendarVisuals() {
    const protectedDays = protectedDaySet();
    const weekStart = startOfWeek(new Date());

    document.querySelectorAll('.home-sequence-days').forEach(container => {
      const days = Array.from(container.querySelectorAll('.home-sequence-day')).slice(0, 7);
      days.forEach((element, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = localDateKey(date);
        const isProtected = protectedDays.has(key);
        element.classList.toggle('is-protected', isProtected);
        if (!isProtected) return;
        element.classList.remove('is-lost', 'is-study');
        const label = `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)}: sequência protegida`;
        element.title = label;
        element.setAttribute('aria-label', label);
      });
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    document.querySelectorAll('#homeStreakPopover .home-streak-day:not(.is-empty)').forEach(element => {
      const day = Number((element.textContent || '').trim());
      if (!Number.isInteger(day) || day < 1 || day > 31) return;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isProtected = protectedDays.has(key);
      element.classList.toggle('is-protected', isProtected);
      if (isProtected) element.classList.remove('is-study');
    });

    const streak = Number(window.FixaSequenceVisualFix?.count?.());
    if (Number.isFinite(streak)) {
      document.querySelectorAll('.home-sequence-summary strong').forEach(element => {
        element.textContent = String(streak);
      });
    }
  }

  function notifyHome() {
    if (typeof window.FixaHomeWeeklyDashboardV2?.refresh === 'function') {
      window.FixaHomeWeeklyDashboardV2.refresh();
    }
    if (typeof window.FixaHomeUnifiedDashboardV2?.refresh === 'function') {
      window.FixaHomeUnifiedDashboardV2.refresh();
    }
    removeGoalChooser();
    requestAnimationFrame(() => {
      applyProtectedCalendarVisuals();
      window.FixaSequenceVisualFix?.refresh?.();
    });
  }

  async function loadWeekXp() {
    if (state.loadingXp || !getUserId()) return;
    const client = getClient();
    if (!client?.from) return;

    state.loadingXp = true;
    try {
      const start = startOfWeek(new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const { data: rows, error } = await client
        .from('user_xp_events')
        .select('points,occurred_on')
        .gte('occurred_on', localDateKey(start))
        .lte('occurred_on', localDateKey(end));

      if (!error && Array.isArray(rows)) {
        state.weekXp = rows.reduce((sum, row) => sum + Math.max(0, Number(row?.points || 0)), 0);
      }
    } catch (_) {
    } finally {
      state.loadingXp = false;
      notifyHome();
    }
  }

  function findTopbarStreakBox() {
    const right = document.querySelector('.topbar-right');
    if (!right) return null;
    return Array.from(right.querySelectorAll('button,div,span')).find(element => {
      if (element.classList.contains('fixa-streak-freeze-box')) return false;
      return /^\s*[^\d]*\d+\s+dias?\s*$/i.test((element.textContent || '').trim());
    }) || right.querySelector('[class*=streak], [class*=sequence]');
  }

  function matchFreezeToStreak(box, streakBox) {
    if (!box || !streakBox) return;
    const rect = streakBox.getBoundingClientRect();
    const css = getComputedStyle(streakBox);
    if (!rect.width || !rect.height) return;

    box.style.setProperty('width', `${rect.width}px`, 'important');
    box.style.setProperty('min-width', `${rect.width}px`, 'important');
    box.style.setProperty('max-width', `${rect.width}px`, 'important');
    box.style.setProperty('height', `${rect.height}px`, 'important');
    box.style.setProperty('min-height', `${rect.height}px`, 'important');
    box.style.setProperty('max-height', `${rect.height}px`, 'important');
    box.style.setProperty('padding', css.padding, 'important');
    box.style.setProperty('border-radius', css.borderRadius, 'important');
    box.style.setProperty('font-size', css.fontSize, 'important');
    box.style.setProperty('font-weight', css.fontWeight, 'important');
    box.style.setProperty('line-height', css.lineHeight, 'important');
    box.style.setProperty('box-sizing', css.boxSizing, 'important');

    const streakText = Array.from(streakBox.querySelectorAll('span,b,strong')).find(element =>
      /\d+\s+dias?/i.test((element.textContent || '').trim())
    ) || streakBox;
    const streakTextCss = getComputedStyle(streakText);
    const freezeCount = box.querySelector('span');
    if (freezeCount) {
      freezeCount.style.setProperty('font-size', streakTextCss.fontSize, 'important');
      freezeCount.style.setProperty('font-weight', streakTextCss.fontWeight, 'important');
      freezeCount.style.setProperty('line-height', streakTextCss.lineHeight, 'important');
    }
  }

  function ensureProtectionStyle() {
    if (document.getElementById('fixaHomeProtectionDataStyle')) return;
    const style = document.createElement('style');
    style.id = 'fixaHomeProtectionDataStyle';
    style.textContent = `
      [data-fixa-add-goals]{display:none!important}
      .fixa-streak-help{position:relative;width:0;height:38px;display:block;flex:0 0 0;overflow:visible;z-index:271}
      .fixa-streak-help-button{position:absolute;right:10px;top:0;width:38px;height:38px;padding:0;border:1px solid #bfd4ff;border-radius:50%;display:inline-grid;place-items:center;background:#fff;color:#1d4ed8;font-size:16px;font-weight:850;line-height:1;box-shadow:0 2px 8px rgba(37,99,235,.08);cursor:pointer;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease}
      .fixa-streak-help-button:hover,.fixa-streak-help-button[aria-expanded="true"]{border-color:#93b7ff;background:#f6f9ff;color:#1746a2;box-shadow:0 4px 12px rgba(37,99,235,.12)}
      .fixa-streak-help-popover{position:absolute;z-index:270;top:48px;right:10px;width:min(320px,calc(100vw - 24px));padding:14px 15px;border:1px solid #dbe6f5;border-radius:12px;background:#fff;color:#334155;box-shadow:0 16px 40px rgba(15,23,42,.16);font-size:12px;line-height:1.5;text-align:left}
      .fixa-streak-help-popover[hidden]{display:none!important}
      .fixa-streak-help-popover h4{margin:0 0 9px;color:#172033;font-size:14px;line-height:1.25}
      .fixa-streak-help-popover ul{margin:0;padding-left:18px;display:grid;gap:6px}
      .fixa-streak-help-popover strong{color:#1d4ed8}
      .fixa-streak-freeze-box{height:38px;border:1px solid #c8dcff;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#1d4ed8;background:#edf5ff;font-size:13px;font-weight:850;box-shadow:none;white-space:nowrap;box-sizing:border-box}
      .fixa-streak-freeze-box img{width:18px;height:18px;object-fit:contain;display:block;flex:0 0 18px}
      .fixa-streak-freeze-box span{font-size:13px;font-weight:850;line-height:1}
      .fixa-streak-freeze-box:hover{background:#e7f1ff;border-color:#b8d1ff}
      .home-sequence-day.is-protected i,[data-home-panel="progress"] .home-sequence-day.is-protected i{border-color:#3b82f6!important;background:#2563eb!important;color:#fff!important}
      .home-sequence-day.is-protected i>*,[data-home-panel="progress"] .home-sequence-day.is-protected i>*{display:none!important}
      .home-sequence-day.is-protected i::before,[data-home-panel="progress"] .home-sequence-day.is-protected i::before{content:'❄';display:block;color:#fff;font-size:15px;font-weight:800;line-height:1}
      .home-streak-day.is-protected{background:#2563eb!important;color:#fff!important;font-weight:800!important}
      .home-streak-day.is-protected.is-today{outline-color:#1d4ed8!important;color:#fff!important}
      .fixa-streak-protection-toast{position:fixed;z-index:220;top:18px;left:50%;max-width:min(92vw,520px);padding:11px 15px;border:1px solid #bfdbfe;border-radius:10px;color:#1e3a8a;background:#eff6ff;box-shadow:0 12px 32px rgba(15,23,42,.16);font-size:13px;font-weight:750;line-height:1.4;text-align:center;opacity:0;pointer-events:none;transform:translate(-50%,-8px);transition:opacity .18s ease,transform .18s ease}
      .fixa-streak-protection-toast.is-visible{opacity:1;transform:translate(-50%,0)}
      @media(max-width:760px){.fixa-streak-protection-toast{top:12px;font-size:12px;padding:10px 12px}.fixa-streak-help-popover{right:-78px}}
    `;
    document.head.appendChild(style);
  }

  function closeProtectionHelp() {
    const help = document.querySelector('.fixa-streak-help');
    const button = help?.querySelector('.fixa-streak-help-button');
    const popover = help?.querySelector('.fixa-streak-help-popover');
    if (popover) popover.hidden = true;
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function ensureProtectionHelp(right, freezeBox) {
    if (!right || !freezeBox) return;
    let help = right.querySelector('.fixa-streak-help');
    if (!help) {
      help = document.createElement('div');
      help.className = 'fixa-streak-help';
      help.innerHTML = `
        <button class="fixa-streak-help-button" type="button" aria-label="Como funciona a proteção de sequência" aria-expanded="false" aria-controls="fixaStreakHelpPopover">?</button>
        <div class="fixa-streak-help-popover" id="fixaStreakHelpPopover" role="dialog" aria-label="Como funciona a proteção de sequência" hidden>
          <h4>Como funciona a proteção</h4>
          <ul>
            <li>Você ganha <strong>1 proteção a cada 4 dias consecutivos</strong> estudando.</li>
            <li>É possível acumular no máximo <strong>3 proteções</strong>.</li>
            <li>Se perder um dia, <strong>1 proteção é usada automaticamente</strong> e sua sequência continua.</li>
            <li>O dia salvo pela proteção aparece em <strong>azul</strong> no calendário.</li>
            <li>Completar <strong>100% dos objetivos da semana</strong> também pode conceder +1 proteção, respeitando o limite de 3.</li>
          </ul>
        </div>`;
      const button = help.querySelector('.fixa-streak-help-button');
      const popover = help.querySelector('.fixa-streak-help-popover');
      button.addEventListener('click', () => {
        const shouldOpen = popover.hidden;
        closeProtectionHelp();
        popover.hidden = !shouldOpen;
        button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      });
    }
    if (freezeBox.parentElement && help.parentElement === freezeBox.parentElement) {
      freezeBox.parentElement.insertBefore(help, freezeBox);
    } else if (freezeBox.parentElement) {
      freezeBox.parentElement.insertBefore(help, freezeBox);
    }
  }

  function ensureProtectionToast() {
    ensureProtectionStyle();
    let toast = document.querySelector('#fixaStreakProtectionToast');
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'fixaStreakProtectionToast';
    toast.className = 'fixa-streak-protection-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toast);
    return toast;
  }

  function runProtectionToastQueue() {
    if (state.toastActive || !state.toastQueue.length) return;
    const message = state.toastQueue.shift();
    const toast = ensureProtectionToast();
    state.toastActive = true;
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        state.toastActive = false;
        runProtectionToastQueue();
      }, 220);
    }, 2600);
  }

  function queueProtectionToast(message) {
    if (!message) return;
    state.toastQueue.push(message);
    runProtectionToastQueue();
  }

  function showProtectionFeedback(result) {
    const awards = Array.isArray(result?.awarded_events) ? result.awarded_events : [];
    const usedDays = Array.isArray(result?.used_days) ? result.used_days : [];
    const events = [
      ...awards.map(item => ({
        type: 'award',
        date: normalizedDateKey(item?.occurred_on),
        message: `Você ganhou uma proteção de sequência — ${Math.max(0, Number(item?.available || 0))} de ${Math.max(1, Number(item?.maximum || 3))}`
      })),
      ...usedDays.map(value => ({
        type: 'used',
        date: normalizedDateKey(value),
        message: 'Proteção utilizada — sua sequência foi mantida'
      }))
    ].sort((a, b) => a.date.localeCompare(b.date) || (a.type === 'award' ? -1 : 1));

    events.forEach(event => queueProtectionToast(event.message));
  }

  function renderProtectionBox() {
    ensureProtectionStyle();
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    const streakBox = findTopbarStreakBox();
    let box = right.querySelector('.fixa-streak-freeze-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'fixa-streak-freeze-box';
      box.title = 'Proteção de sequência';
      if (streakBox?.parentElement) streakBox.parentElement.insertBefore(box, streakBox);
      else right.prepend(box);
    }
    ensureProtectionHelp(right, box);
    box.innerHTML = `<img src="${FROZEN_FIRE_SRC}" alt=""><span>${Math.max(0, Number(state.protection?.available || 0))}</span>`;
    requestAnimationFrame(() => matchFreezeToStreak(box, findTopbarStreakBox()));
  }

  async function syncProtection() {
    if (state.syncingProtection || !getUserId() || !getClient()) return;
    state.syncingProtection = true;
    try {
      const { data: result } = await rpc('sync_streak_protection', {});
      if (result) {
        state.protection = {
          available: Math.max(0, Number(result.available || 0)),
          maximum: Math.max(1, Number(result.maximum || 3)),
          protected_days: Array.isArray(result.protected_days) ? result.protected_days : []
        };
        showProtectionFeedback(result);
      }
    } catch (_) {
    } finally {
      state.syncingProtection = false;
      renderProtectionBox();
      notifyHome();
    }
  }

  function goalValues() {
    return Array.from(document.querySelectorAll('#homeGoals .fixa-week-goal')).map((card, index) => {
      const small = card.querySelector('small')?.textContent || '';
      const match = small.match(/(\d+)\s*\/\s*(\d+)/);
      return {
        index,
        current: Number(match?.[1] || 0),
        target: Number(match?.[2] || 0),
        reward: [20, 25, 40][index] || 20
      };
    });
  }

  async function awardCompletedGoals() {
    if (state.awardingGoals || !getUserId() || !getClient()) return;
    state.awardingGoals = true;
    try {
      const range = currentRange();
      const keyBase = `${range.period}:${localDateKey(range.start)}`;
      const goals = goalValues();
      for (const goal of goals) {
        if (!goal.target || goal.current < goal.target) continue;
        await rpc('record_user_xp', {
          p_event_type: 'weekly_goal',
          p_source_key: `home-goal:${keyBase}:${goal.index}`,
          p_occurred_on: localDateKey(new Date()),
          p_folder_id: null,
          p_folder_name: null,
          p_subject_ids: [],
          p_metadata: { reward_points: goal.reward, goal_index: goal.index }
        });
      }

      const weeklyComplete = range.period === 'week'
        && goals.length >= 3
        && goals.every(goal => goal.target > 0 && goal.current >= goal.target);

      if (weeklyComplete) {
        const { data: reward } = await rpc('award_streak_freeze', {
          p_source_key: `weekly-goal:${localDateKey(range.start)}`
        });
        if (reward) {
          state.protection = {
            available: Math.max(0, Number(reward.available || 0)),
            maximum: Math.max(1, Number(reward.maximum || 3)),
            protected_days: Array.isArray(reward.protected_days) ? reward.protected_days : []
          };
          if (reward.awarded) {
            queueProtectionToast(`Você ganhou uma proteção de sequência — ${state.protection.available} de ${state.protection.maximum}`);
          }
          renderProtectionBox();
          notifyHome();
        }
      }
    } catch (_) {
    } finally {
      state.awardingGoals = false;
      await loadWeekXp();
    }
  }

  async function refreshData() {
    renderProtectionBox();
    removeGoalChooser();
    await Promise.all([loadWeekXp(), syncProtection()]);
    await awardCompletedGoals();
    removeGoalChooser();
    requestAnimationFrame(applyProtectedCalendarVisuals);
  }

  window.addEventListener('fixa-xp-updated', loadWeekXp);
  window.addEventListener('load', refreshData, { once: true });
  document.addEventListener('click', event => {
    if (!event.target.closest('.fixa-streak-help')) closeProtectionHelp();
    if (event.target.closest('#homeTopStreak')) {
      requestAnimationFrame(applyProtectedCalendarVisuals);
    }
    if (!event.target.closest('[data-view="home"], #homeTopTab, [data-fixa-main-tab], [data-fixa-week-period]')) return;
    requestAnimationFrame(() => {
      removeGoalChooser();
      applyProtectedCalendarVisuals();
    });
  }, true);
  renderProtectionBox();
  removeGoalChooser();
  refreshData();
})();