(() => {
  "use strict";

  if (document.querySelector("#questionsHeightFixStyle")) return;

  const style = document.createElement("style");
  style.id = "questionsHeightFixStyle";
  style.textContent = `
    /*
      Aba Questões:
      - usa a mesma largura central da página Início;
      - mantém espaço visível entre os botões secundários e o resumo;
      - aproveita a altura disponível na caixa inferior;
      - somente a lista de questões possui rolagem.
    */
    @media (min-width: 761px) {
      body:has(#manage.view.active) {
        height: 100dvh !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      #appShell.app:has(#manage.view.active) {
        height: 100dvh !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      #appShell.app:has(#manage.view.active) > main {
        height: 100dvh !important;
        min-height: 0 !important;
        overflow: hidden !important;
        grid-template-rows: 52px minmax(0, 1fr) !important;
        align-content: stretch !important;
      }

      #appShell.app:has(#manage.view.active) .topbar-title {
        display: none !important;
      }

      #manage.view.active {
        box-sizing: border-box !important;
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        height: 100% !important;
        min-height: 0 !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding-top: 30px !important;
        padding-bottom: 0 !important;
        overflow: hidden !important;
        display: grid !important;
        grid-template-rows: auto minmax(0, 1fr) !important;
        align-content: stretch !important;
        gap: 12px !important;
      }

      #manage.view.active > .progress-card {
        position: relative !important;
        z-index: 1 !important;
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        flex: 0 0 auto !important;
        overflow: visible !important;
      }

      #manage.view.active > .card {
        align-self: stretch !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        padding-bottom: 6px !important;
      }

      #manage.view.active > .card > .section-heading {
        flex: 0 0 auto !important;
      }

      #manage.view.active #questionsContent {
        flex: 1 1 auto !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }

      #manage.view.active #questionsContent > .row {
        position: relative !important;
        z-index: 2 !important;
        flex: 0 0 auto !important;
        margin-bottom: 8px !important;
        background: rgba(255, 255, 255, 0.98) !important;
      }

      #manage.view.active #questionList {
        flex: 1 1 auto !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin-top: 0 !important;
        padding-right: 8px !important;
        padding-bottom: 2px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        scrollbar-gutter: stable !important;
        align-content: start !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
