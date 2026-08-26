(() => {
  'use strict';

  if (window.FixaHomePanelTabsPolishV1?.active) return;
  window.FixaHomePanelTabsPolishV1 = { active: true };

  const STYLE_ID = 'fixaHomePanelTabsPolishV1Style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home.home-view .fixa-week-main-shell{
        display:flex!important;
        flex-direction:column!important;
      }

      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        flex:1 1 auto!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        padding:14px!important;
        overflow:hidden!important;
      }

      #home.home-view .fixa-week-main-stage [data-fixa-main-panel][hidden],
      #home.home-view .fixa-week-main-stage .fixa-week-main-pair[hidden],
      #home.home-view .fixa-week-main-stage .fixa-week-unified-pane[hidden]{
        display:none!important;
      }

      #home.home-view .fixa-week-main-stage [data-fixa-main-panel]:not([hidden]),
      #home.home-view .fixa-week-main-stage .fixa-week-main-pair:not([hidden]){
        height:100%!important;
        min-height:0!important;
        max-height:none!important;
      }

      #home.home-view .fixa-week-main-pair:not([hidden]){
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        align-items:stretch!important;
        gap:16px!important;
      }

      #home.home-view .fixa-week-main-pane,
      #home.home-view .fixa-week-activities-panel > .home-panel,
      #home.home-view .fixa-week-unified-pane:not(.fixa-week-main-pair):not([hidden]),
      #home.home-view .fixa-unified-chart-pane:not([hidden]){
        height:100%!important;
        min-height:0!important;
        max-height:none!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
      }

      #home.home-view .home-study-card .home-study-head,
      #home.home-view .fixa-week-main-pane .home-panel-head,
      #home.home-view .fixa-week-analysis-pane .home-panel-head,
      #home.home-view .fixa-unified-head{
        flex:0 0 auto!important;
        margin:0 0 10px!important;
        min-height:28px!important;
        overflow:visible!important;
        align-items:flex-start!important;
      }

      #home.home-view .home-study-card .home-study-head h3,
      #home.home-view .fixa-week-main-pane .home-panel-head h3,
      #home.home-view .fixa-week-analysis-pane .home-panel-head h3,
      #home.home-view .fixa-unified-head h3{
        width:fit-content!important;
        max-width:100%!important;
        min-height:26px!important;
        padding:5px 10px!important;
        border:1px solid #bfdbfe!important;
        border-radius:8px!important;
        background:#eff6ff!important;
        color:#155be8!important;
        display:inline-flex!important;
        align-items:center!important;
        gap:6px!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
        font-size:11px!important;
        line-height:14px!important;
        font-weight:850!important;
        box-sizing:border-box!important;
      }

      #home.home-view .home-study-card #homeStudyText,
      #home.home-view .fixa-week-main-pane .home-panel-head p,
      #home.home-view .fixa-unified-head p{
        flex:0 0 auto!important;
      }

      #home.home-view .home-study-card .home-focus-box,
      #home.home-view .fixa-week-main-pane .home-collection-scroll,
      #home.home-view .fixa-week-activities-panel .home-activity-scroll,
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status,
      #home.home-view .fixa-unified-chart-box{
        flex:1 1 auto!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
      }

      #home.home-view #homeStudyRecommendations.fixa-review-reference-list{
        height:100%!important;
        min-height:0!important;
        display:grid!important;
        grid-template-rows:none!important;
        grid-auto-rows:minmax(42px,auto)!important;
        align-content:start!important;
        gap:6px!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        padding-right:4px!important;
      }

      #home.home-view .fixa-review-all{
        width:100%!important;
        align-self:stretch!important;
        min-height:32px!important;
        font-size:8px!important;
      }

      #home.home-view .home-collection-grid.fixa-week-collection-list{
        align-content:start!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }

      #home.home-view .fixa-week-collection .home-collection-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:8px!important;
        align-items:center!important;
      }

      #home.home-view .fixa-week-collection .home-collection-name > span:last-child{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }

      #home.home-view .fixa-unified-question-status{
        display:grid!important;
      }

      #home.home-view .fixa-unified-chart-box{
        min-height:260px!important;
        padding:0!important;
      }

      #home.home-view .fixa-unified-chart-box svg,
      #home.home-view .fixa-week-chart-wrap #homeChart svg,
      #home.home-view #homeChart svg{
        width:100%!important;
        height:100%!important;
        display:block!important;
      }

      @media(max-width:760px){
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
          overflow:visible!important;
        }
        #home.home-view .fixa-week-main-stage [data-fixa-main-panel]:not([hidden]),
        #home.home-view .fixa-week-main-stage .fixa-week-main-pair:not([hidden]),
        #home.home-view .fixa-week-main-pane,
        #home.home-view .fixa-week-unified-pane:not(.fixa-week-main-pair){
          height:auto!important;
        }
        #home.home-view .home-collection-grid.fixa-week-collection-list{
          grid-template-columns:1fr!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeActiveCollectionLabel() {
    document.querySelectorAll('#fixaActiveCollectionChip small').forEach(label => {
      if ((label.textContent || '').trim() !== 'Coleção atual') {
        label.textContent = 'Coleção atual';
      }
    });
  }

  function syncMainTab(key) {
    const shell = document.querySelector('#home.home-view .fixa-week-main-shell');
    if (!shell) return false;
    const buttons = Array.from(shell.querySelectorAll('[data-fixa-main-tab]'));
    const panels = Array.from(shell.querySelectorAll('.fixa-week-main-stage > [data-fixa-main-panel]'));
    if (!buttons.length || !panels.length) return false;
    const available = new Set(panels.map(panel => panel.dataset.fixaMainPanel));
    const selected = available.has(key)
      ? key
      : buttons.find(button => button.classList.contains('active') || button.getAttribute('aria-selected') === 'true')?.dataset.fixaMainTab;
    const activeKey = available.has(selected) ? selected : panels[0].dataset.fixaMainPanel;
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

  function boot() {
    ensureStyle();
    normalizeActiveCollectionLabel();
    syncMainTab();
  }

  boot();
  window.addEventListener('load', boot, { once: true });
  document.addEventListener('click', event => {
    const tab = event.target.closest('#home.home-view [data-fixa-main-tab]');
    requestAnimationFrame(() => {
      boot();
      if (tab) syncMainTab(tab.dataset.fixaMainTab);
    });
  }, true);

  const observer = new MutationObserver(() => {
    normalizeActiveCollectionLabel();
    syncMainTab();
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
