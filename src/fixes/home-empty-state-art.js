/* Compatibilidade: este arquivo não altera mais a Home.
   Mantém somente a recuperação de falhas temporárias da Competição. */
(() => {
  'use strict';

  if (window.FixaCompetitionFetchRecovery) return;
  window.FixaCompetitionFetchRecovery = true;

  const RETRYABLE_ERROR = /failed to fetch|networkerror|network request failed|load failed|fetch failed/i;
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function isRetryable(error) {
    return RETRYABLE_ERROR.test(String(error?.message || error || ''));
  }

  function wrapSupabaseRpc() {
    const client = window.supabaseClient;
    if (!client || typeof client.rpc !== 'function') return false;
    if (client.__fixaRpcRetryWrapped) return true;

    const originalRpc = client.rpc.bind(client);
    client.rpc = async function fixaRpcWithRetry(functionName, parameters, options) {
      let result;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          result = await originalRpc(functionName, parameters, options);
        } catch (error) {
          result = { data: null, error };
        }
        if (!result?.error || !isRetryable(result.error) || attempt === 2) return result;
        await sleep(500 * (2 ** attempt));
      }
      return result;
    };

    Object.defineProperty(client, '__fixaRpcRetryWrapped', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });
    return true;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (wrapSupabaseRpc() || attempts >= 20) window.clearInterval(timer);
  }, 500);
  wrapSupabaseRpc();

  function competitionTab() {
    return document.querySelector('[data-competition-view="v3"]');
  }

  function retryCompetition() {
    competitionTab()?.click();
  }

  function replaceTechnicalError() {
    const root = document.querySelector('.competition-v3.active #cv3');
    if (!root || root.querySelector('[data-competition-retry]')) return;
    if (!RETRYABLE_ERROR.test((root.textContent || '').trim())) return;

    root.innerHTML = `
      <div class="cv3-card" style="display:grid;gap:12px;justify-items:start">
        <h3 style="margin:0">Não foi possível carregar a competição</h3>
        <p class="cv3-muted" style="margin:0">A conexão com o servidor falhou temporariamente. Seus dados não foram apagados.</p>
        <button type="button" data-competition-retry>Tentar novamente</button>
      </div>
    `;
    root.querySelector('[data-competition-retry]')?.addEventListener('click', retryCompetition);
  }

  let scheduled = false;
  function scheduleRecovery() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      wrapSupabaseRpc();
      replaceTechnicalError();
    });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view="v3"], .competition-v3 button, .competition-v3 select')) {
      window.setTimeout(scheduleRecovery, 80);
    }
  });

  window.addEventListener('online', () => {
    if (document.querySelector('[data-competition-retry]')) retryCompetition();
  });

  window.addEventListener('load', scheduleRecovery, { once:true });
  scheduleRecovery();
})();

