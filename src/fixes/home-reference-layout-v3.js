(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const LEGACY_STABLE_ID = 'fixaStableSummaryCards';
  const SUMMARY_ORDER = ['Coleções', 'Questões', 'Dominadas', 'Aproveitamento', 'XP Coleções', 'XP Semana'];
  const SUMMARY_META = Object.freeze({
    'Coleções': {
      key: 'collections',
      asset: 'referencias/icone_livros_colecoes.png'
    },
    'Questões': {
      key: 'questions',
      asset: 'referencias/ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png'
    },
    'Dominadas': {
      key: 'mastered',
      asset: 'referencias/icone_trofeu_dominadas.png'
    },
    'Aproveitamento': {
      key: 'accuracy',
      asset: 'referencias/ChatGPT Image 1 de ago. de 2026, 12_31_23.png'
    },
    'XP Coleções': {
      key: 'xp-total',
      asset: 'referencias/icone_xp_colecoes.svg'
    },
    'XP Semana': {
      key: 'xp-week',
      asset: 'referencias/icone_xp_semana.svg'
    }
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
      /* ===== CÓDIGO FIXA 9 — HOME DE REFERÊNCIA =====
       * Regra: um único resumo visual (#homeSummaryCards), sem alterar cálculos.
       * A primeira captura aprovada é a referência de proporção e identidade.
       */

      body.home-active{
        background:#f6f8fc!important;
      }

      body.home-active #appShell.app:not(.locked){
        width:100%!important;
        max-width:none!important;
        margin:0!important;
      }

      body.home-active #appShell>main{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        padding:12px clamp(28px,2.1vw,40px) 28px!important;
        background:#f6f8fc!important;
      }

      body.home-active #home.home-view,
      body.home-active #home.home-view>.home-shell,
      body.home-active #home.home-view [data-home-panel="today"]>.home-shell{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        margin-left:0!important;
        margin-right:0!important;
      }

      /* Topbar: recuperar presença sem mudar ordem ou funções. */
      @media(min-width:861px){
        body.home-active #appShell .topbar{
          width:100%!important;
          min-height:58px!important;
          margin:0 0 12px!important;
          align-items:center!important;
        }
        body.home-active #appShell .topbar-right .tabs{
          gap:10px!important;
        }
        body.home-active #appShell .topbar-right .tabs .tab{
          min-height:48px!important;
          height:48px!important;
          padding:0 18px!important;
          border-radius:11px!important;
          font-size:13px!important;
        }
      }

      /* Cabeçalho: filtros à esquerda e saudação à direita. */
      #home.home-view .home-hero-head{
        min-height:0!important;
        margin:0 0 14px!important;
        padding:0!important;
      }
      #home.home-view .fixa-reference-header-row{
        width:100%!important;
        min-height:52px!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        align-items:center!important;
        gap:24px!important;
      }
      #home.home-view .fixa-reference-header-left{
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
      }
      #home.home-view .fixa-reference-header-right{
        min-width:230px!important;
        display:grid!important;
        justify-items:end!important;
        align-content:center!important;
        gap:1px!important;
        text-align:right!important;
      }
      #home.home-view .fixa-week-filters{
        width:auto!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        flex-wrap:nowrap!important;
        gap:14px!important;
        margin:0!important;
      }
      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter{
        height:43px!important;
        min-height:43px!important;
        padding:0 12px!important;
        border:1px solid #dce6f3!important;
        border-radius:11px!important;
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        color:#53617a!important;
        background:#fff!important;
        box-shadow:0 1px 3px rgba(15,23,42,.02)!important;
      }
      #home.home-view .fixa-week-folder-filter{width:270px!important;min-width:270px!important}
      #home.home-view .fixa-reference-collection-filter{width:340px!important;min-width:340px!important}
      #home.home-view .fixa-week-folder-filter select,
      #home.home-view .fixa-reference-collection-filter select{
        height:40px!important;
        min-width:0!important;
        border:0!important;
        padding-top:0!important;
        padding-bottom:0!important;
        box-shadow:none!important;
        color:#26324b!important;
        background:#fff!important;
        font-size:13px!important;
        font-weight:750!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting{
        margin:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:5px!important;
        color:#172033!important;
        font-size:20px!important;
        line-height:24px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        text-align:right!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{
        width:20px!important;
        height:20px!important;
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

      /* Resumo: o grid oficial é o único visual. */
      #home.home-view #${LEGACY_STABLE_ID}{display:none!important}
      #home.home-view #homeSummaryCards.fixa-week-summary,
      #home.home-view #homeSummaryCards{
        width:100%!important;
        display:grid!important;
        grid-template-columns:repeat(6,minmax(0,1fr))!important;
        align-items:stretch!important;
        gap:12px!important;
        margin:0!important;
        padding:0!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card,
      #home.home-view #homeSummaryCards .home-card{
        --fixa-summary-bg:#fff;
        --fixa-summary-accent:#172033;
        height:92px!important;
        min-height:92px!important;
        box-sizing:border-box!important;
        display:grid!important;
        grid-template-columns:56px minmax(0,1fr)!important;
        align-items:center!important;
        gap:12px!important;
        padding:11px 14px!important;
        border:1px solid #e3e9f2!important;
        border-radius:14px!important;
        background:var(--fixa-summary-bg)!important;
        box-shadow:0 2px 8px rgba(15,23,42,.05)!important;
        overflow:hidden!important;
        cursor:default!important;
        transform:none!important;
        animation:none!important;
        transition:border-color .15s ease,box-shadow .15s ease!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card:hover,
      #home.home-view #homeSummaryCards .home-card:hover{
        border-color:#d5dfed!important;
        background:var(--fixa-summary-bg)!important;
        box-shadow:0 3px 10px rgba(15,23,42,.06)!important;
        transform:none!important;
      }

      #home.home-view #homeSummaryCards [data-fixa-visual-key="collections"]{
        --fixa-summary-bg:linear-gradient(105deg,#ecf9f2 0%,#f7fcf9 54%,#fff 100%);
        --fixa-summary-accent:#15803d;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="questions"]{
        --fixa-summary-bg:linear-gradient(105deg,#eff6ff 0%,#f7faff 54%,#fff 100%);
        --fixa-summary-accent:#0b69a3;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="mastered"]{
        --fixa-summary-bg:linear-gradient(105deg,#fff5e8 0%,#fffbf4 54%,#fff 100%);
        --fixa-summary-accent:#d97706;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="accuracy"]{
        --fixa-summary-bg:linear-gradient(105deg,#f7f1ff 0%,#fbf8ff 54%,#fff 100%);
        --fixa-summary-accent:#7c3aed;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"],
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"]{
        --fixa-summary-bg:#fff;
        --fixa-summary-accent:#2563eb;
      }

      #home.home-view #homeSummaryCards .fixa-week-summary-icon{
        width:56px!important;
        height:56px!important;
        min-width:56px!important;
        max-width:56px!important;
        display:grid!important;
        place-items:center!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        overflow:visible!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-icon img,
      #home.home-view #homeSummaryCards .home-card-art{
        display:block!important;
        width:54px!important;
        height:54px!important;
        max-width:54px!important;
        max-height:54px!important;
        object-fit:contain!important;
        background:transparent!important;
        filter:none!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon{
        width:48px!important;
        height:48px!important;
        min-width:48px!important;
        max-width:48px!important;
        border-radius:12px!important;
        background:#eef5ff!important;
      }
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-total"] .fixa-week-summary-icon img,
      #home.home-view #homeSummaryCards [data-fixa-visual-key="xp-week"] .fixa-week-summary-icon img{
        width:32px!important;
        height:32px!important;
        max-width:32px!important;
        max-height:32px!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card>span:last-child,
      #home.home-view #homeSummaryCards .home-card>span:last-child{
        min-width:0!important;
      }
      #home.home-view #homeSummaryCards .fixa-week-summary-card strong,
      #home.home-view #homeSummaryCards .home-card strong{
        display:block!important;
        min-width:0!important;
        margin:0 0 1px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#334155!important;
        font-size:14px!important;
        line-height:17px!important;
        font-weight:800!important;
      }
      #home.home-view #homeSummaryCards .home-card-number{
        display:block!important;
        margin:0!important;
        color:var(--fixa-summary-accent)!important;
        font-size:25px!important;
        line-height:27px!important;
        font-weight:900!important;
        white-space:nowrap!important;
        animation:none!important;
        transition:none!important;
      }
      #home.home-view #homeSummaryCards small{
        display:block!important;
        min-width:0!important;
        margin-top:2px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#64748b!important;
        font-size:11px!important;
        line-height:13px!important;
        font-weight:550!important;
      }

      /* Período: os três botões são obrigatórios. */
      #home.home-view .fixa-reference-period-row{
        width:100%!important;
        min-height:40px!important;
        margin:11px 0 17px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:7px!important;
        margin:0!important;
      }
      #home.home-view [data-fixa-week-period="today"],
      #home.home-view [data-fixa-week-period="week"],
      #home.home-view [data-fixa-week-period="month"]{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        height:40px!important;
        min-height:40px!important;
        padding:0 16px!important;
        border:1px solid #dde6f3!important;
        border-radius:9px!important;
        color:#1e293b!important;
        background:#fff!important;
        font-size:12px!important;
        font-weight:750!important;
        box-shadow:none!important;
      }
      #home.home-view [data-fixa-week-period].active{
        border-color:#b9ceff!important;
        color:#2563eb!important;
        background:#eef4ff!important;
        font-weight:850!important;
      }

      /* Segunda faixa: sequência, tempo e objetivo. */
      #home.home-view #homeFooterStats{
        width:100%!important;
        height:132px!important;
        min-height:132px!important;
        display:grid!important;
        grid-template-columns:1.05fr 1fr 1.05fr!important;
        align-items:stretch!important;
        gap:13px!important;
        margin:0 0 12px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card{
        height:132px!important;
        min-height:132px!important;
        padding:15px 17px!important;
        border:1px solid #e3e9f2!important;
        border-radius:14px!important;
        background:#fff!important;
        box-shadow:0 2px 8px rgba(15,23,42,.04)!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head{
        gap:9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head h3{
        color:#172033!important;
        font-size:15px!important;
        line-height:18px!important;
        font-weight:800!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head>b{
        color:#2563eb!important;
        font-size:12px!important;
        font-weight:850!important;
      }
      #home.home-view #homeFooterStats .fixa-week-symbol{
        width:31px!important;
        height:31px!important;
        min-width:31px!important;
        border-radius:9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-symbol svg{
        width:17px!important;
        height:17px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-main-value{
        margin-top:4px!important;
        color:#172033!important;
        font-size:27px!important;
        line-height:29px!important;
        font-weight:900!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card>small,
      #home.home-view #homeFooterStats .fixa-week-top-card>p{
        color:#64748b!important;
        font-size:11px!important;
        line-height:14px!important;
      }
      #home.home-view #homeFooterStats .home-progress{
        height:6px!important;
        border-radius:999px!important;
        background:#e7ecf4!important;
      }
      #home.home-view #homeFooterStats .home-progress>span{
        border-radius:999px!important;
        background:#22c55e!important;
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

      /* Navegação interna: seis opções, sem esconder Atividades. */
      #home.home-view .fixa-week-content-tabs{
        min-height:50px!important;
        height:50px!important;
        display:flex!important;
        align-items:center!important;
        gap:5px!important;
        padding:5px 8px!important;
        border-bottom:1px solid #e7edf5!important;
        background:#f8faff!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
      }
      #home.home-view .fixa-week-content-tabs::-webkit-scrollbar{display:none!important}
      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab]{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:6px!important;
        min-height:39px!important;
        height:39px!important;
        padding:0 16px!important;
        border:0!important;
        border-radius:9px!important;
        color:#53617a!important;
        background:transparent!important;
        font-size:12px!important;
        font-weight:800!important;
        white-space:nowrap!important;
        box-shadow:none!important;
      }
      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab]:hover{
        color:#2563eb!important;
        background:#eef4ff!important;
      }
      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab].active,
      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab][aria-selected="true"]{
        color:#2563eb!important;
        background:#fff!important;
        box-shadow:0 1px 4px rgba(30,64,175,.09)!important;
      }
      #home.home-view [data-fixa-main-tab="activities"]{display:inline-flex!important}

      /* Painel principal: ocupar a altura útil e nunca cortar a última métrica. */
      #home.home-view .fixa-week-main-shell{
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        margin:0 0 18px!important;
        border-radius:14px!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        height:clamp(350px,38vh,390px)!important;
        min-height:350px!important;
        max-height:390px!important;
        padding:12px 15px!important;
        background:#fff!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-pair{
        height:100%!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:16px!important;
      }
      #home.home-view .fixa-week-main-pane{
        height:100%!important;
        min-height:0!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-pair>.fixa-week-main-pane:first-child{
        padding-right:15px!important;
        border-right:1px solid #edf1f6!important;
      }
      #home.home-view .fixa-week-main-pane .home-panel-head{
        min-height:27px!important;
        margin:0 0 9px!important;
      }
      #home.home-view .fixa-week-main-pane .home-panel-head h3,
      #home.home-view .fixa-week-main-pane .home-study-head h3{
        color:#172033!important;
        font-size:15px!important;
        line-height:19px!important;
        font-weight:800!important;
      }

      /* Desempenho recente: seis linhas cabem; as cinco da referência ficam sempre visíveis. */
      #home.home-view .fixa-week-performance-list{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:6px!important;
        margin:0!important;
        padding:0!important;
      }
      #home.home-view .fixa-week-performance-row{
        min-height:52px!important;
        height:52px!important;
        padding:8px 11px!important;
        border:1px solid #e3e9f2!important;
        border-radius:10px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:10px!important;
        background:#fff!important;
      }
      #home.home-view .fixa-week-performance-row>span{
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        min-width:0!important;
        color:#53617a!important;
        font-size:12px!important;
      }
      #home.home-view .fixa-week-performance-row i{
        width:32px!important;
        height:32px!important;
        min-width:32px!important;
        flex:0 0 32px!important;
        border-radius:9px!important;
      }
      #home.home-view .fixa-week-performance-row i svg{
        width:16px!important;
        height:16px!important;
      }
      #home.home-view .fixa-week-performance-row>b{
        color:#172033!important;
        font-size:12.5px!important;
        font-weight:800!important;
        white-space:nowrap!important;
      }

      /* Objetivos: manter recompensas e regras, apenas recuperar escala. */
      #home.home-view .fixa-week-goal-list{
        display:grid!important;
        gap:7px!important;
        margin:0!important;
        padding:0!important;
      }
      #home.home-view .fixa-week-goal{
        min-height:60px!important;
        padding:8px 10px!important;
        border:1px solid #e3e9f2!important;
        border-radius:10px!important;
        background:#fff!important;
      }
      #home.home-view .fixa-week-goal-head{
        grid-template-columns:30px minmax(0,1fr) auto!important;
        gap:8px!important;
      }
      #home.home-view .fixa-week-goal-head>i{
        width:30px!important;
        height:30px!important;
        border-radius:9px!important;
        background:#eef4ff!important;
        color:#2563eb!important;
      }
      #home.home-view .fixa-week-goal-head>i svg{
        width:15px!important;
        height:15px!important;
      }
      #home.home-view .fixa-week-goal-head strong{
        color:#172033!important;
        font-size:12px!important;
        line-height:15px!important;
        font-weight:800!important;
      }
      #home.home-view .fixa-week-goal-head small{
        color:#64748b!important;
        font-size:10px!important;
        line-height:12px!important;
      }
      #home.home-view .fixa-goal-reward{
        padding:4px 8px!important;
        border-radius:999px!important;
        color:#7c3aed!important;
        background:#f3e8ff!important;
        font-size:10px!important;
        font-weight:850!important;
      }
      #home.home-view .fixa-week-goal .home-progress{
        height:6px!important;
        margin-top:5px!important;
        background:#e8edf5!important;
      }
      #home.home-view .fixa-week-goal .home-progress>span{
        background:#22c55e!important;
      }

      /* As demais abas crescem junto com a área principal, sem caixa de 235 px. */
      #home.home-view .home-study-card .home-focus-box,
      #home.home-view .fixa-week-main-pane .home-collection-scroll{
        height:calc(100% - 36px)!important;
        max-height:none!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
      }
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status{
        height:calc(100% - 36px)!important;
        max-height:none!important;
      }
      #home.home-view .fixa-unified-chart-box{
        height:calc(100% - 30px)!important;
        max-height:none!important;
      }
      #home.home-view .fixa-week-activities-panel>.home-activity-panel{
        height:100%!important;
        min-height:0!important;
        max-height:none!important;
      }
      #home.home-view .fixa-week-activities-panel .home-activity-scroll{
        max-height:calc(100% - 42px)!important;
        overflow-y:auto!important;
      }

      /* Responsividade: preservar identidade, nunca ocultar Semana/Atividades. */
      @media(max-width:1179px){
        body.home-active #appShell>main{padding-left:24px!important;padding-right:24px!important}
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        #home.home-view .fixa-reference-header-row{grid-template-columns:1fr!important;gap:8px!important}
        #home.home-view .fixa-reference-header-right{justify-items:start!important;text-align:left!important}
        #home.home-view .fixa-reference-header-right #homeGreeting{justify-content:flex-start!important;text-align:left!important}
        #home.home-view .fixa-reference-header-right #homeDatePill{text-align:left!important}
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{height:360px!important;min-height:360px!important;max-height:360px!important}
      }
      @media(max-width:899px){
        body.home-active #appShell>main{padding-left:16px!important;padding-right:16px!important}
        #home.home-view .fixa-week-filters{width:100%!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
        #home.home-view #homeSummaryCards{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #home.home-view #homeFooterStats{grid-template-columns:1fr!important;height:auto!important;min-height:0!important}
        #home.home-view #homeFooterStats .fixa-week-top-card{height:auto!important;min-height:126px!important}
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{height:auto!important;min-height:340px!important;max-height:none!important}
        #home.home-view .fixa-week-main-pair{grid-template-columns:1fr!important;height:auto!important}
        #home.home-view .fixa-week-main-pair>.fixa-week-main-pane:first-child{padding-right:0!important;padding-bottom:14px!important;border-right:0!important;border-bottom:1px solid #edf1f6!important}
        #home.home-view .fixa-week-main-pane{height:auto!important;overflow:visible!important}
        #home.home-view .home-study-card .home-focus-box,
        #home.home-view .fixa-week-main-pane .home-collection-scroll,
        #home.home-view .fixa-unified-priority-list,
        #home.home-view .fixa-unified-question-status,
        #home.home-view .fixa-unified-chart-box{height:auto!important;max-height:none!important}
      }
      @media(max-width:599px){
        body.home-active #appShell>main{padding-left:12px!important;padding-right:12px!important}
        #home.home-view #homeSummaryCards{grid-template-columns:1fr!important}
        #home.home-view #homeSummaryCards .fixa-week-summary-card,
        #home.home-view #homeSummaryCards .home-card{height:auto!important;min-height:82px!important}
        #home.home-view .fixa-reference-period-row .fixa-week-period{width:100%!important}
        #home.home-view [data-fixa-week-period]{flex:1 1 0!important;padding:0 10px!important}
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

  function observeGrid(grid) {
    if (!grid || grid === observedGrid) return;
    gridObserver?.disconnect();
    observedGrid = grid;
    gridObserver = new MutationObserver(() => scheduleSync());
    gridObserver.observe(grid, { childList: true, subtree: true });
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
    if (event.target.closest('[data-view="home"], #homeTopTab, [data-fixa-week-period], [data-fixa-main-tab], #fixaWeekFolderFilter, #fixaReferenceCollectionFilter')) {
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
