(() => {
  if (document.querySelector('#questionsHeightFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'questionsHeightFixStyle';
  style.textContent = `
    /* Ajusta somente a aba Questões para a caixa acompanhar o conteúdo. */
    @media (min-width: 861px) {
      body:has(#manage.view.active) {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      .app:has(#manage.view.active) {
        height: auto !important;
        min-height: 100vh !important;
      }

      .app:has(#manage.view.active) main {
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
        grid-template-rows: 52px auto !important;
        align-content: start !important;
      }

      #manage.view.active {
        min-height: 0 !important;
        grid-template-rows: auto auto !important;
        align-content: start !important;
      }

      #manage.view.active > .card {
        min-height: 0 !important;
        height: auto !important;
        overflow: visible !important;
        display: block !important;
        padding-bottom: 16px !important;
      }

      #manage.view.active #questionsContent {
        flex: none !important;
        min-height: 0 !important;
        height: auto !important;
        overflow: visible !important;
        display: block !important;
      }

      #manage.view.active #questionList {
        flex: none !important;
        min-height: 0 !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
