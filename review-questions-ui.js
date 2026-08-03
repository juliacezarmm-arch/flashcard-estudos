(() => {
  if (document.querySelector('#reviewQuestionsUiStyle')) return;

  const style = document.createElement('style');
  style.id = 'reviewQuestionsUiStyle';
  style.textContent = `
    #reviewQuestionsSection.active {
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .question-review-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 2px 2px 0;
    }

    .question-review-head h3 {
      margin: 0 0 5px;
      color: #172033;
      font-size: 18px;
      line-height: 1.25;
    }

    .question-review-head p {
      max-width: 720px;
      margin: 0;
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }

    .question-review-count {
      flex: 0 0 auto;
      min-height: 28px;
      padding: 0 10px;
      border: 1px solid #dbe5f5;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #52617a;
      background: #f8faff;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .question-review-empty {
      min-height: 250px;
      border: 1px dashed #cbd8ec;
      border-radius: 13px;
      padding: 28px 22px;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 8px;
      color: #64748b;
      background: #fbfcff;
      text-align: center;
    }

    .question-review-empty-icon {
      width: 52px;
      height: 52px;
      margin-bottom: 4px;
      border: 1px solid #d9e5fa;
      border-radius: 13px;
      display: grid;
      place-items: center;
      color: #2563eb;
      background: #eef4ff;
    }

    .question-review-empty-icon svg {
      width: 27px;
      height: 27px;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .question-review-empty strong {
      color: #172033;
      font-size: 15px;
    }

    .question-review-empty p {
      max-width: 550px;
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }

    @media (max-width: 760px) {
      .question-review-head {
        flex-direction: column;
        gap: 10px;
      }

      .question-review-empty {
        min-height: 220px;
        padding: 24px 18px;
      }
    }
  `;
  document.head.appendChild(style);

  const addMode = document.querySelector('#add .add-mode');
  const importButton = document.querySelector('#showImportQuestion');
  const importSection = document.querySelector('#importQuestionSection');
  const addModeInfo = document.querySelector('#addModeInfo');
  if (!addMode || !importButton || !importSection) return;

  let reviewButton = document.querySelector('#showReviewQuestions');
  if (!reviewButton) {
    reviewButton = document.createElement('button');
    reviewButton.id = 'showReviewQuestions';
    reviewButton.type = 'button';
    reviewButton.setAttribute('role', 'tab');
    reviewButton.setAttribute('aria-controls', 'reviewQuestionsSection');
    reviewButton.setAttribute('aria-selected', 'false');
    reviewButton.innerHTML = `
      <svg class="mode-svg" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2"></rect>
        <path d="M9 9h6"></path>
        <path d="M9 13h3"></path>
        <path d="m14.5 15.5 1.5 1.5 3-3"></path>
      </svg>
      Revisão de questões
    `;
    importButton.insertAdjacentElement('afterend', reviewButton);
  }

  let reviewSection = document.querySelector('#reviewQuestionsSection');
  if (!reviewSection) {
    reviewSection = document.createElement('div');
    reviewSection.className = 'add-section';
    reviewSection.id = 'reviewQuestionsSection';
    reviewSection.setAttribute('role', 'tabpanel');
    reviewSection.setAttribute('aria-labelledby', 'showReviewQuestions');
    reviewSection.innerHTML = `
      <div class="question-review-head">
        <div>
          <h3>Revisão de questões</h3>
          <p>Questões que precisarem de correção ficarão reunidas aqui.</p>
        </div>
        <span class="question-review-count" id="reviewQuestionsCount">0 pendências</span>
      </div>
      <div class="question-review-empty" id="reviewQuestionsEmpty">
        <span class="question-review-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="4" width="14" height="16" rx="2"></rect>
            <path d="M9 9h6"></path>
            <path d="M9 13h3"></path>
            <path d="m14.5 16 1.5 1.5 3-3"></path>
          </svg>
        </span>
        <strong>Nenhuma questão pendente</strong>
        <p>Esta etapa adiciona somente a interface. Nenhuma imagem será enviada, migrada ou alterada automaticamente.</p>
      </div>
      <div id="reviewQuestionsList" hidden></div>
    `;
    importSection.insertAdjacentElement('afterend', reviewSection);
  }

  const regularButtons = [
    document.querySelector('#showCreateCollection'),
    document.querySelector('#showAddQuestion'),
    document.querySelector('#showImportQuestion')
  ].filter(Boolean);

  const regularSections = [
    document.querySelector('#createCollectionSection'),
    document.querySelector('#addQuestionSection'),
    document.querySelector('#importQuestionSection')
  ].filter(Boolean);

  function closeReviewMode() {
    reviewButton.classList.remove('active');
    reviewButton.setAttribute('aria-selected', 'false');
    reviewSection.classList.remove('active');
    if (addModeInfo) addModeInfo.hidden = false;
  }

  function openReviewMode() {
    regularButtons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-selected', 'false');
    });
    regularSections.forEach(section => section.classList.remove('active'));
    reviewButton.classList.add('active');
    reviewButton.setAttribute('aria-selected', 'true');
    reviewSection.classList.add('active');
    if (addModeInfo) addModeInfo.hidden = true;
  }

  regularButtons.forEach(button => button.addEventListener('click', closeReviewMode));
  reviewButton.addEventListener('click', openReviewMode);
})();
