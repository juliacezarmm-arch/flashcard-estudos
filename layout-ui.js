
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

      .topbar-right #homeTopTools {
        order: 2 !important;
        margin-left: auto !important;
        flex: 0 0 auto;
      }

      .topbar-right .auth-panel {
        order: 3 !important;
        width: auto !important;
        margin-left: 0;
        justify-self: auto !important;
        flex: 0 0 auto;
      }
    }

    /* Fixa mobile shell override: evita que celulares exibam o desktop espremido. */
    @media (max-width: 860px), (max-device-width: 860px), (hover: none) and (pointer: coarse) and (orientation: portrait) {
      html,
      body {
        width: 100%;
        min-width: 0;
        height: auto;
        overflow-x: hidden;
        overflow-y: auto;
      }

      body {
        min-height: 100dvh;
      }

      .app {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        min-height: 100dvh !important;
        height: auto !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        overflow-x: hidden !important;
        overflow-y: visible !important;
        margin: 0 !important;
      }

      #collectionsSidebar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: min(86vw, 340px) !important;
        max-width: 340px !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        padding: 16px !important;
        z-index: 90 !important;
        background: var(--panel, #fff) !important;
        border-right: 1px solid var(--line, #dde2ee) !important;
        box-shadow: 0 24px 70px rgba(17, 26, 49, 0.22) !important;
        transform: translateX(calc(-100% - 20px)) !important;
        transition: transform 0.22s ease !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .app.mobile-nav-open #collectionsSidebar {
        transform: translateX(0) !important;
      }

      #subjects {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-gutter: stable;
      }

      #collectionsSidebar .side-footer {
        flex: 0 0 auto;
      }

      main {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 100dvh !important;
        overflow: visible !important;
        padding: 12px 12px 20px !important;
      }

      .mobile-topline {
        display: flex !important;
      }

      .mobile-menu-toggle {
        display: grid !important;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
        padding: 0 0 8px !important;
        background: var(--bg, #f6f7fb);
      }

      .topbar-title {
        display: none !important;
      }

      .topbar-right {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        align-items: center !important;
        gap: 10px !important;
      }

      .topbar-right .tabs {
        order: 2 !important;
        grid-column: 1 / -1 !important;
        width: 100% !important;
        display: flex !important;
        grid-template-columns: none !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        gap: 8px !important;
        padding-bottom: 2px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .topbar-right .tabs::-webkit-scrollbar {
        display: none;
      }

      .topbar-right .tabs .tab,
      .tab {
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: max-content !important;
        min-height: 40px !important;
        padding: 10px 12px !important;
        font-size: 13px !important;
        white-space: nowrap !important;
      }

      .topbar-right #homeTopTools {
        order: 1 !important;
        margin-left: 0 !important;
        justify-self: start !important;
        display: flex !important;
        gap: 8px !important;
      }

      .topbar-right .auth-panel {
        order: 1 !important;
        width: auto !important;
        justify-self: end !important;
        margin-left: 0 !important;
      }

      .auth-panel .user-menu-button,
      .user-menu-button {
        max-width: 44px;
        padding: 0;
      }

      .auth-panel .user-menu-text {
        display: none !important;
      }

      .view,
      .home-view,
      .home-panel,
      .home-summary-card,
      .home-now-panel,
      .home-collections-panel,
      .home-recommended-panel,
      .home-progress-panel,
      .home-activity-panel {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
      }

      body.home-active main {
        width: 100% !important;
        padding: 12px 12px 20px !important;
      }

      .home-summary-grid,
      .home-footer-grid,
      .home-today-grid,
      .home-progress-top-row,
      .home-progress-middle-row,
      .home-progress-bottom-row,
      .home-activity-grid,
      .questions-grid,
      .collection-list-grid,
      .add-grid,
      .test-analysis-grid {
        grid-template-columns: 1fr !important;
      }

      .questions-scroll,
      .home-activity-list,
      .home-progress-list {
        max-height: none;
      }

      .question-card,
      .collection-summary-card {
        break-inside: avoid;
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
      ? '1 questÃƒÂ£o disponÃƒÂ­vel.'
      : `${count} questÃƒÂµes disponÃƒÂ­veis.`;

    const selectedText = usable === 1
      ? 'SerÃƒÂ¡ selecionada 1 questÃƒÂ£o para este teste.'
      : `SerÃƒÂ£o selecionadas ${usable} questÃƒÂµes para este teste.`;

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
  const currentAnalysisPanelButton = document.querySelector('[data-test-panel="analysis"]');
  if (currentAnalysisPanelButton) {
    currentAnalysisPanelButton.hidden = true;
    currentAnalysisPanelButton.tabIndex = -1;
    currentAnalysisPanelButton.setAttribute('aria-hidden', 'true');
  }
  document.querySelector('#topAnalysisTab')?.remove();
  return;

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
    AnÃƒÂ¡lise
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
    const match = text.match(/^(\d+) quest(?:ÃƒÂ£o|ÃƒÂµes) compatÃƒÂ­ve(?:l|is) disponÃƒÂ­ve(?:l|is)\. VocÃƒÂª pediu (\d+); o teste usarÃƒÂ¡ (\d+)\.$/i);
    if (!match) return;

    const available = Number(match[1]);
    const used = Number(match[3]);
    const availableText = available === 1
      ? 'HÃƒÂ¡ 1 questÃƒÂ£o disponÃƒÂ­vel para o teste.'
      : `HÃƒÂ¡ ${available} questÃƒÂµes disponÃƒÂ­veis para o teste.`;
    const usedText = used === 1
      ? 'SerÃƒÂ¡ utilizada 1 questÃƒÂ£o.'
      : `SerÃƒÂ£o utilizadas ${used} questÃƒÂµes.`;

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

/* ===== home-dashboard.js integrado ===== */
(() => {
  if (document.querySelector('#homeDashboardStyle')) return;

  const manageView = document.querySelector('#manage');
  const tabs = document.querySelector('.topbar-right .tabs');
  const manageTab = tabs?.querySelector('[data-view="manage"]');
  const authPanel = document.querySelector('#authPanel');
  if (!manageView || !tabs || !manageTab) return;

  const style = document.createElement('style');
  style.id = 'homeDashboardStyle';
  style.textContent = `
    body.home-active,
    body.home-active .app,
    body.home-active main,
    body.home-active .home-view { background: var(--bg); }
     body.home-active main { width: min(100%, 1180px); padding: 24px 24px 32px; overflow-x: hidden; }
     body.home-active .topbar-title { display: none; }
     body.home-active.home-activity-active { overflow: hidden; }
     body.home-active.home-activity-active main { height: 100vh; min-height: 0; overflow: hidden; grid-template-rows: 52px minmax(0, 1fr); }
     body.home-active.home-activity-active .home-view.active { display: block; height: 100%; min-height: 0; overflow: hidden; }
     body.home-active.home-activity-active .home-view.active > .home-shell { height: 100%; min-height: 0; grid-template-rows: auto auto minmax(0, 1fr); overflow: hidden; }
     body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"] { min-height: 0; height: 100%; overflow: hidden; }
     body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"] > .home-shell { height: 100%; min-height: 0; overflow: hidden; }
    .home-view { display: none; width: 100%; max-width: 1180px; margin: 0 auto; padding: 0; color: #172033; background: var(--bg); overflow-x: hidden; }
    .home-view.active { display: block; }
    .home-view *, .home-view *::before, .home-view *::after { box-sizing: border-box; }
    .home-view [hidden] { display: none !important; }
    .home-analysis-panel { min-width: 0; }
    .home-analysis-panel > #testPanelAnalysis { display: block; }
    .home-top-tools { position: relative; display: inline-flex; align-items: center; gap: 8px; margin-left: auto; }
    .home-top-streak { display: inline-flex; align-items: center; gap: 5px; min-height: 34px; padding: 6px 9px; border: 1px solid #f8e5bd; border-radius: 9px; background: #fff8ea; color: #c76a05; font: inherit; font-size: 13px; font-weight: 700; line-height: 1; cursor: pointer; }
.home-top-streak .fire { font-size: 15px; line-height: 1; }
.home-top-streak .fire img { width: 18px; height: 18px; object-fit: contain; vertical-align: middle; }
    .home-top-streak small { font-size: 10px; font-weight: 500; }
    .home-top-bell { width: 36px; height: 36px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: #334155; display: inline-grid; place-items: center; cursor: pointer; transition: background 160ms ease; }
    .home-top-bell:hover { background: #f1f5f9; }
    .home-streak-popover { position: absolute; top: calc(100% + 10px); right: 0; z-index: 30; width: 286px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; box-shadow: 0 14px 32px rgba(15,23,42,.14); }
    .home-streak-popover[hidden] { display: none !important; }
    .home-streak-popover-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    .home-streak-popover h4 { margin: 0 0 3px; color: #172033; font-size: 14px; line-height: 19px; }
    .home-streak-popover p { margin: 0; color: #64748b; font-size: 11px; line-height: 16px; }
    .home-streak-month { color: #2563eb; font-size: 12px; font-weight: 700; text-transform: capitalize; white-space: nowrap; }
    .home-streak-week, .home-streak-days { display: grid; grid-template-columns: repeat(7, minmax(0,1fr)); gap: 4px; text-align: center; }
    .home-streak-week { margin-bottom: 5px; color: #94a3b8; font-size: 10px; font-weight: 700; }
    .home-streak-day { min-height: 26px; padding: 5px 0; border-radius: 7px; color: #64748b; font-size: 11px; }
    .home-streak-day.is-empty { visibility: hidden; }
    .home-streak-day.is-today { outline: 1px solid #2563eb; outline-offset: -1px; color: #2563eb; font-weight: 700; }
    .home-streak-day.is-study { background: #fff0d8; color: #c76a05; font-weight: 700; }
    .home-streak-day.is-study.is-today { outline-color: #c76a05; }
    .home-shell { display: grid; gap: 16px; }
    .home-hero-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 0 2px; }
    .home-title h2 { margin: 0; color: #172033; font-size: 28px; line-height: 34px; font-weight: 700; letter-spacing: -.015em; display: flex; align-items: center; gap: 6px; }
    .home-greeting-wave { width: 25px; height: 25px; object-fit: contain; flex: 0 0 auto; }
    .home-title p, .home-muted { margin: 0; color: #64748b; font-size: 13px; line-height: 19px; font-weight: 400; }
    .home-hero-actions { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
    .home-date-pill { color: #64748b; font-size: 12px; white-space: nowrap; }
    .home-primary { min-height: 40px; padding: 0 18px; border: 0; border-radius: 10px; background: #2563eb; color: #fff; font-size: 13px; font-weight: 600; box-shadow: 0 4px 10px rgba(37,99,235,.16); cursor: pointer; transition: background 160ms ease, transform 160ms ease; }
    .home-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
    .home-subtabs { display: inline-flex; align-items: center; gap: 4px; min-height: 38px; padding: 4px; border-radius: 10px; background: #f1f5f9; width: fit-content; }
    .home-subtab { min-height: 30px; padding: 0 14px; border: 0; border-radius: 8px; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease; }
    .home-subtab:hover { color: #2563eb; }
    .home-subtab.active { background: #fff; color: #2563eb; box-shadow: 0 1px 4px rgba(15,23,42,.08); }
    .home-panel, .home-card { min-width: 0; background: #fff; border: 1px solid #e5eaf1; border-radius: 14px; box-shadow: 0 4px 16px rgba(15,23,42,.04); }
    .home-panel { padding: 16px; }
    .home-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .home-panel h3 { margin: 0; color: #172033; font-size: 16px; line-height: 22px; font-weight: 600; }
    .home-kicker { margin-bottom: 4px; color: #2563eb; font-size: 11px; line-height: 17px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    .home-summary-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
    .home-card { min-height: 82px; padding: 12px 16px; display: flex; align-items: center; }
    .home-card:nth-child(1) { background: linear-gradient(180deg,rgba(34,197,94,.07),rgba(255,255,255,.95)); border-color: #d8f1e0; }
    .home-card:nth-child(2) { background: linear-gradient(180deg,rgba(59,130,246,.07),rgba(255,255,255,.95)); border-color: #dce7ff; }
    .home-card:nth-child(3) { background: linear-gradient(180deg,rgba(245,158,11,.08),rgba(255,255,255,.95)); border-color: #f8e5bd; }
    .home-card:nth-child(4) { background: linear-gradient(180deg,rgba(139,92,246,.07),rgba(255,255,255,.95)); border-color: #e8deff; }
    .home-icon { width: 36px; height: 36px; border-radius: 10px; display: inline-grid; place-items: center; background: #eef4ff; color: #2563eb; flex: 0 0 auto; }
    .home-card-art { display: block; width: 44px; height: 44px; object-fit: contain; flex: 0 0 44px; margin-right: 11px; }
    .home-card:nth-child(1) .home-icon { background: #effaf3; color: #16a34a; }
    .home-card:nth-child(3) .home-icon { background: #fff8ea; color: #d97706; }
    .home-card:nth-child(4) .home-icon { background: #f7f2ff; color: #7c3aed; }
    .home-svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .home-card-number { color: #172033; font-size: 24px; line-height: 28px; font-weight: 700; }
    .home-card strong { display: block; margin-bottom: 2px; color: #475569; font-size: 13px; line-height: 18px; font-weight: 500; }
    .home-card small { display: block; font-size: 11px; }
    .home-today-grid { display: grid; grid-template-columns: minmax(280px,.36fr) minmax(0,.64fr); gap: 16px; align-items: stretch; }
    .home-today-grid > .home-panel { align-self: stretch; margin-top: 0; }
    .home-study-card { min-height: 0; height: 100%; }
    .home-study-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .home-study-head h3 { margin: 0 0 3px; color: #172033; font-size: 16px; line-height: 22px; font-weight: 600; }
    .home-study-head { position: relative; min-height: 68px; }
    .home-study-head .home-icon { background: #eef4ff; color: #2563eb; }
    .home-study-art { position: absolute; top: -4px; right: 0; width: 72px; height: 72px; object-fit: contain; object-position: center; pointer-events: none; }
    .home-recommendation-list { display: grid; gap: 10px; margin-top: 18px; }
    .home-recommendation { min-height: 62px; padding: 10px 12px; border: 1px solid #e5eaf1; border-radius: 11px; background: #fff; color: #172033; display: grid; grid-template-columns: minmax(0,1fr) auto 14px; align-items: center; gap: 9px; text-align: left; cursor: pointer; transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
    .home-recommendation:hover { border-color: #c9d9f8; box-shadow: 0 7px 18px rgba(15,23,42,.07); transform: translateY(-1px); }
    .home-recommendation-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; background: #eef4ff; border: 1px solid #dce7ff; }
    .home-recommendation-icon img { width: 34px; height: 34px; object-fit: contain; }
    .home-recommendation:nth-child(2) .home-recommendation-icon { background: #f7f2ff; border-color: #e8deff; }
    .home-recommendation-copy { min-width: 0; }
    .home-recommendation strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #172033; font-size: 14px; line-height: 18px; font-weight: 600; }
    .home-recommendation small { display: block; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b; font-size: 11px; line-height: 16px; }
    .home-recommendation-meta { padding: 5px 8px; border-radius: 999px; background: #eef4ff; color: #2563eb; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .home-recommendation-arrow { color: #334155; font-size: 18px; line-height: 1; }
    .home-study-counts { display: flex; gap: 10px; margin-bottom: 14px; }
    .home-count-box { flex: 1; padding: 10px 12px; border: 1px solid #e5eaf1; border-radius: 10px; background: #f8fafc; }
    .home-count-box b { display: block; margin-bottom: 2px; color: #172033; font-size: 22px; line-height: 27px; font-weight: 700; }
    .home-count-box span { font-size: 12px; }
    .home-actions-row { display: grid; gap: 8px; }
    .home-action { min-height: 62px; width: 100%; padding: 12px 14px; border: 1px solid #e5eaf1; border-radius: 11px; background: #fff; color: #172033; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
    .home-action:hover { transform: translateY(-1px); box-shadow: 0 7px 18px rgba(15,23,42,.07); border-color: #dce7ff; }
    .home-action span { display: grid; gap: 2px; }
    .home-action span::after { color: #64748b; content: 'Foco no que voc\\00ea mais precisa.'; font-size: 11px; font-weight: 400; }
    .home-action:nth-child(2) span::after { content: 'Teste seu conhecimento.'; }
    .home-action:nth-child(3) span::after { content: 'N\\00e3o deixe acumular.'; }
    .home-action.primary { border-color: #2563eb; background: #2563eb; color: #fff; box-shadow: 0 4px 10px rgba(37,99,235,.16); }
    .home-action.primary span::after { color: rgba(255,255,255,.78); }
    .home-action b { color: #64748b; font-size: 20px; font-weight: 400; line-height: 1; }
    .home-action.primary b { color: #fff; }
    .home-collection-scroll, .home-priority-scroll, .home-activity-scroll { overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
    .home-collection-scroll::-webkit-scrollbar, .home-priority-scroll::-webkit-scrollbar, .home-activity-scroll::-webkit-scrollbar { width: 6px; height: 0; }
    .home-collection-scroll::-webkit-scrollbar-track, .home-priority-scroll::-webkit-scrollbar-track, .home-activity-scroll::-webkit-scrollbar-track { background: transparent; }
    .home-collection-scroll::-webkit-scrollbar-thumb, .home-priority-scroll::-webkit-scrollbar-thumb, .home-activity-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
    .home-collection-scroll { max-height: 300px; padding-right: 4px; }
    .home-collection-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
    .home-collection-card { min-height: 122px; padding: 14px; border: 1px solid #e5eaf1; border-radius: 12px; background: #fff; cursor: pointer; }
    .home-collection-card:hover { border-color: #c9d9f8; box-shadow: 0 7px 18px rgba(15,23,42,.07); }
    .home-collection-head, .home-collection-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .home-collection-head { margin-bottom: 10px; }
    .home-collection-name { min-width: 0; display: flex; align-items: center; gap: 8px; color: #172033; font-size: 13px; font-weight: 600; }
    .home-collection-name span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .home-folder-icon { color: #2563eb; }
    .home-collection-total { color: #64748b; font-size: 11px; white-space: nowrap; }
    .home-collection-metrics { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; margin-bottom: 10px; }
    .home-collection-metrics span { display: grid; gap: 1px; min-width: 0; }
    .home-collection-metrics b { color: #172033; font-size: 14px; line-height: 17px; font-weight: 700; }
    .home-collection-metrics small { color: #94a3b8; font-size: 10px; white-space: nowrap; }
    .home-progress { height: 6px; overflow: hidden; border-radius: 999px; background: #e8edf5; }
    .home-progress span { display: block; height: 100%; border-radius: inherit; background: #22c55e; }
    .home-collection-foot { margin-top: 7px; color: #94a3b8; font-size: 11px; }
    .home-collection-foot b { color: #e5484d; font-weight: 600; }
    .home-priority-panel { position: relative; min-height: 170px; padding: 16px; background: #fff; border-color: #e5eaf1; overflow: hidden; }
    .home-priority-panel .home-panel-head { position: relative; z-index: 1; align-items: flex-start; justify-content: flex-start; }
    .home-priority-panel .home-panel-head > div { min-width: 0; }
    .home-priority-panel .home-panel-head h3 { margin-bottom: 2px; }
    .home-priority-panel .home-panel-head p { margin: 0; }
    .home-priority-head-icon { width: 28px; height: 28px; display: grid; place-items: center; flex: 0 0 auto; border: 1px solid #dce7ff; border-radius: 8px; background: #eef4ff; color: #2563eb; }
    .home-priority-head-icon .home-svg { width: 17px; height: 17px; }
    .home-priority-scroll { position: relative; z-index: 1; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; }
    .home-priority-list { display: flex; gap: 10px; min-width: max-content; }
    .home-priority-item { flex: 0 0 31%; min-width: 220px; padding: 11px 12px; border: 1px solid #e5eaf1; border-radius: 10px; background: #fff; }
    .home-priority-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; color: #172033; font-size: 12px; font-weight: 600; }
    .home-priority-head span { color: #2563eb; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .home-priority-sub { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 6px 0 7px; color: #64748b; font-size: 11px; }
    .home-priority-sub b { color: #475569; font-weight: 600; }
    .home-priority-art { position: absolute; z-index: 0; top: -28px; right: 6px; width: 165px; height: 165px; object-fit: contain; object-position: center; pointer-events: none; opacity: .95; }
    .home-priority-panel .home-panel-head, .home-priority-panel .home-priority-scroll { position: relative; z-index: 1; }
    .home-focus-box { position: relative; min-height: 0; margin-top: 12px; padding: 0; border: 0; background: transparent; }
    .home-focus-box:hover { border-color: transparent; box-shadow: none; transform: none; }
    .home-focus-box strong { color: #172033; font-size: 16px; line-height: 20px; font-weight: 600; }
    .home-focus-box small { color: #64748b; font-size: 11px; line-height: 16px; }
    .home-focus-arrow { position: absolute; top: 50%; right: 14px; color: #334155; font-size: 22px; line-height: 1; transform: translateY(-50%); }
     .home-progress-dashboard { display: grid; grid-template-rows: 188px 298px 298px; gap: 16px; width: 100%; min-width: 0; padding: 10px 0 18px; box-sizing: border-box; }
    .home-progress-top-row, .home-progress-middle-row, .home-progress-bottom-row { display: grid; min-width: 0; gap: 12px; }
    .home-progress-top-row { grid-template-columns: repeat(3,minmax(0,1fr)); }
    .home-progress-middle-row, .home-progress-bottom-row { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .home-progress-card, .home-progress-large-panel { min-width: 0; min-height: 0; overflow: hidden; box-sizing: border-box; border: 1px solid #e5eaf1; border-radius: 14px; background: #fff; box-shadow: 0 3px 12px rgba(15,23,42,.035); }
     .home-progress-card { height: 188px; padding: 20px 24px; }
     .home-progress-card-head { display: flex; align-items: center; gap: 11px; height: 36px; margin-bottom: 8px; }
     .home-progress-card-head h3 { margin: 0; color: #172033; font-size: 16px; line-height: 22px; font-weight: 650; }
     .home-progress-symbol { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 10px; background: #eef4ff; color: #2563eb; }
     .home-progress-symbol img { width: 16px; height: 16px; object-fit: contain; }
     .home-progress-symbol.home-symbol-fire img { width: 13px; height: 13px; }
     .home-progress-symbol .home-svg { width: 19px; height: 19px; stroke-width: 2; }
    .home-progress-symbol.home-symbol-fire { background: #fff1e8; color: #e47832; }
    .home-progress-symbol.home-symbol-clock { background: #eef4ff; color: #2563eb; }
    .home-progress-symbol.home-symbol-flag { background: #eef4ff; color: #2563eb; }
     .home-progress-value { display: flex; align-items: baseline; gap: 8px; margin-bottom: 3px; }
     .home-progress-value strong { color: #172033; font-size: 34px; line-height: 39px; font-weight: 700; letter-spacing: 0; }
     .home-progress-value span { color: #64748b; font-size: 14px; line-height: 19px; }
     .home-progress-card > p { margin: 0; color: #64748b; font-size: 13px; line-height: 18px; }
     .home-progress-card .home-progress { height: 7px; margin-top: 13px; }
    .home-progress-card .home-progress span { background: #2563eb; }
.home-sequence-days { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 6px; height: 58px; margin-top: 11px; padding: 7px 13px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-sizing: border-box; }
.home-sequence-card .home-progress-card-head { margin-bottom: 10px; }
.home-sequence-summary { margin-left: auto; color: #2563eb; font-size: 13px; line-height: 18px; font-weight: 650; white-space: nowrap; }
.home-sequence-summary strong { color: #172033; font-size: 19px; line-height: 22px; }
.home-sequence-day { display: grid; grid-template-rows: 29px 13px; justify-items: center; gap: 3px; color: #64748b; font-size: 11px; line-height: 13px; font-weight: 700; }
      .home-sequence-day i { grid-row: 1; }
      .home-sequence-day b { grid-row: 2; }
     .home-sequence-day i { width: 29px; height: 29px; display: grid; place-items: center; border: 1px solid #dce4ed; border-radius: 50%; color: transparent; font-style: normal; box-sizing: border-box; }
      .home-sequence-day i .home-svg, .home-sequence-day i .home-sequence-icon { width: 15px; height: 15px; stroke-width: 2; object-fit: contain; }
    .home-sequence-day.is-study i { border-color: #f1a20c; background: #ffb72b; color: #fff; }
    .home-sequence-day.is-lost i { border-color: #a7d8ff; background: #eaf5ff; color: #2588e8; }
    .home-sequence-day.is-current i { border-color: #8dcbff; background: #f5faff; color: #2563eb; }
    .home-sequence-day.is-current i::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
    .home-sequence-day.is-current { color: #172033; }
     .home-progress-middle-row > .home-panel, .home-progress-bottom-row > .home-panel { height: 100%; min-height: 0; padding: 20px 24px; box-sizing: border-box; }
     .home-progress-dashboard .home-panel-head { min-height: 36px; margin: 0 0 10px; }
     .home-progress-dashboard .home-panel-head h3 { display: flex; align-items: center; gap: 10px; color: #172033; font-size: 16px; line-height: 22px; font-weight: 650; }
     .home-progress-title-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; color: #1672f4; flex: 0 0 22px; }
     .home-progress-title-icon .home-svg { width: 20px; height: 20px; }
    .home-simple-list, .home-goal-list { display: grid; gap: 0; margin: 0; padding: 0; }
     .home-stat-row { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 14px; min-height: 52px; padding: 8px 0; border-bottom: 1px solid #eef2f6; color: #64748b; font-size: 14px; line-height: 19px; box-sizing: border-box; }
     .home-stat-row:last-child { border-bottom: 0; }
      .home-stat-row b { min-width: max-content; color: #172033; font-size: 16px; line-height: 20px; font-weight: 700; text-align: right; white-space: nowrap; }
     .home-stat-label { display: inline-flex; align-items: center; gap: 12px; min-width: 0; overflow: hidden; }
.home-stat-label > span { min-width: 0; overflow: hidden; color: #334155; font-size: 13px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
.home-progress-dashboard .home-simple-list { display: flex; flex-direction: column; min-height: 0; }
.home-progress-dashboard .home-stat-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 58px; padding: 9px 0; }
.home-progress-dashboard .home-stat-label { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; overflow: hidden; }
.home-progress-dashboard .home-stat-label > span { flex: 1 1 auto; min-width: 0; }
.home-progress-dashboard .home-stat-row > b { flex: 0 0 auto; margin-left: auto; }
.home-stat-icon, .home-goal-icon, .home-period-icon { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 10px; background: #eef4ff; color: #2563eb; }
     .home-stat-icon .home-svg, .home-goal-icon .home-svg, .home-period-icon .home-svg { width: 17px; height: 17px; stroke-width: 2; }
    .home-stat-icon.home-stat-icon-green { background: #ecf9f0; color: #20a856; }
    .home-stat-icon.home-stat-icon-amber { background: #fff6df; color: #e4a000; }
     .home-goal-list { gap: 9px; }
     .home-goal-item { height: 58px; padding: 9px 12px; border: 1px solid #e5eaf1; border-radius: 10px; background: #fff; display: grid; gap: 7px; box-sizing: border-box; }
     .home-goal-head { display: flex; align-items: center; gap: 10px; color: #172033; font-size: 14px; line-height: 19px; font-weight: 600; }
    .home-goal-copy { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; width: 100%; }
     .home-goal-head span { color: #334155; font-size: 14px; line-height: 19px; font-weight: 600; white-space: nowrap; }
     .home-goal-item .home-progress { height: 6px; }
     .home-period-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
     .home-period-item { min-height: 96px; padding: 14px; display: grid; grid-template-columns: 34px minmax(0,1fr); gap: 10px; align-items: start; border: 1px solid #dce7ff; border-radius: 10px; background: #f5f8ff; box-sizing: border-box; }
    .home-period-copy { min-width: 0; }
      .home-period-copy b { display: block; color: #172033; font-size: 24px; line-height: 28px; font-weight: 700; }
     .home-period-copy span { display: block; margin-top: 3px; color: #64748b; font-size: 12px; line-height: 16px; }
     .home-chart { min-width: 0; height: 238px; }
     .home-chart svg { width: 100%; height: 198px; display: block; overflow: visible; }
     .home-chart-note { display: flex; align-items: center; gap: 8px; margin-top: 0; padding: 8px 11px; border-radius: 9px; background: #f3f7ff; color: #2563eb; font-size: 12px; line-height: 16px; }
    .home-footer-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
    .home-footer-card { min-height: 90px; padding: 16px; display: flex; align-items: center; gap: 10px; }
    .home-footer-card strong { display: block; color: #172033; font-size: 24px; line-height: 28px; font-weight: 700; }
    .home-footer-card small { display: block; font-size: 12px; }
     .home-activity-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); grid-template-rows: repeat(2,minmax(0,1fr)); gap: 16px; width: 100%; height: 100%; min-height: 0; max-width: none; margin: 0; padding: 4px 0 24px; box-sizing: border-box; overflow: hidden; }
     .home-activity-panel { height: auto; min-height: 0; max-height: none; min-width: 0; overflow: hidden; border: 1px solid #e5eaf1; border-radius: 16px; background: #fff; box-shadow: 0 5px 18px rgba(31, 48, 78, .06); }
    .home-activity-panel .home-panel-head { height: 58px; min-height: 58px; padding: 0 20px; border-bottom: 1px solid #f0f3f7; display: flex; align-items: center; }
    .home-activity-panel .home-panel-head h3 { display: flex; align-items: center; gap: 10px; margin: 0; color: #172033; font-size: 16px; line-height: 22px; font-weight: 700; }
    .home-activity-title-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; color: #1672f4; flex: 0 0 22px; }
    .home-activity-title-icon .home-svg { width: 20px; height: 20px; }
     .home-activity-scroll { height: calc(100% - 58px); min-height: 0; max-height: none; box-sizing: border-box; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; padding: 0 20px 12px; }
    .home-activity-scroll::-webkit-scrollbar { width: 6px; }
    .home-activity-scroll::-webkit-scrollbar-track { background: transparent; }
    .home-activity-scroll::-webkit-scrollbar-thumb { background: #b9c7d9; border-radius: 999px; }
    .home-activity-list, .home-recent-list, .home-recommendation-list, .home-test-list { margin: 0; padding: 0; list-style: none; }
    .home-activity-item { position: relative; display: grid; grid-template-columns: 54px 30px minmax(0,1fr); gap: 0; min-height: 58px; padding: 10px 0; border-bottom: 1px solid #eef1f5; color: #172033; font-size: 13px; line-height: 18px; }
    .home-activity-item:last-child { border-bottom: 0; }
    .home-activity-item::before { content: ''; position: absolute; top: 0; bottom: 0; left: 69px; width: 1px; background: #dce5ef; }
    .home-activity-item:first-child::before { top: 22px; }
    .home-activity-item:last-child::before { bottom: 22px; }
    .home-activity-time { align-self: start; padding-top: 3px; color: #7b8aa0; font-size: 11px; line-height: 17px; white-space: nowrap; }
    .home-activity-timeline { position: relative; z-index: 1; display: flex; justify-content: center; align-items: flex-start; }
    .home-activity-status { display: grid; place-items: center; width: 24px; height: 24px; border: 2px solid #43b45b; border-radius: 50%; background: #fff; color: #2ea648; box-sizing: border-box; }
    .home-activity-status::before { content: '\\2713'; font-size: 13px; line-height: 1; font-weight: 800; }
    .home-activity-body { min-width: 0; padding-left: 2px; }
    .home-activity-title { display: block; overflow: hidden; color: #172033; font-size: 13px; line-height: 18px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .home-activity-body small { display: block; margin-top: 2px; color: #7b8aa0; font-size: 11px; line-height: 17px; }
    .home-activity-clickable { cursor: pointer; }
    .home-activity-clickable:hover .home-activity-title { color: #1264db; }
    .home-recent-content-row { display: grid; grid-template-columns: 36px minmax(0,1fr) minmax(28px,1fr) auto; gap: 10px; align-items: center; min-height: 52px; padding: 8px 0; border-bottom: 1px solid #eef1f5; color: #172033; }
    .home-recent-content-row:last-child { border-bottom: 0; }
    .home-activity-avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; color: #166534; font-size: 12px; line-height: 1; font-weight: 700; }
    .home-activity-avatar.tone-green { background: #d9f4e8; color: #178653; }
    .home-activity-avatar.tone-purple { background: #ece2ff; color: #7148cd; }
    .home-activity-avatar.tone-amber { background: #fff0c8; color: #b77900; }
    .home-activity-avatar.tone-blue { background: #dceaff; color: #2365cf; }
    .home-activity-avatar.tone-pink { background: #ffe1ed; color: #c43c72; }
    .home-activity-content-name { overflow: hidden; font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .home-activity-leader { position: relative; height: 1px; border-top: 1px dotted #d9e2ec; }
    .home-activity-leader::after { content: ''; position: absolute; top: -4px; right: 32%; width: 7px; height: 7px; border-radius: 50%; background: #4aa75a; }
    .home-activity-result { padding: 8px 10px; border-radius: 10px; background: #f2f6fc; color: #344b69; font-size: 11px; line-height: 16px; white-space: nowrap; }
    .home-recommendation-list, .home-test-list { padding-top: 8px; }
    .home-recommendation-row { display: grid; grid-template-columns: 36px minmax(0,1fr) 18px; gap: 10px; align-items: center; min-height: 68px; padding: 8px 0; border-bottom: 1px solid #eef1f5; color: #172033; cursor: pointer; }
    .home-recommendation-row:last-child { border-bottom: 0; }
    .home-recommendation-copy { min-width: 0; }
    .home-recommendation-name { display: block; overflow: hidden; font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .home-recommendation-reason { display: inline-block; margin-top: 4px; padding: 2px 7px; border-radius: 999px; background: #eef4ff; color: #2863be; font-size: 10px; line-height: 15px; white-space: nowrap; }
    .home-recommendation-reason.reason-amber { background: #fff2d2; color: #a96c00; }
    .home-recommendation-reason.reason-red { background: #ffe5e4; color: #d0443e; }
    .home-recommendation-meta { display: grid; grid-template-columns: 1fr auto; gap: 5px; align-items: center; margin-top: 6px; }
    .home-recommendation-meta .home-progress { min-width: 0; height: 6px; }
    .home-recommendation-meta small, .home-recommendation-percent { color: #64748b; font-size: 10px; line-height: 14px; white-space: nowrap; }
    .home-recommendation-chevron { color: #71839b; font-size: 20px; line-height: 1; }
    .home-test-row { display: grid; grid-template-columns: 36px minmax(0,1fr) auto; gap: 10px; align-items: center; min-height: 52px; padding: 8px 0; border-bottom: 1px solid #eef1f5; color: #172033; }
    .home-test-row:last-child { border-bottom: 0; }
    .home-test-copy { min-width: 0; }
    .home-test-name { display: block; overflow: hidden; font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .home-test-meta { display: block; margin-top: 2px; color: #7b8aa0; font-size: 11px; line-height: 17px; }
    .home-test-score { padding: 7px 10px; border-radius: 10px; background: #eaf6e8; color: #238b3a; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .home-test-score.is-warn { background: #fff5d8; color: #a66b00; }
    .home-test-score.is-bad { background: #ffe9e6; color: #c84138; }
    @media (max-width: 1200px) { .home-summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
 @media (max-width: 1100px) { .home-progress-dashboard { grid-template-rows: 170px 270px 298px; } .home-progress-card { height: 170px; padding: 16px 18px; } .home-progress-middle-row > .home-panel, .home-progress-bottom-row > .home-panel { padding: 16px 18px; } .home-progress-value strong { font-size: 30px; line-height: 35px; } .home-chart { height: 210px; } .home-chart svg { height: 174px; } }
     @media (max-width: 980px) { .home-today-grid { grid-template-columns: 1fr; } .home-priority-list { grid-template-columns: repeat(2,minmax(0,1fr)); } }
     @media (max-width: 760px) {
      body.home-active main { padding: 16px 14px 24px; }
      .home-hero-head { align-items: flex-start; flex-direction: column; gap: 8px; }
      .home-title h2 { font-size: 24px; line-height: 30px; }
      .home-hero-actions { width: 100%; align-items: stretch; flex-direction: column; gap: 8px; }
      .home-date-pill { font-size: 11px; }
      .home-primary { width: 100%; }
      .home-subtabs { max-width: 100%; overflow-x: auto; }
      .home-subtab { flex: 0 0 auto; }
       .home-summary-grid, .home-footer-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
       .home-progress-top-row, .home-progress-middle-row, .home-progress-bottom-row { grid-template-columns: 1fr; }
       .home-progress-dashboard { grid-template-rows: auto; }
      .home-card { min-height: 82px; padding: 11px 12px; }
      .home-card-number { font-size: 23px; line-height: 28px; }
      .home-card strong { font-size: 12px; }
      .home-collection-grid, .home-priority-list, .home-period-list { grid-template-columns: 1fr; }
      .home-collection-scroll { max-height: 330px; }
       body.home-active.home-activity-active { overflow-y: auto; }
       body.home-active.home-activity-active main,
       body.home-active.home-activity-active .home-view.active,
       body.home-active.home-activity-active .home-view.active > .home-shell,
       body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"],
       body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"] > .home-shell { height: auto; min-height: 0; overflow: visible; }
       .home-activity-grid { grid-template-columns: 1fr; grid-template-rows: none; height: auto; gap: 12px; padding: 4px 0 20px; overflow: visible; }
       .home-activity-panel { height: 300px; min-height: 300px; }
       .home-priority-item { flex-basis: 235px; }
       .home-priority-art { right: 8px; width: 110px; height: 110px; }
    }
    @media (max-width: 420px) { .home-summary-grid { grid-template-columns: 1fr; } .home-top-tools { gap: 4px; } .home-top-streak { padding: 6px 7px; } }
  `;
  document.head.appendChild(style);

  const homeTab = document.createElement('button');
  homeTab.className = 'tab';
  homeTab.type = 'button';
  homeTab.dataset.view = 'home';
  homeTab.innerHTML = '<svg class="tab-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path><path d="M9 21v-6h6v6"></path></svg>In&iacute;cio';
  manageTab.insertAdjacentElement('beforebegin', homeTab);

  if (authPanel && !document.querySelector('#homeTopTools')) {
    const tools = document.createElement('div');
    tools.className = 'home-top-tools';
    tools.id = 'homeTopTools';
    tools.innerHTML = '<button class="home-top-streak" id="homeTopStreak" type="button" aria-expanded="false" title="Voc&ecirc; estuda h&aacute; 0 dias consecutivos."><span class="fire" aria-hidden="true">&#128293;</span><b>0</b><small>dias</small></button><button class="home-top-bell" type="button" aria-label="Notifica&ccedil;&otilde;es" title="Notifica&ccedil;&otilde;es"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button><div class="home-streak-popover" id="homeStreakPopover" hidden></div>';
    authPanel.insertAdjacentElement('beforebegin', tools);
  }

  const homeView = document.createElement('section');
  homeView.className = 'view home-view';
  homeView.id = 'home';
  homeView.innerHTML = `
    <div class="home-shell">
       <header class="home-hero-head">
         <div class="home-title"><h2 id="homeGreeting"><span id="homeGreetingText">Boa noite, Julia!</span><img id="homeGreetingWave" class="home-greeting-wave" alt="" aria-hidden="true"></h2><p>Pronta para mais um passo rumo aos seus objetivos?</p><span class="home-last-label">&Uacute;ltima cole&ccedil;&atilde;o: <b id="homeLastCollection">Nenhuma ainda</b></span></div>
        <div class="home-hero-actions"><span class="home-date-pill" id="homeDatePill">Hoje</span></div>
      </header>
      <nav class="home-subtabs" aria-label="Resumo inicial" role="tablist"><button class="home-subtab active" type="button" role="tab" aria-selected="true" data-home-tab="today">Hoje</button><button class="home-subtab" type="button" role="tab" aria-selected="false" data-home-tab="progress">Progresso</button><button class="home-subtab" type="button" role="tab" aria-selected="false" data-home-tab="activity">Atividade</button><button class="home-subtab" type="button" role="tab" aria-selected="false" data-home-tab="analysis">AnÃƒÂ¡lise</button></nav>
      <section data-home-panel="today"><div class="home-shell">
        <section class="home-summary-grid" id="homeSummaryCards"></section>
        <div class="home-today-grid">
          <article class="home-panel home-study-card"><div class="home-study-head"><div><div class="home-kicker">Estude agora</div><h3>O que revisar primeiro</h3><p class="home-muted" id="homeStudyText">Comece um teste para criar sua primeira recomenda&ccedil;&atilde;o.</p></div><span class="home-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 9-12h-7z"></path></svg></span></div><div class="home-focus-box"><div class="home-recommendation-list" id="homeStudyRecommendations"><p class="home-muted">As recomenda&ccedil;&otilde;es aparecer&atilde;o depois do primeiro teste.</p></div></div></article>
          <article class="home-panel"><div class="home-panel-head"><h3>Resumo das cole&ccedil;&otilde;es</h3></div><div class="home-collection-scroll"><div class="home-collection-grid" id="homeCollectionSummary"></div></div></article>
        </div>
        <section class="home-panel home-priority-panel"><div class="home-panel-head"><div><h3>Revis&otilde;es recomendadas para hoje</h3><p class="home-muted">Mantenha o ritmo! Revise e fixe ainda mais o conte&uacute;do.</p></div></div><div class="home-priority-scroll"><div class="home-priority-list" id="homePriorities"></div></div></section>
      </div></section>
       <section data-home-panel="progress" hidden><div class="home-shell home-progress-dashboard"><section class="home-progress-top-row" id="homeFooterStats"></section><div class="home-progress-middle-row"><article class="home-panel home-progress-large-panel"><div class="home-panel-head"><h3>Desempenho recente</h3></div><ul class="home-simple-list" id="homePerformance"></ul></article><article class="home-panel home-progress-large-panel"><div class="home-panel-head"><h3><span class="home-progress-title-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path></svg></span>Evolu&ccedil;&atilde;o</h3></div><div class="home-chart" id="homeChart"></div></article></div><div class="home-progress-bottom-row"><article class="home-panel home-progress-large-panel"><div class="home-panel-head"><h3><span class="home-progress-title-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg></span>Objetivos</h3></div><ul class="home-goal-list" id="homeGoals"></ul></article><article class="home-panel home-progress-large-panel"><div class="home-panel-head"><h3>Resumo do per&iacute;odo</h3></div><div class="home-period-list" id="homePeriodSummary"></div></article></div></div></section>
      <section data-home-panel="activity" hidden><div class="home-shell"><div class="home-activity-grid"><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3><span class="home-activity-title-icon" data-home-activity-icon="clock" aria-hidden="true"></span>Atividade recente</h3></div><div class="home-activity-scroll"><ul class="home-activity-list" id="homeActivity"></ul></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3><span class="home-activity-title-icon" data-home-activity-icon="books" aria-hidden="true"></span>Conte&uacute;dos estudados recentemente</h3></div><div class="home-activity-scroll"><div class="home-recent-list" id="homeRecentContent"></div></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3><span class="home-activity-title-icon" data-home-activity-icon="target" aria-hidden="true"></span>Revis&otilde;es recomendadas</h3></div><div class="home-activity-scroll"><div class="home-recommendation-list" id="homeRecommendations"></div></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3><span class="home-activity-title-icon" data-home-activity-icon="chart" aria-hidden="true"></span>&Uacute;ltimos testes realizados</h3></div><div class="home-activity-scroll"><div class="home-test-list" id="homeTests"></div></div></article></div></div></section>
      <section class="home-analysis-panel" data-home-panel="analysis" hidden></section>
    </div>
  `;
  manageView.insertAdjacentElement('beforebegin', homeView);

  const homeAnalysisPanel = homeView.querySelector('[data-home-panel="analysis"]');
  const analysisPanel = document.querySelector('#testPanelAnalysis');
  if (homeAnalysisPanel && analysisPanel) {
    homeAnalysisPanel.appendChild(analysisPanel);
    analysisPanel.hidden = false;
    analysisPanel.classList.add('active');
  }

  const homeAsset = file => encodeURI(`referencias/${file}`);
  const HOME_ASSETS = Object.freeze({
  books: 'ChatGPT Image 1 de ago. de 2026, 12_11_38 (1).png',
     clipboard: 'icone_prancheta_revisao.png',
    chart: 'ChatGPT Image 1 de ago. de 2026, 12_31_23.png',
    questions: 'ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png',
     trophy: 'icone_trofeu_dominadas.png',
     target: 'icone_trofeu_dominadas.png',
     booksOnly: 'icone_livros_colecoes.png',
     fire: 'icone_fogo_sequencia.png',
     wave: 'icone_maozinha_acenando.png'
  });
  const svgIcon = name => { const paths = { books: '<path d="M5 4h3v16H5zM10 4h3v16h-3zM15 6h4v14h-4z"></path><path d="M4 20h16"></path>', questions: '<rect x="6" y="4" width="12" height="16" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path>', target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="m17 7 3-3"></path>', chart: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>', folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>', clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path>', calendar: '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 9h16"></path>', flag: '<path d="M5 21V4"></path><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0"></path>', snowflake: '<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"></path><path d="m12 3-2 2m2-2 2 2m0 14-2 2-2-2M3 12l2-2m-2 2 2 2m14-2 2-2m-2 2 2 2"></path>' }; return `<svg class="home-svg" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.chart}</svg>`; };
  const studyArt = homeView.querySelector('.home-study-head .home-icon');
   if (studyArt) {
    const image = document.createElement('img');
    image.className = 'home-study-art';
    image.src = homeAsset(HOME_ASSETS.clipboard);
    image.alt = 'Prancheta com tarefas de estudo';
     studyArt.replaceWith(image);
   }
   const greetingWave = homeView.querySelector('#homeGreetingWave');
   if (greetingWave) greetingWave.src = homeAsset(HOME_ASSETS.wave);
  homeView.querySelector('.home-title p')?.remove();
  homeView.querySelector('.home-last-label')?.setAttribute('hidden', '');
  const focusBox = homeView.querySelector('.home-focus-box');
  if (focusBox) {
    focusBox.id = 'homeFocusBox';
    focusBox.setAttribute('tabindex', '0');
    focusBox.innerHTML = '<div class="home-recommendation-list" id="homeStudyRecommendations"><p class="home-muted">As recomenda&ccedil;&otilde;es aparecer&atilde;o depois do primeiro teste.</p></div>';
  }
  const priorityPanel = homeView.querySelector('.home-priority-panel');
  const priorityHead = priorityPanel?.querySelector('.home-panel-head');
  if (priorityHead && !priorityHead.querySelector('.home-priority-head-icon')) {
    const icon = document.createElement('span');
    icon.className = 'home-priority-head-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = svgIcon('calendar');
    priorityHead.prepend(icon);
  }
  if (priorityPanel && !priorityPanel.querySelector('.home-priority-art')) {
    const image = document.createElement('img');
    image.className = 'home-priority-art';
    image.src = homeAsset(HOME_ASSETS.books);
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    priorityPanel.append(image);
  }
  const streakFire = document.querySelector('#homeTopStreak .fire');
  if (streakFire) streakFire.innerHTML = `<img src="${homeAsset(HOME_ASSETS.fire)}" alt="" aria-hidden="true">`;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const percent = (part, total) => total ? Math.round((part / total) * 100) : 0;
  const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const cardsOf = subject => Array.isArray(subject?.cards) ? subject.cards : [];
  const isFrozen = card => card?.status === 'frozen';
  const isMastered = card => card?.status === 'mastered' || card?.status === 'dominated';
  const isLearning = card => card?.status === 'learning' || card?.status === 'hard';
  const needsReview = card => !isFrozen(card) && !isMastered(card);
  const subjects = () => Array.isArray(data?.subjects) ? data.subjects : [];
  const history = () => Array.isArray(data?.testHistory) ? data.testHistory : [];
  const allCards = () => subjects().flatMap(subject => cardsOf(subject).map(card => ({ subject, card })));
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const duration = ms => { const s = Math.max(0, Math.round(Number(ms || 0) / 1000)); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : m ? `${m}min ${s % 60}s` : `${s}s`; };
  const userName = () => { const label = document.querySelector('#userDisplayName')?.textContent?.trim(); const normalized = label ? label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : ''; return label && normalized !== 'usuario' ? label.split(/\s+/)[0] : 'Julia'; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
  let homePanel = 'today';


  function localDateKey(value) { const date = value instanceof Date ? value : new Date(value); if (Number.isNaN(date.getTime())) return ''; return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function studyDateKey(item) { return localDateKey(item?.date || item?.created_at || item?.createdAt || item?.finishedAt || item?.completedAt); }
  function studyDates() { return new Set(history().map(studyDateKey).filter(Boolean)); }
  function studyStreak() { const set = studyDates(); const day = new Date(); day.setHours(0, 0, 0, 0); let count = 0; for (let i = 0; i < 365; i++) { const key = localDateKey(day); if (!set.has(key)) { if (i === 0) { day.setDate(day.getDate() - 1); continue; } break; } count += 1; day.setDate(day.getDate() - 1); } return count; }
  function renderStreakPopover() { const popover = document.querySelector('#homeStreakPopover'); if (!popover) return; const now = new Date(); const year = now.getFullYear(); const month = now.getMonth(); const first = new Date(year, month, 1); const daysInMonth = new Date(year, month + 1, 0).getDate(); const pad = first.getDay(); const studied = studyDates(); const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now); const weekdays = ['D','S','T','Q','Q','S','S']; const cells = []; for (let i = 0; i < pad; i++) cells.push('<span class="home-streak-day is-empty"></span>'); for (let day = 1; day <= daysInMonth; day++) { const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const classes = ['home-streak-day']; if (studied.has(key)) classes.push('is-study'); if (day === now.getDate()) classes.push('is-today'); cells.push(`<span class="${classes.join(' ')}">${day}</span>`); } popover.innerHTML = `<div class="home-streak-popover-head"><div><h4>Sequ&ecirc;ncia de estudos</h4><p>Dias em que voc&ecirc; concluiu um teste.</p></div><span class="home-streak-month">${monthLabel}</span></div><div class="home-streak-week">${weekdays.map(day => `<span>${day}</span>`).join('')}</div><div class="home-streak-days">${cells.join('')}</div>`; }
  function subjectStats(subject) { const cards = cardsOf(subject); const total = cards.length; const frozen = cards.filter(isFrozen).length; const mastered = cards.filter(isMastered).length; const learning = cards.filter(card => !isFrozen(card) && isLearning(card)).length; const review = cards.filter(needsReview).length; const wrong = cards.reduce((sum, card) => sum + (Number(card.totalWrong) || 0), 0); const hard = cards.reduce((sum, card) => sum + (Number(card.ratingCounts?.hard) || 0), 0); const again = cards.reduce((sum, card) => sum + (Number(card.ratingCounts?.again) || 0), 0); return { total, frozen, mastered, learning, review, wrong, hard, again, priority: (review * 2) + (wrong * 5) + (hard * 3) + (again * 4), progress: percent(mastered, Math.max(1, total - frozen)) }; }
  function sortedSubjects() { return subjects().map(subject => ({ subject, stats: subjectStats(subject) })).sort((a, b) => (b.stats.review - a.stats.review) || (b.stats.total - a.stats.total)); }
  function testRecordsFor(subject, tests = history()) { return tests.filter(item => item.subjectId === subject.id || (Array.isArray(item.subjectIds) && item.subjectIds.includes(subject.id)) || item.subject === subject.name); }
  function testedSubjectItems(tests = history()) { return sortedSubjects().filter(({ subject }) => testRecordsFor(subject, tests).length); }
  function priorityForSubject(item, tests = history()) { const records = testRecordsFor(item.subject, tests); const errors = records.reduce((sum, record) => sum + Math.max(0, Number(record.total || 0) - Number(record.score || 0)), 0); const durationMinutes = records.reduce((sum, record) => sum + (Number(record.durationMs || 0) / 60000), 0); return item.stats.priority + (errors * 6) + (records.length * 2) + Math.round(durationMinutes); }
  function sortedTestedSubjects(tests = history()) { return testedSubjectItems(tests).sort((a, b) => priorityForSubject(b, tests) - priorityForSubject(a, tests)); }
  function setHomePanel(panel) { homePanel = panel; document.body.classList.toggle('home-activity-active', panel === 'activity'); homeView.querySelectorAll('[data-home-tab]').forEach(button => { const active = button.dataset.homeTab === panel; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); }); homeView.querySelectorAll('[data-home-panel]').forEach(view => { view.hidden = view.dataset.homePanel !== panel; }); }
  function openAppView(view, panel) { if (view === 'analysis') { openHome('analysis'); return; } document.body.classList.remove('home-active', 'home-activity-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); if (typeof showView === 'function') showView(view); if (view === 'test' && typeof showTestPanel === 'function') showTestPanel(panel || 'quick'); if (view === 'test' && typeof renderTest === 'function') renderTest(); }
  function openHome(panel = 'today') { document.body.classList.add('home-active'); document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view === homeView)); tabs.querySelectorAll('.tab').forEach(button => { const active = button === homeTab; button.classList.toggle('active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); }); setHomePanel(panel); renderHome(); if (panel === 'analysis' && typeof renderAnalysis === 'function') renderAnalysis(); if (typeof closeMobileNav === 'function') closeMobileNav(); }
   function renderCollectionCards(items) { if (!items.length) return '<div class="home-muted">As cole&ccedil;&otilde;es aparecer&atilde;o aqui depois do primeiro teste.</div>'; return items.map(({ subject, stats }) => `<article class="home-collection-card" data-home-subject="${esc(subject.id)}" tabindex="0"><div class="home-collection-head"><div class="home-collection-name"><span class="home-folder-icon">${svgIcon('folder')}</span><span>${esc(subject.name)}</span></div><span class="home-collection-total">${stats.total} quest&otilde;es</span></div><div class="home-collection-metrics"><span><b>${stats.mastered}</b><small>Dominadas</small></span><span><b>${stats.learning}</b><small>Em andamento</small></span><span><b>${stats.review}</b><small>Revisar</small></span></div><div class="home-progress"><span style="width:${clamp(stats.progress,3,100)}%"></span></div><div class="home-collection-foot"><span>Aproveitamento</span><b>${stats.progress}%</b></div></article>`).join(''); }
   const PROGRESS_DAILY_GOAL_MS = 2 * 60 * 60 * 1000;
   const PROGRESS_MIN_RESPONSE_MS = 1000;
   const PROGRESS_MAX_RESPONSE_MS = 10 * 60 * 1000;
    function progressCompletedTests(items = history()) { return items.filter(item => item && !item.cancelled && !item.canceled && !item.interrupted && !item.inProgress && Number(item.total || 0) > 0).sort((a, b) => new Date(b.date || b.finishedAt || b.completedAt || 0) - new Date(a.date || a.finishedAt || a.completedAt || 0)); }
   function progressTestId(item) { return item?.id == null ? '' : String(item.id); }
   function progressResponseTime(item) { const fields = ['responseTimeMs', 'response_time_ms', 'answerTimeMs', 'elapsedMs', 'timeMs', 'durationMs']; for (const field of fields) { const value = Number(item?.[field]); if (Number.isFinite(value) && value >= PROGRESS_MIN_RESPONSE_MS) return Math.min(PROGRESS_MAX_RESPONSE_MS, value); } return 0; }
   function progressAnswerRecords() { const rows = []; allCards().forEach(({ card, subject }) => { (Array.isArray(card?.attemptHistory) ? card.attemptHistory : []).forEach((item, index) => rows.push({ ...item, subjectId: item.subjectId || subject?.id, _order: index })); }); return rows; }
   function progressSessionRecords() { const sources = [data?.studySessions, data?.sessions, data?.reviewSessions, data?.study_sessions]; const source = sources.find(Array.isArray); return source || []; }
    function progressDateValue(value) { if (value instanceof Date) return value; if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); } return new Date(value); }
    function progressDayKey(date) { return localDateKey(progressDateValue(date)); }
    function progressDayOffset(offset) { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + offset); return date; }
    function progressDateRangeFrom(referenceDate, days = 7) { const reference = progressDateValue(referenceDate); const end = new Date(reference); end.setHours(0, 0, 0, 0); if (days === 7) { const weekday = end.getDay() || 7; end.setDate(end.getDate() + (7 - weekday)); } return Array.from({ length: days }, (_, index) => { const date = new Date(end); date.setDate(end.getDate() + index - (days - 1)); return { date, key: progressDayKey(date), label: `${date.getDate()}/${date.getMonth() + 1}` }; }); }
    function progressDateRange(days = 7) { return progressDateRangeFrom(new Date(), days); }
   function progressWeekRange() { const start = new Date(); start.setHours(0, 0, 0, 0); const day = start.getDay() || 7; start.setDate(start.getDate() - day + 1); const end = new Date(start); end.setDate(end.getDate() + 7); return { start, end }; }
    function progressInRange(value, start, end) { const date = progressDateValue(value); return Number.isFinite(date.getTime()) && date >= start && date < end; }
   function progressActiveDuration(item) { const direct = Number(item?.active_duration ?? item?.activeDurationMs ?? item?.active_duration_ms); if (Number.isFinite(direct) && direct > 0) return Math.min(PROGRESS_MAX_RESPONSE_MS * 60, direct); const started = new Date(item?.started_at || item?.startedAt || 0).getTime(); const finished = new Date(item?.finished_at || item?.finishedAt || item?.completedAt || 0).getTime(); if (!started || !finished || finished <= started) return 0; const paused = Number(item?.paused_duration ?? item?.pausedDurationMs ?? item?.paused_duration_ms) || 0; return Math.max(0, finished - started - paused); }
   function progressActiveTimeForDay(dayKey) { const sessions = progressSessionRecords().filter(item => progressDayKey(item?.finished_at || item?.finishedAt || item?.date || item?.started_at || item?.startedAt) === dayKey); const sessionTime = sessions.reduce((sum, item) => sum + progressActiveDuration(item), 0); if (sessionTime > 0) return sessionTime; return progressAnswerRecords().filter(item => progressDayKey(item.date || item.createdAt || item.created_at) === dayKey).reduce((sum, item) => sum + progressResponseTime(item), 0); }
   function progressActivityMap() { const map = new Map(); const mark = (key, update) => { if (!key) return; const current = map.get(key) || { answers: 0, activeMs: 0, test: false, review: false }; map.set(key, { ...current, ...update }); }; progressCompletedTests().forEach(item => mark(progressDayKey(item.date || item.finishedAt || item.completedAt), { test: true })); progressAnswerRecords().forEach(item => { const key = progressDayKey(item.date || item.createdAt || item.created_at); if (key) mark(key, { answers: (map.get(key)?.answers || 0) + 1, activeMs: (map.get(key)?.activeMs || 0) + progressResponseTime(item) }); }); progressSessionRecords().forEach(item => { const key = progressDayKey(item.finished_at || item.finishedAt || item.date || item.started_at || item.startedAt); if (key) mark(key, { activeMs: (map.get(key)?.activeMs || 0) + progressActiveDuration(item), review: true }); }); return map; }
   function progressWasValidDay(entry) { return Boolean(entry && (entry.test || entry.review || entry.answers >= 5 || entry.activeMs >= 10 * 60 * 1000)); }
    function progressStreak() { const activity = progressActivityMap(); let count = 0; let offset = 0; if (!progressWasValidDay(activity.get(progressDayKey(progressDayOffset(0))))) offset = -1; for (; offset > -366; offset -= 1) { const key = progressDayKey(progressDayOffset(offset)); if (progressWasValidDay(activity.get(key))) count += 1; else break; } return count; }
   function progressTodayTime() { return progressActiveTimeForDay(progressDayKey(new Date())); }
   function progressGoalSource() { const sources = [data?.weeklyGoals, data?.goals?.weekly, data?.settings?.weeklyGoals, data?.settings?.goals]; return sources.find(Array.isArray) || []; }
   function progressGoalType(goal) { const value = String(goal?.type || goal?.kind || goal?.id || goal?.label || '').toLowerCase(); if (value.includes('test') || value.includes('teste')) return 'tests'; if (value.includes('master') || value.includes('domin')) return 'mastered'; return 'review'; }
   function progressGoalDefinitions() { const source = progressGoalSource(); if (source.length) return source.map((goal, index) => ({ type: progressGoalType(goal), label: goal.label || goal.name || (index === 0 ? 'Revisar quest&otilde;es nesta semana' : index === 1 ? 'Fazer testes nesta semana' : 'Dominar quest&otilde;es nesta semana'), target: Number(goal.target ?? goal.total ?? goal.goal) })).filter(goal => goal.target > 0); return [{ type: 'review', label: 'Revisar quest&otilde;es nesta semana', target: 30 }, { type: 'tests', label: 'Fazer testes nesta semana', target: 2 }, { type: 'mastered', label: 'Dominar quest&otilde;es nesta semana', target: 20 }]; }
   function progressWeeklyValues() { const { start, end } = progressWeekRange(); const tests = progressCompletedTests().filter(item => progressInRange(item.date || item.finishedAt || item.completedAt, start, end)); const answers = progressAnswerRecords().filter(item => progressInRange(item.date || item.createdAt || item.created_at, start, end) && (item.correct === true || item.correct === false)); const reviewed = answers.length || tests.reduce((sum, item) => sum + Number(item.total || 0), 0); const mastered = answers.filter(item => String(item.statusAfter || '').toLowerCase().includes('master') && !String(item.statusBefore || '').toLowerCase().includes('master')).length; return { review: reviewed, tests: tests.length, mastered }; }
    function progressWeeklyGoals() { const values = progressWeeklyValues(); const goals = progressGoalDefinitions().map(goal => { const current = Math.min(goal.target, Math.max(0, Number(values[goal.type] || 0))); return { ...goal, current, ratio: Math.min(1, current / goal.target) }; }); const completed = goals.filter(goal => goal.ratio >= 1).length; const percentValue = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.ratio, 0) / goals.length * 100) : 0; return { goals, completed, total: goals.length, percent: percentValue }; }
    function progressPeriodSummary() { const { start, end } = progressWeekRange(); const tests = progressCompletedTests().filter(item => progressInRange(item.date || item.finishedAt || item.completedAt, start, end)); const attempts = progressAnswerRecords().filter(item => progressInRange(item.date || item.createdAt || item.created_at, start, end) && (item.correct === true || item.correct === false)); const cards = allCards(); const reviews = attempts.length || tests.reduce((sum, item) => sum + Number(item.total || 0), 0); return { tests: tests.length, questions: cards.length, mastered: cards.filter(({ card }) => isMastered(card)).length, reviews }; }
   function progressAttemptsForTests(items) { const ids = new Set(items.map(progressTestId).filter(Boolean)); return progressAnswerRecords().filter(item => item.testId != null && ids.has(String(item.testId))); }
   function progressBestStreak(items) { return items.reduce((best, test) => { const answers = progressAttemptsForTests([test]).sort((a, b) => Number(a.order ?? a.index ?? a.position ?? a._order) - Number(b.order ?? b.index ?? b.position ?? b._order)); let current = 0; let localBest = 0; answers.forEach(answer => { if (answer.correct === true) { current += 1; localBest = Math.max(localBest, current); } else current = 0; }); return Math.max(best, localBest); }, 0); }
   function progressRecentStats() { const tests = progressCompletedTests().slice(0, 5); const total = tests.reduce((sum, item) => sum + Number(item.total || 0), 0); const score = tests.reduce((sum, item) => sum + Number(item.score || 0), 0); const times = progressAttemptsForTests(tests).map(progressResponseTime).filter(value => value >= PROGRESS_MIN_RESPONSE_MS); const averageTime = times.length ? times.reduce((sum, value) => sum + value, 0) / times.length : 0; const latest = tests[0]; return { tests, score, total, accuracy: total ? Math.round(score / total * 100) : null, averageTime, bestStreak: progressBestStreak(tests), latest: latest ? `${Number(latest.score || 0)} de ${Number(latest.total || 0)}` : 'Sem dados' }; }
    function progressDailyPoints(referenceDate = new Date()) { const days = progressDateRangeFrom(referenceDate, 7); const map = new Map(); const answerRows = progressAnswerRecords().filter(item => item.correct === true || item.correct === false); const recordedTests = new Set(answerRows.map(item => item.testId || item.test_id).filter(value => value != null).map(String)); const add = (date, correct, total) => { const key = progressDayKey(date); if (!key || !Number.isFinite(Number(total)) || Number(total) <= 0) return; const current = map.get(key) || { score: 0, total: 0 }; map.set(key, { score: current.score + Number(correct || 0), total: current.total + Number(total || 0) }); }; answerRows.forEach(item => add(item.date || item.createdAt || item.created_at, item.correct === true ? 1 : 0, 1)); if (!answerRows.length) { progressCompletedTests().forEach(item => add(item.date || item.finishedAt || item.completedAt, Number(item.score || 0), Number(item.total || 0))); } else { progressCompletedTests().forEach(item => { const id = progressTestId(item); if (id && !recordedTests.has(id)) add(item.date || item.finishedAt || item.completedAt, Number(item.score || 0), Number(item.total || 0)); }); } return days.map(day => { const value = map.get(day.key); return { label: day.label, value: value && value.total ? Math.round(value.score / value.total * 100) : null }; }); }
    function progressChartNote(points) { const currentValues = points.map(point => point.value).filter(value => value != null); const previousValues = progressDailyPoints(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).map(point => point.value).filter(value => value != null); if (currentValues.length >= 1 && previousValues.length >= 1) { const currentAverage = currentValues.reduce((sum, value) => sum + value, 0) / currentValues.length; const previousAverage = previousValues.reduce((sum, value) => sum + value, 0) / previousValues.length; if (currentAverage > previousAverage) return 'Voc&ecirc; est&aacute; acima da sua m&eacute;dia semanal. Continue assim!'; if (currentAverage < previousAverage) return 'Seu aproveitamento caiu nesta semana. Priorize as revis&otilde;es recomendadas.'; } return 'Continue estudando para acompanhar sua evolu&ccedil;&atilde;o semanal.'; }
    function progressFormatAverageTime(value) { if (!value) return 'Sem dados'; const seconds = Math.round(value / 1000); if (seconds < 60) return `${seconds}s`; return `${Math.floor(seconds / 60)}min ${seconds % 60}s`; }
   function renderProgressChart(points) { const list = Array.isArray(points) && points.length ? points : progressDateRange(7).map(day => ({ label: day.label, value: null })); const plot = { left: 42, right: 590, top: 16, bottom: 118 }; const x = index => plot.left + index * ((plot.right - plot.left) / Math.max(1, list.length - 1)); const y = value => plot.bottom - (clamp(value, 0, 100) / 100) * (plot.bottom - plot.top); const grid = [100, 75, 50, 25, 0].map(value => `<line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${value === 0 ? '#dbe3ef' : '#edf1f7'}" stroke-width="1" stroke-dasharray="${value === 0 ? '0' : '4 4'}"></line><text x="0" y="${y(value) + 4}" fill="#64748b" font-size="10">${value}%</text>`).join(''); const segments = []; let current = []; list.forEach((point, index) => { if (point.value == null) { if (current.length) segments.push(current.join(' ')); current = []; return; } current.push(`${x(index)},${y(point.value)}`); }); if (current.length) segments.push(current.join(' ')); const lines = segments.map(segment => `<polyline points="${segment}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>`).join(''); const dots = list.map((point, index) => point.value == null ? '' : `<circle cx="${x(index)}" cy="${y(point.value)}" r="3.5" fill="#2563eb"></circle>`).join(''); const labels = list.map((point, index) => `<text x="${x(index)}" y="140" text-anchor="middle" fill="#64748b" font-size="10">${esc(point.label)}</text>`).join(''); const note = progressChartNote(list); const chart = document.querySelector('#homeChart'); if (chart) chart.innerHTML = `<svg viewBox="0 0 610 154" role="img" aria-label="Evolu&ccedil;&atilde;o dos acertos">${grid}${lines}${dots}${labels}</svg><div class="home-chart-note"><span aria-hidden="true">&#10024;</span><span>${note}</span></div>`; }
    function renderProgressChart(points) { const list = Array.isArray(points) && points.length ? points : progressDateRange(7).map(day => ({ label: day.label, value: null })); const plot = { left: 42, right: 590, top: 16, bottom: 118 }; const x = index => plot.left + index * ((plot.right - plot.left) / Math.max(1, list.length - 1)); const y = value => plot.bottom - (clamp(value, 0, 100) / 100) * (plot.bottom - plot.top); const grid = [100, 75, 50, 25, 0].map(value => `<line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${value === 0 ? '#dbe3ef' : '#edf1f7'}" stroke-width="1" stroke-dasharray="${value === 0 ? '0' : '4 4'}"></line><text x="8" y="${y(value) + 4}" fill="#64748b" font-size="10">${value}%</text>`).join(''); const segments = []; let current = []; list.forEach((point, index) => { if (point.value == null) { if (current.length) segments.push(current.join(' ')); current = []; return; } current.push(`${x(index)},${y(point.value)}`); }); if (current.length) segments.push(current.join(' ')); const lines = segments.map(segment => `<polyline points="${segment}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>`).join(''); const dots = list.map((point, index) => point.value == null ? '' : `<circle cx="${x(index)}" cy="${y(point.value)}" r="3.5" fill="#2563eb"></circle>`).join(''); const pointLabels = list.map((point, index) => point.value == null ? '' : `<text x="${x(index)}" y="${Math.max(10, y(point.value) - 9)}" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="700">${point.value}%</text>`).join(''); const labels = list.map((point, index) => `<text x="${x(index)}" y="140" text-anchor="middle" fill="#64748b" font-size="10">${esc(point.label)}</text>`).join(''); const note = progressChartNote(list); const chart = document.querySelector('#homeChart'); if (chart) chart.innerHTML = `<svg viewBox="0 0 610 154" role="img" aria-label="Evolu&ccedil;&atilde;o dos acertos">${grid}${lines}${dots}${pointLabels}${labels}</svg><div class="home-chart-note"><span aria-hidden="true">&#10024;</span><span>${note}</span></div>`; }
   function renderChart(points, records = []) {
    const values = points.length ? points.slice(-7) : [0];
    const list = Array.from({ length: 7 }, (_, index) => values[Math.max(0, index - (7 - values.length))] ?? 0);
    const labels = Array.from({ length: 7 }, (_, index) => {
      const record = records.slice(-7)[index];
      if (!record?.date) return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃƒÂ¡b', 'Dom'][index];
      return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(record.date)).replace('.', '');
    });
    const plot = { left: 48, right: 602, top: 22, bottom: 176 };
    const x = index => plot.left + index * ((plot.right - plot.left) / 6);
    const y = value => plot.bottom - (clamp(value, 0, 100) / 100) * (plot.bottom - plot.top);
    const xy = list.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const grid = [100, 75, 50, 25, 0].map(value => `<line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${value === 0 ? '#dbe3ef' : '#edf1f7'}" stroke-width="1" stroke-dasharray="${value === 0 ? '0' : '4 4'}"></line><text x="0" y="${y(value) + 4}" fill="#64748b" font-size="12">${value}%</text>`).join('');
    const axisLabels = labels.map((label, index) => `<text x="${x(index)}" y="204" text-anchor="middle" fill="#64748b" font-size="12">${label}</text>`).join('');
    document.querySelector('#homeChart').innerHTML = `<svg viewBox="0 0 640 224" role="img" aria-label="Evolu&ccedil;&atilde;o de aproveitamento">${grid}<polyline points="${xy}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>${list.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="4" fill="#2563eb"></circle>`).join('')}${axisLabels}</svg><div class="home-chart-note"><span aria-hidden="true">Ã¢Å“Â¦</span><span>Acompanhe seus acertos ao longo dos &uacute;ltimos testes.</span></div>`;
  }

   function renderHomeLegacy() {
    const cards = allCards(); const tests = history(); const recent = tests.slice(0, 7); const totalAttempts = tests.reduce((sum,item) => sum + Number(item.total || 0), 0); const totalScore = tests.reduce((sum,item) => sum + Number(item.score || 0), 0); const current = typeof currentSubject === 'function' ? currentSubject() : subjects()[0]; const last = subjects().find(subject => subject.id === tests[0]?.subjectId) || current || subjects()[0]; const reviewTotal = cards.filter(item => needsReview(item.card)).length; const overdueTotal = cards.filter(item => item.card?.dueAt && new Date(item.card.dueAt).getTime() < Date.now()).length; const masteredTotal = cards.filter(item => isMastered(item.card)).length; const accuracy = percent(totalScore, totalAttempts); const streak = studyStreak(); const dateText = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
    document.querySelector('#homeGreeting').textContent = `${greeting()}, ${userName()}!`; document.querySelector('#homeDatePill').textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1); document.querySelector('#homeLastCollection').textContent = last?.name || 'Nenhuma ainda'; document.querySelector('#homeTodayCount').textContent = reviewTotal; document.querySelector('#homeLateCount').textContent = overdueTotal; document.querySelector('#homeStudyText').textContent = `Voc\u00ea possui ${reviewTotal} revis\u00f5es para fazer hoje.`;
    const streakElement = document.querySelector('#homeTopStreak'); if (streakElement) { streakElement.querySelector('b').textContent = streak; streakElement.title = `Voc\u00ea estuda h\u00e1 ${streak} dias consecutivos.`; }
     document.querySelector('#homeSummaryCards').innerHTML = [['books','Cole&ccedil;&otilde;es',subjects().length,'Total de cole&ccedil;&otilde;es'],['questions','Quest&otilde;es',cards.length,'Total de quest&otilde;es'],['target','Dominadas',masteredTotal,`${percent(masteredTotal,cards.length)}% do total`],['chart','Aproveitamento',`${accuracy}%`,'M&eacute;dia dos testes']].map(([icon,label,value,caption]) => `<article class="home-card"><img class="home-card-art" src="${homeAsset(HOME_ASSETS[icon] || HOME_ASSETS.chart)}" alt="" aria-hidden="true"><span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span></article>`).join('');
    document.querySelector('#homeCollectionSummary').innerHTML = renderCollectionCards(sortedSubjects().slice(0,14));
    const recentTotal = recent.reduce((sum,item) => sum + Number(item.total || 0), 0); const recentScore = recent.reduce((sum,item) => sum + Number(item.score || 0), 0); const recentDuration = recent.reduce((sum,item) => sum + Number(item.durationMs || 0), 0); const lastTest = recent[0] ? `${Number(recent[0].score || 0)} de ${Number(recent[0].total || 0)}` : 'Sem testes';
     document.querySelector('#homePerformance').innerHTML = [['chart','M&eacute;dia dos &uacute;ltimos testes',`${percent(recentScore,recentTotal)}%`,''],['clock','Tempo m&eacute;dio por quest&atilde;o',recentTotal ? duration(recentDuration / recentTotal) : '0s',''],['target','Melhor sequ&ecirc;ncia',`${recent.reduce((max,item) => Math.max(max,Number(item.score || 0)),0)} acertos`,'home-stat-icon-amber'],['target','Acertos recentes',lastTest,'home-stat-icon-green']].map(([icon,label,value,variant]) => `<li class="home-stat-row"><span class="home-stat-label"><i class="home-stat-icon ${variant}">${svgIcon(icon)}</i><span>${label}</span></span><b>${value}</b></li>`).join('');
    renderChart(recent.slice(0,6).reverse().map(item => clamp(percent(Number(item.score || 0),Number(item.total || 0)),0,100)));
    document.querySelector('#homeGoals').innerHTML = [['Revisar 30 quest&otilde;es hoje',Math.min(reviewTotal,30),30],['Fazer dois testes',Math.min(tests.filter(item => String(item.date || '').slice(0,10) === todayKey()).length,2),2],['Dominar mais 20 quest&otilde;es',Math.min(masteredTotal,20),20]].map(([label,done,total]) => `<li class="home-goal-item"><div class="home-goal-head"><strong>${label}</strong><span>${done}/${total}</span></div><div class="home-progress"><span style="width:${clamp(percent(done,total),4,100)}%"></span></div></li>`).join('');
    const todayTime = tests.filter(item => String(item.date || '').slice(0,10) === todayKey()).reduce((sum,item) => sum + Number(item.durationMs || 0), 0); document.querySelector('#homePeriodSummary').innerHTML = [[tests.length,'testes realizados'],[cards.length,'quest&otilde;es cadastradas'],[masteredTotal,'quest&otilde;es dominadas'],[duration(todayTime),'estudado hoje']].map(([value,label]) => `<div class="home-period-item"><b>${value}</b><span>${label}</span></div>`).join('');
    const priorities = sortedSubjects().filter(item => item.stats.review > 0).slice(0,10); document.querySelector('#homePriorities').innerHTML = priorities.length ? priorities.map(({subject,stats}) => `<article class="home-priority-item"><div class="home-priority-head"><strong>${esc(subject.name)}</strong><span>Revisar ${stats.review}</span></div><div class="home-progress"><span style="width:${clamp(percent(stats.review,stats.total || 1),8,100)}%"></span></div></article>`).join('') : '<article class="home-priority-item"><strong>Tudo em dia por aqui</strong><p class="home-muted">Quando houver revis&otilde;es, elas aparecer&atilde;o nesta lista.</p></article>';
    const activities = recent.slice(0,5).map(item => `<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Finalizou teste em ${esc(item.subject || 'Cole&ccedil;&atilde;o')}<small>${Number(item.score || 0)} de ${Number(item.total || 0)} acertos</small></span></li>`); if (subjects().length) activities.push('<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Organizou suas cole&ccedil;&otilde;es<small>Dados atualizados no Fixa</small></span></li>'); document.querySelector('#homeActivity').innerHTML = activities.length ? activities.join('') : '<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Sua atividade aparecer&aacute; aqui.</span></li>';
    document.querySelector('#homeRecentContent').innerHTML = recent.length ? recent.slice(0,5).map(item => `<div class="home-recent-row"><span>${esc(item.subject || 'Cole&ccedil;&atilde;o')}</span><small>${Number(item.score || 0)} acertos</small></div>`).join('') : '<p class="home-muted">Nenhum conte&uacute;do estudado recentemente.</p>';
    document.querySelector('#homeRecommendations').innerHTML = sortedSubjects().filter(item => item.stats.review > 0).slice(0,5).map(({subject,stats}) => `<div class="home-recent-row"><span>${esc(subject.name)}</span><small>${stats.review} para revisar</small></div>`).join('') || '<p class="home-muted">Nenhuma revis&atilde;o recomendada agora.</p>';
    document.querySelector('#homeTests').innerHTML = recent.slice(0,5).map(item => `<div class="home-recent-row"><span>${esc(item.subject || 'Cole&ccedil;&atilde;o')}</span><small>${Number(item.score || 0)}/${Number(item.total || 0)}</small></div>`).join('') || '<p class="home-muted">Nenhum teste realizado ainda.</p>';
    document.querySelector('#homeFooterStats').innerHTML = [['&#128293;','Sequ&ecirc;ncia atual',`${streak} dia${streak === 1 ? '' : 's'}`],[svgIcon('clock'),'Tempo estudado hoje',duration(todayTime)],[svgIcon('calendar'),'Meta semanal',`${clamp(percent(tests.slice(0,7).length,7),0,100)}%`]].map(([icon,label,value]) => `<article class="home-panel home-footer-card"><span class="home-icon">${icon}</span><span><strong>${value}</strong><small class="home-muted">${label}</small></span></article>`).join('');
       setHomePanel(homePanel);
  }

   function renderHome() {
     const cards = allCards();
     const tests = history();
     const recent = tests.slice(0, 7);
     const totalAttempts = tests.reduce((sum, item) => sum + Number(item.total || 0), 0);
     const totalScore = tests.reduce((sum, item) => sum + Number(item.score || 0), 0);
     const current = typeof currentSubject === 'function' ? currentSubject() : subjects()[0];
     const last = subjects().find(subject => subject.id === tests[0]?.subjectId || subject.name === tests[0]?.subject) || current || subjects()[0];
     const testedItems = sortedTestedSubjects(tests);
      const studyPlans = testedItems.filter(item => item.stats.review > 0).slice(0, 3);
      const studyTotal = studyPlans.reduce((sum, item) => sum + Math.min(10, Math.max(0, item.stats.review)), 0);
     const reviewTotal = testedItems.reduce((sum, item) => sum + item.stats.review, 0);
     const masteredTotal = cards.filter(item => isMastered(item.card)).length;
     const accuracy = percent(totalScore, totalAttempts);
     const streak = studyStreak();
     const dateText = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
     const testSubjectName = item => item.subject || subjects().find(subject => subject.id === item.subjectId)?.name || 'Cole&ccedil;&atilde;o';

     document.querySelector('#homeGreetingText').textContent = `${greeting()}, ${userName()}!`;
     document.querySelector('#homeDatePill').textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1);
     document.querySelector('#homeLastCollection').textContent = last?.name || 'Nenhuma ainda';
     document.querySelector('#homeStudyText').textContent = studyPlans.length ? `${studyTotal} quest${studyTotal === 1 ? '\u00e3o selecionada' : '\u00f5es selecionadas'} para hoje.` : 'Comece um teste para criar sua primeira recomenda\u00e7\u00e3o.';
     const studyRecommendations = document.querySelector('#homeStudyRecommendations');
     if (studyRecommendations) {
       studyRecommendations.innerHTML = studyPlans.length ? studyPlans.map(({ subject, stats }) => {
         const reason = stats.review >= stats.total * .75 ? 'Maior atraso nas revis\u00f5es' : stats.wrong > 0 ? 'Mais erros recentes' : 'Mais precisa de pr\u00e1tica';
         const target = Math.min(10, Math.max(0, stats.review));
         return `<article class="home-recommendation" data-home-subject="${esc(subject.id)}" tabindex="0"><div class="home-recommendation-copy"><strong>${esc(subject.name)}</strong><small>${reason}</small></div><span class="home-recommendation-meta">Hoje: ${target} quest\u00f5es</span><span class="home-recommendation-arrow" aria-hidden="true">&rsaquo;</span></article>`;
       }).join('') : '<p class="home-muted">As recomenda\u00e7\u00f5es aparecer\u00e3o depois do primeiro teste.</p>';
     }

     const streakElement = document.querySelector('#homeTopStreak');
     if (streakElement) { streakElement.querySelector('b').textContent = streak; streakElement.title = `Voc\u00ea estuda h\u00e1 ${streak} dias consecutivos.`; streakElement.setAttribute('aria-label', `Sequ\u00eancia de ${streak} dias`); }
     document.querySelector('#homeSummaryCards').innerHTML = [['books','Cole&ccedil;&otilde;es',subjects().length,'Total de cole&ccedil;&otilde;es'],['questions','Quest&otilde;es',cards.length,'Total de quest&otilde;es'],['target','Dominadas',masteredTotal,`${percent(masteredTotal,cards.length)}% do total`],['chart','Aproveitamento',`${accuracy}%`,'M&eacute;dia dos testes']].map(([,label,value,caption]) => `<article class="home-card"><span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span></article>`).join('');
     document.querySelector('#homeCollectionSummary').innerHTML = renderCollectionCards(testedItems.slice(0, 14));

      const progressStats = progressRecentStats();
      document.querySelector('#homePerformance').innerHTML = [['chart','M&eacute;dia dos &uacute;ltimos testes',progressStats.accuracy == null ? 'Sem dados' : `${progressStats.accuracy}%`,''],['clock','Tempo m&eacute;dio por quest&atilde;o',progressFormatAverageTime(progressStats.averageTime),''],['target','Melhor sequ&ecirc;ncia',progressStats.tests.length ? `${progressStats.bestStreak} acertos` : 'Sem dados','home-stat-icon-amber'],['target','Acertos recentes',progressStats.latest,'home-stat-icon-green']].map(([icon,label,value,variant]) => `<li class="home-stat-row"><span class="home-stat-label"><i class="home-stat-icon ${variant}">${svgIcon(icon)}</i><span>${label}</span></span><b>${value}</b></li>`).join('');
      renderProgressChart(progressDailyPoints());
      const weeklyGoals = progressWeeklyGoals();
      document.querySelector('#homeGoals').innerHTML = weeklyGoals.goals.map(({ type, label, current, target, ratio }) => { const icon = type === 'tests' ? 'flag' : type === 'mastered' ? 'target' : 'calendar'; return `<li class="home-goal-item"><div class="home-goal-head"><i class="home-goal-icon">${svgIcon(icon)}</i><span class="home-goal-copy"><strong>${label}</strong><span>${current}/${target}</span></span></div><div class="home-progress"><span style="width:${Math.max(3, Math.round(ratio * 100))}%"></span></div></li>`; }).join('') || '<li class="home-muted">Nenhuma meta semanal configurada.</li>';
      const periodSummary = progressPeriodSummary();
      const periodTitle = document.querySelector('#homePeriodSummary')?.closest('.home-progress-large-panel')?.querySelector('.home-panel-head h3');
      if (periodTitle && !periodTitle.querySelector('.home-progress-title-icon')) periodTitle.insertAdjacentHTML('afterbegin', '<span class="home-progress-title-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path></svg></span>');
      document.querySelector('#homePeriodSummary').innerHTML = [['target',periodSummary.tests,'testes realizados'],['questions',periodSummary.questions,'quest&otilde;es cadastradas'],['target',periodSummary.mastered,'quest&otilde;es dominadas'],['clock',periodSummary.reviews,'revis&otilde;es conclu&iacute;das']].map(([icon,value,label]) => `<div class="home-period-item"><i class="home-period-icon">${svgIcon(icon)}</i><div class="home-period-copy"><b>${value}</b><span>${label}</span></div></div>`).join('');

     const priorities = testedItems.filter(item => item.stats.review > 0).slice(0, 12);
     document.querySelector('#homePriorities').innerHTML = priorities.length ? priorities.map(({subject,stats}) => `<article class="home-priority-item" data-home-subject="${esc(subject.id)}" tabindex="0"><div class="home-priority-head"><strong>${esc(subject.name)}</strong><span>Revisar ${stats.review}</span></div><div class="home-progress"><span style="width:${clamp(percent(stats.review,stats.total || 1),8,100)}%"></span></div></article>`).join('') : '<p class="home-muted">As revis&otilde;es recomendadas aparecer&atilde;o depois do primeiro teste.</p>';
     const activityRelativeTime = value => { const timestamp = Number(new Date(value || 0)); if (!timestamp) return 'agora'; const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000)); if (minutes < 60) return `h&aacute; ${minutes} min`; const hours = Math.floor(minutes / 60); if (hours < 24) return `h&aacute; ${hours} h`; const days = Math.floor(hours / 24); return days === 1 ? 'ontem' : `h&aacute; ${days} dias`; };
     const activityInitials = name => { const parts = String(name || '').trim().split(/\s+/).filter(Boolean); if (!parts.length) return '??'; if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase(); return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase(); };
     const activityTone = name => { const tones = ['green', 'purple', 'amber', 'blue', 'pink']; const hash = Array.from(String(name || '')).reduce((sum, char) => sum + char.charCodeAt(0), 0); return tones[hash % tones.length]; };
     const activitySubject = item => subjects().find(subject => subject.id === item.subjectId || subject.name === item.subject);
     const activitySubjectId = item => activitySubject(item)?.id || item.subjectId || '';
     const activitySubjectAttr = item => activitySubjectId(item) ? ` data-home-subject="${esc(activitySubjectId(item))}" tabindex="0"` : '';
     const activityRecords = recent.slice().sort((a, b) => Number(new Date(b.date || 0)) - Number(new Date(a.date || 0)));
     document.querySelectorAll('[data-home-activity-icon]').forEach(icon => { icon.innerHTML = svgIcon(icon.dataset.homeActivityIcon); });
     document.querySelector('#homeActivity').innerHTML = activityRecords.length ? activityRecords.slice(0, 12).map(item => `<li class="home-activity-item home-activity-clickable"${activitySubjectAttr(item)}><span class="home-activity-time">${activityRelativeTime(item.date)}</span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Finalizou teste em ${esc(testSubjectName(item))}</span><small>${Number(item.score || 0)} de ${Number(item.total || 0)} acertos</small></span></li>`).join('') : '<li class="home-activity-item"><span></span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Sua atividade aparecer&aacute; aqui.</span></span></li>';
     document.querySelector('#homeRecentContent').innerHTML = activityRecords.length ? activityRecords.slice(0, 12).map(item => { const name = testSubjectName(item); return `<div class="home-recent-content-row"${activitySubjectAttr(item)}><span class="home-activity-avatar tone-${activityTone(name)}">${activityInitials(name)}</span><span class="home-activity-content-name">${esc(name)}</span><span class="home-activity-leader" aria-hidden="true"></span><span class="home-activity-result">${Number(item.score || 0)} acertos</span></div>`; }).join('') : '<p class="home-muted">Nenhum conte&uacute;do estudado recentemente.</p>';
     const activityTodayRecords = tests.filter(item => String(item.date || '').slice(0, 10) === todayKey());
     const activityRecommendations = testedItems.filter(item => item.stats.review > 0).slice(0, 12);
     document.querySelector('#homeRecommendations').innerHTML = activityRecommendations.length ? activityRecommendations.map(({subject, stats}) => { const target = Math.min(10, Math.max(1, stats.review)); const done = Math.min(target, testRecordsFor(subject, activityTodayRecords).reduce((sum, item) => sum + Number(item.total || 0), 0)); const progress = target ? Math.round(done / target * 100) : 0; const reason = stats.wrong >= stats.hard && stats.wrong > 0 ? ['Mais erros recentes', 'reason-red'] : stats.review >= Math.max(5, Math.ceil(stats.total * .5)) ? ['Maior atraso', 'reason-amber'] : ['Menor aproveitamento', '']; return `<div class="home-recommendation-row" data-home-subject="${esc(subject.id)}" tabindex="0"><span class="home-activity-avatar tone-${activityTone(subject.name)}">${activityInitials(subject.name)}</span><span class="home-recommendation-copy"><span class="home-recommendation-name">${esc(subject.name)}</span><span class="home-recommendation-reason ${reason[1]}">${reason[0]}</span><span class="home-recommendation-meta"><span class="home-progress"><span style="width:${progress}%"></span></span><small>${done} de ${target} conclu&iacute;das</small></span></span><span class="home-recommendation-chevron" aria-hidden="true">&rsaquo;</span></div>`; }).join('') : '<p class="home-muted">Nenhuma revis&atilde;o recomendada agora.</p>';
     document.querySelector('#homeTests').innerHTML = activityRecords.length ? activityRecords.slice(0, 12).map(item => { const name = testSubjectName(item); const score = Number(item.score || 0); const total = Number(item.total || 0); const percentage = total ? score / total * 100 : 0; const resultClass = percentage >= 80 ? '' : percentage >= 60 ? ' is-warn' : ' is-bad'; return `<div class="home-test-row"${activitySubjectAttr(item)}><span class="home-activity-avatar tone-${activityTone(name)}">${activityInitials(name)}</span><span class="home-test-copy"><span class="home-test-name">${esc(name)}</span><span class="home-test-meta">${activityRelativeTime(item.date)}</span></span><span class="home-test-score${resultClass}">${score}/${total}</span></div>`; }).join('') : '<p class="home-muted">Nenhum teste realizado ainda.</p>';
        const todayTime = progressTodayTime();
        const activityMap = progressActivityMap();
         const sequenceToday = new Date();
         sequenceToday.setHours(0, 0, 0, 0);
         const weekStart = new Date(sequenceToday);
         weekStart.setDate(sequenceToday.getDate() - ((sequenceToday.getDay() + 6) % 7));
         const sequenceDays = Array.from({ length: 7 }, (_, index) => {
           const date = new Date(weekStart);
           date.setDate(weekStart.getDate() + index);
           const key = progressDayKey(date);
           const entry = activityMap.get(key);
           const isToday = key === progressDayKey(sequenceToday);
           const isFuture = date > sequenceToday;
           const studied = progressWasValidDay(entry);
           const lost = !studied && !isToday && !isFuture && date < sequenceToday;
           const state = studied ? ' is-study' : lost ? ' is-lost' : isToday ? ' is-current' : '';
           const icon = studied ? `<img class="home-sequence-icon" src="${homeAsset(HOME_ASSETS.fire)}" alt="" aria-hidden="true">` : lost ? svgIcon('snowflake') : '';
           const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' }).format(date).toUpperCase();
           const weekdayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
           return `<span class="home-sequence-day${state}" title="${weekdayName}"><i>${icon}</i><b>${weekday}</b></span>`;
         }).join('');
       document.querySelector('#homeFooterStats').innerHTML = `<article class="home-panel home-progress-card home-sequence-card"><div class="home-progress-card-head"><span class="home-progress-symbol home-symbol-fire"><img src="${homeAsset(HOME_ASSETS.fire)}" alt="" aria-hidden="true"></span><h3>Sequ&ecirc;ncia</h3><span class="home-sequence-summary"><strong>${streak}</strong> dias seguidos</span></div><div class="home-sequence-days">${sequenceDays}</div></article><article class="home-panel home-progress-card"><div class="home-progress-card-head"><span class="home-progress-symbol home-symbol-clock">${svgIcon('clock')}</span><h3>Tempo estudado hoje</h3></div><div class="home-progress-value"><strong>${duration(todayTime)}</strong></div><p>Meta di&aacute;ria: 2h</p><div class="home-progress"><span style="width:${Math.min(100, Math.round(todayTime / PROGRESS_DAILY_GOAL_MS * 100))}%"></span></div></article><article class="home-panel home-progress-card"><div class="home-progress-card-head"><span class="home-progress-symbol home-symbol-flag">${svgIcon('flag')}</span><h3>Objetivo da semana</h3></div><div class="home-progress-value"><strong>${weeklyGoals.percent}%</strong></div><p>${weeklyGoals.completed} de ${weeklyGoals.total} metas conclu&iacute;das</p><div class="home-progress"><span style="width:${weeklyGoals.percent}%"></span></div></article>`;

      const dailyTarget = item => Math.min(10, Math.max(0, item.stats.review));
      const todayTestRecords = tests.filter(item => String(item.date || '').slice(0, 10) === todayKey());
      const completedToday = subject => testRecordsFor(subject, todayTestRecords).reduce((sum, item) => sum + Number(item.score || 0), 0);
      document.querySelector('#homeSummaryCards').innerHTML = [['books','Cole&ccedil;&otilde;es',subjects().length,'Total de cole&ccedil;&otilde;es'],['questions','Quest&otilde;es',cards.length,'Total de quest&otilde;es'],['trophy','Dominadas',masteredTotal,`${percent(masteredTotal,cards.length)}% do total`],['chart','Aproveitamento',`${accuracy}%`,'M&eacute;dia dos testes']].map(([icon,label,value,caption]) => `<article class="home-card"><img class="home-card-art" src="${homeAsset(HOME_ASSETS[icon] || HOME_ASSETS.chart)}" alt="" aria-hidden="true"><span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span></article>`).join('');
      const plans = testedItems.filter(item => item.stats.review > 0).slice(0, 3);
      document.querySelector('#homePriorities').innerHTML = plans.length ? plans.map(item => { const target = dailyTarget(item); const done = Math.min(target, completedToday(item.subject)); const progress = target ? Math.min(100, Math.round(done / target * 100)) : 0; return `<article class="home-priority-item" data-home-subject="${esc(item.subject.id)}" tabindex="0"><div class="home-priority-head"><strong>${esc(item.subject.name)}</strong><span>Hoje: ${target} quest&otilde;es</span></div><div class="home-priority-sub"><span>${done} de ${target} conclu&iacute;das</span><b>${progress}%</b></div><div class="home-progress"><span style="width:${progress}%"></span></div></article>`; }).join('') : '<p class="home-muted">As revis&otilde;es recomendadas aparecer&atilde;o depois do primeiro teste.</p>';
      setHomePanel(homePanel);
   }

   homeTab.addEventListener('click', openHome);
  homeView.querySelectorAll('[data-home-tab]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.homeTab === 'analysis') {
      openAppView('analysis');
      return;
    }
    setHomePanel(button.dataset.homeTab);
  }));
   tabs.addEventListener('click', event => { const button = event.target.closest('.tab[data-view]'); if (!button || button === homeTab) return; document.body.classList.remove('home-active', 'home-activity-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); });
   homeView.addEventListener('click', event => { const action = event.target.closest('[data-home-action]'); if (action) { openAppView('test','quick'); return; } const collection = event.target.closest('[data-home-subject]'); if (collection) { if (typeof selectDestinationCollection === 'function') selectDestinationCollection(collection.dataset.homeSubject); document.body.classList.remove('home-active', 'home-activity-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); if (typeof showView === 'function') showView('manage'); } });
   homeView.addEventListener('keydown', event => { if (event.key !== 'Enter' && event.key !== ' ') return; const collection = event.target.closest('[data-home-subject]'); if (!collection) return; event.preventDefault(); collection.click(); });
   const streakButton = document.querySelector('#homeTopStreak');
   const streakPopover = document.querySelector('#homeStreakPopover');
   const closeStreakPopover = () => { if (!streakPopover) return; streakPopover.hidden = true; streakButton?.setAttribute('aria-expanded', 'false'); };
   streakButton?.addEventListener('click', event => { event.stopPropagation(); if (!streakPopover) return; renderStreakPopover(); streakPopover.hidden = !streakPopover.hidden; streakButton.setAttribute('aria-expanded', String(!streakPopover.hidden)); });
   document.addEventListener('click', event => { if (!event.target.closest('#homeTopTools')) closeStreakPopover(); });
   const observer = new MutationObserver(() => { if (homeView.classList.contains('active')) requestAnimationFrame(renderHome); });
  observer.observe(document.querySelector('#subjects') || document.body, { childList: true, subtree: true });
   requestAnimationFrame(() => openHome('today'));
})();
/* ===== fixa-mobile-topbar-repair.js ===== */
(() => {
  const style = document.createElement('style');
  style.id = 'fixaMobileTopbarRepair';
  style.textContent = `
    @media (max-width: 860px), (max-device-width: 860px), (hover: none) and (pointer: coarse) and (orientation: portrait) {
      main { padding-top: 10px !important; }
      .topbar {
        position: sticky !important;
        top: 0 !important;
        z-index: 90 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 0 12px !important;
        margin: 0 0 12px !important;
        background: var(--bg, #f6f7fb) !important;
        box-shadow: 0 1px 0 rgba(203, 213, 225, .7) !important;
        transform: none !important;
      }
      .mobile-topline {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        min-height: 40px !important;
        width: 100% !important;
        flex: 0 0 auto !important;
      }
      .mobile-topline-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
      }
      .mobile-brand { min-width: 0 !important; }
      .topbar-title { display: none !important; }
      .topbar-right {
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        grid-template-areas:
          "tools auth"
          "tabs tabs" !important;
        align-items: center !important;
        gap: 8px !important;
        min-height: 0 !important;
        overflow: visible !important;
      }
      .topbar-right #homeTopTools {
        position: static !important;
        grid-area: tools !important;
        order: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        min-width: 0 !important;
        min-height: 34px !important;
        margin: 0 !important;
        transform: none !important;
      }
      .topbar-right .auth-panel {
        position: static !important;
        grid-area: auth !important;
        order: 0 !important;
        justify-self: end !important;
        align-self: center !important;
        width: auto !important;
        min-width: 0 !important;
        margin: 0 !important;
        transform: none !important;
      }
      .auth-panel .user-menu-button, .user-menu-button {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        max-width: 38px !important;
        padding: 0 !important;
        border-radius: 999px !important;
      }
      .auth-panel .user-avatar, .user-avatar {
        width: 36px !important;
        height: 36px !important;
      }
      .topbar-right .tabs {
        grid-area: tabs !important;
        order: 0 !important;
        grid-column: auto !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        gap: 8px !important;
        padding: 0 0 3px !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
        transform: none !important;
      }
      .topbar-right .tabs::-webkit-scrollbar { display: none !important; }
      .topbar-right .tabs .tab {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: max-content !important;
        min-height: 38px !important;
        padding: 9px 12px !important;
        border-radius: 10px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transform: none !important;
      }
      .topbar-right .tabs .tab svg {
        width: 14px !important;
        height: 14px !important;
        flex: 0 0 auto !important;
      }
      .home-top-streak {
        position: static !important;
        min-height: 31px !important;
        padding: 5px 8px !important;
        border-radius: 9px !important;
        font-size: 12px !important;
        white-space: nowrap !important;
        transform: none !important;
      }
      .home-top-streak .fire { font-size: 14px !important; }
      .home-top-streak small { font-size: 9px !important; }
      .home-top-bell {
        width: 31px !important;
        height: 31px !important;
        border-radius: 8px !important;
      }
      .home-streak-popover {
        left: 0 !important;
        right: auto !important;
        max-width: calc(100vw - 24px) !important;
      }
      .home-hero-head, .home-page-head {
        margin-top: 0 !important;
        padding-top: 0 !important;
        clear: both !important;
      }
      .home-panel-switch {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 6px !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        padding: 3px !important;
        scrollbar-width: none !important;
      }
      .home-panel-switch::-webkit-scrollbar { display: none !important; }
      .home-panel-switch [data-home-tab] {
        flex: 0 0 auto !important;
        min-height: 32px !important;
        padding: 7px 10px !important;
        border-radius: 9px !important;
        font-size: 12px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }
    }

    @media (max-width: 520px), (max-device-width: 520px) {
      .topbar-right .tabs .tab {
        min-height: 34px !important;
        padding: 8px 9px !important;
        font-size: 11px !important;
        gap: 5px !important;
      }
      .topbar-right .tabs .tab svg {
        width: 13px !important;
        height: 13px !important;
      }
      .home-panel-switch [data-home-tab] {
        min-height: 30px !important;
        padding: 6px 8px !important;
        font-size: 11px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
/* ===== end fixa-mobile-topbar-repair.js ===== */

/* ===== fixa-progress-desktop-compact.js ===== */
(() => {
  const oldStyle = document.getElementById('fixaProgressDesktopCompact');
  if (oldStyle) oldStyle.remove();

  const style = document.createElement('style');
  style.id = 'fixaProgressDesktopCompact';
  style.textContent = `
    @media (min-width: 1024px) {
      [data-home-panel="progress"] .home-progress-dashboard {
        grid-template-rows: 142px 258px 238px;
        gap: 12px;
        padding: 4px 0 10px;
      }

      [data-home-panel="progress"] .home-progress-top-row,
      [data-home-panel="progress"] .home-progress-middle-row,
      [data-home-panel="progress"] .home-progress-bottom-row {
        gap: 12px;
      }

      [data-home-panel="progress"] .home-progress-card {
        height: 142px;
        padding: 14px 18px;
        border-radius: 12px;
      }

      [data-home-panel="progress"] .home-progress-card-head {
        height: 30px;
        gap: 9px;
        margin-bottom: 5px;
      }

      [data-home-panel="progress"] .home-progress-card-head h3 {
        font-size: 15px;
        line-height: 20px;
      }

      [data-home-panel="progress"] .home-progress-symbol {
        width: 30px;
        height: 30px;
        border-radius: 9px;
      }

      [data-home-panel="progress"] .home-progress-symbol .home-svg {
        width: 17px;
        height: 17px;
      }

      [data-home-panel="progress"] .home-progress-symbol img {
        width: 15px;
        height: 15px;
      }

      [data-home-panel="progress"] .home-progress-symbol.home-symbol-fire img {
        width: 12px;
        height: 12px;
      }

      [data-home-panel="progress"] .home-progress-value {
        margin-bottom: 2px;
      }

      [data-home-panel="progress"] .home-progress-value strong {
        font-size: 28px;
        line-height: 32px;
      }

      [data-home-panel="progress"] .home-progress-value span {
        font-size: 12px;
        line-height: 16px;
      }

      [data-home-panel="progress"] .home-progress-card > p {
        font-size: 12px;
        line-height: 16px;
      }

      [data-home-panel="progress"] .home-progress-card .home-progress {
        height: 6px;
        margin-top: 9px;
      }

      [data-home-panel="progress"] .home-sequence-card .home-progress-card-head {
        margin-bottom: 7px;
      }

      [data-home-panel="progress"] .home-sequence-summary {
        margin-left: auto;
        font-size: 12px;
      }

      [data-home-panel="progress"] .home-sequence-summary strong {
        font-size: 16px;
      }

      [data-home-panel="progress"] .home-sequence-days {
        padding: 7px 10px;
        gap: 8px;
      }

      [data-home-panel="progress"] .home-sequence-day {
        width: 28px;
      }

      [data-home-panel="progress"] .home-sequence-day span {
        width: 27px;
        height: 27px;
        font-size: 13px;
      }

      [data-home-panel="progress"] .home-sequence-day small {
        font-size: 10px;
        line-height: 13px;
      }

      [data-home-panel="progress"] .home-progress-middle-row > .home-panel,
      [data-home-panel="progress"] .home-progress-bottom-row > .home-panel {
        padding: 16px 20px;
        border-radius: 12px;
      }

      [data-home-panel="progress"] .home-progress-dashboard .home-panel-head {
        min-height: 30px;
        margin-bottom: 8px;
      }

      [data-home-panel="progress"] .home-progress-dashboard .home-panel-head h3 {
        font-size: 15px;
        line-height: 20px;
      }

      [data-home-panel="progress"] .home-progress-title-icon {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
      }

      [data-home-panel="progress"] .home-progress-title-icon .home-svg {
        width: 18px;
        height: 18px;
      }

      [data-home-panel="progress"] .home-progress-dashboard .home-stat-row {
        min-height: 46px;
        padding: 6px 0;
      }

      [data-home-panel="progress"] .home-stat-icon,
      [data-home-panel="progress"] .home-goal-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
      }

      [data-home-panel="progress"] .home-stat-row > b {
        font-size: 18px;
        line-height: 22px;
      }

      [data-home-panel="progress"] .home-goal-list {
        gap: 8px;
      }

      [data-home-panel="progress"] .home-goal-item {
        padding: 10px 12px;
      }

      [data-home-panel="progress"] .home-period-list {
        gap: 10px;
      }

      [data-home-panel="progress"] .home-period-item {
        min-height: 74px;
        padding: 12px 14px;
      }

      [data-home-panel="progress"] .home-period-item b {
        font-size: 24px;
        line-height: 28px;
      }

      [data-home-panel="progress"] .home-chart {
        height: 196px;
      }

      [data-home-panel="progress"] .home-chart svg {
        height: 158px;
      }

      [data-home-panel="progress"] .home-chart-note {
        min-height: 30px;
        padding: 7px 10px;
      }
    }

    @media (min-width: 1024px) and (max-height: 760px) {
      [data-home-panel="progress"] .home-progress-dashboard {
        grid-template-rows: 126px 232px 212px;
        gap: 10px;
        padding-bottom: 6px;
      }

      [data-home-panel="progress"] .home-progress-card {
        height: 126px;
        padding: 12px 16px;
      }

      [data-home-panel="progress"] .home-progress-value strong {
        font-size: 25px;
        line-height: 29px;
      }

      [data-home-panel="progress"] .home-progress-middle-row > .home-panel,
      [data-home-panel="progress"] .home-progress-bottom-row > .home-panel {
        padding: 14px 18px;
      }

      [data-home-panel="progress"] .home-chart {
        height: 176px;
      }

      [data-home-panel="progress"] .home-chart svg {
        height: 142px;
      }
    }
  `;
  document.head.appendChild(style);
})();
/* ===== end fixa-progress-desktop-compact.js ===== */
