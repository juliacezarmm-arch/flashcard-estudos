/* Alinha o cabeçalho ao mesmo eixo do conteúdo da página inicial */
(() => {
  "use strict";

  if (document.querySelector("#fixaTopbarHomeAlignment")) return;

  const style = document.createElement("style");
  style.id = "fixaTopbarHomeAlignment";
  style.textContent = `
    @media (min-width: 861px) {
      body.home-active #appShell.app:not(.locked) > main {
        width: 100% !important;
        max-width: none !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      body.home-active #appShell .topbar,
      body.home-active #appShell .home-view {
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      body.home-active #appShell .topbar {
        flex: 0 0 auto !important;
      }

      body.home-active #appShell .mobile-topline {
        flex: 0 0 auto !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
