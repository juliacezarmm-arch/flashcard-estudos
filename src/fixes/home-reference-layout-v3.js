(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const LEGACY_STABLE_ID = 'fixaStableSummaryCards';
  const SUMMARY_ORDER = ['Coleções', 'Questões', 'Dominadas', 'Aproveitamento', 'XP Coleções', 'XP Semana'];
  let observedGrid = null;
  let gridObserver = null;
  let syncFrame = 0;
  let syncing = false;

  const api = window.FixaHomeReferenceLayoutV3 = {
    active: true,
    refresh: syncAll
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /*
       * A Home possui uma única faixa de resumo.
       * O #homeSummaryCards é o renderizador oficial; o antigo espelho estável
       * não participa mais do layout nem recebe valores em paralelo.
       */
      #home.home-view #${LEGACY_STABLE_ID}{display:none!important}
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
        transition:border-color .15s ease,background-color .15s ease!important;
      }

      #home.home-view #homeSummaryCards .fixa-week-summary-card:hover,
      #home.home-view #homeSummaryCards .home-card:hover{
        border-color:#cbd8ea!important;
        background:#fbfdff!important;
        transform:none!important;
      }

      #home.home-view #homeSummaryCards .fixa-week-summary-icon,
      #home.home-view #homeSummaryCards .home-card-art{
        width:40px!important;
        height:40px!important;
        min-width:40px!important;
        max-width:40px!important;
        max-height:40px!important;
        object-fit:contain!important;
        border-radius:0!important;
        background:transparent!important;
      }

      #home.home-view #homeSummaryCards .fixa-week-summary-card strong,
      #home.home-view #homeSummaryCards .home-card strong{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#172033!important;
        font-size:11px!important;
        line-height:13px!important;
        font-weight:800!important;
      }

      #home.home-view #homeSummaryCards .home-card-number{
        display:block!important;
        margin:0!important;
        color:#172033!important;
        font-size:20px!important;
        line-height:21px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        animation:none!important;
        transition:none!important;
      }

      #home.home-view #homeSummaryCards small{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#64748b!important;
        font-size:9px!important;
        line-height:10px!important;
        font-weight:550!important;
      }

      #home.home-view #homeSummaryCards [data-fixa-summary-key="collections"] .home-card-number{color:#15803d!important}
      #home.home-view #homeSummaryCards [data-fixa-summary-key="questions"] .home-card-number{color:#0891b2!important}
      #home.home-view #homeSummaryCards [data-fixa-summary-key="mastered"] .home-card-number{color:#d97706!important}
      #home.home-view #homeSummaryCards [data-fixa-summary-key="accuracy"] .home-card-number{color:#7c3aed!important}
      #home.home-view #homeSummaryCards [data-fixa-summary-key="xp-total"] .home-card-number,
      #home.home-view #homeSummaryCards [data-fixa-summary-key="xp-week"] .home-card-number{color:#2563eb!important}

      /* Mantém os ajustes compactos já aprovados na Home. */
      #home.home-view [data-fixa-week-period="week"],
      #home.home-view [data-fixa-main-tab="activities"]{display:none!important}

      #home.home-view .home-hero-head{margin-bottom:8px!important}
      #home.home-view .fixa-reference-header-row{min-height:44px!important;gap:18px!important}
      #home.home-view .fixa-week-filters{gap:8px!important}
      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter{
        height:38px!important;
        min-height:38px!important;
        padding:0 10px!important;
        border-radius:9px!important;
        gap:7px!important;
      }
      #home.home-view .fixa-week-folder-filter{width:250px!important;min-width:250px!important}
      #home.home-view .fixa-reference-collection-filter{width:315px!important;min-width:315px!important}
      #home.home-view .fixa-week-folder-filter select,
      #home.home-view .fixa-reference-collection-filter select{
        height:36px!important;
        font-size:12px!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting{
        font-size:20px!important;
        line-height:22px!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{
        width:19px!important;
        height:19px!important;
      }
      #home.home-view .fixa-reference-header-right #homeDatePill{
        font-size:11px!important;
        line-height:14px!important;
      }

      #home.home-view .fixa-reference-period-row{
        min-height:34px!important;
        margin:6px 0 7px!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period{gap:4px!important}
      #home.home-view .fixa-reference-period-row .fixa-week-period button{
        height:34px!important;
        min-height:34px!important;
        padding:0 14px!important;
        border-radius:8px!important;
        font-size:11px!important;
      }

      #home.home-view #homeFooterStats{
        height:116px!important;
        min-height:116px!important;
        gap:9px!important;
        margin:0 0 9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card{
        height:116px!important;
        min-height:116px!important;
        padding:11px 13px!important;
        border-radius:10px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head h3{font-size:13px!important;line-height:16px!important}
      #home.home-view #homeFooterStats .fixa-week-main-value{font-size:23px!important;line-height:25px!important}
      #home.home-view #homeFooterStats .fixa-week-symbol{width:27px!important;height:27px!important;border-radius:8px!important}
      #home.home-view #homeFooterStats .fixa-week-days{margin-top:5px!important;gap:4px!important}
      #home.home-view #homeFooterStats .fixa-week-day i{width:27px!important;height:27px!important;font-size:11px!important}

      #home.home-view .fixa-week-main-shell{
        margin:0 0 12px!important;
        border-radius:11px!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        height:235px!important;
        min-height:235px!important;
        max-height:235px!important;
        padding:9px 11px!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-pane .home-collection-scroll{
        height:190px!important;
        max-height:190px!important;
      }
      #home.home-view .home-collection-grid.fixa-week-collection-list{gap:6px!important}
      #home.home-view .fixa-week-collection{
        height:96px!important;
        min-height:96px!important;
        padding:7px 8px!important;
        border-radius:8px!important;
      }
      #home.home-view .fixa-week-collection .home-collection-name,
      #home.home-view .fixa-week-collection .home-collection-total{font-size:8.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics b{font-size:9.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics small{font-size:6.8px!important}
      #home.home-view .fixa-unified-head{margin-bottom:6px!important}
      #home.home-view .fixa-unified-head h3{font-size:12px!important;line-height:15px!important}
      #home.home-view .fixa-unified-head p{font-size:8px!important}
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status{height:187px!important}
      #home.home-view .fixa-unified-chart-box{height:198px!important}

      @media(max-width:1159px){
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
      @media(max-width:760px){
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        #home.home-view #homeSummaryCards .fixa-week-summary-card,
        #home.home-view #homeSummaryCards .home-card{height:auto!important;min-height:62px!important}
        #home.home-view #homeFooterStats{height:auto!important;min-height:0!important}
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{height:auto!important;min-height:235px!important;max-height:none!important}
      }
      @media(max-width:440px){
        #home.home-view #homeSummaryCards{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cardLabel(card) {
    return card?.querySelector('strong')?.textContent?.trim() || '';
  }

  function normalizeSummaryGrid() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid || syncing) return grid;

    syncing = true;
    try {
      document.getElementById(LEGACY_STABLE_ID)?.remove();

      const cards = Array.from(grid.children).filter(element => element.matches?.('.fixa-week-summary-card, .home-card'));
      const byLabel = new Map();

      cards.forEach(card => {
        const label = cardLabel(card);
        if (!SUMMARY_ORDER.includes(label)) {
          card.remove();
          return;
        }
        if (byLabel.has(label)) {
          card.remove();
          return;
        }
        byLabel.set(label, card);
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

  function observeGrid(grid) {
    if (!grid || grid === observedGrid) return;
    gridObserver?.disconnect();
    observedGrid = grid;
    gridObserver = new MutationObserver(() => scheduleSync());
    gridObserver.observe(grid, { childList: true });
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
    const grid = normalizeSummaryGrid();
    observeGrid(grid);
    return Boolean(grid);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"], #homeTopTab, [data-fixa-week-period], #fixaWeekFolderFilter, #fixaReferenceCollectionFilter')) {
      scheduleSync();
    }
  });

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter, #fixaReferenceCollectionFilter')) scheduleSync();
  });

  window.addEventListener('load', scheduleSync, { once: true });

  let tries = 0;
  const boot = window.setInterval(() => {
    tries += 1;
    if (syncAll() || tries >= 40) window.clearInterval(boot);
  }, 150);

  syncAll();
})();
