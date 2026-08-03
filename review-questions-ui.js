(() => {
  if (document.querySelector('#reviewQuestionsUiStyle')) return;

  const STORE_KEY = 'flashcard-estudos-v2';

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

    .question-review-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 9px;
    }

    .question-review-toolbar button,
    .question-review-toolbar a {
      min-height: 36px;
      border-radius: 8px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
    }

    .question-review-refresh {
      border: 1px solid #cbd8ec;
      color: #334155;
      background: #ffffff;
    }

    .question-review-refresh:hover {
      color: #2563eb;
      background: #eef4ff;
    }

    .question-review-diagnostic {
      border: 1px solid #bfdbfe;
      color: #2563eb;
      background: #eff6ff;
    }

    .question-review-note {
      color: #64748b;
      font-size: 12px;
      line-height: 1.45;
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

    .question-review-list {
      display: grid;
      gap: 10px;
    }

    .question-review-item {
      border: 1px solid #dfe7f2;
      border-radius: 12px;
      padding: 13px 14px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      background: #ffffff;
    }

    .question-review-copy {
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    .question-review-copy strong {
      overflow: hidden;
      color: #172033;
      font-size: 13px;
      line-height: 1.45;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .question-review-copy small {
      color: #64748b;
      font-size: 11px;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .question-review-badge {
      align-self: start;
      min-height: 27px;
      border-radius: 999px;
      padding: 0 9px;
      display: inline-flex;
      align-items: center;
      color: #92400e;
      background: #fff7ed;
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
    }

    .question-review-error {
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 12px;
      color: #b91c1c;
      background: #fef2f2;
      font-size: 12px;
      line-height: 1.45;
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

      .question-review-item {
        grid-template-columns: 1fr;
      }

      .question-review-badge {
        justify-self: start;
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
          <p>Questões com imagens incorporadas ou arquivos ainda não confirmados ficam reunidas aqui para conferência.</p>
        </div>
        <span class="question-review-count" id="reviewQuestionsCount">0 pendências</span>
      </div>
      <div class="question-review-toolbar">
        <button class="question-review-refresh" id="refreshReviewQuestions" type="button">Atualizar lista</button>
        <a class="question-review-diagnostic" href="./diagnostico-storage-imagens.html" target="_blank" rel="noopener">Abrir diagnóstico do Storage</a>
        <span class="question-review-note">Somente leitura: nenhuma imagem será enviada ou alterada nesta etapa.</span>
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
        <p>Não foram encontradas imagens incorporadas nem arquivos de imagem ainda não confirmados nos dados deste navegador.</p>
      </div>
      <div class="question-review-list" id="reviewQuestionsList" hidden></div>
    `;
    importSection.insertAdjacentElement('afterend', reviewSection);
  }

  const reviewCount = reviewSection.querySelector('#reviewQuestionsCount');
  const reviewEmpty = reviewSection.querySelector('#reviewQuestionsEmpty');
  const reviewList = reviewSection.querySelector('#reviewQuestionsList');
  const refreshButton = reviewSection.querySelector('#refreshReviewQuestions');

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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function summarizeQuestion(text) {
    const normalized = String(text || 'Questão sem enunciado').replace(/\s+/g, ' ').trim();
    return normalized.length > 145 ? `${normalized.slice(0, 142)}...` : normalized;
  }

  function imageIssue(imageValue) {
    const image = String(imageValue || '').trim();
    if (!image) return null;
    if (image.startsWith('data:image/')) {
      return { type: 'Imagem incorporada', detail: 'A imagem ainda está salva dentro dos dados da questão.' };
    }
    if (image.startsWith('storage://')) {
      const path = image.slice('storage://'.length).trim();
      return path ? null : { type: 'Referência inválida', detail: 'A referência ao Storage está sem caminho de arquivo.' };
    }
    if (/^(https?:|blob:)/i.test(image)) return null;
    return { type: 'Arquivo não confirmado', detail: `Referência encontrada: ${image}` };
  }

  function collectPendingQuestions() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw);
    const subjects = Array.isArray(stored?.subjects) ? stored.subjects : [];
    const pending = [];

    subjects.forEach(subject => {
      const cards = Array.isArray(subject?.cards) ? subject.cards : [];
      cards.forEach((card, cardIndex) => {
        const issue = imageIssue(card?.image);
        if (!issue) return;
        pending.push({
          collection: subject?.name || 'Coleção sem nome',
          code: card?.questionCode || `Questão ${cardIndex + 1}`,
          question: summarizeQuestion(card?.q),
          issue
        });
      });
    });

    return pending;
  }

  function renderReviewQuestions() {
    if (!reviewCount || !reviewEmpty || !reviewList) return;

    try {
      const pending = collectPendingQuestions();
      reviewCount.textContent = `${pending.length} ${pending.length === 1 ? 'pendência' : 'pendências'}`;
      reviewEmpty.hidden = pending.length > 0;
      reviewList.hidden = pending.length === 0;

      if (!pending.length) {
        reviewList.innerHTML = '';
        return;
      }

      reviewList.innerHTML = pending.map(item => `
        <article class="question-review-item">
          <div class="question-review-copy">
            <strong title="${escapeHtml(item.question)}">${escapeHtml(item.question)}</strong>
            <small><b>${escapeHtml(item.collection)}</b> · ${escapeHtml(item.code)}</small>
            <small>${escapeHtml(item.issue.detail)}</small>
          </div>
          <span class="question-review-badge">${escapeHtml(item.issue.type)}</span>
        </article>
      `).join('');
    } catch (error) {
      reviewCount.textContent = 'Erro na leitura';
      reviewEmpty.hidden = true;
      reviewList.hidden = false;
      reviewList.innerHTML = `<div class="question-review-error">Não foi possível ler as questões salvas neste navegador: ${escapeHtml(error.message || 'erro desconhecido')}.</div>`;
    }
  }

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
    renderReviewQuestions();
  }

  regularButtons.forEach(button => button.addEventListener('click', closeReviewMode));
  reviewButton.addEventListener('click', openReviewMode);
  refreshButton?.addEventListener('click', renderReviewQuestions);
})();