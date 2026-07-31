
/* ===== topbar-compact.js ===== */
(() => {
  const style = document.createElement('style');
  style.id = 'topbarCompactStyle';
  style.textContent = `
    @media (min-width: 761px) {
      html,
      body {
        height: 100%;
        overflow: hidden;
      }

      body {
        min-height: 0;
      }

      .app {
        width: 100%;
        height: 100dvh;
        min-height: 0 !important;
        align-items: stretch;
        overflow: hidden;
      }

      #collectionsSidebar {
        position: sticky;
        top: 0;
        height: 100dvh;
        max-height: 100dvh;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      #subjects {
        flex: 1 1 auto;
        min-height: 0;
        max-height: none !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-gutter: stable;
        align-content: start !important;
        grid-auto-rows: max-content !important;
      }

      #subjects .folder-block {
        align-self: start !important;
        height: auto !important;
        min-height: 0 !important;
      }

      #collectionsSidebar .side-footer {
        flex: 0 0 auto;
        margin-top: 10px !important;
        padding: 10px 0 2px !important;
        border-top: 1px solid #e3e9f3 !important;
        border-bottom: 0 !important;
        background: transparent !important;
      }

      #collectionsSidebar .side-footer::before,
      #collectionsSidebar .side-footer::after {
        display: none !important;
        content: none !important;
      }

      #collectionsSidebar .app-version {
        width: max-content;
        margin: 0 auto;
        padding: 5px 10px;
        border: 1px solid #e5ebf5;
        border-radius: 999px;
        color: #8490a6;
        background: #f8faff;
        font-size: 10px;
        line-height: 1;
        letter-spacing: 0.01em;
      }

      #collectionsSidebar .app-version span {
        margin: 0 4px;
        color: #b0bacb;
      }

      main {
        min-width: 0;
        height: 100dvh;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .topbar-title {
        display: none !important;
      }

      .topbar {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0 !important;
      }

      .topbar-right {
        width: 100% !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 14px !important;
      }

      .topbar-right .tabs {
        order: 1 !important;
        width: auto !important;
        display: flex !important;
        grid-template-columns: none !important;
        justify-content: flex-start !important;
        gap: 10px;
      }

      .topbar-right .auth-panel {
        order: 2 !important;
        width: auto !important;
        margin-left: auto;
        justify-self: auto !important;
        flex: 0 0 auto;
      }
    }
  `;
  document.head.appendChild(style);

  const testStartNote = document.querySelector('#testStartNote');
  const testQuestionAmount = document.querySelector('#testQuestionAmount');

  function updateCompactTestNote() {
    if (!testStartNote || typeof currentSubject !== 'function' || typeof testableCards !== 'function') return;

    const subject = currentSubject();
    const count = testableCards().length;
    if (!subject || count <= 0) return;

    const rawAmount = Number(testQuestionAmount?.value);
    const requested = Number.isFinite(rawAmount) && rawAmount > 0 ? Math.floor(rawAmount) : 14;
    const usable = Math.min(requested, count);

    const availableText = count === 1
      ? '1 questão disponível.'
      : `${count} questões disponíveis.`;

    const selectedText = usable === 1
      ? 'Será selecionada 1 questão para este teste.'
      : `Serão selecionadas ${usable} questões para este teste.`;

    const nextText = `${availableText} ${selectedText}`;
    if (testStartNote.textContent !== nextText) testStartNote.textContent = nextText;
  }

  if (testStartNote) {
    const noteObserver = new MutationObserver(() => requestAnimationFrame(updateCompactTestNote));
    noteObserver.observe(testStartNote, { childList: true, characterData: true, subtree: true });
    testQuestionAmount?.addEventListener('input', () => requestAnimationFrame(updateCompactTestNote));
    requestAnimationFrame(updateCompactTestNote);
  }
})();