/* ===== Central de notificações internas — Etapa 4 ===== */
(() => {
  'use strict';
  if (window.FixaNotificationsV1?.active) return;

  const state = {
    items: [],
    unread: 0,
    loading: false,
    open: false
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

  async function rpc(name, args = {}) {
    const client = getClient();
    if (!client?.rpc) return { data: null, error: new Error('Supabase indisponível') };
    return client.rpc(name, args);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function ensureStyle() {
    if (document.querySelector('#fixaNotificationsV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaNotificationsV1Style';
    style.textContent = `
      #homeTopTools{position:relative}
      .home-top-bell{position:relative}
      .fixa-notification-badge{position:absolute;top:5px;right:5px;width:8px;height:8px;border:2px solid #fff;border-radius:999px;background:#2563eb;box-sizing:content-box;pointer-events:none}
      .fixa-notification-popover{position:absolute;z-index:210;top:calc(100% + 10px);right:0;width:min(390px,calc(100vw - 28px));max-height:min(520px,72vh);border:1px solid #dbe3ef;border-radius:14px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.18);overflow:hidden;color:#172033}
      .fixa-notification-popover[hidden]{display:none!important}
      .fixa-notification-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px 12px;border-bottom:1px solid #e7ecf4;background:#fff}
      .fixa-notification-head strong{font-size:15px;line-height:1.2}
      .fixa-notification-head small{color:#64748b;font-size:11px;font-weight:700;white-space:nowrap}
      .fixa-notification-list{display:grid;max-height:440px;overflow-y:auto;overscroll-behavior:contain}
      .fixa-notification-item{display:grid;grid-template-columns:34px minmax(0,1fr) 7px;gap:10px;align-items:start;padding:12px 14px;border-bottom:1px solid #eef2f7;background:#fff}
      .fixa-notification-item:last-child{border-bottom:0}
      .fixa-notification-item.is-unread{background:#f7faff}
      .fixa-notification-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:#eff6ff;color:#1d4ed8;font-size:16px;line-height:1}
      .fixa-notification-copy{min-width:0;display:grid;gap:3px}
      .fixa-notification-copy strong{color:#172033;font-size:12px;line-height:1.35;font-weight:850}
      .fixa-notification-copy p{margin:0;color:#59677f;font-size:11px;line-height:1.45;overflow-wrap:anywhere}
      .fixa-notification-copy time{color:#94a3b8;font-size:10px;line-height:1.3;font-weight:650}
      .fixa-notification-unread-dot{width:7px;height:7px;margin-top:5px;border-radius:999px;background:#2563eb}
      .fixa-notification-item:not(.is-unread) .fixa-notification-unread-dot{visibility:hidden}
      .fixa-notification-empty{padding:28px 18px;text-align:center;color:#64748b;font-size:12px;line-height:1.5}
      @media(max-width:760px){.fixa-notification-popover{position:fixed;top:64px;right:12px;left:12px;width:auto;max-height:min(520px,72vh)}.fixa-notification-list{max-height:calc(72vh - 54px)}}
    `;
    document.head.appendChild(style);
  }

  function iconFor(type) {
    if (type === 'streak_freeze_earned' || type === 'streak_freeze_used') return '❄';
    if (type === 'shared_folder_available' || type === 'shared_folder_updated') return '📁';
    return '🏆';
  }

  function formatWhen(value) {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round((today - target) / 86400000);
    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    if (dayDiff === 0) return `Hoje, ${time}`;
    if (dayDiff === 1) return `Ontem, ${time}`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  function bell() {
    return document.querySelector('#homeTopTools .home-top-bell');
  }

  function ensureUi() {
    ensureStyle();
    const button = bell();
    const tools = document.querySelector('#homeTopTools');
    if (!button || !tools) return null;

    button.id = 'homeTopBell';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', String(state.open));

    let badge = button.querySelector('.fixa-notification-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'fixa-notification-badge';
      badge.setAttribute('aria-hidden', 'true');
      button.appendChild(badge);
    }

    let popover = tools.querySelector('#fixaNotificationPopover');
    if (!popover) {
      popover = document.createElement('section');
      popover.id = 'fixaNotificationPopover';
      popover.className = 'fixa-notification-popover';
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-label', 'Notificações');
      popover.hidden = true;
      tools.appendChild(popover);
    }
    return popover;
  }

  function updateBadge() {
    const button = bell();
    if (!button) return;
    const badge = button.querySelector('.fixa-notification-badge');
    if (badge) badge.hidden = state.unread <= 0;
    button.setAttribute('aria-label', state.unread > 0 ? `Notificações — ${state.unread} não lida${state.unread === 1 ? '' : 's'}` : 'Notificações');
    button.title = state.unread > 0 ? `${state.unread} notificação${state.unread === 1 ? '' : 'ões'} não lida${state.unread === 1 ? '' : 's'}` : 'Notificações';
  }

  function render() {
    const popover = ensureUi();
    if (!popover) return;

    const status = state.unread > 0 ? `${state.unread} não lida${state.unread === 1 ? '' : 's'}` : 'Tudo em dia';
    const body = state.loading && !state.items.length
      ? '<div class="fixa-notification-empty">Carregando notificações…</div>'
      : state.items.length
        ? `<div class="fixa-notification-list">${state.items.map(item => {
            const unread = !item?.read_at;
            return `<article class="fixa-notification-item${unread ? ' is-unread' : ''}" data-notification-id="${esc(item?.id || '')}">
              <span class="fixa-notification-icon" aria-hidden="true">${iconFor(item?.notification_type)}</span>
              <div class="fixa-notification-copy">
                <strong>${esc(item?.title || 'Notificação')}</strong>
                <p>${esc(item?.message || '')}</p>
                <time datetime="${esc(item?.created_at || '')}">${esc(formatWhen(item?.created_at))}</time>
              </div>
              <span class="fixa-notification-unread-dot" aria-hidden="true"></span>
            </article>`;
          }).join('')}</div>`
        : '<div class="fixa-notification-empty">Nenhuma notificação por enquanto.</div>';

    popover.innerHTML = `<div class="fixa-notification-head"><strong>Notificações</strong><small>${esc(status)}</small></div>${body}`;
    updateBadge();
  }

  async function markVisibleAsRead() {
    const ids = state.items.filter(item => !item?.read_at && item?.id).map(item => item.id);
    if (!ids.length) return;
    const { error } = await rpc('mark_my_notifications_read', { p_ids: ids });
    if (error) return;
    const now = new Date().toISOString();
    state.items.forEach(item => { if (ids.includes(item.id)) item.read_at = now; });
    state.unread = 0;
    updateBadge();
  }

  async function refresh() {
    if (state.loading || !getUserId() || !getClient()) return;
    state.loading = true;
    render();
    try {
      const { data: result, error } = await rpc('sync_my_notifications', {});
      if (!error && result) {
        state.items = Array.isArray(result.items) ? result.items : [];
        state.unread = Math.max(0, Number(result.unread_count || 0));
      }
    } catch (_) {
    } finally {
      state.loading = false;
      render();
    }
  }

  function close() {
    const popover = ensureUi();
    if (!popover) return;
    state.open = false;
    popover.hidden = true;
    bell()?.setAttribute('aria-expanded', 'false');
  }

  async function open() {
    const popover = ensureUi();
    if (!popover) return;
    const streakPopover = document.querySelector('#homeStreakPopover');
    if (streakPopover) streakPopover.hidden = true;
    document.querySelector('#homeTopStreak')?.setAttribute('aria-expanded', 'false');

    state.open = true;
    popover.hidden = false;
    bell()?.setAttribute('aria-expanded', 'true');
    render();
    await refresh();
    await markVisibleAsRead();
  }

  function toggle() {
    if (state.open) close();
    else open();
  }

  function bind() {
    const button = bell();
    if (!button || button.dataset.fixaNotificationsBound === 'true') return false;
    button.dataset.fixaNotificationsBound = 'true';
    button.addEventListener('click', event => {
      event.stopPropagation();
      toggle();
    });
    document.addEventListener('click', event => {
      if (!state.open) return;
      if (event.target.closest('#fixaNotificationPopover, #homeTopBell')) return;
      close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.open) close();
    });
    return true;
  }

  window.FixaNotificationsV1 = {
    active: true,
    refresh,
    open,
    close,
    get unread() { return state.unread; }
  };

  ensureUi();
  bind();
  refresh();
  window.addEventListener('load', () => { bind(); refresh(); }, { once: true });
  window.addEventListener('focus', refresh);
  window.addEventListener('fixa-xp-updated', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
})();
