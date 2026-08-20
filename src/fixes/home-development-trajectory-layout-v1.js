(() => {
  'use strict';

  if (window.FixaHomeDevelopmentTrajectoryV1?.active) return;

  const state = {
    folderId: 'all',
    subjectId: 'all'
  };

  const api = window.FixaHomeDevelopmentTrajectoryV1 = {
    active: true,
    refresh: syncAll
  };

  const style = document.createElement('style');
  style.id = 'fixaHomeDevelopmentTrajectoryV1Style';
  style.textContent = `
    #home .fixa-development-filter-row,
    #home .fixa-trajectory-period-row{
      width:100%;
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }
    #home .fixa-development-filter-row{margin:0 0 1px;padding:0 1px;justify-content:flex-start}
    #home .fixa-trajectory-period-row{margin:2px 0 0;padding:0 1px;justify-content:flex-start}
    #home .fixa-development-filter{
      height:31px;
      min-width:210px;
      padding:0 8px 0 10px;
      border:1px solid #dbe5f4;
      border-radius:9px;
      background:#fff;
      display:flex;
      align-items:center;
      gap:7px;
      color:#53617a;
    }
    #home .fixa-development-filter svg{width:14px;height:14px;flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    #home .fixa-development-filter select{
      border:0!important;
      box-shadow:none!important;
      min-width:0;
      padding:0 22px 0 0!important;
      background:#fff!important;
      color:#26324b!important;
      font-size:10px!important;
      font-weight:750!important;
    }
    #home .fixa-week-control-slot{display:none!important}
    #home .fixa-week-header-stack{justify-items:start!important;min-width:100%!important;width:100%!important}
    #home .home-hero-actions{justify-content:flex-start!important}
    #home .fixa-week-greeting-slot,#home .fixa-week-date-slot{text-align:left!important}
    #home .fixa-week-greeting-slot #homeGreeting{justify-content:flex-start!important}
    #home .fixa-trajectory-period-row .fixa-week-period{justify-content:flex-start!important}
    @media(max-width:760px){
      #home .fixa-development-filter-row{display:grid;grid-template-columns:1fr;gap:6px}
      #home .fixa-development-filter{width:100%;min-width:0}
      #home .fixa-trajectory-period-row .fixa-week-period{width:100%}
      #home .fixa-trajectory-period-row .fixa-week-period button{flex:1}
    }
  `;
  document.head.appendChild(style);

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data; }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function folders() {
    return Array.isArray(dataRef()?.folders) ? dataRef().folders : [];
  }

  function allSubjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function subjectsForFolder() {
    const all = allSubjects();
    if (state.folderId === 'all') return all;
    return all.filter(subject => String(subject?.folder || '') === String(state.folderId));
  }

  function selectedSubjects() {
    const scoped = subjectsForFolder();
    if (state.subjectId === 'all') return scoped;
    return scoped.filter(subject => String(subject?.id || '') === String(state.subjectId));
  }

  function cardsFor(subject) {
    return Array.isArray(subject?.cards) ? subject.cards : [];
  }

  function statusOf(card) {
    if (!card) return 'unseen';
    const raw = String(card.status || '').toLowerCase();
    if (raw === 'frozen' || raw.includes('congel')) return 'frozen';
    if (raw === 'mastered' || raw.includes('dominad')) return 'mastered';
    try { if (typeof isMastered === 'function' && isMastered(card)) return 'mastered'; } catch (_) {}
    return raw;
  }

  function completedTests() {
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0);
  }

  function testDate(test) {
    const date = new Date(test?.completedAt || test?.finishedAt || test?.date || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function testsForSelection() {
    const selected = selectedSubjects();
    if (!selected.length) return [];
    const ids = new Set(selected.map(subject => String(subject.id)));
    const names = new Set(selected.map(subject => String(subject.name || '')));
    return completedTests().filter(test => {
      const testIds = Array.isArray(test?.subjectIds) && test.subjectIds.length
        ? test.subjectIds.map(String)
        : [test?.subjectId].filter(Boolean).map(String);
      if (testIds.some(id => ids.has(id))) return true;
      return names.has(String(test?.subject || ''));
    });
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function weekBounds() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  function greetingText() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function userFirstName() {
    const label = document.querySelector('#userDisplayName')?.textContent?.trim();
    if (label) {
      const normalized = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (normalized && normalized !== 'usuario') return label.split(/\s+/)[0];
    }
    const current = document.querySelector('#homeGreetingText')?.textContent || '';
    const match = current.match(/,\s*([^!]+)!/);
    return match?.[1]?.trim() || 'Julia';
  }

  function syncGreeting() {
    const text = document.querySelector('#homeGreetingText');
    if (!text) return;
    text.textContent = `${greetingText()}, ${userFirstName()}!`;
  }

  function filterIcon(type) {
    if (type === 'collection') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  }

  function ensureDevelopmentFilters(todayShell, anchor) {
    let row = todayShell.querySelector('.fixa-development-filter-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'fixa-development-filter-row';
      row.setAttribute('aria-label', 'Filtros de desenvolvimento');
      row.innerHTML = `
        <label class="fixa-development-filter">${filterIcon('folder')}<select id="fixaDevelopmentFolderFilter" aria-label="Filtrar desenvolvimento por pasta"></select></label>
        <label class="fixa-development-filter">${filterIcon('collection')}<select id="fixaDevelopmentCollectionFilter" aria-label="Filtrar desenvolvimento por coleção"></select></label>`;
    }
    if (row.parentElement !== todayShell || row.nextElementSibling !== anchor) {
      todayShell.insertBefore(row, anchor || todayShell.firstChild);
    }
    return row;
  }

  function fillDevelopmentFilters() {
    const folderSelect = document.querySelector('#fixaDevelopmentFolderFilter');
    const collectionSelect = document.querySelector('#fixaDevelopmentCollectionFilter');
    if (!folderSelect || !collectionSelect) return;

    const folderList = folders();
    const previousFolder = state.folderId;
    folderSelect.innerHTML = '<option value="all">Todas as pastas</option>' + folderList
      .map(folder => `<option value="${esc(folder.id)}">${esc(folder.name)}</option>`)
      .join('');
    state.folderId = folderList.some(folder => String(folder.id) === String(previousFolder)) ? String(previousFolder) : 'all';
    folderSelect.value = state.folderId;

    const available = subjectsForFolder();
    const previousSubject = state.subjectId;
    collectionSelect.innerHTML = '<option value="all">Todas as coleções</option>' + available
      .map(subject => `<option value="${esc(subject.id)}">${esc(subject.name)}</option>`)
      .join('');
    state.subjectId = available.some(subject => String(subject.id) === String(previousSubject)) ? String(previousSubject) : 'all';
    collectionSelect.value = state.subjectId;
  }

  function ensureTrajectoryPeriod(todayShell, footerStats) {
    let row = todayShell.querySelector('.fixa-trajectory-period-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'fixa-trajectory-period-row';
      row.setAttribute('aria-label', 'Filtro de período da trajetória');
    }
    const period = document.querySelector('.fixa-week-period');
    if (period && period.parentElement !== row) row.appendChild(period);
    if (row.parentElement !== todayShell || row.nextElementSibling !== footerStats) {
      todayShell.insertBefore(row, footerStats || null);
    }
    return row;
  }

  function arrangeLayout() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const todayShell = today?.querySelector(':scope > .home-shell');
    const summary = document.querySelector('#homeSummaryCards');
    const footerStats = document.querySelector('#homeFooterStats');
    if (!home || !todayShell || !summary || !footerStats) return false;

    const oldFolder = document.querySelector('.fixa-week-folder-filter');
    if (oldFolder) oldFolder.hidden = true;

    const filters = ensureDevelopmentFilters(todayShell, summary);
    if (summary.previousElementSibling !== filters) filters.insertAdjacentElement('afterend', summary);

    const periodRow = ensureTrajectoryPeriod(todayShell, footerStats);
    if (periodRow.previousElementSibling !== summary) summary.insertAdjacentElement('afterend', periodRow);
    if (footerStats.previousElementSibling !== periodRow) periodRow.insertAdjacentElement('afterend', footerStats);

    return true;
  }

  function developmentCard(label) {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return null;
    return Array.from(grid.children).find(card => card.querySelector('strong')?.textContent?.trim() === label) || null;
  }

  function setDevelopmentCard(label, value, caption) {
    const card = developmentCard(label);
    if (!card) return;
    const number = card.querySelector('.home-card-number');
    const small = card.querySelector('.home-muted');
    if (number) number.textContent = String(value);
    if (small && caption !== undefined) small.textContent = String(caption || '');
  }

  function renderDevelopment() {
    const selected = selectedSubjects();
    const cards = selected
      .flatMap(subject => cardsFor(subject).map(card => ({ subject, card })))
      .filter(item => statusOf(item.card) !== 'frozen');
    const mastered = cards.filter(item => statusOf(item.card) === 'mastered').length;
    const tests = testsForSelection();
    const total = tests.reduce((sum, test) => sum + Number(test?.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test?.score || 0), 0);
    const xp = tests.reduce((sum, test) => sum + Number(test?.xp || 0), 0);
    const { start, end } = weekBounds();
    const weekXpFromTests = tests.reduce((sum, test) => {
      const date = testDate(test);
      return date && date >= start && date <= end ? sum + Number(test?.xp || 0) : sum;
    }, 0);
    const weekXp = state.folderId === 'all' && state.subjectId === 'all'
      ? Number(window.FixaHomeGoalsStreakProtectionV1?.weekXp ?? weekXpFromTests)
      : weekXpFromTests;

    setDevelopmentCard('Coleções', selected.length, 'Total de coleções');
    setDevelopmentCard('Questões', cards.length, 'Total de questões');
    setDevelopmentCard('Dominadas', mastered, `${percent(mastered, cards.length)}% do total`);
    setDevelopmentCard('Aproveitamento', `${percent(score, total)}%`, 'Média dos testes');
    setDevelopmentCard('XP Coleções', xp, '');
    setDevelopmentCard('XP Semana', weekXp, '');
  }

  function syncAll() {
    if (!arrangeLayout()) return false;
    fillDevelopmentFilters();
    syncGreeting();
    renderDevelopment();
    return true;
  }

  function wrapWeeklyRefresh() {
    const weekly = window.FixaHomeWeeklyDashboardV2;
    if (!weekly || typeof weekly.refresh !== 'function') return false;
    if (weekly.__developmentTrajectoryWrapped) return true;
    const original = weekly.refresh.bind(weekly);
    weekly.refresh = (...args) => {
      const result = original(...args);
      window.setTimeout(syncAll, 0);
      return result;
    };
    weekly.__developmentTrajectoryWrapped = true;
    return true;
  }

  function install() {
    if (!document.querySelector('#home.home-view')) return false;
    if (!wrapWeeklyRefresh()) return false;
    if (!syncAll()) return false;

    document.addEventListener('change', event => {
      const folder = event.target.closest('#fixaDevelopmentFolderFilter');
      if (folder) {
        state.folderId = folder.value || 'all';
        state.subjectId = 'all';
        fillDevelopmentFilters();
        renderDevelopment();
        return;
      }
      const collection = event.target.closest('#fixaDevelopmentCollectionFilter');
      if (collection) {
        state.subjectId = collection.value || 'all';
        renderDevelopment();
      }
    });

    document.addEventListener('click', event => {
      if (event.target.closest('[data-fixa-week-period], [data-view="home"], #homeTopTab, [data-home-tab="today"]')) {
        window.setTimeout(syncAll, 0);
      }
    });

    window.addEventListener('fixa-cloud-data-loaded', () => window.setTimeout(syncAll, 0));
    window.addEventListener('focus', () => {
      syncGreeting();
      window.setTimeout(syncAll, 0);
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncGreeting();
        window.setTimeout(syncAll, 0);
      }
    });

    return true;
  }

  let attempts = 0;
  const boot = () => {
    if (install()) return;
    attempts += 1;
    if (attempts < 24) window.setTimeout(boot, 250);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
