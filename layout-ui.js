
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
    body.home-active,
    body.home-active .app,
    body.home-active main,
    body.home-active .home-view { background: var(--bg); }
    body.home-active main { width: min(100%, 1180px); padding: 24px 24px 32px; overflow-x: hidden; }
    body.home-active .topbar-title { display: none; }
    .home-view { display: none; width: 100%; max-width: 1180px; margin: 0 auto; padding: 0; color: #172033; background: var(--bg); overflow-x: hidden; }
    .home-view.active { display: block; }
    .home-view *, .home-view *::before, .home-view *::after { box-sizing: border-box; }
    .home-view [hidden] { display: none !important; }
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
    .home-progress-overview { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 16px; }
    .home-progress-card { min-height: 164px; padding: 20px; overflow: hidden; }
    .home-progress-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .home-progress-card-head h3 { margin: 0; color: #172033; font-size: 16px; line-height: 22px; font-weight: 600; }
    .home-progress-symbol { width: 36px; height: 36px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%; background: #eef4ff; color: #2563eb; }
    .home-progress-symbol img { width: 27px; height: 27px; object-fit: contain; }
    .home-progress-symbol .home-svg { width: 23px; height: 23px; }
    .home-progress-value { display: flex; align-items: baseline; gap: 9px; margin-bottom: 3px; }
    .home-progress-value strong { color: #172033; font-size: 36px; line-height: 40px; font-weight: 700; }
    .home-progress-value span { color: #334155; font-size: 16px; }
    .home-progress-card > p { margin: 0 0 12px; color: #64748b; font-size: 13px; line-height: 18px; }
    .home-progress-card .home-progress { height: 8px; }
    .home-progress-card .home-progress span { background: #2563eb; }
    .home-sequence-days { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 7px; margin-top: 12px; padding: 9px 8px 7px; border: 1px solid #e5eaf1; border-radius: 10px; }
    .home-sequence-day { display: grid; justify-items: center; gap: 5px; color: #64748b; font-size: 11px; font-weight: 600; }
    .home-sequence-day i { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid #e5eaf1; border-radius: 50%; color: transparent; font-style: normal; }
    .home-sequence-day.is-study i { border-color: #b8e2ff; background: #eef9ff; color: #2563eb; }
    .home-sequence-day.is-current i { border-color: #f59e0b; background: #fbbf24; color: #172033; }
    .home-sequence-day.is-current { color: #172033; }
    .home-progress-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
    .home-progress-grid .home-panel { min-height: 240px; }
    .home-simple-list, .home-goal-list { display: grid; gap: 0; margin: 0; padding: 0; }
    .home-stat-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef1f5; color: #64748b; font-size: 13px; }
    .home-stat-row:last-child { border-bottom: 0; }
    .home-stat-row b { color: #172033; font-size: 18px; font-weight: 700; }
    .home-chart svg { width: 100%; height: 170px; display: block; }
    .home-chart-caption { margin: 4px 0 0; color: #94a3b8; font-size: 12px; }
    .home-goal-list { gap: 10px; }
    .home-goal-item { padding: 10px 12px; border: 1px solid #e5eaf1; border-radius: 10px; background: #f8fafc; display: grid; gap: 8px; }
    .home-goal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #172033; font-size: 13px; font-weight: 600; }
    .home-goal-head span { color: #64748b; font-size: 12px; font-weight: 500; }
    .home-period-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
    .home-period-item { padding: 12px; border: 1px solid #dce7ff; border-radius: 10px; background: #eef4ff; }
    .home-period-item b { display: block; color: #172033; font-size: 21px; line-height: 26px; font-weight: 700; }
    .home-period-item span { color: #64748b; font-size: 12px; }
    .home-footer-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
    .home-footer-card { min-height: 90px; padding: 16px; display: flex; align-items: center; gap: 10px; }
    .home-footer-card strong { display: block; color: #172033; font-size: 24px; line-height: 28px; font-weight: 700; }
    .home-footer-card small { display: block; font-size: 12px; }
    .home-activity-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
    .home-activity-panel { min-height: 300px; }
    .home-activity-scroll { height: 226px; max-height: 226px; overflow-y: scroll; overflow-x: hidden; padding-right: 8px; }
    .home-activity-item { display: grid; grid-template-columns: 20px minmax(0,1fr); gap: 8px; padding: 10px 0; border-bottom: 1px solid #eef1f5; color: #172033; font-size: 13px; line-height: 19px; }
    .home-activity-item:last-child { border-bottom: 0; }
    .home-check { color: #16a34a; font-weight: 700; }
    .home-activity-item small { display: block; color: #94a3b8; font-size: 11px; line-height: 17px; }
    .home-recent-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eef1f5; color: #172033; font-size: 13px; }
    .home-recent-row:last-child { border-bottom: 0; }
    .home-recent-row small { color: #64748b; font-size: 11px; white-space: nowrap; }
    @media (max-width: 1200px) { .home-summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
    @media (max-width: 980px) { .home-today-grid, .home-progress-overview, .home-progress-grid, .home-activity-grid { grid-template-columns: 1fr; } .home-priority-list { grid-template-columns: repeat(2,minmax(0,1fr)); } }
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
      .home-card { min-height: 82px; padding: 11px 12px; }
      .home-card-number { font-size: 23px; line-height: 28px; }
      .home-card strong { font-size: 12px; }
      .home-collection-grid, .home-priority-list, .home-period-list { grid-template-columns: 1fr; }
      .home-collection-scroll { max-height: 330px; }
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
      <nav class="home-subtabs" aria-label="Resumo inicial" role="tablist"><button class="home-subtab active" type="button" role="tab" aria-selected="true" data-home-tab="today">Hoje</button><button class="home-subtab" type="button" role="tab" aria-selected="false" data-home-tab="progress">Progresso</button><button class="home-subtab" type="button" role="tab" aria-selected="false" data-home-tab="activity">Atividade</button></nav>
      <section data-home-panel="today"><div class="home-shell">
        <section class="home-summary-grid" id="homeSummaryCards"></section>
        <div class="home-today-grid">
          <article class="home-panel home-study-card"><div class="home-study-head"><div><div class="home-kicker">Estude agora</div><h3>O que revisar primeiro</h3><p class="home-muted" id="homeStudyText">Comece um teste para criar sua primeira recomenda&ccedil;&atilde;o.</p></div><span class="home-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 9-12h-7z"></path></svg></span></div><div class="home-focus-box"><div class="home-recommendation-list" id="homeStudyRecommendations"><p class="home-muted">As recomenda&ccedil;&otilde;es aparecer&atilde;o depois do primeiro teste.</p></div></div></article>
          <article class="home-panel"><div class="home-panel-head"><h3>Resumo das cole&ccedil;&otilde;es</h3></div><div class="home-collection-scroll"><div class="home-collection-grid" id="homeCollectionSummary"></div></div></article>
        </div>
        <section class="home-panel home-priority-panel"><div class="home-panel-head"><div><h3>Revis&otilde;es recomendadas para hoje</h3><p class="home-muted">Mantenha o ritmo! Revise e fixe ainda mais o conte&uacute;do.</p></div></div><div class="home-priority-scroll"><div class="home-priority-list" id="homePriorities"></div></div></section>
      </div></section>
      <section data-home-panel="progress" hidden><div class="home-shell"><section class="home-progress-overview" id="homeFooterStats"></section><div class="home-progress-grid"><article class="home-panel"><div class="home-panel-head"><h3>Desempenho recente</h3></div><ul class="home-simple-list" id="homePerformance"></ul></article><article class="home-panel"><div class="home-panel-head"><h3>Evolu&ccedil;&atilde;o</h3></div><div class="home-chart" id="homeChart"></div></article><article class="home-panel"><div class="home-panel-head"><h3>Objetivos</h3></div><ul class="home-goal-list" id="homeGoals"></ul></article><article class="home-panel"><div class="home-panel-head"><h3>Resumo do per&iacute;odo</h3></div><div class="home-period-list" id="homePeriodSummary"></div></article></div></div></section>
      <section data-home-panel="activity" hidden><div class="home-shell"><div class="home-activity-grid"><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3>Atividade recente</h3></div><div class="home-activity-scroll"><ul class="home-simple-list" id="homeActivity"></ul></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3>Conte&uacute;dos estudados recentemente</h3></div><div class="home-activity-scroll"><div id="homeRecentContent"></div></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3>Revis&otilde;es recomendadas</h3></div><div class="home-activity-scroll"><div id="homeRecommendations"></div></div></article><article class="home-panel home-activity-panel"><div class="home-panel-head"><h3>&Uacute;ltimos testes realizados</h3></div><div class="home-activity-scroll"><div id="homeTests"></div></div></article></div></div></section>
    </div>
  `;
  manageView.insertAdjacentElement('beforebegin', homeView);

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
  const svgIcon = name => { const paths = { books: '<path d="M5 4h3v16H5zM10 4h3v16h-3zM15 6h4v14h-4z"></path><path d="M4 20h16"></path>', questions: '<rect x="6" y="4" width="12" height="16" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path>', target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="m17 7 3-3"></path>', chart: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>', folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>', clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path>', calendar: '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 9h16"></path>', flag: '<path d="M5 21V4"></path><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0"></path>' }; return `<svg class="home-svg" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.chart}</svg>`; };
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
  function setHomePanel(panel) { homePanel = panel; homeView.querySelectorAll('[data-home-tab]').forEach(button => { const active = button.dataset.homeTab === panel; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); }); homeView.querySelectorAll('[data-home-panel]').forEach(view => { view.hidden = view.dataset.homePanel !== panel; }); }
  function openAppView(view, panel) { document.body.classList.remove('home-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); if (typeof showView === 'function') showView(view); if (view === 'test' && typeof showTestPanel === 'function') showTestPanel(panel || 'quick'); if (view === 'test' && typeof renderTest === 'function') renderTest(); }
  function openHome() { document.body.classList.add('home-active'); document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view === homeView)); tabs.querySelectorAll('.tab').forEach(button => { const active = button === homeTab; button.classList.toggle('active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); }); setHomePanel('today'); renderHome(); if (typeof closeMobileNav === 'function') closeMobileNav(); }
   function renderCollectionCards(items) { if (!items.length) return '<div class="home-muted">As cole&ccedil;&otilde;es aparecer&atilde;o aqui depois do primeiro teste.</div>'; return items.map(({ subject, stats }) => `<article class="home-collection-card" data-home-subject="${esc(subject.id)}" tabindex="0"><div class="home-collection-head"><div class="home-collection-name"><span class="home-folder-icon">${svgIcon('folder')}</span><span>${esc(subject.name)}</span></div><span class="home-collection-total">${stats.total} quest&otilde;es</span></div><div class="home-collection-metrics"><span><b>${stats.mastered}</b><small>Dominadas</small></span><span><b>${stats.learning}</b><small>Em andamento</small></span><span><b>${stats.review}</b><small>Revisar</small></span></div><div class="home-progress"><span style="width:${clamp(stats.progress,3,100)}%"></span></div><div class="home-collection-foot"><span>Aproveitamento</span><b>${stats.progress}%</b></div></article>`).join(''); }
  function renderChart(points) { const list = points.length ? points : [0,0,0,0]; const xy = list.map((value,index) => `${28 + index * (244 / Math.max(1, list.length - 1))},${145 - (clamp(value,0,100) / 100) * 104}`).join(' '); document.querySelector('#homeChart').innerHTML = `<svg viewBox="0 0 300 185" role="img" aria-label="Evolu&ccedil;&atilde;o de aproveitamento"><path d="M28 36v109h244" fill="none" stroke="#e8edf5" stroke-width="1"></path><path d="M28 92h244M28 64h244" fill="none" stroke="#f1f5f9" stroke-width="1"></path><polyline points="${xy}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>${list.map((value,index) => `<circle cx="${28 + index * (244 / Math.max(1, list.length - 1))}" cy="${145 - (clamp(value,0,100) / 100) * 104}" r="3" fill="#2563eb"></circle>`).join('')}</svg><p class="home-chart-caption">Aproveitamento dos &uacute;ltimos testes.</p>`; }

   function renderHomeLegacy() {
    const cards = allCards(); const tests = history(); const recent = tests.slice(0, 7); const totalAttempts = tests.reduce((sum,item) => sum + Number(item.total || 0), 0); const totalScore = tests.reduce((sum,item) => sum + Number(item.score || 0), 0); const current = typeof currentSubject === 'function' ? currentSubject() : subjects()[0]; const last = subjects().find(subject => subject.id === tests[0]?.subjectId) || current || subjects()[0]; const reviewTotal = cards.filter(item => needsReview(item.card)).length; const overdueTotal = cards.filter(item => item.card?.dueAt && new Date(item.card.dueAt).getTime() < Date.now()).length; const masteredTotal = cards.filter(item => isMastered(item.card)).length; const accuracy = percent(totalScore, totalAttempts); const streak = studyStreak(); const dateText = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
    document.querySelector('#homeGreeting').textContent = `${greeting()}, ${userName()}!`; document.querySelector('#homeDatePill').textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1); document.querySelector('#homeLastCollection').textContent = last?.name || 'Nenhuma ainda'; document.querySelector('#homeTodayCount').textContent = reviewTotal; document.querySelector('#homeLateCount').textContent = overdueTotal; document.querySelector('#homeStudyText').textContent = `Voc\u00ea possui ${reviewTotal} revis\u00f5es para fazer hoje.`;
    const streakElement = document.querySelector('#homeTopStreak'); if (streakElement) { streakElement.querySelector('b').textContent = streak; streakElement.title = `Voc\u00ea estuda h\u00e1 ${streak} dias consecutivos.`; }
     document.querySelector('#homeSummaryCards').innerHTML = [['books','Cole&ccedil;&otilde;es',subjects().length,'Total de cole&ccedil;&otilde;es'],['questions','Quest&otilde;es',cards.length,'Total de quest&otilde;es'],['target','Dominadas',masteredTotal,`${percent(masteredTotal,cards.length)}% do total`],['chart','Aproveitamento',`${accuracy}%`,'M&eacute;dia dos testes']].map(([icon,label,value,caption]) => `<article class="home-card"><img class="home-card-art" src="${homeAsset(HOME_ASSETS[icon] || HOME_ASSETS.chart)}" alt="" aria-hidden="true"><span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span></article>`).join('');
    document.querySelector('#homeCollectionSummary').innerHTML = renderCollectionCards(sortedSubjects().slice(0,14));
    const recentTotal = recent.reduce((sum,item) => sum + Number(item.total || 0), 0); const recentScore = recent.reduce((sum,item) => sum + Number(item.score || 0), 0); const recentDuration = recent.reduce((sum,item) => sum + Number(item.durationMs || 0), 0); const lastTest = recent[0] ? `${Number(recent[0].score || 0)} de ${Number(recent[0].total || 0)}` : 'Sem testes';
    document.querySelector('#homePerformance').innerHTML = [['M&eacute;dia dos &uacute;ltimos testes',`${percent(recentScore,recentTotal)}%`],['Tempo m&eacute;dio por quest&atilde;o',recentTotal ? duration(recentDuration / recentTotal) : '0s'],['Melhor sequ&ecirc;ncia',`${recent.reduce((max,item) => Math.max(max,Number(item.score || 0)),0)} acertos`],['Acertos recentes',lastTest]].map(([label,value]) => `<li class="home-stat-row"><span>${label}</span><b>${value}</b></li>`).join('');
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

     const recentTotal = recent.reduce((sum, item) => sum + Number(item.total || 0), 0);
     const recentScore = recent.reduce((sum, item) => sum + Number(item.score || 0), 0);
     const recentDuration = recent.reduce((sum, item) => sum + Number(item.durationMs || 0), 0);
     const lastTest = recent[0] ? `${Number(recent[0].score || 0)} de ${Number(recent[0].total || 0)}` : 'Sem testes';
     document.querySelector('#homePerformance').innerHTML = [['M&eacute;dia dos &uacute;ltimos testes',`${percent(recentScore,recentTotal)}%`],['Tempo m&eacute;dio por quest&atilde;o',recentTotal ? duration(recentDuration / recentTotal) : '0s'],['Melhor sequ&ecirc;ncia',`${recent.reduce((max,item) => Math.max(max,Number(item.score || 0)),0)} acertos`],['Acertos recentes',lastTest]].map(([label,value]) => `<li class="home-stat-row"><span>${label}</span><b>${value}</b></li>`).join('');
     renderChart(recent.slice(0, 6).reverse().map(item => clamp(percent(Number(item.score || 0), Number(item.total || 0)), 0, 100)));
     const todayTests = tests.filter(item => String(item.date || '').slice(0, 10) === todayKey()).length;
     document.querySelector('#homeGoals').innerHTML = [['Revisar 30 quest&otilde;es hoje',Math.min(reviewTotal,30),30],['Fazer dois testes',Math.min(todayTests,2),2],['Dominar mais 20 quest&otilde;es',Math.min(masteredTotal,20),20]].map(([label,done,total]) => `<li class="home-goal-item"><div class="home-goal-head"><strong>${label}</strong><span>${done}/${total}</span></div><div class="home-progress"><span style="width:${clamp(percent(done,total),4,100)}%"></span></div></li>`).join('');
     const todayTime = tests.filter(item => String(item.date || '').slice(0,10) === todayKey()).reduce((sum,item) => sum + Number(item.durationMs || 0), 0);
     document.querySelector('#homePeriodSummary').innerHTML = [[tests.length,'testes realizados'],[cards.length,'quest&otilde;es cadastradas'],[masteredTotal,'quest&otilde;es dominadas'],[duration(todayTime),'estudado hoje']].map(([value,label]) => `<div class="home-period-item"><b>${value}</b><span>${label}</span></div>`).join('');

     const priorities = testedItems.filter(item => item.stats.review > 0).slice(0, 12);
     document.querySelector('#homePriorities').innerHTML = priorities.length ? priorities.map(({subject,stats}) => `<article class="home-priority-item" data-home-subject="${esc(subject.id)}" tabindex="0"><div class="home-priority-head"><strong>${esc(subject.name)}</strong><span>Revisar ${stats.review}</span></div><div class="home-progress"><span style="width:${clamp(percent(stats.review,stats.total || 1),8,100)}%"></span></div></article>`).join('') : '<p class="home-muted">As revis&otilde;es recomendadas aparecer&atilde;o depois do primeiro teste.</p>';
     const activities = recent.slice(0, 5).map(item => `<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Finalizou teste em ${esc(testSubjectName(item))}<small>${Number(item.score || 0)} de ${Number(item.total || 0)} acertos</small></span></li>`);
     if (subjects().length) activities.push('<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Organizou suas cole&ccedil;&otilde;es<small>Dados atualizados no Fixa</small></span></li>');
     document.querySelector('#homeActivity').innerHTML = activities.length ? activities.join('') : '<li class="home-activity-item"><span class="home-check">&#10003;</span><span>Sua atividade aparecer&aacute; aqui.</span></li>';
      document.querySelector('#homeRecentContent').innerHTML = recent.length ? recent.slice(0, 5).map(item => `<div class="home-recent-row"><span>${esc(testSubjectName(item))}</span><small>${Number(item.score || 0)} acertos</small></div>`).join('') : '<p class="home-muted">Nenhum conte&uacute;do estudado recentemente.</p>';
      document.querySelector('#homeRecommendations').innerHTML = testedItems.filter(item => item.stats.review > 0).slice(0, 5).map(({subject,stats}) => `<div class="home-recent-row"><span>${esc(subject.name)}</span><small>${stats.review} para revisar</small></div>`).join('') || '<p class="home-muted">Nenhuma revis&atilde;o recomendada agora.</p>';
      document.querySelector('#homeTests').innerHTML = recent.slice(0, 5).map(item => `<div class="home-recent-row"><span>${esc(testSubjectName(item))}</span><small>${Number(item.score || 0)}/${Number(item.total || 0)}</small></div>`).join('') || '<p class="home-muted">Nenhum teste realizado ainda.</p>';
       const weeklyTests = tests.filter(item => Number(new Date(item.date || 0)) >= Date.now() - (7 * 24 * 60 * 60 * 1000)).length;
       const weeklyDone = Math.min(4, weeklyTests);
       const weeklyPercent = Math.round((weeklyDone / 4) * 100);
       const sequenceLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
       const sequenceDays = sequenceLabels.map((label, index) => { const active = streak > 0 && index >= Math.max(0, 7 - Math.min(7, streak)); const current = index === 6 && streak > 0; return `<span class="home-sequence-day${active ? ' is-study' : ''}${current ? ' is-current' : ''}"><b>${label}</b><i>${current ? '&#10003;' : active ? '&bull;' : ''}</i></span>`; }).join('');
       document.querySelector('#homeFooterStats').innerHTML = `<article class="home-panel home-progress-card home-sequence-card"><div class="home-progress-card-head"><span class="home-progress-symbol"><img src="${homeAsset(HOME_ASSETS.fire)}" alt="" aria-hidden="true"></span><h3>Sequ&ecirc;ncia</h3></div><div class="home-progress-value"><strong>${streak}</strong><span>dias seguidos</span></div><div class="home-sequence-days">${sequenceDays}</div></article><article class="home-panel home-progress-card"><div class="home-progress-card-head"><span class="home-progress-symbol">${svgIcon('clock')}</span><h3>Tempo estudado hoje</h3></div><div class="home-progress-value"><strong>${duration(todayTime)}</strong></div><p>Meta di&aacute;ria: 2h</p><div class="home-progress"><span style="width:${Math.min(100, Math.round(todayTime / (2 * 60 * 60 * 1000) * 100))}%"></span></div></article><article class="home-panel home-progress-card"><div class="home-progress-card-head"><span class="home-progress-symbol">${svgIcon('flag')}</span><h3>Metas da semana</h3></div><div class="home-progress-value"><strong>${weeklyPercent}%</strong></div><p>${weeklyDone} de 4 metas conclu&iacute;das</p><div class="home-progress"><span style="width:${weeklyPercent}%"></span></div></article>`;

      const dailyTarget = item => Math.min(10, Math.max(0, item.stats.review));
      const todayTestRecords = tests.filter(item => String(item.date || '').slice(0, 10) === todayKey());
      const completedToday = subject => testRecordsFor(subject, todayTestRecords).reduce((sum, item) => sum + Number(item.score || 0), 0);
      document.querySelector('#homeSummaryCards').innerHTML = [['books','Cole&ccedil;&otilde;es',subjects().length,'Total de cole&ccedil;&otilde;es'],['questions','Quest&otilde;es',cards.length,'Total de quest&otilde;es'],['trophy','Dominadas',masteredTotal,`${percent(masteredTotal,cards.length)}% do total`],['chart','Aproveitamento',`${accuracy}%`,'M&eacute;dia dos testes']].map(([icon,label,value,caption]) => `<article class="home-card"><img class="home-card-art" src="${homeAsset(HOME_ASSETS[icon] || HOME_ASSETS.chart)}" alt="" aria-hidden="true"><span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span></article>`).join('');
      const plans = testedItems.filter(item => item.stats.review > 0).slice(0, 3);
      document.querySelector('#homePriorities').innerHTML = plans.length ? plans.map(item => { const target = dailyTarget(item); const done = Math.min(target, completedToday(item.subject)); const progress = target ? Math.min(100, Math.round(done / target * 100)) : 0; return `<article class="home-priority-item" data-home-subject="${esc(item.subject.id)}" tabindex="0"><div class="home-priority-head"><strong>${esc(item.subject.name)}</strong><span>Hoje: ${target} quest&otilde;es</span></div><div class="home-priority-sub"><span>${done} de ${target} conclu&iacute;das</span><b>${progress}%</b></div><div class="home-progress"><span style="width:${progress}%"></span></div></article>`; }).join('') : '<p class="home-muted">As revis&otilde;es recomendadas aparecer&atilde;o depois do primeiro teste.</p>';
      setHomePanel(homePanel);
   }

   homeTab.addEventListener('click', openHome);
   homeView.querySelectorAll('[data-home-tab]').forEach(button => button.addEventListener('click', () => setHomePanel(button.dataset.homeTab)));
   tabs.addEventListener('click', event => { const button = event.target.closest('.tab[data-view]'); if (!button || button === homeTab) return; document.body.classList.remove('home-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); });
   homeView.addEventListener('click', event => { const action = event.target.closest('[data-home-action]'); if (action) { openAppView('test','quick'); return; } const collection = event.target.closest('[data-home-subject]'); if (collection) { if (typeof selectDestinationCollection === 'function') selectDestinationCollection(collection.dataset.homeSubject); document.body.classList.remove('home-active'); homeView.classList.remove('active'); homeTab.classList.remove('active'); if (typeof showView === 'function') showView('manage'); } });
   homeView.addEventListener('keydown', event => { if (event.key !== 'Enter' && event.key !== ' ') return; const collection = event.target.closest('[data-home-subject]'); if (!collection) return; event.preventDefault(); collection.click(); });
   const streakButton = document.querySelector('#homeTopStreak');
   const streakPopover = document.querySelector('#homeStreakPopover');
   const closeStreakPopover = () => { if (!streakPopover) return; streakPopover.hidden = true; streakButton?.setAttribute('aria-expanded', 'false'); };
   streakButton?.addEventListener('click', event => { event.stopPropagation(); if (!streakPopover) return; renderStreakPopover(); streakPopover.hidden = !streakPopover.hidden; streakButton.setAttribute('aria-expanded', String(!streakPopover.hidden)); });
   document.addEventListener('click', event => { if (!event.target.closest('#homeTopTools')) closeStreakPopover(); });
   const observer = new MutationObserver(() => { if (homeView.classList.contains('active')) requestAnimationFrame(renderHome); });
  observer.observe(document.querySelector('#subjects') || document.body, { childList: true, subtree: true });
  requestAnimationFrame(openHome);
})();
