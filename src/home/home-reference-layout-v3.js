(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const LEGACY_STABLE_ID = 'fixaStableSummaryCards';
  const BODY_CLASS = 'fixa-home-v3-active';
  const LOADING_GUARD_ID = 'fixaHomeLayoutLoadingGuard';
  const SUMMARY_ORDER = ['Coleções', 'Questões', 'Congeladas', 'Dominadas', 'Aproveitamento', 'XP Coleções'];
  const SUMMARY_META = Object.freeze({
    'Coleções': { key: 'collections', asset: 'assets/icons/home-collections.svg' },
    'Questões': { key: 'questions', asset: 'assets/icons/home-questions.svg' },
    'Congeladas': { key: 'frozen', asset: 'assets/icons/home-frozen-questions.svg' },
    'Dominadas': { key: 'mastered', asset: 'assets/icons/home-mastered.svg' },
    'Aproveitamento': { key: 'accuracy', asset: 'assets/icons/home-accuracy.svg' },
    'XP Coleções': { key: 'xp-total', asset: 'assets/icons/home-xp-collections.svg' }
  });

  const state = { subjectId: 'all' };
  let observedGrid = null;
  let gridObserver = null;
  let syncFrame = 0;
  let fitFrame = 0;
  let syncing = false;
  let syncingActiveCollection = false;
  let activeCollectionHintTimer = 0;
  let primaryTabsObserver = null;

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
          padding-top:18px!important;
          padding-bottom:16px!important;
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
        transform:translateY(0)!important;
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
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip,
      #appShell .topbar-right > .fixa-active-collection-chip{
        height:38px!important;min-height:38px!important;width:184px!important;max-width:184px!important;min-width:164px!important;
        padding:0 11px!important;border:1px solid #bfdbfe!important;border-radius:9px!important;
        display:grid!important;grid-template-columns:18px minmax(0,1fr)!important;align-items:center!important;column-gap:7px!important;
        color:#1d4ed8!important;background:linear-gradient(90deg,#eff6ff 0%,#fff 88%)!important;
        box-shadow:0 2px 8px rgba(37,99,235,.08)!important;box-sizing:border-box!important;flex:0 0 auto!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip svg,
      #appShell .topbar-right > .fixa-active-collection-chip svg{
        width:17px!important;height:17px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;
        stroke-linecap:round!important;stroke-linejoin:round!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip span,
      #appShell .topbar-right > .fixa-active-collection-chip span{min-width:0!important;display:grid!important;gap:0!important}
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip small,
      #appShell .topbar-right > .fixa-active-collection-chip small{
        display:block!important;margin:0!important;color:#64748b!important;font-size:8px!important;line-height:9px!important;
        font-weight:800!important;text-transform:uppercase!important;letter-spacing:.02em!important;white-space:nowrap!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip strong,
      #appShell .topbar-right > .fixa-active-collection-chip strong{
        display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
        color:#172033!important;font-size:11px!important;line-height:14px!important;font-weight:850!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip[data-fixa-active-mode="all"],
      #appShell .topbar-right > .fixa-active-collection-chip[data-fixa-active-mode="all"]{
        border-color:#bfdbfe!important;color:#1d4ed8!important;background:linear-gradient(90deg,#eff6ff 0%,#f8fbff 100%)!important;
        box-shadow:0 2px 8px rgba(37,99,235,.06)!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-active-collection-chip[data-fixa-active-mode="all"] small,
      #appShell .topbar-right > .fixa-active-collection-chip[data-fixa-active-mode="all"] small{
        color:#2563eb!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-streak-help{
        position:relative!important;width:38px!important;min-width:38px!important;max-width:38px!important;
        height:38px!important;min-height:38px!important;max-height:38px!important;flex:0 0 38px!important;
        display:grid!important;place-items:center!important;overflow:visible!important;
      }
      #appShell .topbar-right #homeTopTools .fixa-streak-help-button{
        position:static!important;right:auto!important;top:auto!important;
      }
      #appShell .topbar-right .tabs > .tab.fixa-needs-active-collection{
        opacity:.58!important;cursor:not-allowed!important;filter:saturate(.72)!important;
      }
      #appShell .topbar-right .tabs > .tab[data-view="home"]{order:1!important}
      #appShell .topbar-right .tabs > .tab[data-competition-view],
      #appShell .topbar-right .tabs > .tab[data-view="competition"]{order:2!important}
      #appShell .topbar-right .tabs > .tab[data-view="manage"]{order:3!important}
      #appShell .topbar-right .tabs > .tab[data-view="test"]{order:4!important}
      #appShell .topbar-right .tabs > .tab[data-competition-view],
      #appShell .topbar-right .tabs > .tab[data-view="competition"]{
        margin-right:16px!important;
      }
      .fixa-active-collection-toast{
        position:fixed!important;z-index:9999!important;top:66px!important;right:24px!important;
        max-width:min(360px,calc(100vw - 32px))!important;padding:11px 13px!important;border:1px solid #bfdbfe!important;
        border-radius:12px!important;background:#fff!important;color:#172033!important;box-shadow:0 18px 45px rgba(15,23,42,.18)!important;
        font-size:12px!important;line-height:1.35!important;font-weight:750!important;
      }
      .fixa-active-collection-toast[hidden]{display:none!important}
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
      #home.home-view #homeSummaryCards [data-fixa-visual-key="frozen"]{background:linear-gradient(90deg,#eef8ff 0%,#fff 72%)!important}
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
      #home.home-view #homeSummaryCards [data-fixa-visual-key="frozen"] .home-card-number{color:#0f75bc!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"] .home-card-number{color:#d97706!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"] .home-card-number{color:#7c3aed!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .home-card-number{color:#2563eb!important}

      #home.home-view .fixa-week-filters .fixa-week-period{display:flex!important;gap:4px!important;flex:0 0 auto!important}
      #home.home-view .fixa-week-filters .fixa-week-period button{
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
        margin:0!important;box-sizing:border-box!important;border:0!important;border-radius:11px!important;
        background:#fff!important;box-shadow:0 1px 3px rgba(15,23,42,.045),0 8px 18px rgba(15,23,42,.035)!important;
        overflow:hidden!important;display:flex!important;flex-direction:column!important;
      }
      #home.home-view .fixa-week-main-shell::after{
        content:""!important;display:block!important;position:absolute!important;inset:0!important;
        pointer-events:none!important;border:1px solid #d3ddec!important;border-radius:11px!important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.65)!important;
        z-index:5!important;box-sizing:border-box!important;
      }
      #home.home-view .fixa-week-content-tabs{
        position:relative!important;z-index:1!important;flex:0 0 auto!important;
        border-radius:11px 11px 0 0!important;
        overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin!important;scrollbar-color:#b7c5da transparent!important;
      }
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar{height:5px!important}
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar-track{background:transparent!important}
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar-thumb{background:#b7c5da!important;border-radius:999px!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        position:relative!important;z-index:1!important;flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:none!important;
        margin-right:3px!important;margin-bottom:3px!important;border-radius:0 0 9px 9px!important;
        padding:9px 11px 24px!important;overflow-y:auto!important;overflow-x:hidden!important;
        scrollbar-width:thin!important;scrollbar-color:#aebbd0 transparent!important;scrollbar-gutter:stable!important;overscroll-behavior:contain!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar{width:7px!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar-track{background:transparent!important}
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage::-webkit-scrollbar-thumb{
        background:#aebbd0!important;border:2px solid transparent!important;border-radius:999px!important;background-clip:content-box!important;
      }
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

  function allFolders() {
    return Array.isArray(dataRef()?.folders) ? dataRef().folders : [];
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
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      const [year, month, day] = value.trim().split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function testDate(test) {
    return dateOf(test?.completedOn || test?.occurredOn || test?.occurred_on || test?.completedAt || test?.finishedAt || test?.date);
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

  function activePeriodWord() {
    const period = activePeriod();
    return period === 'today' ? 'hoje' : period === 'month' ? 'mês' : 'semana';
  }

  function periodXpCaption() {
    const period = activePeriod();
    return period === 'today' ? 'XP de hoje' : period === 'month' ? 'XP do mês' : 'XP da semana';
  }

  function testXp(test) {
    return Math.max(0, Number(test?.xp ?? test?.xpBreakdown?.total ?? test?.points ?? 0) || 0);
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function collectionIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg>';
  }

  function activeCollectionIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="m9 13 2 2 4-5"></path></svg>';
  }

  function subjectById(id) {
    const key = String(id || '');
    if (!key) return null;
    return allSubjects().find(subject => String(subject?.id || '') === key) || null;
  }

  function folderNameForSubject(subject) {
    const key = String(subject?.folder || '');
    if (!key) return '';
    return allFolders().find(folder => String(folder?.id || '') === key)?.name || '';
  }

  function currentSubjectSafe() {
    try {
      if (typeof currentSubject === 'function') return currentSubject();
      if (typeof window.currentSubject === 'function') return window.currentSubject();
    } catch (_) {}
    return null;
  }

  function activeCollectionSubject() {
    return state.subjectId !== 'all'
      ? subjectById(state.subjectId)
      : null;
  }

  function selectHasValue(select, value) {
    if (!select) return false;
    const key = String(value || '');
    return Array.from(select.options || []).some(option => option.value === key);
  }

  function setSelectValue(selector, value) {
    const select = document.querySelector(selector);
    if (!select || !selectHasValue(select, value)) return false;
    select.value = String(value || '');
    return true;
  }

  function syncVisibleCollectionRows(subjectId) {
    const key = String(subjectId || '');
    document.querySelectorAll('#subjects .subject[data-id], #collectionsSidebar .subject[data-id]').forEach(row => {
      row.classList.toggle('active', row.dataset.id === key);
    });
  }

  function renderAppSelectionSoon() {
    requestAnimationFrame(() => {
      try {
        if (typeof render === 'function') render();
        else if (typeof window.render === 'function') window.render();
      } catch (_) {}
    });
  }

  function createActiveCollectionChip() {
    const chip = document.createElement('div');
    chip.id = 'fixaActiveCollectionChip';
    chip.className = 'fixa-active-collection-chip';
    chip.setAttribute('aria-live', 'polite');
    chip.innerHTML = `${activeCollectionIcon()}<span><small>Coleção atual</small><strong>Todas as coleções</strong></span>`;
    return chip;
  }

  function directChild(container, selector) {
    return Array.from(container?.children || []).find(child => child.matches?.(selector)) || null;
  }

  function ensureTopbarActiveCollectionChip() {
    const tools = document.querySelector('#homeTopTools');
    const right = document.querySelector('.topbar-right');
    const container = tools || right;
    if (!container) return null;

    let chip = document.querySelector('#fixaActiveCollectionChip');
    if (!chip) chip = createActiveCollectionChip();

    const help = container.querySelector('.fixa-streak-help');
    const anchor = container === tools
      ? tools.querySelector('.fixa-streak-freeze-box, #homeTopStreak, .home-top-streak, .home-top-bell')
      : directChild(container, '.fixa-streak-help, .fixa-streak-freeze-box, #homeTopTools, .auth-panel');

    if (container === tools && help && chip.previousElementSibling !== help) {
      help.insertAdjacentElement('afterend', chip);
    } else if (anchor && anchor !== chip && chip.nextElementSibling !== anchor) {
      container.insertBefore(chip, anchor);
    } else if (chip.parentElement !== container) {
      container.appendChild(chip);
    }
    return chip;
  }

  function restoreTopbarActiveView() {
    const activeView = Array.from(document.querySelectorAll('main > section, .view')).find(section =>
      section?.id && section.classList?.contains('active')
    );
    const key = activeView?.id || 'home';
    document.querySelectorAll('.topbar-right .tabs > .tab[data-view]').forEach(button => {
      const selected = button.dataset.view === key;
      button.classList.toggle('active', selected);
      button.classList.remove('fixa-nav-pending', 'fixa-nav-forced-inactive');
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function showActiveCollectionHint() {
    let toast = document.querySelector('#fixaActiveCollectionToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fixaActiveCollectionToast';
      toast.className = 'fixa-active-collection-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = 'Escolha uma coleção em Minhas coleções antes de abrir Questões ou Teste.';
    toast.hidden = false;
    window.clearTimeout(activeCollectionHintTimer);
    activeCollectionHintTimer = window.setTimeout(() => { toast.hidden = true; }, 2800);
  }

  function setNavigationGuardState(isOverview) {
    document.querySelectorAll('.topbar-right .tabs > .tab[data-view="manage"], .topbar-right .tabs > .tab[data-view="test"]').forEach(button => {
      button.classList.toggle('fixa-needs-active-collection', Boolean(isOverview));
      if (isOverview) {
        button.setAttribute('aria-disabled', 'true');
        button.title = 'Escolha uma coleção antes de abrir esta área.';
      } else {
        button.removeAttribute('aria-disabled');
        if (button.title === 'Escolha uma coleção antes de abrir esta área.') button.removeAttribute('title');
      }
    });
  }

  function shouldBlockCollectionViewNavigation(target) {
    const button = target?.closest?.('.topbar-right .tabs > .tab[data-view="manage"], .topbar-right .tabs > .tab[data-view="test"]');
    return Boolean(button && !activeCollectionSubject());
  }

  function blockCollectionViewNavigation(event) {
    if (!shouldBlockCollectionViewNavigation(event.target)) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    showActiveCollectionHint();
    requestAnimationFrame(restoreTopbarActiveView);
    return true;
  }

  function reorderPrimaryTabs() {
    const tabs = document.querySelector('.topbar-right .tabs');
    if (!tabs) return false;
    const home = tabs.querySelector(':scope > .tab[data-view="home"], :scope > #homeTopTab');
    const competition = tabs.querySelector(':scope > .tab[data-competition-view], :scope > .tab[data-view="competition"]');
    const manage = tabs.querySelector(':scope > .tab[data-view="manage"]');
    const test = tabs.querySelector(':scope > .tab[data-view="test"]');
    const desired = [home, competition, manage, test].filter(Boolean);
    if (desired.length < 2) return false;
    [
      [home, '1', '0'],
      [competition, '2', '16px'],
      [manage, '3', '0'],
      [test, '4', '0']
    ].forEach(([button, order, marginRight]) => {
      if (!button) return;
      button.style.setProperty('order', order, 'important');
      button.style.setProperty('margin-right', marginRight, 'important');
    });
    const currentPrimary = Array.from(tabs.children).filter(child => desired.includes(child));
    if (currentPrimary.length === desired.length && currentPrimary.every((child, index) => child === desired[index])) {
      return true;
    }
    const firstPrimary = Array.from(tabs.children).find(child => desired.includes(child));
    if (!firstPrimary) return false;
    const marker = document.createComment('fixa-primary-tabs-order');
    tabs.insertBefore(marker, firstPrimary);
    desired.forEach(button => tabs.insertBefore(button, marker));
    marker.remove();
    return true;
  }

  function observePrimaryTabs() {
    const tabs = document.querySelector('.topbar-right .tabs');
    if (!tabs || primaryTabsObserver) return;
    primaryTabsObserver = new MutationObserver(() => requestAnimationFrame(reorderPrimaryTabs));
    primaryTabsObserver.observe(tabs, { childList:true, subtree:false });
  }

  function syncActiveCollectionChip() {
    const chip = ensureTopbarActiveCollectionChip();
    if (!chip) return;
    const subject = activeCollectionSubject();
    const folderName = folderNameForSubject(subject);
    const text = subject ? [subject.name || 'Coleção', folderName].filter(Boolean).join(' · ') : 'Todas as coleções';
    const title = subject
      ? `Coleção ativa: ${subject.name || 'Coleção'}${folderName ? ` — Pasta: ${folderName}` : ''}`
      : 'Visão geral: todas as coleções. Escolha uma coleção para abrir Questões ou Teste.';
    chip.dataset.fixaActiveMode = subject ? 'collection' : 'all';
    chip.setAttribute('aria-disabled', subject ? 'false' : 'true');
    chip.title = title;
    const label = chip.querySelector('small');
    const value = chip.querySelector('strong');
    if (label) label.textContent = subject ? 'Coleção ativa' : 'Coleção atual';
    if (value) {
      value.textContent = text;
      value.title = title;
    }
    setNavigationGuardState(!subject);
  }

  function setActiveCollection(id, options = {}) {
    const subject = subjectById(id);
    if (!subject) return false;
    if (syncingActiveCollection) return true;

    syncingActiveCollection = true;
    try {
      const subjectId = String(subject.id);
      const appData = dataRef();
      const previousSelected = String(appData?.selected || '');
      state.subjectId = subjectId;

      if (appData) appData.selected = subjectId;

      const folderSelect = document.querySelector('#fixaWeekFolderFilter');
      const subjectFolder = String(subject.folder || '');
      if (folderSelect && subjectFolder && selectHasValue(folderSelect, subjectFolder)) {
        folderSelect.value = subjectFolder;
      }

      fillCollectionFilter();
      setSelectValue('#fixaReferenceCollectionFilter', subjectId);
      setSelectValue('#questionCollection', subjectId);
      setSelectValue('#importCollection', subjectId);
      syncVisibleCollectionRows(subjectId);
      syncActiveCollectionChip();

      window.FixaHomeWeeklyDashboardV2?.refresh?.();
      if (options.renderApp !== false && previousSelected !== subjectId) renderAppSelectionSoon();
      scheduleSync();
    } finally {
      syncingActiveCollection = false;
    }
    return true;
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
    let period = document.querySelector('.fixa-week-period');
    if (!period) {
      period = document.createElement('div');
      period.className = 'fixa-week-period';
      period.setAttribute('role', 'group');
      period.setAttribute('aria-label', 'Período do painel');
      period.innerHTML = '<button type="button" data-fixa-week-period="today">Hoje</button><button type="button" data-fixa-week-period="week" class="active">Semana</button><button type="button" data-fixa-week-period="month">Mês</button>';
    }
    if (period.parentElement !== filters || period.previousElementSibling !== collection) {
      collection.insertAdjacentElement('afterend', period);
    }

    if (filters.parentElement !== left) left.appendChild(filters);
    if (greeting.parentElement !== right) right.appendChild(greeting);
    if (date.parentElement !== right) right.appendChild(date);
    syncActiveCollectionChip();
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
    syncActiveCollectionChip();
  }

  function removeLegacyPeriodRow(todayShell) {
    todayShell?.querySelector('.fixa-reference-period-row')?.remove();
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
    removeLegacyPeriodRow(todayShell);
    if (footerStats.previousElementSibling !== summary) summary.insertAdjacentElement('afterend', footerStats);
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

  function createSummaryCard(label) {
    const card = document.createElement('article');
    card.className = `home-card fixa-week-summary-card${label.startsWith('XP') ? ' fixa-xp-card' : ''}`;
    card.dataset.fixaSummaryKey = label;
    card.innerHTML = '<span class="fixa-week-summary-icon"></span><span><strong></strong><span class="home-card-number">0</span><small class="home-muted"></small></span>';
    const title = card.querySelector('strong');
    if (title) title.textContent = label;
    applySummaryArtwork(card, label);
    return card;
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
        const card = byLabel.get(label) || createSummaryCard(label);
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
    const allSelectedCards = selected.flatMap(subject => cardsFor(subject));
    const frozen = allSelectedCards.filter(card => statusOf(card) === 'frozen').length;
    const cards = allSelectedCards.filter(card => statusOf(card) !== 'frozen');
    const mastered = cards.filter(card => statusOf(card) === 'mastered').length;
    const allTests = testsForSelection();
    const periodTests = testsInPeriod(allTests);
    const total = periodTests.reduce((sum, test) => sum + Number(test?.total || 0), 0);
    const score = periodTests.reduce((sum, test) => sum + Number(test?.score || 0), 0);
    const xp = periodTests.reduce((sum, test) => sum + testXp(test), 0);

    setSummaryCard('Coleções', selected.length, 'Total de coleções');
    setSummaryCard('Questões', cards.length, 'Total de questões');
    setSummaryCard('Congeladas', frozen, 'Questões congeladas');
    setSummaryCard('Dominadas', mastered, `${percent(mastered, cards.length)}% do total`);
    setSummaryCard('Aproveitamento', `${percent(score, total)}%`, `Média de ${activePeriodWord()}`);
    setSummaryCard('XP Coleções', xp, periodXpCaption());
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

  function collectionIdFromClick(event) {
    if (event.target.closest?.('[data-subject-menu], [data-folder-menu], .collection-favorite, .subject-options')) return '';
    const row = event.target.closest?.('.subject[data-id], [data-home-subject]');
    if (!row) return '';
    if (!row.closest?.('#subjects, #collectionsSidebar, #home')) return '';
    return row.dataset.id || row.dataset.homeSubject || '';
  }

  function handleCollectionSelectionClick(event) {
    const id = collectionIdFromClick(event);
    if (!id) return;
    setActiveCollection(id, { renderApp:false });
    setTimeout(() => setActiveCollection(id, { renderApp:false }), 0);
    setTimeout(() => setActiveCollection(id, { renderApp:false }), 120);
  }

  function syncAll() {
    ensureStyle();
    observePrimaryTabs();
    reorderPrimaryTabs();
    const homeActive = syncHomeMode();
    const headerReady = ensureHeaderLayout();
    if (headerReady) fillCollectionFilter();
    const bodyReady = arrangeBody();
    const grid = normalizeSummaryGrid();
    observeGrid(grid);
    renderCollectionSelection();
    syncActiveCollectionChip();
    syncMainTabs();
    if (homeActive) scheduleFit();
    const ready = Boolean(headerReady && bodyReady && grid);
    finishLoadingGuard(ready);
    return ready;
  }

  document.addEventListener('pointerdown', blockCollectionViewNavigation, true);
  document.addEventListener('click', blockCollectionViewNavigation, true);
  document.addEventListener('click', handleCollectionSelectionClick, true);

  document.addEventListener('click', event => {
    const id = collectionIdFromClick(event);
    if (id) {
      setTimeout(() => setActiveCollection(id), 0);
      setTimeout(() => setActiveCollection(id), 80);
    }

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
      syncActiveCollectionChip();
      setTimeout(scheduleSync, 0);
      return;
    }
    const collection = event.target.closest('#fixaReferenceCollectionFilter');
    if (collection) {
      const value = collection.value || 'all';
      if (value !== 'all' && setActiveCollection(value)) return;
      state.subjectId = 'all';
      window.FixaHomeWeeklyDashboardV2?.refresh?.();
      syncActiveCollectionChip();
      setTimeout(scheduleSync, 0);
      return;
    }
    const appCollection = event.target.closest('#questionCollection');
    if (appCollection) {
      setActiveCollection(appCollection.value);
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
