/* Fixa: recovery helpers + unified Home activity tab */

(() => {
  if (window.FixaCompetitionFetchRecovery) return;
  window.FixaCompetitionFetchRecovery = true;

  const RETRYABLE_ERROR = /failed to fetch|networkerror|network request failed|load failed|fetch failed/i;
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function isRetryable(error) {
    const message = String(error?.message || error || '');
    return RETRYABLE_ERROR.test(message);
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

  let wrapAttempts = 0;
  const wrapTimer = window.setInterval(() => {
    wrapAttempts += 1;
    if (wrapSupabaseRpc() || wrapAttempts >= 20) window.clearInterval(wrapTimer);
  }, 500);
  wrapSupabaseRpc();

  function competitionTab() {
    return document.querySelector('[data-competition-view="v3"]');
  }

  function retryCompetition() {
    const tab = competitionTab();
    if (tab) tab.click();
  }

  function replaceTechnicalError() {
    const root = document.querySelector('.competition-v3.active #cv3');
    if (!root || root.querySelector('[data-competition-retry]')) return;

    const message = (root.textContent || '').trim();
    if (!RETRYABLE_ERROR.test(message)) return;

    root.innerHTML = `
      <div class="cv3-card" style="display:grid;gap:12px;justify-items:start">
        <h3 style="margin:0">Não foi possível carregar a competição</h3>
        <p class="cv3-muted" style="margin:0">A conexão com o servidor falhou temporariamente. Seus dados não foram apagados.</p>
        <button type="button" data-competition-retry>Tentar novamente</button>
      </div>
    `;
    root.querySelector('[data-competition-retry]')?.addEventListener('click', retryCompetition);
  }

  let recoveryScheduled = false;
  const scheduleRecovery = () => {
    if (recoveryScheduled) return;
    recoveryScheduled = true;
    requestAnimationFrame(() => {
      recoveryScheduled = false;
      wrapSupabaseRpc();
      replaceTechnicalError();
    });
  };

  function recoveryBurst() {
    [80, 350, 900].forEach(delay => window.setTimeout(scheduleRecovery, delay));
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view="v3"], .competition-v3 button, .competition-v3 select')) recoveryBurst();
  }, true);

  window.addEventListener('online', () => {
    const retryButton = document.querySelector('[data-competition-retry]');
    if (retryButton) retryCompetition();
  });

  window.addEventListener('load', recoveryBurst, { once:true });
  recoveryBurst();
})();

