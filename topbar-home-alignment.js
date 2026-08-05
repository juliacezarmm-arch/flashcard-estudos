/* Mantém o cabeçalho e todas as páginas no mesmo contêiner central */
(() => {
  "use strict";

  if (document.querySelector("#fixaTopbarHomeAlignment")) return;

  const style = document.createElement("style");
  style.id = "fixaTopbarHomeAlignment";
  style.textContent = `
    @media (min-width: 861px) {
      #appShell.app:not(.locked) > main {
        width: 100% !important;
        max-width: none !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      #appShell .topbar,
      #appShell > main > .view {
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #appShell .topbar,
      #appShell .mobile-topline {
        flex: 0 0 auto !important;
      }

      #appShell > main > .view.active {
        min-width: 0 !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
