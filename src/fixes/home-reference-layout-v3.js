(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const LEGACY_STABLE_ID = 'fixaStableSummaryCards';
  const BODY_CLASS = 'fixa-home-v3-active';
  const LOADING_GUARD_ID = 'fixaHomeLayoutLoadingGuard';
  const SUMMARY_ORDER = ['Coleções', 'Questões', 'Dominadas', 'Aproveitamento', 'XP Coleções', 'XP Semana'];
  const SUMMARY_META = Object.freeze({
    'Coleções': { key: 'collections', asset: 'referencias/icone_livros_colecoes.png' },
    'Questões': { key: 'questions', asset: 'referencias/ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png' },
    'Dominadas': { key: 'mastered', asset: 'referencias/icone_trofeu_dominadas.png' },
    'Aproveitamento': { key: 'accuracy', asset: 'referencias/ChatGPT Image 1 de ago. de 2026, 12_31_23.png' },
    'XP Coleções': { key: 'xp-total', asset: 'referencias/icone_xp_colecoes.svg' },
    'XP Semana': { key: 'xp-week', asset: 'referencias/icone_xp_semana.svg' }
  });

  const state = { subjectId: 'all' };
  let observedGrid = null;
  let gridObserver = null;
  let syncFrame = 0;
  let fitFrame = 0;
  let syncing = false;

  window.FixaHomeReferenceLayoutV3 = { active: true, refresh: syncAll };

  // Bloqueia os controladores antigos embutidos em outros arquivos.
  window.FixaHomeCompactHeaderRowV2 = true;
  window.FixaHomeMainPanelFillViewportV1 = true;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    document.getElementById('fixaHomeMainPanelFillViewportStyle')?.remove();
    document.getElementById('fixaHomeCompactHeaderRowStyle')?.remove();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home.home-view .home-subtabs{display:none!important}
      #home.home-view #${LEGACY_STABLE_ID}{display:none!important}

      @media(min-width:861px){
        body.${BODY_CLASS}{overflow:hidden!important}
        body.${BODY_CLASS} #appShell.app:not(.locked)>main{
          height:100dvh!important;
          min-height:0!important;
          max-height:100dvh!important;
          overflow:hidden!important;
          grid-template-rows:56px minmax(0,1fr)!important;
          align-content:stretch!important;
        }
        body.${BODY_CLASS} #home.home-view.active{
          height:100%!important;
          min-height:0!important;
          box-sizing:border-box!important;
          overflow:hidden!important;
          padding-top:28px!important;
          padding-bottom:20px!important;
        }
      }

      /* Cabeçalho: filtros à esquerda; saudação e data à direita. */
      #home.home-view .home-hero-head{
        display:block!important;
        margin:0 0 4px!important;
        padding:0!important;
        min-height:38px!important;
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
        width:100%!important;
        height:38px!important;
        min-height:38px!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:18px!important;
        align-items:end!important;
        overflow:visible!important;
        transform:translateY(-8px)!important;
      }
      #home.home-view .fixa-reference-header-left{
        min-width:0!important;
        display:flex!important;
        align-items:flex-end!important;
        justify-content:flex-start!important;
        align-self:end!important;
      }
      #home.home-view .fixa-reference-header-right{
        position:relative!important;
        min-width:220px!important;
        justify-self:end!important;
        align-self:end!important;
        height:38px!important;
        min-height:38px!important;
        transform:none!important;
        display:block!important;
        overflow:visible!important;
        text-align:right!important;
      }
      #home.home-view .fixa-week-filters{
        width:auto!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        flex-wrap:nowrap!important;
        gap:8px!important;
        margin:0!important;
      }
      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter{
        height:38px!important;
        min-height:38px!important;
        padding:0 10px!important;
        border:1px solid #dbe5f4!important;
        border-radius:9px!important;
        background:#fff!important;
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
        color:#53617a!important;
        box-shadow:none!important;
      }
      #home.home-view .fixa-week-folder-filter{width:250px!important;min-width:250px!important}
      #home.home-view .fixa-reference-collection-filter{width:315px!important;min-width:315px!important}
      #home.home-view .fixa-week-folder-filter svg,
      #home.home-view .fixa-reference-collection-filter svg{
        width:16px!important;height:16px!important;flex:0 0 16px!important;
        fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;
        stroke-linecap:round!important;stroke-linejoin:round!important;
      }
      #home.home-view .fixa-week-folder-filter select,
      #home.home-view .fixa-reference-collection-filter select{
        height:36px!important;min-width:0!important;border:0!important;box-shadow:none!important;
        padding:0 24px 0 0!important;background:#fff!important;color:#26324b!important;
        font-size:12px!important;font-weight:800!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting{
        position:absolute!important;
        right:0!important;
        bottom:20px!important;
        margin:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:5px!important;
        font-size:23px!important;
        line-height:25px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        text-align:right!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{
        width:21px!important;height:21px!important;
      }
      #home.home-view .fixa-reference-header-right #homeDatePill{
        position:absolute!important;
        right:0!important;
        bottom:0!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        color:#64748b!important;
        font-size:14px!important;
        line-height:17px!important;
        white-space:nowrap!important;
        text-align:right!important;
      }

      /* Primeira linha */
      #home.home-view #homeSummaryCards.fixa-week-summary,
      #home.home-view #homeSummaryCards{
        width:100%!important;
        display:grid!important;
        grid-template-columns:repeat(6,minmax(0,1fr))!important;
        gap:7px!important;
        margin:0!important;
        padding:0!important;
        align-items:stretch!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card,
      #home.home-view #homeSummaryCards .home-card{
        height:66px!important;
        min-height:66px!important;
        box-sizing:border-box!important;
        display:grid!important;
        grid-template-columns:40px minmax(0,1fr)!important;
        align-items:center!important;
        gap:9px!important;
        padding:7px 9px!important;
        border:1px solid #e3e9f2!important;
        border-radius:9px!important;
        background:#fff!important;
        box-shadow:0 1px 3px rgba(15,23,42,.04)!important;
        overflow:hidden!important;
        cursor:default!important;
        transform:none!important;
        animation:none!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="collections"]{background:linear-gradient(90deg,#ecf9f2 0%,#fff 72%)!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="questions"]{background:linear-gradient(90deg,#eff6ff 0%,#fff 72%)!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"]{background:linear-gradient(90deg,#fff5e8 0%,#fff 72%)!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"]{background:linear-gradient(90deg,#f7f1ff 0%,#fff 72%)!important}
      #home.home-view #homeSummaryCards .fixa-week-summary-icon{
        width:40px!important;height:40px!important;min-width:40px!important;
        border:0!important;border-radius:0!important;display:grid!important;place-items:center!important;
        background:transparent!important;overflow:visible!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-icon img{
        width:40px!important;height:40px!important;max-width:40px!important;max-height:40px!important;
        display:block!important;object-fit:contain!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon{
        border-radius:8px!important;background:#eef5ff!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon img,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon img{
        width:26px!important;height:26px!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card strong,
      #home.home-view #homeSummaryCards .home-card strong{
        display:block!important;min-width:0!important;margin:0!important;overflow:hidden!important;
        text-overflow:ellipsis!important;white-space:nowrap!important;color:#172033!important;
        font-size:11px!important;line-height:13px!important;font-weight:800!important;
      }
      #home.home-view #homeSummaryCards .home-card-number{
        display:block!important;margin:0!important;font-size:20px!important;line-height:21px!important;
        font-weight:850!important;white-space:nowrap!important;animation:none!important;transition:none!important;
      }
      #home.home-view #homeSummaryCards small{
        display:block!important;min-width:0!important;margin:0!important;overflow:hidden!important;
        text-overflow:ellipsis!important;white-space:nowrap!important;color:#64748b!important;
        font-size:9px!important;line-height:10px!important;font-weight:550!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="collections"] .home-card-number{color:#15803d!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="questions"] .home-card-number{color:#0b69a3!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"] .home-card-number{color:#d97706!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"] .home-card-number{color:#7c3aed!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .home-card-number,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .home-card-number{color:#2563eb!important}

      #home.home-view .fixa-reference-period-row{min-height:34px!important;margin:6px 0 7px!important}
      #home.home-view .fixa-reference-period-row .fixa-week-period{display:flex!important;gap:4px!important}
      #home.home-view .fixa-reference-period-row .fixa-week-period button{
        display:inline-flex!important;height:34px!important;min-height:34px!important;padding:0 14px!important;
        border-radius:8px!important;font-size:11px!important;
      }

      /* Segunda linha */
      #home.home-view #homeFooterStats{
        width:100%!important;display:grid!important;grid-template-columns:1.05fr 1fr 1.05fr!important;
        height:116px!important;min-height:116px!important;gap:9px!important;margin:0 0 9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card{
        height:116px!important;min-height:116px!important;padding:11px 13px!important;border-radius:10px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head h3{font-size:13px!important;line-height:16px!important}
      #home.home-view #homeFooterStats .fixa-week-main-value{font-size:23px!important;line-height:25px!important}
      #home.home-view #homeFooterStats .fixa-week-symbol{width:27px!important;height:27px!important;border-radius:8px!important}
      #home.home-view #homeFooterStats .fixa-week-days{margin-top:5px!important;gap:4px!important}
      #home.home-view #homeFooterStats .fixa-week-day i{width:27px!important;height:27px!important;font-size:11px!important}

      /* Terceira linha */
      #home.home-view .fixa-week-main-shell{
        position:relative!important;isolation:isolate!important;
        height:var(--fixa-third-line-height,300px)!important;min-height:180px!important;max-height:none!important;
        margin:0!important;box-sizing:border-box!important;border:1px solid #dfe6f0!important;border-radius:11px!important;
        background:#fff!important;box-shadow:0 1px 2px rgba(15,23,42,.025), inset 0 -1px 0 #dfe6f0!important;
        overflow:hidden!important;display:flex!important;flex-direction:column!important;
      }
      #home.home-view .fixa-week-main-shell::after{content:none!important;display:none!important}
      #home.home-view .fixa-week-content-tabs{
        position:relative!important;z-index:1!important;flex:0 0 auto!important;
        overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin!important;scrollbar-color:#b7c5da transparent!important;
      }
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar{height:5px!important}
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar-track{background:transparent!important}
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar-thumb{background:#b7c5da!important;border-radius:999px!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        position:relative!important;z-index:1!important;flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:none!important;
        padding:9px 11px 24px!important;overflow-y:auto!important;overflow-x:hidden!important;
        scrollbar-width:thin!important;scrollbar-color:#aebbd0 transparent!important;scrollbar-gutter:stable!important;overscroll-behavior:contain!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar{width:7px!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar-track{background:transparent!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar-thumb{background:#aebbd0!important;border-radius:999px!important}
      #home.home-view .fixa-week-main-stage [data-fixa-main-panel],
      #home.home-view .fixa-week-main-stage .fixa-week-main-pair{height:auto!important;min-height:0!important;max-height:none!important}
      #home.home-view .fixa-week-main-pane .home-collection-scroll{height:190px!important;max-height:190px!important}
      #home.home-view .home-collection-grid.fixa-week-collection-list{gap:6px!important}
      #home.home-view .fixa-week-collection{height:96px!important;min-height:96px!important;padding:7px 8px!important;border-radius:8px!important}
      #home.home-view .fixa-week-collection .home-collection-name,
      #home.home-view .fixa-week-collection .home-collection-total{font-size:8.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics b{font-size:9.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics small{font-size:6.8px!important}
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status{height:187px!important}
      #home.home-view .fixa-unified-chart-box{height:198px!important}

      @media(max-width:1159px){#home.home-view #homeSummaryCards{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      @media(max-width:900px){
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
      }
      @media(max-width:760px){
        body.${BODY_CLASS}{overflow:auto!important}
        body.${BODY_CLASS} #home.home-view.active{height:auto!important;overflow:visible!important;padding-top:10px!important;padding-bottom:10px!important}
        #home.home-view .fixa-reference-header-row{height:auto!important;min-height:38px!important;transform:none!important;grid-template-columns:1fr!important;gap:7px!important}
        #home.home-view .fixa-reference-header-right{position:static!important;height:auto!important;min-height:0!important;display:grid!important;justify-self:start!important;text-align:left!important}
        #home.home-view .fixa-reference-header-right #homeGreeting,
        #home.home-view .fixa-reference-header-right #homeDatePill{position:static!important;text-align:left!important;justify-content:flex-start!important}
        #home.home-view .fixa-week-filters{width:100%!important;display:grid!important;grid-template-columns:1fr!important;gap:7px!important}
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        #home.home-view #homeSummaryCards .fixa-week-summary-card,
        #home.home-view #homeSummaryCards .home-card{height:auto!important;min-height:62px!important}
        #home.home-view #homeFooterStats{grid-template-columns:1fr!important;height:auto!important;min-height:0!important}
        #home.home-view #homeFooterStats .fixa-week-top-card{height:auto!important;min-height:116px!important}
        #home.home-view .fixa-week-main-shell{height:var(--fixa-third-line-height,280px)!important;min-height:180px!important}
      }
      @media(max-width:440px){#home.home-view #homeSummaryCards{grid-template-columns:1fr!important}}
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

    let period = document.querySelector('.fixa-week-period');
    if (!period) {
      period = document.createElement('div');
      period.className = 'fixa-week-period';
      period.setAttribute('role', 'group');
      period.setAttribute('aria-label', 'Período do painel');
      period.innerHTML = '<button type="button" data-fixa-week-period="today">Hoje</button><button type="button" data-fixa-week-period="week" class="active">Semana</button><button type="button" data-fixa-week-period="month">Mês</button>';
    }
    if (period.parentElement !== row) row.appendChild(period);

    if (row.parentElement !== todayShell || row.previousElementSibling !== summary) summary.insertAdjacentElement('afterend', row);
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

  function syncHomeMode() {
    const active = Boolean(document.querySelector('#home.home-view.active'));
    document.body?.classList.toggle(BODY_CLASS, active);
    if (active && window.scrollY !== 0) window.scrollTo({ top:0, left:0, behavior:'auto' });
    return active;
  }

  function cardLabel(card) {
    return card?.querySelector('strong')?.textContent?.trim() || '';
  }

  function applySummaryArtwork(card, label) {
    const meta = SUMMARY_META[label];
    if (!card || !meta) return;
    card.dataset.fixaVisualKey = meta.key;
    const iconBox = card.querySelector('.fixa-week-summary-icon');
    if (!iconBox) return;
    const current = iconBox.querySelector('img[data-fixa-reference-asset]');
    if (current?.dataset.fixaReferenceAsset === meta.asset) return;
    iconBox.innerHTML = `<img src="${encodeURI(meta.asset)}" data-fixa-reference-asset="${meta.asset}" alt="" aria-hidden="true">`;
  }

  function normalizeSummaryGrid() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid || syncing) return grid;
    syncing = true;
    try {
      document.getElementById(LEGACY_STABLE_ID)?.remove();
      const cards = Array.from(grid.children).filter(el => el.matches?.('.fixa-week-summary-card, .home-card'));
      const byLabel = new Map();
      cards.forEach(card => {
        const label = cardLabel(card);
        if (!SUMMARY_ORDER.includes(label) || byLabel.has(label)) {
          card.remove();
          return;
        }
        byLabel.set(label, card);
        applySummaryArtwork(card, label);
      });
      SUMMARY_ORDER.forEach(label => {
        const card = byLabel.get(label);
        if (card && card !== grid.lastElementChild) grid.appendChild(card);
      });
      return grid;
    } finally {
      syncing = false;
    }
  }

  function summaryCard(label) {
    const grid = document.querySelector('#homeSummaryCards');
    return grid ? Array.from(grid.children).find(card => cardLabel(card) === label) || null : null;
  }

  function setSummaryCard(label, value, caption) {
    const card = summaryCard(label);
    if (!card) return;
    const number = card.querySelector('.home-card-number');
    const small = card.querySelector('small, .home-muted');
    if (number && number.textContent !== String(value)) number.textContent = String(value);
    if (small && caption !== undefined && small.textContent !== String(caption || '')) small.textContent = String(caption || '');
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

    const now = new Date();
    const weekStart = new Date(now); weekStart.setHours(0,0,0,0); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay()+6)%7));
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6); weekEnd.setHours(23,59,59,999);
    const weekXp = allTests.filter(test => {
      const date = testDate(test);
      return date && date >= weekStart && date <= weekEnd;
    }).reduce((sum, test) => sum + Number(test?.xp || 0), 0);

    setSummaryCard('Coleções', selected.length, 'Total de coleções');
    setSummaryCard('Questões', cards.length, 'Total de questões');
    setSummaryCard('Dominadas', mastered, `${percent(mastered, cards.length)}% do total`);
    setSummaryCard('Aproveitamento', `${percent(score, total)}%`, 'Média dos testes');
    setSummaryCard('XP Coleções', xp, '');
    setSummaryCard('XP Semana', weekXp, '');
  }

  function activateMainTab(key) {
    const shell = document.querySelector('#home.home-view .fixa-week-main-shell');
    if (!shell) return false;
    const buttons = Array.from(shell.querySelectorAll('[data-fixa-main-tab]'));
    const panels = Array.from(shell.querySelectorAll('[data-fixa-main-panel]'));
    if (!buttons.length || !panels.length) return false;
    const available = new Set(panels.map(panel => panel.dataset.fixaMainPanel));
    const fallback = available.has('performance-goals') ? 'performance-goals' : panels[0]?.dataset.fixaMainPanel;
    const activeKey = available.has(key) ? key : fallback;
    if (!activeKey) return false;
    buttons.forEach(button => {
      const active = button.dataset.fixaMainTab === activeKey;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.dataset.fixaMainPanel === activeKey;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    return true;
  }

  function syncMainTabs() {
    const shell = document.querySelector('#home.home-view .fixa-week-main-shell');
    if (!shell) return false;
    const selected = shell.querySelector('[data-fixa-main-tab].active, [data-fixa-main-tab][aria-selected="true"]');
    const visible = Array.from(shell.querySelectorAll('[data-fixa-main-panel]')).find(panel => !panel.hidden);
    return activateMainTab(selected?.dataset.fixaMainTab || visible?.dataset.fixaMainPanel || 'performance-goals');
  }

  function fitThirdLine() {
    const shell = document.querySelector('#home.home-view .fixa-week-main-shell');
    if (!shell || shell.offsetParent === null || !syncHomeMode()) return false;
    const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
    if (!viewportHeight) return false;
    const top = Math.round(shell.getBoundingClientRect().top);
    const bottomGap = 32;
    const target = Math.max(180, Math.floor(viewportHeight - top - bottomGap));
    shell.style.setProperty('--fixa-third-line-height', `${target}px`);
    return true;
  }

  function scheduleFit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      fitFrame = 0;
      fitThirdLine();
    });
  }

  function observeGrid(grid) {
    if (!grid || grid === observedGrid) return;
    gridObserver?.disconnect();
    observedGrid = grid;
    gridObserver = new MutationObserver(() => scheduleSync());
    gridObserver.observe(grid, { childList:true });
  }

  function finishLoadingGuard(success) {
    if (success) document.getElementById(LOADING_GUARD_ID)?.remove();
  }

  function scheduleSync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      syncAll();
    });
  }

  function syncAll() {
    ensureStyle();
    const homeActive = syncHomeMode();
    const headerReady = ensureHeaderLayout();
    if (headerReady) fillCollectionFilter();
    const bodyReady = arrangeBody();
    const grid = normalizeSummaryGrid();
    observeGrid(grid);
    renderCollectionSelection();
    syncMainTabs();
    if (homeActive) scheduleFit();
    const ready = Boolean(headerReady && bodyReady && grid);
    finishLoadingGuard(ready);
    return ready;
  }

  document.addEventListener('click', event => {
    const mainTab = event.target.closest('#home.home-view [data-fixa-main-tab]');
    if (mainTab) {
      const key = mainTab.dataset.fixaMainTab;
      requestAnimationFrame(() => {
        activateMainTab(key);
        scheduleFit();
      });
      return;
    }

    if (event.target.closest('[data-view], #homeTopTab, [data-fixa-week-period], #fixaWeekFolderFilter, #fixaReferenceCollectionFilter')) {
      requestAnimationFrame(() => {
        syncHomeMode();
        scheduleSync();
      });
    }
  });

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) {
      state.subjectId = 'all';
      setTimeout(scheduleSync, 0);
      return;
    }
    const collection = event.target.closest('#fixaReferenceCollectionFilter');
    if (collection) {
      state.subjectId = collection.value || 'all';
      if (state.subjectId === 'all') window.FixaHomeWeeklyDashboardV2?.refresh?.();
      setTimeout(scheduleSync, 0);
    }
  });

  window.addEventListener('fixa-cloud-data-loaded', () => setTimeout(scheduleSync, 0));
  window.addEventListener('resize', scheduleFit, { passive:true });
  window.visualViewport?.addEventListener('resize', scheduleFit, { passive:true });
  window.addEventListener('load', scheduleSync, { once:true });

  let tries = 0;
  const boot = window.setInterval(() => {
    tries += 1;
    const ready = syncAll();
    if (ready || tries >= 40) {
      window.clearInterval(boot);
      if (!ready) document.getElementById(LOADING_GUARD_ID)?.remove();
    }
  }, 150);

  syncAll();
})();