/* ===== topbar-analysis.js ===== */
(() => {
  const tabsContainer = document.querySelector('.topbar-right .tabs');
  const testButton = tabsContainer?.querySelector('[data-view="test"]');
  if (!tabsContainer || !testButton || document.querySelector('#topAnalysisTab')) return;

  const style = document.createElement('style');
  style.id = 'topbarAnalysisStyle';
  style.textContent = `
    [data-test-panel="analysis"] {
      display: none !important;
    }

    @media (max-width: 760px) {
      .topbar-right .tabs {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }
  `;
  document.head.appendChild(style);

  const analysisButton = document.createElement('button');
  analysisButton.className = 'tab';
  analysisButton.id = 'topAnalysisTab';
  analysisButton.type = 'button';
  analysisButton.setAttribute('aria-controls', 'testPanelAnalysis');
  analysisButton.innerHTML = `
    <svg class="tab-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19h16"></path>
      <path d="M7 16V9"></path>
      <path d="M12 16V5"></path>
      <path d="M17 16v-4"></path>
    </svg>
    Análise
  `;
  testButton.insertAdjacentElement('afterend', analysisButton);

  const innerAnalysisButton = document.querySelector('[data-test-panel="analysis"]');
  if (innerAnalysisButton) {
    innerAnalysisButton.hidden = true;
    innerAnalysisButton.tabIndex = -1;
    innerAnalysisButton.setAttribute('aria-hidden', 'true');
  }

  function setTopbarState(activeView) {
    tabsContainer.querySelectorAll('.tab').forEach(button => {
      const active = activeView === 'analysis'
        ? button === analysisButton
        : button.dataset.view === activeView;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function openAnalysis() {
    if (typeof showView === 'function') showView('test');
    if (typeof showTestPanel === 'function') showTestPanel('analysis');
    if (typeof renderAnalysis === 'function') renderAnalysis();
    setTopbarState('analysis');
  }

  analysisButton.addEventListener('click', openAnalysis);

  tabsContainer.querySelectorAll('.tab[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view === 'test' && typeof showTestPanel === 'function') {
        showTestPanel('quick');
      }
      setTopbarState(view);
    });
  });

  document.querySelectorAll('[data-test-panel="quick"], [data-test-panel="history"]').forEach(button => {
    button.addEventListener('click', () => setTopbarState('test'));
  });

  const testView = document.querySelector('#test');
  const analysisPanel = document.querySelector('#testPanelAnalysis');
  const quickPanel = document.querySelector('#testPanelQuick');
  const historyPanel = document.querySelector('#testPanelHistory');

  const syncFromPanels = () => {
    if (!testView?.classList.contains('active')) return;
    setTopbarState(analysisPanel && !analysisPanel.hidden ? 'analysis' : 'test');
  };

  const observer = new MutationObserver(syncFromPanels);
  [testView, analysisPanel, quickPanel, historyPanel].forEach(element => {
    if (element) observer.observe(element, { attributes: true, attributeFilter: ['class', 'hidden'] });
  });

  fetch('home-dashboard.js?v=20260731-home-1', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Não foi possível carregar a página inicial.');
      return response.text();
    })
    .then(code => {
      const script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
    })
    .catch(error => console.error('[Fixa] Página inicial:', error));
})();


/* ===== sidebar-footer-polish.js ===== */
(() => {
  const style = document.createElement('style');
  style.id = 'sidebarFooterPolishStyle';
  style.textContent = `
    @media (min-width: 761px) {
      #collectionsSidebar .side-footer {
        flex: 0 0 auto;
        margin-top: auto;
        padding: 10px 0 0;
        border-top: 1px solid #edf1f7 !important;
        background: transparent;
        display: grid;
        justify-items: center;
        gap: 6px;
      }

      #collectionsSidebar .side-footer::before,
      #collectionsSidebar .side-footer::after {
        display: none !important;
        content: none !important;
      }

      #collectionsSidebar .app-version {
        width: auto;
        min-height: 28px;
        margin: 0;
        border: 0 !important;
        border-radius: 999px;
        padding: 5px 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #7b879d;
        background: #f5f8fc;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        box-shadow: none !important;
      }

      #collectionsSidebar .app-version::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #4f7df5;
        flex: 0 0 auto;
      }

      #collectionsSidebar .app-version span {
        margin: 0 1px;
        color: #a5afc0;
      }
    }
  `;
  document.head.appendChild(style);

  const testStartNote = document.querySelector('#testStartNote');

  function correctTestStartText() {
    if (!testStartNote) return;
    const text = String(testStartNote.textContent || '').trim();
    const match = text.match(/^(\d+) quest(?:ão|ões) compatíve(?:l|is) disponíve(?:l|is)\. Você pediu (\d+); o teste usará (\d+)\.$/i);
    if (!match) return;

    const available = Number(match[1]);
    const used = Number(match[3]);
    const availableText = available === 1
      ? 'Há 1 questão disponível para o teste.'
      : `Há ${available} questões disponíveis para o teste.`;
    const usedText = used === 1
      ? 'Será utilizada 1 questão.'
      : `Serão utilizadas ${used} questões.`;

    testStartNote.textContent = `${availableText} ${usedText}`;
  }

  if (testStartNote) {
    new MutationObserver(correctTestStartText).observe(testStartNote, {
      childList: true,
      characterData: true,
      subtree: true
    });
    correctTestStartText();
  }
})();
