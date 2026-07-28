(() => {
  "use strict";

  if (document.querySelector("#fixaCompactQuestionsStyles")) return;

  const style = document.createElement("style");
  style.id = "fixaCompactQuestionsStyles";
  style.textContent = `
    @media (min-width: 861px) {
      #questionList {
        gap: 6px !important;
      }

      #questionList .question-item {
        padding: 7px !important;
        gap: 4px !important;
        border-radius: 7px !important;
      }

      #questionList .question-item .meta {
        gap: 5px !important;
      }

      #questionList .question-item .pill {
        padding: 3px 7px !important;
        font-size: 11px !important;
        line-height: 1.15 !important;
      }

      #questionList .question-item .quick-delete {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
      }

      #questionList .question-item .card-menu summary {
        width: 28px !important;
        height: 28px !important;
      }

      #questionList .question-item > strong {
        font-size: 13px !important;
        line-height: 1.22 !important;
      }

      #questionList .question-item .card-options {
        margin-top: 4px !important;
        gap: 4px !important;
      }

      #questionList .question-item .card-option {
        grid-template-columns: 26px minmax(0, 1fr) !important;
        gap: 6px !important;
        padding: 5px 7px !important;
        border-radius: 7px !important;
        font-size: 14px !important;
        line-height: 1.24 !important;
      }

      #questionList .question-item .card-option .option-letter {
        padding: 5px 0 !important;
        border-radius: 7px !important;
        font-size: 13px !important;
      }

      #questionList .question-item .answer {
        font-size: 12px !important;
        line-height: 1.25 !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
