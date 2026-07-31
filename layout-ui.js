
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
    .home-view {
      display: none;
      width: min(100%, 1300px);
      margin: 0 auto;
      padding: 2px 0 32px;
      gap: 24px;
    }

    .home-view.active {
      display: grid;
      background: #f8fafc;
    }

    .home-view *,
    .home-view *::before,
    .home-view *::after {
      box-sizing: border-box;
    }

    .home-top-tools {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    .home-top-streak {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      padding: 0 12px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #fff;
      color: #1e293b;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 4px 14px rgba(15,23,42,.05);
    }

    .home-top-streak .fire {
      color: #fb923c;
      font-size: 15px;
      line-height: 1;
    }

    .home-top-bell {
      width: 40px;
      height: 40px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #fff;
      color: #1e293b;
      display: inline-grid;
      place-items: center;
      box-shadow: 0 4px 14px rgba(15,23,42,.05);
    }

    .home-shell {
      display: grid;
      gap: 24px;
    }

    .home-hero-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 20px;
      align-items: end;
      padding: 2px 2px 0;
    }

    .home-title h2 {
      margin: 0 0 8px;
      color: #1e293b;
      font-size: clamp(28px, 3vw, 38px);
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .home-title p,
    .home-muted {
      margin: 0;
      color: #64748b;
      font-size: 15px;
      line-height: 1.55;
      font-weight: 400;
    }

    .home-date-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 38px;
      padding: 0 14px;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      background: #fff;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(15,23,42,.04);
    }

    .home-card,
    .home-main-card,
    .home-panel {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 4px 14px rgba(15,23,42,.05);
      transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
    }

    .home-card:hover,
    .home-panel:hover {
      transform: translateY(-1px);
      border-color: #dbe5f3;
      box-shadow: 0 10px 26px rgba(15,23,42,.07);
    }

    .home-main-card {
      padding: 28px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 28px;
      align-items: center;
      background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    }

    .home-kicker {
      margin-bottom: 12px;
      color: #2563eb;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .home-main-card h3,
    .home-panel h3,
    .home-card strong {
      margin: 0;
      color: #1e293b;
      font-weight: 700;
    }

    .home-main-card h3 {
      font-size: clamp(24px, 3vw, 34px);
      line-height: 1.08;
      letter-spacing: -0.02em;
    }

    .home-main-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }

    .home-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 0 12px;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      background: #f8fafc;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .home-progress {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: #e8eef7;
    }

    .home-progress span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #3b82f6;
    }

    .home-main-progress {
      margin-top: 22px;
      display: grid;
      gap: 8px;
      max-width: 520px;
    }

    .home-progress-label {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }

    .home-primary {
      min-height: 52px;
      padding: 0 28px;
      border: 0;
      border-radius: 12px;
      background: #2563eb;
      color: #fff;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 18px 32px rgba(37,99,235,.20);
      cursor: pointer;
      transition: background 150ms ease, transform 150ms ease;
    }

    .home-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .home-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 20px;
    }

    .home-card {
      min-height: 138px;
      padding: 24px;
      display: grid;
      align-content: center;
      gap: 12px;
    }

    .home-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .home-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: inline-grid;
      place-items: center;
      background: #eff6ff;
      color: #2563eb;
      font-weight: 800;
      flex: 0 0 auto;
    }

    .home-card-number {
      color: #0f172a;
      font-size: 34px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .home-study-card {
      padding: 24px;
      display: grid;
      gap: 18px;
      background: linear-gradient(135deg, #ffffff 0%, #fbfdff 100%);
    }

    .home-study-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .home-study-counts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .home-count-box {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fafc;
    }

    .home-count-box b {
      display: block;
      color: #0f172a;
      font-size: 28px;
      line-height: 1;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .home-actions-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .home-action {
      min-height: 58px;
      padding: 0 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #fff;
      color: #1e293b;
      font-weight: 800;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .home-action.primary {
      border-color: #2563eb;
      background: #2563eb;
      color: #fff;
      box-shadow: 0 16px 26px rgba(37,99,235,.18);
    }

    .home-section-grid {
      display: grid;
      grid-template-columns: minmax(320px, .86fr) minmax(0, 1.4fr);
      gap: 24px;
    }

    .home-panel {
      padding: 24px;
      min-width: 0;
    }

    .home-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .home-list-scroll {
      max-height: 330px;
      overflow-y: auto;
      padding-right: 6px;
    }

    .home-collection-list,
    .home-simple-list,
    .home-goal-list {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
    }

    .home-collection-row {
      display: grid;
      grid-template-columns: minmax(170px, 1.25fr) minmax(140px, 1fr) repeat(3, minmax(70px, .42fr));
      gap: 14px;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #eef2f7;
      color: #64748b;
      font-size: 13px;
    }

    .home-collection-row:last-child {
      border-bottom: 0;
    }

    .home-collection-row strong {
      color: #1e293b;
      font-size: 14px;
      font-weight: 700;
    }

    .home-collection-row b {
      color: #0f172a;
      font-weight: 800;
    }

    .home-lower-grid {
      display: grid;
      grid-template-columns: .9fr 1.05fr 1fr 1fr;
      gap: 24px;
    }

    .home-simple-list li,
    .home-goal-list li {
      list-style: none;
    }

    .home-stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid #eef2f7;
      color: #64748b;
      font-size: 13px;
    }

    .home-stat-row:last-child {
      border-bottom: 0;
    }

    .home-stat-row b {
      color: #0f172a;
      font-weight: 800;
    }

    .home-activity-item {
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      gap: 10px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fafc;
      color: #475569;
      font-size: 13px;
      line-height: 1.35;
    }

    .home-check {
      color: #22c55e;
      font-weight: 900;
    }

    .home-goal-item {
      padding: 14px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fafc;
      display: grid;
      gap: 10px;
    }

    .home-goal-head,
    .home-priority-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      color: #1e293b;
      font-size: 13px;
      font-weight: 800;
    }

    .home-chart svg {
      width: 100%;
      height: 185px;
      display: block;
    }

    .home-chart-caption {
      margin-top: 8px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    .home-priority-panel {
      background: linear-gradient(135deg, #fff 0%, #fff7f7 100%);
    }

    .home-priority-scroll {
      max-height: 250px;
      overflow-y: auto;
      padding-right: 6px;
    }

    .home-priority-list {
      display: grid;
      gap: 12px;
    }

    .home-priority-item {
      padding: 16px;
      border: 1px solid #fee2e2;
      border-radius: 14px;
      background: rgba(255,255,255,.82);
      display: grid;
      gap: 10px;
    }

    .home-priority-item .home-progress span {
      background: #ef4444;
    }

    .home-footer-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }

    .home-footer-card {
      padding: 20px;
      display: grid;
      grid-template-columns: 46px minmax(0, 1fr);
      align-items: center;
      gap: 14px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 4px 14px rgba(15,23,42,.05);
    }

    .home-footer-card strong {
      display: block;
      color: #0f172a;
      font-size: 24px;
      line-height: 1.1;
      font-weight: 800;
    }

    @media (max-width: 1200px) {
      .home-summary-grid,
      .home-lower-grid,
      .home-footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .home-section-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .home-view {
        padding: 0 0 24px;
      }

      .home-hero-head,
      .home-main-card {
        grid-template-columns: 1fr;
      }

      .home-summary-grid,
      .home-lower-grid,
      .home-footer-grid,
      .home-actions-row,
      .home-study-counts {
        grid-template-columns: 1fr;
      }

      .home-collection-row {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 14px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #f8fafc;
      }

      .home-top-tools {
        gap: 6px;
      }

      .home-top-streak {
        padding: 0 9px;
      }
    }
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
    tools.innerHTML = '<span class="home-top-streak" id="homeTopStreak" title="Voc&ecirc; estuda h&aacute; 0 dias consecutivos."><span class="fire" aria-hidden="true">&#128293;</span><b>0</b><small>dias</small></span><button class="home-top-bell" type="button" aria-label="Notifica&ccedil;&otilde;es" title="Notifica&ccedil;&otilde;es"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>';
    authPanel.insertAdjacentElement('beforebegin', tools);
  }

  const homeView = document.createElement('section');
  homeView.className = 'view home-view';
  homeView.id = 'home';
  homeView.innerHTML = `
    <div class="home-shell">
      <header class="home-hero-head">
        <div class="home-title">
          <h2 id="homeGreeting">Ol&aacute;!</h2>
          <p>Continue assim. Voc&ecirc; possui revis&otilde;es esperando por voc&ecirc;.</p>
        </div>
        <span class="home-date-pill" id="homeDatePill">Hoje</span>
      </header>

      <section class="home-main-card">
        <div>
          <div class="home-kicker">Continuar estudando</div>
          <h3 id="homeLastCollection">Crie ou selecione uma cole&ccedil;&atilde;o</h3>
          <p class="home-muted" id="homeContinueText">O Fixa vai indicar aqui o melhor pr&oacute;ximo passo.</p>
          <div class="home-main-meta">
            <span class="home-chip" id="homeProgressChip">0% conclu&iacute;do</span>
            <span class="home-chip" id="homeReviewChip">0 quest&otilde;es restantes</span>
            <span class="home-chip" id="homeTimeChip">0 min estimados</span>
          </div>
          <div class="home-main-progress">
            <div class="home-progress-label"><span>Progresso da cole&ccedil;&atilde;o</span><b id="homeProgressText">0%</b></div>
            <div class="home-progress"><span id="homeMainProgressBar" style="width:0%"></span></div>
          </div>
        </div>
        <button class="home-primary" type="button" data-home-action="continue">&#9658; Continuar estudando</button>
      </section>

      <section class="home-summary-grid" id="homeSummaryCards"></section>

      <section class="home-section-grid">
        <article class="home-panel home-study-card">
          <div class="home-study-head">
            <div>
              <div class="home-kicker">Estude agora</div>
              <h3>O que revisar primeiro</h3>
              <p class="home-muted" id="homeStudyText">Hoje voc&ecirc; possui revis&otilde;es para fazer.</p>
            </div>
            <span class="home-icon" aria-hidden="true">&#128640;</span>
          </div>
          <div class="home-study-counts">
            <div class="home-count-box"><b id="homeTodayCount">0</b><span class="home-muted">revis&otilde;es hoje</span></div>
            <div class="home-count-box"><b id="homeLateCount">0</b><span class="home-muted">atrasadas</span></div>
          </div>
          <div class="home-actions-row">
            <button class="home-action primary" type="button" data-home-action="recommended"><span>Revis&atilde;o recomendada</span><b>&rsaquo;</b></button>
            <button class="home-action" type="button" data-home-action="quick-test"><span>Teste r&aacute;pido</span><b>&rsaquo;</b></button>
          </div>
        </article>

        <article class="home-panel">
          <div class="home-panel-head"><h3>Resumo das cole&ccedil;&otilde;es</h3></div>
          <div class="home-list-scroll"><div class="home-collection-list" id="homeCollectionSummary"></div></div>
        </article>
      </section>

      <section class="home-lower-grid">
        <article class="home-panel"><div class="home-panel-head"><h3>Desempenho recente</h3></div><ul class="home-simple-list" id="homePerformance"></ul></article>
        <article class="home-panel"><div class="home-panel-head"><h3>Evolu&ccedil;&atilde;o</h3></div><div class="home-chart" id="homeChart"></div></article>
        <article class="home-panel"><div class="home-panel-head"><h3>Atividade recente</h3></div><ul class="home-simple-list" id="homeActivity"></ul></article>
        <article class="home-panel"><div class="home-panel-head"><h3>Objetivos</h3></div><ul class="home-goal-list" id="homeGoals"></ul></article>
      </section>

      <section class="home-panel home-priority-panel">
        <div class="home-panel-head"><h3>Prioridades</h3></div>
        <div class="home-priority-scroll"><div class="home-priority-list" id="homePriorities"></div></div>
      </section>

      <section class="home-footer-grid" id="homeFooterStats"></section>
    </div>
  `;
  manageView.insertAdjacentElement('beforebegin', homeView);

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
  const userName = () => { const label = document.querySelector('#userDisplayName')?.textContent?.trim(); return label && label !== 'Usuário' ? label.split(/\s+/)[0] : 'Julia'; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

  function studyStreak() {
    const set = new Set(history().map(item => String(item.date || '').slice(0, 10)).filter(Boolean));
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const key = day.toISOString().slice(0, 10);
      if (!set.has(key)) {
        if (i === 0) {
          day.setDate(day.getDate() - 1);
          continue;
        }
        break;
      }
      count += 1;
      day.setDate(day.getDate() - 1);
    }
    return count;
  }

  function subjectStats(subject) {
    const cards = cardsOf(subject);
    const total = cards.length;
    const frozen = cards.filter(isFrozen).length;
    const mastered = cards.filter(isMastered).length;
    const learning = cards.filter(card => !isFrozen(card) && isLearning(card)).length;
    const review = cards.filter(needsReview).length;
    return { total, frozen, mastered, learning, review, progress: percent(mastered, Math.max(1, total - frozen)) };
  }

  function sortedSubjects() {
    return subjects()
      .map(subject => ({ subject, stats: subjectStats(subject) }))
      .sort((a, b) => (b.stats.review - a.stats.review) || (b.stats.total - a.stats.total));
  }

  function openAppView(view, panel) {
    homeView.classList.remove('active');
    homeTab.classList.remove('active');
    homeTab.removeAttribute('aria-current');
    if (typeof showView === 'function') showView(view);
    if (view === 'test' && typeof showTestPanel === 'function') showTestPanel(panel || 'quick');
    if (view === 'test' && typeof renderTest === 'function') renderTest();
  }

  function openHome() {
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view === homeView));
    tabs.querySelectorAll('.tab').forEach(button => {
      const active = button === homeTab;
      button.classList.toggle('active', active);
      active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current');
    });
    renderHome();
    if (typeof closeMobileNav === 'function') closeMobileNav();
  }

  function renderCollectionRows(items) {
    if (!items.length) {
      return '<div class="home-collection-row"><strong>Nenhuma cole&ccedil;&atilde;o ainda</strong><span class="home-muted">Crie uma cole&ccedil;&atilde;o na aba Adicionar para come&ccedil;ar.</span></div>';
    }
    return items.map(({ subject, stats }) => `
      <div class="home-collection-row">
        <strong>${esc(subject.name)}</strong>
        <div><div class="home-progress"><span style="width:${clamp(stats.progress, 3, 100)}%"></span></div></div>
        <span><b>${stats.total}</b> quest&otilde;es</span>
        <span><b>${stats.mastered}</b> dominadas</span>
        <span><b>${stats.review}</b> revisar</span>
      </div>
    `).join('');
  }

  function renderChart(points) {
    const list = points.length ? points : [0, 0, 0, 0];
    const xy = list.map((value, index) => `${28 + index * (244 / Math.max(1, list.length - 1))},${145 - (clamp(value, 0, 100) / 100) * 104}`).join(' ');
    document.querySelector('#homeChart').innerHTML = `
      <svg viewBox="0 0 300 185" role="img" aria-label="Evolu&ccedil;&atilde;o de quest&otilde;es dominadas">
        <path d="M28 36v109h244" fill="none" stroke="#e5e7eb" stroke-width="2"></path>
        <path d="M28 92h244" fill="none" stroke="#eef2f7" stroke-width="1"></path>
        <polyline points="${xy}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
      <p class="home-chart-caption">Quest&otilde;es dominadas ao longo dos testes.</p>
    `;
  }

  function renderHome() {
    const cards = allCards();
    const tests = history();
    const recent = tests.slice(0, 7);
    const totalAttempts = tests.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalScore = tests.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const current = typeof currentSubject === 'function' ? currentSubject() : subjects()[0];
    const last = subjects().find(subject => subject.id === tests[0]?.subjectId) || current || subjects()[0];
    const lastStats = subjectStats(last);
    const reviewTotal = cards.filter(item => needsReview(item.card)).length;
    const overdueTotal = cards.filter(item => item.card?.dueAt && new Date(item.card.dueAt).getTime() < Date.now()).length;
    const masteredTotal = cards.filter(item => isMastered(item.card)).length;
    const accuracy = percent(totalScore, totalAttempts);
    const streak = studyStreak();
    const estimatedMinutes = Math.max(1, Math.round((lastStats.review || reviewTotal || 0) * 0.7));

    const dateText = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
    document.querySelector('#homeGreeting').textContent = `${greeting()}, ${userName()}.`;
    document.querySelector('#homeDatePill').textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1);
    document.querySelector('#homeLastCollection').textContent = last?.name || 'Nenhuma cole\u00e7\u00e3o criada ainda';
    document.querySelector('#homeContinueText').textContent = last ? 'Retome exatamente de onde parou e avance sem se perder.' : 'Crie sua primeira cole\u00e7\u00e3o para o Fixa montar seu caminho de estudos.';
    document.querySelector('#homeProgressChip').textContent = `${lastStats.progress}% conclu\u00eddo`;
    document.querySelector('#homeReviewChip').textContent = `${lastStats.review || reviewTotal} quest\u00f5es restantes`;
    document.querySelector('#homeTimeChip').textContent = `${estimatedMinutes} min estimados`;
    document.querySelector('#homeProgressText').textContent = `${lastStats.progress}%`;
    document.querySelector('#homeMainProgressBar').style.width = `${clamp(lastStats.progress, 3, 100)}%`;
    document.querySelector('#homeTodayCount').textContent = reviewTotal;
    document.querySelector('#homeLateCount').textContent = overdueTotal;
    document.querySelector('#homeStudyText').textContent = `Hoje voc\u00ea possui ${reviewTotal} revis\u00f5es e ${overdueTotal} atrasadas.`;

    const streakElement = document.querySelector('#homeTopStreak');
    if (streakElement) {
      streakElement.querySelector('b').textContent = streak;
      streakElement.title = `Voc\u00ea estuda h\u00e1 ${streak} dias consecutivos.`;
    }

    document.querySelector('#homeSummaryCards').innerHTML = [
      ['&#128218;', 'Cole&ccedil;&otilde;es', subjects().length],
      ['&#128221;', 'Quest&otilde;es', cards.length],
      ['&#127919;', 'Dominadas', masteredTotal],
      ['&#128200;', 'Aproveitamento', `${accuracy}%`]
    ].map(([icon, label, value]) => `
      <article class="home-card">
        <div class="home-card-top"><span class="home-icon">${icon}</span></div>
        <span class="home-card-number">${value}</span>
        <strong>${label}</strong>
      </article>
    `).join('');

    document.querySelector('#homeCollectionSummary').innerHTML = renderCollectionRows(sortedSubjects().slice(0, 14));

    const recentTotal = recent.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const recentScore = recent.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const recentDuration = recent.reduce((sum, item) => sum + Number(item.durationMs || 0), 0);
    const lastTest = recent[0] ? `${Number(recent[0].score || 0)} de ${Number(recent[0].total || 0)}` : 'Sem testes';
    document.querySelector('#homePerformance').innerHTML = [
      ['M&eacute;dia &uacute;ltimos testes', `${percent(recentScore, recentTotal)}%`],
      ['Tempo m&eacute;dio', recentTotal ? duration(recentDuration / recentTotal) : '0s'],
      ['Maior sequ&ecirc;ncia', `${recent.reduce((max, item) => Math.max(max, Number(item.score || 0)), 0)} acertos`],
      ['&Uacute;ltimo teste', lastTest]
    ].map(([label, value]) => `<li class="home-stat-row"><span>${label}</span><b>${value}</b></li>`).join('');

    renderChart(recent.slice(0, 6).reverse().map((item, index) => clamp(percent(Number(item.score || 0), Number(item.total || 0)) + (index * 3), 0, 100)));

    const activities = recent.slice(0, 4).map(item => `Finalizou teste em ${esc(item.subject || 'Cole\u00e7\u00e3o')} - ${Number(item.score || 0)} de ${Number(item.total || 0)} acertos`);
    if (subjects().length) activities.push(`Criou ${subjects().length} cole\u00e7\u00e3o${subjects().length === 1 ? '' : 'es'}`);
    if (cards.length) activities.push(`Organizou ${cards.length} quest\u00f5es`);
    document.querySelector('#homeActivity').innerHTML = (activities.length ? activities : ['Sua atividade aparecer\u00e1 aqui.']).slice(0, 5).map(item => `<li class="home-activity-item"><span class="home-check">&#10003;</span><span>${item}</span></li>`).join('');

    document.querySelector('#homeGoals').innerHTML = [
      ['Revisar 30 quest&otilde;es', Math.min(reviewTotal, 30), 30],
      ['Fazer 2 testes', Math.min(tests.filter(item => String(item.date || '').slice(0, 10) === todayKey()).length, 2), 2],
      ['Dominar mais 15 quest&otilde;es', Math.min(masteredTotal, 15), 15]
    ].map(([label, done, total]) => `<li class="home-goal-item"><div class="home-goal-head"><strong>${label}</strong><span>${done}/${total}</span></div><div class="home-progress"><span style="width:${clamp(percent(done, total), 4, 100)}%"></span></div></li>`).join('');

    const priorities = sortedSubjects().filter(item => item.stats.review > 0).slice(0, 10);
    document.querySelector('#homePriorities').innerHTML = priorities.length ? priorities.map(({ subject, stats }) => `<article class="home-priority-item"><div class="home-priority-head"><strong>${esc(subject.name)}</strong><span>${Math.max(0, 100 - stats.progress)}% aten&ccedil;&atilde;o</span></div><div class="home-progress"><span style="width:${clamp(percent(stats.review, stats.total || 1), 5, 100)}%"></span></div></article>`).join('') : '<article class="home-priority-item"><strong>Tudo em dia por aqui</strong><p class="home-muted">Quando houver revis&otilde;es, elas aparecem nesta lista.</p></article>';

    const todayTime = tests.filter(item => String(item.date || '').slice(0, 10) === todayKey()).reduce((sum, item) => sum + Number(item.durationMs || 0), 0);
    document.querySelector('#homeFooterStats').innerHTML = [
      ['&#128293;', 'Sequ&ecirc;ncia atual', `${streak} dia${streak === 1 ? '' : 's'}`],
      ['&#9201;', 'Tempo estudado hoje', duration(todayTime)],
      ['&#128197;', 'Meta semanal', `${clamp(percent(tests.slice(0, 7).length, 7), 0, 100)}%`]
    ].map(([icon, label, value]) => `<article class="home-footer-card"><span class="home-icon">${icon}</span><span><strong>${value}</strong><small class="home-muted">${label}</small></span></article>`).join('');
  }

  homeTab.addEventListener('click', openHome);
  tabs.addEventListener('click', event => {
    const button = event.target.closest('.tab[data-view]');
    if (!button || button === homeTab) return;
    homeView.classList.remove('active');
    homeTab.classList.remove('active');
    homeTab.removeAttribute('aria-current');
  });
  homeView.addEventListener('click', event => {
    if (event.target.closest('[data-home-action]')) openAppView('test', 'quick');
  });
  const observer = new MutationObserver(() => {
    if (homeView.classList.contains('active')) requestAnimationFrame(renderHome);
  });
  observer.observe(document.querySelector('#subjects') || document.body, { childList: true, subtree: true });
  requestAnimationFrame(openHome);
})();