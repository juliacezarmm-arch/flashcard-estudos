(() => {
  'use strict';
  if (window.FixaTestTopbarAlignmentV1) return;
  window.FixaTestTopbarAlignmentV1 = true;

  const STYLE_ID = 'fixaTestTopbarAlignmentV1Style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width: 861px) {
        #appShell:not(.locked) .topbar-right {
          box-sizing: border-box !important;
          padding-right: 24px !important;
        }

        #appShell:not(.locked) .topbar-right > .auth-panel {
          height: 42px !important;
          min-height: 42px !important;
          align-self: center !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
        }

        #appShell:not(.locked) .user-trigger {
          width: 42px !important;
          height: 42px !important;
          min-width: 42px !important;
          min-height: 42px !important;
          max-width: 42px !important;
          max-height: 42px !important;
          box-sizing: border-box !important;
          display: grid !important;
          place-items: center !important;
          line-height: 1 !important;
          margin: 0 !important;
        }

        #appShell:not(.locked) .user-avatar {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          min-height: 32px !important;
          max-width: 32px !important;
          max-height: 32px !important;
          flex: 0 0 32px !important;
          display: block !important;
          margin: 0 !important;
          background-position: center center !important;
          background-size: cover !important;
        }

        #test.view.active .test-topbar {
          box-sizing: border-box !important;
          padding-right: 24px !important;
        }

        #test.view.active .test-timer-bar {
          justify-content: flex-end !important;
          margin-left: auto !important;
        }
      }

      @media (max-width: 860px) {
        #test.view.active .test-topbar {
          padding-right: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  ensureStyle();
  window.addEventListener('load', ensureStyle, { once: true });
})();
