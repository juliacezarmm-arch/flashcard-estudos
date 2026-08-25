(() => {
  'use strict';
  if (window.FixaGlobalWideViewsV1) return;
  window.FixaGlobalWideViewsV1 = true;

  const STYLE_ID = 'fixaGlobalWideViewsV1Style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width: 861px) {
        #appShell.app:not(.locked) {
          width: calc(100vw - clamp(80px, 18vw, 300px)) !important;
          max-width: none !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        #appShell.app:not(.locked) > main {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        #appShell .topbar,
        #appShell > main > .view,
        #appShell #home.home-view,
        #appShell #test.view,
        #appShell #add.view,
        #appShell #manage.view,
        #appShell .competition-v3,
        body.questions-hub-active #appShell #questionsHubNav {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          justify-self: stretch !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }

        #appShell #home.home-view > .home-shell,
        #appShell #test.view .test-layout,
        #appShell #test.view .test-card,
        #appShell #test.view .test-start-card,
        #appShell #add.view .add-workspace,
        #appShell #add.view .unified-add-panel,
        #appShell #manage.view > .card,
        #appShell .competition-v3 > #cv3,
        #appShell .competition-v3 .cv3-hero,
        #appShell .competition-v3 .cv3-dashboard {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        #appShell #test.view .test-running {
          width: 100% !important;
          max-width: none !important;
        }
      }

      @media (max-width: 860px) {
        #appShell.app:not(.locked) {
          width: 100% !important;
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  ensureStyle();
  window.addEventListener('load', ensureStyle, { once: true });
})();
