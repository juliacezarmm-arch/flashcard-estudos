(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV2?.active) return;

  // Estes comportamentos antigos não devem disputar o layout da Home.
  window.FixaHomeCompactHeaderRowV2 = true;
  window.FixaHomeMainPanelFillViewportV1 = true;

  const state = { subjectId: 'all' };
  const api = window.FixaHomeReferenceLayoutV2 = { active: true, refresh: syncAll };
  const STYLE_ID = 'fixaHomeReferenceLayoutV2Style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Faixa superior da Home: filtros à esquerda, saudação à direita. */
      #home.home-view .home-hero-head{
        display:block!important;
        min-height:0!important;
        height:auto!important;
        margin:0 0 12px!important;
        padding:0!important;
      }
      #home.home-view .home-title,
      #home.home-view .fixa-week-title-empty{display:none!important}
      #home.home-view .home-hero-actions{
        width:100%!important;
        display:block!important;
        margin:0!important;
        padding:0!important;
      }
      #home.home-view .fixa-reference-header-row{
        width:100%;
        min-height:52px;
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        gap:24px;
      }
      #home.home-view .fixa-reference-header-left{
        min-width:0;
        display:flex;
        align-items:center;
        justify-content:flex-start;
      }
      #home.home-view .fixa-reference-header-right{
        min-width:220px;
        display:grid;
        justify-items:end;
        align-content:center;
        gap:1px;
        text-align:right;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting{
        margin:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:5px!important;
        font-size:22px!important;
        line-height:25px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        text-align:right!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{
        width:21px!important;
        height:21px!important;
      }
      #home.home-view .fixa-reference-header-right #homeDatePill{
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        color:#64748b!important;
        font-size:12px!important;
        line-height:15px!important;
        white-space:nowrap!important;
        text-align:right!important;
      }

      /* Filtros exatamente na faixa superior, sem período misturado. */
      #home.home-view .fixa-week-filters{
        width:auto!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:14px!important;
        flex-wrap:nowrap!important;
        margin:0!important;
      }
      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter{
        height:43px!important;
        padding:0 12px!important;
        border:1px solid #dbe5f4!important;
        border-radius:11px!important;
        background:#fff!important;
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        color:#53617a!important;
        box-shadow:none!important;
      }
      #home.home-view .fixa-week-folder-filter{width:274px!important;min-width:274px!important}
      #home.home-view .fixa-reference-collection-filter{width:340px!important;min-width:340px!important}
      #home.home-view .fixa-week-folder-filter svg,
      #home.home-view .fixa-reference-collection-filter svg{
        width:16px!important;
        height:16px!important;
        flex:0 0 16px!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:1.9!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
      }
      #home.home-view .fixa-week-folder-filter select,
      #home.home-view .fixa-reference-collection-filter select{
        height:40px!important;
        min-width:0!important;
        border:0!important;
        box-shadow:none!important;
        padding:0 24px 0 0!important;
        background:#fff!important;
        color:#26324b!important;
        font-size:13px!important;
        font-weight:800!important;
      }

      /* 1ª linha: seis cards exatamente na mesma faixa. */
      #home.home-view #homeSummaryCards.fixa-week-summary{
        width:100%!important;
        display:grid!important;
        grid-template-columns:repeat(6,minmax(0,1fr))!important;
        gap:12px!important;
        margin:0!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card{
        height:92px!important;
        min-height:92px!important;
        padding:12px 14px!important;
        grid-template-columns:54px minmax(0,1fr)!important;
        gap:11px!important;
        border-radius:14px!important;
        align-items:center!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-icon{
        width:54px!important;
        height:54px!important;
        border-radius:12px!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-icon svg{
        width:31px!important;
        height:31px!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card strong{
        display:block!important;
        margin:0 0 1px!important;
        font-size:14px!important;
        line-height:17px!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card .home-card-number{
        display:block!important;
        font-size:24px!important;
        line-height:25px!important;
        font-weight:900!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card small{
        display:block!important;
        margin-top:2px!important;
        font-size:11px!important;
        line-height:13px!important;
      }

      /* Período em uma linha própria entre a 1ª e a 2ª linha. */
      #home.home-view .fixa-reference-period-row{
        width:100%;
        min-height:42px;
        margin:10px 0 10px;
        display:flex;
        align-items:center;
        justify-content:flex-start;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:4px!important;
        margin:0!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period button{
        min-height:40px!important;
        height:40px!important;
        padding:0 18px!important;
        border-radius:9px!important;
        font-size:12px!important;
        font-weight:850!important;
      }

      /* 2ª linha: sequência, tempo e objetivo. */
      #home.home-view #homeFooterStats{
        width:100%!important;
        display:grid!important;
        grid-template-columns:1.05fr 1fr 1.05fr!important;
        gap:12px!important;
        margin:0 0 14px!important;
        height:132px!important;
        min-height:132px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card{
        height:132px!important;
        min-height:132px!important;
        padding:15px 17px!important;
        border-radius:14px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head{
        gap:9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head h3{
        font-size:15px!important;
        line-height:18px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head>b{
        font-size:12px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-symbol{
        width:30px!important;
        height:30px!important;
        border-radius:9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-symbol svg{
        width:17px!important;
        height:17px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-main-value{
        margin-top:4px!important;
        font-size:26px!important;
        line-height:28px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card>small{
        font-size:11px!important;
        line-height:14px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-days{
        margin-top:8px!important;
        gap:5px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-day i{
        width:31px!important;
        height:31px!important;
        font-size:12px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-day b{
        margin-top:2px!important;
        font-size:10px!important;
      }

      /* Painel inferior: tamanho estável. Sem cálculo JS e sem caixa infinita. */
      #home.home-view .fixa-week-main-shell{
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        margin:0 0 18px!important;
        overflow:hidden!important;
        border-radius:14px!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        height:clamp(300px,34vh,390px)!important;
        min-height:300px!important;
        max-height:390px!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-pane,
      #home.home-view .fixa-week-main-shell [data-fixa-main-panel]{
        min-height:0!important;
      }
      #home.home-view .fixa-week-main-shell .home-activity-scroll,
      #home.home-view .fixa-week-main-shell .home-collection-scroll,
      #home.home-view .fixa-week-main-shell .home-focus-box,
      #home.home-view .fixa-week-main-shell .fixa-unified-priority-list,
      #home.home-view .fixa-week-main-shell .fixa-question-group-list{
        overflow-y:auto!important;
        overflow-x:hidden!important;
        scrollbar-width:thin!important;
      }

      @media(max-width:1150px){
        #home.home-view .fixa-reference-header-row{grid-template-columns:1fr;gap:8px}
        #home.home-view .fixa-reference-header-right{justify-items:start;text-align:left}
        #home.home-view .fixa-reference-header-right #homeGreeting{justify-content:flex-start!important;text-align:left!important}
        #home.home-view .fixa-reference-header-right #homeDatePill{text-align:left!important}
        #home.home-view #homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
      @media(max-width:760px){
        #home.home-view .fixa-week-filters{width:100%!important;display:grid!important;grid-template-columns:1fr!important;gap:7px!important}
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
        #home.home-view #homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #home.home-view #homeFooterStats{grid-template-columns:1fr!important;height:auto!important;min-height:0!important}
        #home.home-view #homeFooterStats .fixa-week-top-card{height:auto!important;min-height:118px!important}
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{height:auto!important;min-height:300px!important;max-height:none!important}
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

  function allSubjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function folderId() {
    return document.querySelector('#fixaWeekFolderFilter')?.value || 'all';
  }

  function subjectsForFolder() {
    const id = folderId();
    const list = allSubjects();
    return id === 'all' ? list : list.filter(subject => String(subject?.folder || '') === String(id));
  }

  function selectedSubjects() {
    const list = subjectsForFolder();
    return state.subjectId === 'all' ? list : list.filter(subject => String(subject?.id || '') === String(state.subjectId));
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

  function periodBounds() {
    const period = activePeriod();
    const now = new Date();
    if (period === 'today') {
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now); end.setHours(23,59,59,999);
      return { start, end };
    }
    if (period === 'month') {
      return {
        start:new Date(now.getFullYear(),now.getMonth(),1),
        end:new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999)
      };
    }
    const start = new Date(now); start.setHours(0,0,0,0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    return { start, end };
  }

  function testsInPeriod(tests) {
    const { start, end } = periodBounds();
    return tests.filter(test => {
      const date = testDate(test);
      return date && date >= start && date <= end;
    });
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function collectionIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg>';
  }

  function ensureHeaderLayout() {
    const home = document.querySelector('#home.home-view');
    const actions = home?.querySelector('.home-hero-actions');
    const filters = home?.querySelector('.fixa-week-filters');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    if (!home || !actions || !filters || !greeting || !date) return false;

    let row = actions.querySelector('.fixa-reference-header-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'fixa-reference-header-row';
      row.innerHTML = '<div class="fixa-reference-header-left"></div><div class="fixa-reference-header-right"></div>';
      actions.prepend(row);
    }
    const left = row.querySelector('.fixa-reference-header-left');
    const right = row.querySelector('.fixa-reference-header-right');

    const period = filters.querySelector('.fixa-week-period');
    if (period) period.remove();

    let collection = filters.querySelector('.fixa-reference-collection-filter');
    if (!collection) {
      collection = document.createElement('label');
      collection.className = 'fixa-reference-collection-filter';
      collection.innerHTML = `${collectionIcon()}<select id="fixaReferenceCollectionFilter" aria-label="Filtrar por coleção"></select>`;
      filters.appendChild(collection);
    }

    if (filters.parentElement !== left) left.appendChild(filters);
    if (greeting.parentElement !== right) right.appendChild(greeting);
    if (date.parentElement !== right) right.appendChild(date);
    return true;
  }

  function fillCollectionFilter() {
    const select = document.querySelector('#fixaReferenceCollectionFilter');
    if (!select) return;
    const available = subjectsForFolder();
    if (state.subjectId !== 'all' && !available.some(subject => String(subject.id) === String(state.subjectId))) {
      state.subjectId = 'all';
    }
    const options = [
      { value:'all', label:'Todas as coleções' },
      ...available.map(subject => ({ value:String(subject.id), label:String(subject.name || 'Coleção') }))
    ];
    const signature = options.map(item => `${item.value}:${item.label}`).join('|');
    if (select.dataset.optionsSignature !== signature) {
      select.innerHTML = options.map(item => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
      select.dataset.optionsSignature = signature;
    }
    select.value = state.subjectId;
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
    if (!period) {
      const filters = document.querySelector('.fixa-week-filters');
      const detached = filters?.querySelector('.fixa-week-period');
      if (detached) row.appendChild(detached);
    }

    if (!row.querySelector('.fixa-week-period')) {
      row.innerHTML = '<div class="fixa-week-period" role="group" aria-label="Período do painel"><button type="button" data-fixa-week-period="today">Hoje</button><button type="button" data-fixa-week-period="week" class="active">Semana</button><button type="button" data-fixa-week-period="month">Mês</button></div>';
    }

    if (row.parentElement !== todayShell || row.previousElementSibling !== summary) {
      summary.insertAdjacentElement('afterend', row);
    }
    if (footerStats.previousElementSibling !== row) row.insertAdjacentElement('afterend', footerStats);
    return row;
  }

  function clearOldHeightControl() {
    document.querySelector('#fixaHomeMainPanelFillViewportStyle')?.remove();
    const shell = document.querySelector('#home .fixa-week-main-shell');
    if (!shell) return;
    ['height','min-height','max-height'].forEach(property => shell.style.removeProperty(property));
  }

  function arrangeBody() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const todayShell = today?.querySelector(':scope > .home-shell');
    const summary = document.querySelector('#homeSummaryCards');
    const footerStats = document.querySelector('#homeFooterStats');
    if (!todayShell || !summary || !footerStats) return false;

    if (summary.parentElement !== todayShell) todayShell.prepend(summary);
    ensurePeriodRow(todayShell, summary, footerStats);
    const mainShell = todayShell.querySelector('.fixa-week-main-shell');
    if (mainShell && mainShell.previousElementSibling !== footerStats) footerStats.insertAdjacentElement('afterend', mainShell);
    clearOldHeightControl();
    return true;
  }

  function summaryCard(label) {
    const grid = document.querySelector('#homeSummaryCards');
    return grid ? [...grid.children].find(card => card.querySelector('strong')?.textContent?.trim() === label) || null : null;
  }

  function setSummaryCard(label, value, caption) {
    const card = summaryCard(label);
    if (!card) return;
    const number = card.querySelector('.home-card-number');
    const small = card.querySelector('small, .home-muted');
    if (number && number.textContent !== String(value)) number.textContent = String(value);
    if (small && caption !== undefined && small.textContent !== String(caption)) small.textContent = String(caption || '');
  }

  function renderCollectionSelection() {
    if (state.subjectId === 'all') return;
    const selected = selectedSubjects();
    const cards = selected.flatMap(subject => cardsFor(subject)).filter(card => statusOf(card) !== 'frozen');
    const mastered = cards.filter(card => statusOf(card) === 'mastered').length;
    const allTests = testsForSelection();
    const periodTests = testsInPeriod(allTests);
    const total = periodTests.reduce((sum, test) => sum + Number(test?.total || 0), 0);
    const score = periodTests.reduce((sum, test) => sum + Number(test?.score || 0), 0);
    const xpSummary = window.FixaCompetitionXpHomeV4?.summary || {};
    const bySubject = xpSummary.by_subject || {};
    const subjectId = String(selected[0]?.id || '');
    const xp = Number(bySubject[subjectId] || allTests.reduce((sum, test) => sum + Number(test?.xp || 0), 0));
    const weekTests = (() => {
      const previous = activePeriod();
      const now = new Date();
      const start = new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate() - ((start.getDay()+6)%7));
      const end = new Date(start); end.setDate(end.getDate()+6); end.setHours(23,59,59,999);
      return allTests.filter(test => { const date = testDate(test); return date && date >= start && date <= end; });
    })();
    const weekXp = weekTests.reduce((sum, test) => sum + Number(test?.xp || 0), 0);

    setSummaryCard('Coleções', selected.length, 'Total de coleções');
    setSummaryCard('Questões', cards.length, 'Total de questões');
    setSummaryCard('Dominadas', mastered, `${percent(mastered, cards.length)}% do total`);
    setSummaryCard('Aproveitamento', `${percent(score, total)}%`, 'Média dos testes');
    setSummaryCard('XP Coleções', xp, '');
    setSummaryCard('XP Semana', weekXp, '');
  }

  function syncAll() {
    ensureStyle();
    if (!ensureHeaderLayout()) return false;
    fillCollectionFilter();
    if (!arrangeBody()) return false;
    renderCollectionSelection();
    return true;
  }

  function queueSync() {
    requestAnimationFrame(() => syncAll());
  }

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) {
      state.subjectId = 'all';
      setTimeout(syncAll, 0);
      return;
    }
    const collection = event.target.closest('#fixaReferenceCollectionFilter');
    if (collection) {
      state.subjectId = collection.value || 'all';
      if (state.subjectId === 'all') window.FixaHomeWeeklyDashboardV2?.refresh?.();
      setTimeout(syncAll, 0);
    }
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-home-tab="today"],[data-fixa-main-tab]')) {
      setTimeout(syncAll, 0);
    }
  });

  window.addEventListener('fixa-cloud-data-loaded', () => setTimeout(syncAll, 0));
  window.addEventListener('load', queueSync, { once:true });
  window.addEventListener('resize', queueSync);
  queueSync();
})();
