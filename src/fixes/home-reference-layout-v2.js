(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV2?.active) return;

  /*
   * Estes dois comportamentos antigos são deliberadamente desativados antes
   * de home-art-and-competition-icon-fix.js rodar. O primeiro puxava os
   * filtros para o cabeçalho; o segundo gravava altura fixa baseada no viewport.
   */
  window.FixaHomeCompactHeaderRowV2 = true;
  window.FixaHomeMainPanelFillViewportV1 = true;

  const state = {
    folderId: 'all',
    subjectId: 'all'
  };

  const api = window.FixaHomeReferenceLayoutV2 = {
    active: true,
    refresh: syncAll
  };

  const STYLE_ID = 'fixaHomeReferenceLayoutV2Style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home .fixa-reference-filter-row,
      #home .fixa-reference-period-row{
        width:100%;
        display:flex;
        align-items:center;
        gap:8px;
        flex-wrap:wrap;
      }
      #home .fixa-reference-filter-row{
        margin:0 0 7px;
        padding:0 1px;
        justify-content:flex-start;
      }
      #home .fixa-reference-period-row{
        margin:8px 0 7px;
        padding:0 1px;
        justify-content:flex-start;
      }
      #home .fixa-reference-filter{
        height:34px;
        min-width:230px;
        padding:0 9px 0 10px;
        border:1px solid #dbe5f4;
        border-radius:9px;
        background:#fff;
        display:flex;
        align-items:center;
        gap:7px;
        color:#53617a;
      }
      #home .fixa-reference-filter svg{
        width:14px;
        height:14px;
        flex:0 0 auto;
        fill:none;
        stroke:currentColor;
        stroke-width:1.9;
        stroke-linecap:round;
        stroke-linejoin:round;
      }
      #home .fixa-reference-filter select{
        border:0!important;
        box-shadow:none!important;
        min-width:0;
        padding:0 22px 0 0!important;
        background:#fff!important;
        color:#26324b!important;
        font-size:11px!important;
        font-weight:750!important;
      }
      #home .fixa-week-folder-filter{display:none!important}
      #home .fixa-week-filters:empty{display:none!important}
      #home .fixa-reference-period-row .fixa-week-period{
        display:flex!important;
        justify-content:flex-start!important;
        gap:4px!important;
      }
      #homeSummaryCards.fixa-week-summary{
        width:100%!important;
        display:grid!important;
        grid-template-columns:repeat(6,minmax(0,1fr))!important;
        gap:8px!important;
        margin:0!important;
      }
      #homeFooterStats{
        width:100%!important;
        display:grid!important;
        grid-template-columns:1.05fr 1fr 1.05fr!important;
        gap:8px!important;
        margin:0!important;
      }
      #home .fixa-week-main-shell{
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        margin-bottom:20px!important;
      }
      #home .fixa-week-main-stage{
        max-height:none!important;
      }
      @media(max-width:1050px){
        #homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
      @media(max-width:760px){
        #home .fixa-reference-filter-row{display:grid;grid-template-columns:1fr;gap:6px}
        #home .fixa-reference-filter{width:100%;min-width:0}
        #home .fixa-reference-period-row .fixa-week-period{width:100%}
        #home .fixa-reference-period-row .fixa-week-period button{flex:1}
        #homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #homeFooterStats{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[char]));
  }

  function folders() {
    return Array.isArray(dataRef()?.folders) ? dataRef().folders : [];
  }

  function allSubjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function subjectsForFolder() {
    const list = allSubjects();
    if (state.folderId === 'all') return list;
    return list.filter(subject => String(subject?.folder || '') === String(state.folderId));
  }

  function selectedSubjects() {
    const list = subjectsForFolder();
    if (state.subjectId === 'all') return list;
    return list.filter(subject => String(subject?.id || '') === String(state.subjectId));
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

  function dateOf(value) {
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function testDate(test) {
    return dateOf(test?.completedAt || test?.finishedAt || test?.date);
  }

  function completedTests() {
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0);
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

  function activePeriod() {
    return document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
  }

  function periodWord() {
    const period = activePeriod();
    return period === 'today' ? 'hoje' : period === 'month' ? 'mês' : 'semana';
  }

  function periodBounds(period = activePeriod()) {
    const now = new Date();
    if (period === 'today') {
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now); end.setHours(23,59,59,999);
      return { start, end };
    }
    if (period === 'month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }
    const start = new Date(now); start.setHours(0,0,0,0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    return { start, end };
  }

  function testsInPeriod(tests, period = activePeriod()) {
    const { start, end } = periodBounds(period);
    return tests.filter(test => {
      const date = testDate(test);
      return date && date >= start && date <= end;
    });
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function filterIcon(type) {
    if (type === 'collection') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  }

  function ensureFilterRow(todayShell, summary) {
    let row = todayShell.querySelector('.fixa-reference-filter-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'fixa-reference-filter-row';
      row.setAttribute('aria-label', 'Filtros da página inicial');
      row.innerHTML = `
        <label class="fixa-reference-filter">${filterIcon('folder')}<select id="fixaReferenceFolderFilter" aria-label="Filtrar por pasta"></select></label>
        <label class="fixa-reference-filter">${filterIcon('collection')}<select id="fixaReferenceCollectionFilter" aria-label="Filtrar por coleção"></select></label>`;
    }
    if (row.parentElement !== todayShell || row.nextElementSibling !== summary) {
      todayShell.insertBefore(row, summary || todayShell.firstChild);
    }
    return row;
  }

  function setSelectOptions(select, options, selectedValue) {
    if (!select) return;
    const signature = options.map(item => `${item.value}:${item.label}`).join('|');
    if (select.dataset.optionsSignature !== signature) {
      select.innerHTML = options.map(item => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
      select.dataset.optionsSignature = signature;
    }
    select.value = selectedValue;
  }

  function fillFilters() {
    const folderSelect = document.querySelector('#fixaReferenceFolderFilter');
    const collectionSelect = document.querySelector('#fixaReferenceCollectionFilter');
    if (!folderSelect || !collectionSelect) return;

    const folderList = folders();
    if (state.folderId !== 'all' && !folderList.some(folder => String(folder.id) === String(state.folderId))) {
      state.folderId = 'all';
      state.subjectId = 'all';
    }
    setSelectOptions(folderSelect, [
      { value:'all', label:'Todas as pastas' },
      ...folderList.map(folder => ({ value:String(folder.id), label:String(folder.name || 'Pasta') }))
    ], state.folderId);

    const available = subjectsForFolder();
    if (state.subjectId !== 'all' && !available.some(subject => String(subject.id) === String(state.subjectId))) {
      state.subjectId = 'all';
    }
    setSelectOptions(collectionSelect, [
      { value:'all', label:'Todas as coleções' },
      ...available.map(subject => ({ value:String(subject.id), label:String(subject.name || 'Coleção') }))
    ], state.subjectId);
  }

  function ensurePeriodRow(todayShell, summary, footerStats) {
    let row = todayShell.querySelector('.fixa-reference-period-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'fixa-reference-period-row';
      row.setAttribute('aria-label', 'Período da página inicial');
    }

    const period = document.querySelector('.fixa-week-period');
    if (period && period.parentElement !== row) row.appendChild(period);

    if (row.parentElement !== todayShell || row.previousElementSibling !== summary) {
      summary.insertAdjacentElement('afterend', row);
    }
    if (footerStats.previousElementSibling !== row) row.insertAdjacentElement('afterend', footerStats);
    return row;
  }

  function clearForcedPanelHeight() {
    document.querySelector('#fixaHomeMainPanelFillViewportStyle')?.remove();
    const shell = document.querySelector('#home .fixa-week-main-shell');
    if (!shell) return;
    ['height','min-height','max-height'].forEach(property => shell.style.removeProperty(property));
  }

  function arrangeLayout() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const todayShell = today?.querySelector(':scope > .home-shell');
    const summary = document.querySelector('#homeSummaryCards');
    const footerStats = document.querySelector('#homeFooterStats');
    if (!home || !todayShell || !summary || !footerStats) return false;

    ensureStyle();
    const filterRow = ensureFilterRow(todayShell, summary);
    if (summary.previousElementSibling !== filterRow) filterRow.insertAdjacentElement('afterend', summary);
    const periodRow = ensurePeriodRow(todayShell, summary, footerStats);
    if (footerStats.previousElementSibling !== periodRow) periodRow.insertAdjacentElement('afterend', footerStats);

    const mainShell = todayShell.querySelector('.fixa-week-main-shell');
    if (mainShell && mainShell.previousElementSibling !== footerStats) footerStats.insertAdjacentElement('afterend', mainShell);

    clearForcedPanelHeight();
    return true;
  }

  function summaryCard(label) {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return null;
    return [...grid.children].find(card => card.querySelector('strong')?.textContent?.trim() === label) || null;
  }

  function setSummaryCard(label, value, caption) {
    const card = summaryCard(label);
    if (!card) return;
    const number = card.querySelector('.home-card-number');
    const small = card.querySelector('small, .home-muted');
    if (number && number.textContent !== String(value)) number.textContent = String(value);
    if (small && caption !== undefined && small.textContent !== String(caption)) small.textContent = String(caption || '');
  }

  function renderFilteredSummary() {
    const selected = selectedSubjects();
    const cards = selected
      .flatMap(subject => cardsFor(subject).map(card => ({ subject, card })))
      .filter(item => statusOf(item.card) !== 'frozen');
    const mastered = cards.filter(item => statusOf(item.card) === 'mastered').length;
    const allTests = testsForSelection();
    const periodTests = testsInPeriod(allTests);
    const total = periodTests.reduce((sum, test) => sum + Number(test?.total || 0), 0);
    const score = periodTests.reduce((sum, test) => sum + Number(test?.score || 0), 0);

    const xpSummary = window.FixaCompetitionXpHomeV4?.summary || {};
    const bySubject = xpSummary.by_subject || {};
    const subjectIds = selected.map(subject => String(subject.id));
    const fallbackXp = allTests.reduce((sum, test) => sum + Number(test?.xp || 0), 0);
    const summaryXp = subjectIds.reduce((sum, id) => sum + Number(bySubject[id] || 0), 0);
    const totalXp = state.folderId === 'all' && state.subjectId === 'all'
      ? (Number(xpSummary.total_xp || 0) || fallbackXp)
      : (summaryXp || fallbackXp);

    const weekTests = testsInPeriod(allTests, 'week');
    const fallbackWeekXp = weekTests.reduce((sum, test) => sum + Number(test?.xp || 0), 0);
    const weekXp = state.folderId === 'all' && state.subjectId === 'all'
      ? (Number(window.FixaHomeGoalsStreakProtectionV1?.weekXp || 0) || fallbackWeekXp)
      : fallbackWeekXp;

    setSummaryCard('Coleções', selected.length, 'Total de coleções');
    setSummaryCard('Questões', cards.length, 'Total de questões');
    setSummaryCard('Dominadas', mastered, `${percent(mastered, cards.length)}% do total`);
    setSummaryCard('Aproveitamento', `${percent(score, total)}%`, `Média de ${periodWord()}`);
    setSummaryCard('XP Coleções', totalXp, '');
    setSummaryCard('XP Semana', weekXp, '');
  }

  function syncLegacyFolderFilter() {
    const legacy = document.querySelector('#fixaWeekFolderFilter');
    if (!legacy) return;
    const value = state.folderId || 'all';
    if (legacy.value === value) return;
    legacy.value = value;
    legacy.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function syncAll() {
    if (!arrangeLayout()) return false;
    fillFilters();
    renderFilteredSummary();
    return true;
  }

  let queued = false;
  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncAll();
    });
  }

  function bind() {
    document.addEventListener('change', event => {
      const folder = event.target.closest('#fixaReferenceFolderFilter');
      if (folder) {
        state.folderId = folder.value || 'all';
        state.subjectId = 'all';
        fillFilters();
        syncLegacyFolderFilter();
        queueSync();
        return;
      }
      const collection = event.target.closest('#fixaReferenceCollectionFilter');
      if (collection) {
        state.subjectId = collection.value || 'all';
        renderFilteredSummary();
      }
    });

    document.addEventListener('click', event => {
      if (event.target.closest('[data-fixa-week-period], [data-view="home"], #homeTopTab')) queueSync();
    });

    window.addEventListener('fixa-cloud-data-loaded', queueSync);
    window.addEventListener('fixa-xp-updated', queueSync);
    window.addEventListener('load', queueSync, { once:true });

    const home = document.querySelector('#home');
    if (home) {
      new MutationObserver(queueSync).observe(home, { childList:true, subtree:true });
    }
  }

  function boot() {
    if (!syncAll()) {
      requestAnimationFrame(boot);
      return;
    }
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
