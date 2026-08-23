(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const LEGACY_STABLE_ID = 'fixaStableSummaryCards';
  const SUMMARY_ORDER = ['Coleções', 'Questões', 'Dominadas', 'Aproveitamento', 'XP Coleções', 'XP Semana'];
  const SUMMARY_META = Object.freeze({
    'Coleções': { key: 'collections', asset: 'referencias/icone_livros_colecoes.png' },
    'Questões': { key: 'questions', asset: 'referencias/ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png' },
    'Dominadas': { key: 'mastered', asset: 'referencias/icone_trofeu_dominadas.png' },
    'Aproveitamento': { key: 'accuracy', asset: 'referencias/ChatGPT Image 1 de ago. de 2026, 12_31_23.png' },
    'XP Coleções': { key: 'xp-total', asset: 'referencias/icone_xp_colecoes.svg' },
    'XP Semana': { key: 'xp-week', asset: 'referencias/icone_xp_semana.svg' }
  });

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
      /* Código Fixa 9: correções pontuais da Home. Não amplia o layout global. */

      /* A navegação antiga Semana/Atividade não faz parte da Home atual. */
      #home.home-view .home-subtabs{
        display:none!important;
      }

      /* Mantém somente a faixa oficial dos seis resumos. */
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
        transform:none!important;
      }

      /* Preserva a qualidade visual aprovada, sem aumentar os cards. */
      #home.home-view #homeSummaryCards [data-fixa-visual-key="collections"]{
        background:linear-gradient(90deg,#ecf9f2 0%,#ffffff 72%)!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="questions"]{
        background:linear-gradient(90deg,#eff6ff 0%,#ffffff 72%)!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"]{
        background:linear-gradient(90deg,#fff5e8 0%,#ffffff 72%)!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"]{
        background:linear-gradient(90deg,#f7f1ff 0%,#ffffff 72%)!important;
      }

      #home.home-view #homeSummaryCards .fixa-week-summary-icon{
        width:40px!important;
        height:40px!important;
        min-width:40px!important;
        border:0!important;
        border-radius:0!important;
        display:grid!important;
        place-items:center!important;
        background:transparent!important;
        overflow:visible!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-icon img{
        width:40px!important;
        height:40px!important;
        max-width:40px!important;
        max-height:40px!important;
        display:block!important;
        object-fit:contain!important;
        background:transparent!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon{
        border-radius:8px!important;
        background:#eef5ff!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon img,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon img{
        width:26px!important;
        height:26px!important;
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
      #home.home-view #homeSummaryCards [data-fixa-visual-key="collections"] .home-card-number{color:#15803d!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="questions"] .home-card-number{color:#0b69a3!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"] .home-card-number{color:#d97706!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"] .home-card-number{color:#7c3aed!important}
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .home-card-number,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .home-card-number{color:#2563eb!important}

      /* Cabeçalho e filtros voltam à escala compacta anterior. */
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

      /* Hoje / Semana / Mês continuam existentes, mas em escala anterior. */
      #home.home-view .fixa-reference-period-row{
        min-height:34px!important;
        margin:6px 0 7px!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period{
        display:flex!important;
        gap:4px!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period button{
        display:inline-flex!important;
        height:34px!important;
        min-height:34px!important;
        padding:0 14px!important;
        border-radius:8px!important;
        font-size:11px!important;
      }

      /* Segunda linha: restaura o tamanho anterior sem perder o conteúdo. */
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

      /* Terceira linha: volta à altura anterior. As abas permanecem todas visíveis. */
      #home.home-view .fixa-week-main-shell{
        margin:0 0 12px!important;
        border-radius:11px!important;
      }
      #home.home-view .fixa-week-content-tabs{
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
      }
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar{display:none!important}
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
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status{height:187px!important}
      #home.home-view .fixa-unified-chart-box{height:198px!important}

      @media(max-width:1159px){
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
      @media(max-width:900px){
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
      }
      @media(max-width:760px){
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        #home.home-view #homeSummaryCards .fixa-week-summary-card,
        #home.home-view #homeSummaryCards .home-card{height:auto!important;min-height:62px!important}
        #home.home-view #homeFooterStats{height:auto!important;min-height:0!important}
        #home.home-view #homeFooterStats .fixa-week-top-card{height:auto!important;min-height:116px!important}
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
    const key = selected?.dataset.fixaMainTab || visible?.dataset.fixaMainPanel || 'performance-goals';
    return activateMainTab(key);
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
    syncMainTabs();
    return Boolean(grid);
  }

  document.addEventListener('click', event => {
    const mainTab = event.target.closest('#home.home-view [data-fixa-main-tab]');
    if (mainTab) {
      const key = mainTab.dataset.fixaMainTab;
      requestAnimationFrame(() => activateMainTab(key));
      return;
    }

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