(() => {
  'use strict';

  if (window.FixaHomeUnifiedActivityV1) return;
  window.FixaHomeUnifiedActivityV1 = true;

  const STYLE_ID = 'fixaHomeUnifiedActivityStyle';
  const tones = ['green', 'purple', 'amber', 'blue', 'pink'];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  }

  function subjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function subjectFor(test) {
    return subjects().find(subject => String(subject.id || '') === String(test?.subjectId || ''))
      || subjects().find(subject => subject.name === test?.subject)
      || null;
  }

  function subjectName(test) {
    return test?.subject || subjectFor(test)?.name || 'Coleção';
  }

  function subjectId(test) {
    return subjectFor(test)?.id || test?.subjectId || '';
  }

  function testDate(test) {
    const raw = test?.completedAt || test?.finishedAt || test?.date;
    const date = new Date(raw || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function completedTests() {
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0)
      .sort((a, b) => (testDate(b)?.getTime() || 0) - (testDate(a)?.getTime() || 0));
  }

  function relativeTime(value) {
    const date = value instanceof Date ? value : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    const delta = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(delta / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days} dia${days === 1 ? '' : 's'}`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  }

  function initials(name) {
    const parts = String(name || 'Coleção').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0, 2).map(part => part[0]).join('') || 'C').toUpperCase();
  }

  function tone(name) {
    const hash = Array.from(String(name || '')).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return tones[hash % tones.length];
  }

  function subjectAttr(test) {
    const id = subjectId(test);
    return id ? ` data-home-subject="${esc(id)}" tabindex="0"` : '';
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home .home-subtabs .home-subtab,
      #home .home-subtabs [data-home-tab]{display:none!important}
      #home .home-subtabs{background:transparent!important;border:0!important;padding-left:0!important;padding-right:0!important}
      .fixa-week-activities-panel{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;align-items:stretch!important}
      .fixa-week-activities-panel>.home-activity-panel{min-width:0!important;min-height:230px!important;max-height:270px!important;margin:0!important;overflow:hidden!important}
      .fixa-week-activities-panel .home-activity-scroll{max-height:208px!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:3px!important}
      .fixa-week-activities-panel .home-panel-head{min-height:42px!important;margin-bottom:0!important}
      .fixa-week-activities-panel .home-panel-head h3{display:flex!important;align-items:center!important;gap:7px!important}
      .fixa-week-activities-panel .home-activity-title-icon svg{width:16px!important;height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
      @media(max-width:760px){
        .fixa-week-activities-panel{grid-template-columns:1fr!important}
        .fixa-week-activities-panel>.home-activity-panel{max-height:none!important}
        .fixa-week-activities-panel .home-activity-scroll{max-height:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function removeSecondaryNavigation(home) {
    const nav = home?.querySelector('.home-subtabs');
    if (!nav) return;
    nav.querySelectorAll('[data-home-tab], .home-subtab').forEach(button => button.remove());

    const greeting = home.querySelector('#homeGreeting');
    if (greeting && greeting.parentElement !== nav) nav.appendChild(greeting);

    try {
      if (typeof homePanel !== 'undefined') homePanel = 'today';
    } catch (_) {}
  }

  function setActivityHeadingIcons() {
    const clock = document.querySelector('[data-home-activity-icon="clock"]');
    const chart = document.querySelector('[data-home-activity-icon="chart"]');
    if (clock) clock.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>';
    if (chart) chart.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path></svg>';
  }

  function ensureUnifiedPanel() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const shell = today?.querySelector('.fixa-week-main-shell');
    const tabs = shell?.querySelector('.fixa-week-content-tabs');
    const stage = shell?.querySelector('.fixa-week-main-stage');
    if (!home || !today || !shell || !tabs || !stage) return false;

    addStyle();
    removeSecondaryNavigation(home);
    today.hidden = false;

    let tab = tabs.querySelector('[data-fixa-main-tab="activities"]');
    if (!tab) {
      tab = document.createElement('button');
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', 'false');
      tab.dataset.fixaMainTab = 'activities';
      tab.textContent = 'Atividades';
      tabs.appendChild(tab);
    }

    let panel = stage.querySelector('[data-fixa-main-panel="activities"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'fixa-week-main-pair fixa-week-activities-panel';
      panel.dataset.fixaMainPanel = 'activities';
      panel.hidden = true;
      stage.appendChild(panel);
    }

    const activityArticle = home.querySelector('#homeActivity')?.closest('.home-panel');
    const testsArticle = home.querySelector('#homeTests')?.closest('.home-panel');
    [activityArticle, testsArticle].filter(Boolean).forEach(article => {
      article.classList.add('fixa-week-main-pane');
      article.removeAttribute('data-fixa-main-panel');
      article.hidden = false;
      if (article.parentElement !== panel) panel.appendChild(article);
    });

    const oldActivity = home.querySelector('[data-home-panel="activity"]');
    if (oldActivity) oldActivity.hidden = true;
    home.querySelector('[data-home-panel="progress"]')?.setAttribute('hidden', '');

    setActivityHeadingIcons();
    return Boolean(activityArticle && testsArticle);
  }

  function renderActivities() {
    const activity = document.querySelector('#homeActivity');
    const testsBox = document.querySelector('#homeTests');
    if (!activity || !testsBox) return;

    const recent = completedTests().slice(0, 12);
    activity.innerHTML = recent.length ? recent.map(test => {
      const date = testDate(test);
      return `<li class="home-activity-item home-activity-clickable"${subjectAttr(test)}><span class="home-activity-time">${relativeTime(date)}</span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Finalizou teste em ${esc(subjectName(test))}</span><small>${Number(test.score || 0)} de ${Number(test.total || 0)} acertos</small></span></li>`;
    }).join('') : '<li class="home-activity-item"><span></span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Sua atividade aparecerá aqui.</span></span></li>';

    testsBox.innerHTML = recent.length ? recent.map(test => {
      const name = subjectName(test);
      const score = Number(test.score || 0);
      const total = Number(test.total || 0);
      const percentage = total ? score / total * 100 : 0;
      const resultClass = percentage >= 80 ? '' : percentage >= 60 ? ' is-warn' : ' is-bad';
      return `<div class="home-test-row"${subjectAttr(test)}><span class="home-activity-avatar tone-${tone(name)}">${initials(name)}</span><span class="home-test-copy"><span class="home-test-name">${esc(name)}</span><span class="home-test-meta">${relativeTime(testDate(test))}</span></span><span class="home-test-score${resultClass}">${score}/${total}</span></div>`;
    }).join('') : '<p class="home-muted">Nenhum teste realizado ainda.</p>';

    setActivityHeadingIcons();
  }

  let refreshTimer = 0;
  function refresh(delay = 0) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      if (ensureUnifiedPanel()) renderActivities();
    }, delay);
  }

  function wrapDashboardRefresh() {
    const api = window.FixaHomeWeeklyDashboardV2;
    if (!api || typeof api.refresh !== 'function' || api.__unifiedActivityWrapped) return false;
    const original = api.refresh.bind(api);
    api.refresh = (...args) => {
      const result = original(...args);
      refresh(80);
      return result;
    };
    Object.defineProperty(api, '__unifiedActivityWrapped', { value: true, configurable: false });
    return true;
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"], #homeTopTab, [data-fixa-main-tab], [data-fixa-week-period]')) refresh(60);
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh(80);
  });

  window.addEventListener('load', () => refresh(80), { once:true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    wrapDashboardRefresh();
    const ready = ensureUnifiedPanel();
    if (ready) renderActivities();
    if ((ready && wrapDashboardRefresh()) || attempts >= 20) window.clearInterval(timer);
  }, 250);

  wrapDashboardRefresh();
  refresh(0);
  refresh(350);
})();
