(() => {
  if (document.querySelector('#addSpacingFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'addSpacingFixStyle';
  style.textContent = `
    /* Impede que os blocos internos da área Adicionar se espalhem pela altura do cartão. */
    #add .add-section.active {
      align-content: start !important;
      justify-content: stretch !important;
      grid-auto-rows: max-content !important;
    }

    #add #importQuestionSection.active {
      grid-template-rows: max-content max-content !important;
    }

    #add #importQuestionSection .import-box,
    #add #addQuestionSection .form,
    #add #createCollectionSection .collection-flow,
    #add #reviewQuestionsSection {
      align-content: start !important;
    }

    @media (min-width: 861px) {
      #add.view.active .unified-add-panel {
        justify-content: flex-start !important;
      }

      #add.view.active .add-section.active {
        flex: 1 1 auto;
        align-self: stretch;
      }
    }
  `;

  document.head.appendChild(style);
})();
