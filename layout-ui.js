
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
  if (!manageView || !tabs || !manageTab) return;

  const style = document.createElement('style');
  style.id = 'homeDashboardStyle';
  style.textContent = `
    .home-view { display: none; gap: 16px; }
    .home-view.active { display: grid; }
    .home-card, .home-panel, .home-continue { background: #fff; border: 1px solid #dbe5f3; border-radius: 14px; box-shadow: 0 16px 40px rgba(15,23,42,.05); }
    .home-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .home-title h2 { margin: 0 0 6px; color: #0f172a; font-size: clamp(24px,3vw,32px); line-height: 1.05; }
    .home-title p, .home-muted { margin: 0; color: #65728a; font-size: 14px; }
    .home-head-actions { display: flex; align-items: center; gap: 10px; }
    .home-streak, .home-icon-button, .home-avatar { min-height: 42px; border: 1px solid #dbe5f3; border-radius: 14px; background: #fff; box-shadow: 0 10px 26px rgba(15,23,42,.05); }
    .home-streak { display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; color: #0f172a; font-weight: 900; }
    .home-streak small { color: #65728a; font-size: 11px; font-weight: 800; }
    .home-icon-button, .home-avatar { width: 42px; display: inline-grid; place-items: center; color: #2563eb; }
    .home-avatar { border-radius: 999px; background: linear-gradient(135deg,#eaf1ff,#fff); font-weight: 950; cursor: pointer; }
    .home-continue { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 18px; padding: 22px; background: linear-gradient(135deg,#fff 0%,#f7fbff 100%); }
    .home-kicker { color: #2563eb; font-size: 12px; font-weight: 950; letter-spacing: .04em; text-transform: uppercase; }
    .home-continue h3, .home-panel h3, .home-card strong { margin: 0; color: #0f172a; }
    .home-continue h3 { margin-top: 8px; font-size: 24px; }
    .home-chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    .home-chip { display: inline-flex; align-items: center; min-height: 30px; padding: 0 10px; border: 1px solid #dbe5f3; border-radius: 999px; background: #f8fbff; color: #475569; font-size: 12px; font-weight: 850; }
    .home-primary, .home-secondary { min-height: 46px; border-radius: 10px; font-weight: 900; cursor: pointer; }
    .home-primary { padding: 0 22px; border: 0; background: #2563eb; color: #fff; box-shadow: 0 16px 30px rgba(37,99,235,.20); }
    .home-summary-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
    .home-card { min-height: 112px; padding: 18px; display: grid; align-content: center; gap: 8px; }
    .home-icon { width: 42px; height: 42px; border-radius: 14px; display: inline-grid; place-items: center; background: #eaf1ff; color: #2563eb; font-weight: 950; }
    .home-value { color: #0f172a; font-size: 30px; font-weight: 950; line-height: 1; }
    .home-two-col { display: grid; grid-template-columns: minmax(280px,.9fr) minmax(0,1.5fr); gap: 14px; }
    .home-panel { padding: 18px; min-width: 0; }
    .home-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .home-action-list, .home-list { display: grid; gap: 10px; }
    .home-action { width: 100%; min-height: 58px; border: 1px solid #dbe5f3; border-radius: 12px; background: #fff; padding: 12px; display: grid; grid-template-columns: 42px minmax(0,1fr) auto; align-items: center; gap: 12px; text-align: left; cursor: pointer; }
    .home-action.primary { border-color: #2563eb; background: #2563eb; color: #fff; }
    .home-action.primary .home-icon { background: rgba(255,255,255,.16); color: #fff; }
    .home-action span span { display: block; margin-top: 3px; color: inherit; opacity: .78; font-size: 12px; }
    .home-scroll { max-height: 278px; overflow-y: auto; padding-right: 3px; }
    .home-item { border: 1px solid #dbe5f3; border-radius: 12px; background: #f8fbff; padding: 12px; }
    .home-item-head, .home-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .home-mini-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 8px; margin-top: 10px; }
    .home-mini { border-radius: 10px; background: #fff; padding: 8px; color: #65728a; font-size: 11px; }
    .home-mini b { display: block; color: #0f172a; font-size: 14px; }
    .home-progress { height: 7px; border-radius: 999px; background: #e7edf7; overflow: hidden; margin-top: 8px; }
    .home-progress span { display: block; height: 100%; border-radius: inherit; background: #2563eb; }
    .home-dashboard-grid { display: grid; grid-template-columns: .9fr 1fr 1fr 1fr; gap: 14px; }
    .home-list li { list-style: none; }
    .home-performance-row { display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid #edf2f8; color: #65728a; font-size: 13px; }
    .home-performance-row:last-child { border-bottom: 0; }
    .home-performance-row b { color: #0f172a; }
    .home-chart svg { width: 100%; height: 170px; display: block; }
    .home-chart-legend { display: flex; flex-wrap: wrap; gap: 10px; color: #65728a; font-size: 12px; }
    .home-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; margin-right: 5px; }
    .home-priority-scroll { max-height: 220px; overflow-y: auto; padding-right: 3px; }
    .home-footer-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
    .home-footer-card { border: 1px solid #dbe5f3; border-radius: 14px; background: #fff; padding: 16px; display: grid; grid-template-columns: 42px minmax(0,1fr); align-items: center; gap: 12px; box-shadow: 0 12px 30px rgba(15,23,42,.04); }
    @media (max-width:1180px) { .home-summary-grid, .home-dashboard-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .home-two-col { grid-template-columns: 1fr; } }
    @media (max-width:760px) { .home-head, .home-continue { display: grid; grid-template-columns: 1fr; align-items: stretch; } .home-head-actions { justify-content: flex-start; } .home-summary-grid, .home-dashboard-grid, .home-footer-grid { grid-template-columns: 1fr; } .home-mini-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
  `;
  document.head.appendChild(style);

  const homeTab = document.createElement('button');
  homeTab.className = 'tab';
  homeTab.type = 'button';
  homeTab.dataset.view = 'home';
  homeTab.innerHTML = '<svg class="tab-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path><path d="M9 21v-6h6v6"></path></svg>In&iacute;cio';
  manageTab.insertAdjacentElement('beforebegin', homeTab);

  const homeView = document.createElement('section');
  homeView.className = 'view home-view';
  homeView.id = 'home';
  homeView.innerHTML = `
    <header class="home-head"><div class="home-title"><h2 id="homeGreeting">Ol&aacute;!</h2><p>Pronta para mais um passo rumo aos seus objetivos?</p></div><div class="home-head-actions"><span class="home-streak" id="homeStreak" title="Voc&ecirc; estuda h&aacute; 0 dias consecutivos."><span aria-hidden="true">&#128293;</span><b>0</b><small>dias</small></span><button class="home-icon-button" type="button" aria-label="Notifica&ccedil;&otilde;es" title="Notifica&ccedil;&otilde;es"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button><button class="home-avatar" id="homeAvatar" type="button" aria-label="Abrir menu do usu&aacute;rio">F</button></div></header>
    <section class="home-continue"><div><span class="home-kicker">Continuar estudando</span><h3 id="homeLastCollection">Crie ou selecione uma cole&ccedil;&atilde;o</h3><p class="home-muted" id="homeContinueText">O Fixa vai indicar aqui o melhor pr&oacute;ximo passo.</p><div class="home-chips"><span class="home-chip" id="homeReviewChip">0 revis&otilde;es para hoje</span><span class="home-chip" id="homeOverdueChip">0 atrasadas</span></div></div><button class="home-primary" type="button" data-home-action="continue">Continuar estudando</button></section>
    <section class="home-summary-grid" id="homeSummaryCards"></section>
    <section class="home-two-col"><article class="home-panel"><div class="home-panel-head"><div><span class="home-kicker">Estude agora</span><h3>O que revisar primeiro</h3></div><span class="home-icon">&#9658;</span></div><div class="home-action-list"><button class="home-action primary" type="button" data-home-action="recommended"><span class="home-icon">&#9658;</span><span><strong>Revis&atilde;o recomendada</strong><span id="homeRecommendedText">Comece pelo que mais precisa de aten&ccedil;&atilde;o.</span></span><b>&rsaquo;</b></button><button class="home-action" type="button" data-home-action="quick-test"><span class="home-icon">&#9889;</span><span><strong>Teste r&aacute;pido</strong><span>Treine com quest&otilde;es embaralhadas.</span></span><b>&rsaquo;</b></button></div></article><article class="home-panel"><div class="home-panel-head"><h3>Resumo das cole&ccedil;&otilde;es</h3></div><div class="home-scroll"><div class="home-list" id="homeCollectionSummary"></div></div></article></section>
    <section class="home-dashboard-grid"><article class="home-panel"><div class="home-panel-head"><h3>Desempenho recente</h3></div><ul class="home-list" id="homePerformance"></ul></article><article class="home-panel"><div class="home-panel-head"><h3>Evolu&ccedil;&atilde;o</h3></div><div class="home-chart" id="homeChart"></div></article><article class="home-panel"><div class="home-panel-head"><h3>Atividade recente</h3></div><ul class="home-list" id="homeActivity"></ul></article><article class="home-panel"><div class="home-panel-head"><h3>Objetivos</h3></div><ul class="home-list" id="homeGoals"></ul></article></section>
    <section class="home-panel"><div class="home-panel-head"><h3>Prioridades</h3></div><div class="home-priority-scroll"><div class="home-list" id="homePriorities"></div></div></section><section class="home-footer-grid" id="homeFooterStats"></section>
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
  const duration = ms => { const s = Math.max(0, Math.round(Number(ms || 0) / 1000)); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : m ? `${m}min ${s % 60}s` : `${s}s`; };
  const userName = () => { const label = document.querySelector('#userDisplayName')?.textContent?.trim(); return label && label !== 'Usuário' ? label.split(/\s+/)[0] : 'Julia'; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
  function streak() { const set = new Set(history().map(item => String(item.date || '').slice(0, 10)).filter(Boolean)); const day = new Date(); day.setHours(0,0,0,0); let count = 0; for (let i = 0; i < 365; i++) { const key = day.toISOString().slice(0,10); if (!set.has(key)) { if (i === 0) { day.setDate(day.getDate() - 1); continue; } break; } count++; day.setDate(day.getDate() - 1); } return count; }
  function subjectStats(subject) { const cards = cardsOf(subject); const total = cards.length; const frozen = cards.filter(isFrozen).length; const mastered = cards.filter(isMastered).length; const learning = cards.filter(card => !isFrozen(card) && isLearning(card)).length; const review = cards.filter(needsReview).length; return { total, frozen, mastered, learning, review, progress: percent(mastered, Math.max(1, total - frozen)) }; }
  const sortedSubjects = () => subjects().map(subject => ({ subject, stats: subjectStats(subject) })).sort((a,b) => (b.stats.review - a.stats.review) || (b.stats.total - a.stats.total));

  function openAppView(view, panel) { homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); if (typeof showView === 'function') showView(view); if (view === 'test' && typeof showTestPanel === 'function') showTestPanel(panel || 'quick'); if (view === 'test' && typeof renderTest === 'function') renderTest(); }
  function openHome() { document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view === homeView)); tabs.querySelectorAll('.tab').forEach(button => { const active = button === homeTab; button.classList.toggle('active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); }); renderHome(); if (typeof closeMobileNav === 'function') closeMobileNav(); }

  function renderHome() {
    const cards = allCards(); const tests = history(); const totalAttempts = tests.reduce((sum,item) => sum + Number(item.total || 0), 0); const totalScore = tests.reduce((sum,item) => sum + Number(item.score || 0), 0);
    const metrics = { total: cards.length, mastered: cards.filter(item => isMastered(item.card)).length, review: cards.filter(item => needsReview(item.card)).length, overdue: cards.filter(item => item.card?.dueAt && new Date(item.card.dueAt).getTime() < Date.now()).length, accuracy: percent(totalScore, totalAttempts) };
    const current = typeof currentSubject === 'function' ? currentSubject() : subjects()[0]; const last = subjects().find(subject => subject.id === tests[0]?.subjectId) || current || subjects()[0]; const currentStreak = streak();
    document.querySelector('#homeGreeting').innerHTML = `${greeting()}, ${esc(userName())}!`; document.querySelector('#homeLastCollection').textContent = last?.name || 'Nenhuma colecao criada ainda'; document.querySelector('#homeContinueText').textContent = last ? `${subjectStats(last).review} questoes restantes para revisar nesta colecao.` : 'Crie sua primeira colecao para o Fixa montar seu caminho de estudos.'; document.querySelector('#homeReviewChip').textContent = `${metrics.review} revisoes para hoje`; document.querySelector('#homeOverdueChip').textContent = `${metrics.overdue} atrasadas`; document.querySelector('#homeRecommendedText').textContent = metrics.review ? `Voce tem ${metrics.review} questoes para revisar hoje.` : 'Sem revisoes pendentes; faca um teste rapido para aquecer.'; document.querySelector('#homeStreak b').textContent = currentStreak; document.querySelector('#homeStreak').title = `Voce estuda ha ${currentStreak} dias consecutivos.`; document.querySelector('#homeAvatar').textContent = userName().charAt(0).toUpperCase() || 'F';
    document.querySelector('#homeSummaryCards').innerHTML = [['&#128218;','Cole&ccedil;&otilde;es',subjects().length],['&#128221;','Quest&otilde;es',metrics.total],['&#127919;','Dominadas',metrics.mastered],['&#128200;','Aproveitamento',`${metrics.accuracy}%`]].map(([icon,label,value]) => `<article class="home-card"><span class="home-icon">${icon}</span><span class="home-value">${value}</span><strong>${label}</strong></article>`).join('');
    const collectionList = sortedSubjects().slice(0,12); document.querySelector('#homeCollectionSummary').innerHTML = collectionList.length ? collectionList.map(({subject,stats}) => `<article class="home-item"><div class="home-item-head"><strong>${esc(subject.name)}</strong><span class="home-chip">${stats.total} quest&otilde;es</span></div><div class="home-mini-grid"><span class="home-mini"><b>${stats.mastered}</b>Dominadas</span><span class="home-mini"><b>${stats.learning}</b>Em andamento</span><span class="home-mini"><b>${stats.review}</b>Revisar</span><span class="home-mini"><b>${stats.progress}%</b>Aproveitamento</span></div><div class="home-progress"><span style="width:${clamp(stats.progress,3,100)}%"></span></div></article>`).join('') : '<article class="home-item"><strong>Nenhuma cole&ccedil;&atilde;o ainda</strong><p class="home-muted">Crie uma cole&ccedil;&atilde;o na aba Adicionar para come&ccedil;ar.</p></article>';
    const recent = tests.slice(0,7); const recentTotal = recent.reduce((sum,item) => sum + Number(item.total || 0), 0); const recentScore = recent.reduce((sum,item) => sum + Number(item.score || 0), 0); const recentDuration = recent.reduce((sum,item) => sum + Number(item.durationMs || 0), 0); document.querySelector('#homePerformance').innerHTML = [['M&eacute;dia dos &uacute;ltimos testes',`${percent(recentScore,recentTotal)}%`],['Melhor sequ&ecirc;ncia',`${recent.reduce((max,item) => Math.max(max, Number(item.score || 0)),0)} acertos`],['Tempo m&eacute;dio por quest&atilde;o',recentTotal ? duration(recentDuration / recentTotal) : '0s'],['Acertos recentes',`${recentScore} acertos`]].map(([label,value]) => `<li class="home-performance-row"><span>${label}</span><b>${value}</b></li>`).join('');
    const points = (recent.length ? recent : [{score:0,total:1},{score:0,total:1},{score:0,total:1}]).slice(0,6).reverse().map(item => percent(Number(item.score || 0), Number(item.total || 0))); const dominated = points.map((_,index) => Math.max(0, metrics.mastered - ((points.length - index - 1) * 3))); const maxDominated = Math.max(1, ...dominated); const xy = values => values.map((value,index) => `${24 + index * (252 / Math.max(1, values.length - 1))},${142 - (clamp(value,0,100) / 100) * 104}`).join(' '); const xyd = dominated.map((value,index) => `${24 + index * (252 / Math.max(1, dominated.length - 1))},${142 - (value / maxDominated) * 104}`).join(' '); document.querySelector('#homeChart').innerHTML = `<svg viewBox="0 0 300 170" role="img" aria-label="Evolu&ccedil;&atilde;o"><path d="M24 30v112h252" fill="none" stroke="#dbe5f3" stroke-width="2"></path><path d="M24 86h252M24 38h252" fill="none" stroke="#edf2f8"></path><polyline points="${xyd}" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="${xy(points)}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg><div class="home-chart-legend"><span><i class="home-dot" style="background:#2563eb"></i>Acertos</span><span><i class="home-dot" style="background:#22c55e"></i>Dominadas</span></div>`;
    const activities = tests.slice(0,4).map(item => `Finalizou teste em ${esc(item.subject || 'Colecao')} - ${Number(item.score || 0)} de ${Number(item.total || 0)} acertos`); if (subjects().length) activities.push(`Criou ${subjects().length} colecao${subjects().length === 1 ? '' : 'es'}`); if (cards.length) activities.push(`Organizou ${cards.length} questoes`); document.querySelector('#homeActivity').innerHTML = (activities.length ? activities : ['Sua atividade aparecera aqui.']).slice(0,5).map(item => `<li class="home-item home-row"><span style="color:#22c55e;font-weight:950">&#10003;</span><span>${item}</span></li>`).join('');
    document.querySelector('#homeGoals').innerHTML = [['Revisar 30 quest&otilde;es hoje',Math.min(metrics.review,30),30],['Fazer dois testes',Math.min(tests.filter(item => String(item.date || '').slice(0,10) === new Date().toISOString().slice(0,10)).length,2),2],['Dominar mais 20 quest&otilde;es',Math.min(metrics.mastered,20),20]].map(([label,done,total]) => `<li class="home-item"><div class="home-item-head"><strong>${label}</strong><span>${done}/${total}</span></div><div class="home-progress"><span style="width:${clamp(percent(done,total),4,100)}%"></span></div></li>`).join('');
    const priorities = sortedSubjects().filter(item => item.stats.review > 0).slice(0,10); document.querySelector('#homePriorities').innerHTML = priorities.length ? priorities.map(({subject,stats}) => `<article class="home-item"><div class="home-item-head"><strong>${esc(subject.name)}</strong><span class="home-chip">Revisar ${stats.review}</span></div><div class="home-progress"><span style="width:${clamp(percent(stats.review, stats.total || 1),5,100)}%;background:#ef4444"></span></div></article>`).join('') : '<article class="home-item"><strong>Tudo em dia por aqui</strong><p class="home-muted">Quando houver revis&otilde;es, elas aparecem nesta lista.</p></article>';
    const todayTime = tests.filter(item => String(item.date || '').slice(0,10) === new Date().toISOString().slice(0,10)).reduce((sum,item) => sum + Number(item.durationMs || 0), 0); document.querySelector('#homeFooterStats').innerHTML = [['&#128293;','Sequ&ecirc;ncia atual',`${currentStreak} dia${currentStreak === 1 ? '' : 's'}`],['&#9201;','Tempo estudado hoje',duration(todayTime)],['&#128197;','Meta semanal',`${clamp(percent(tests.slice(0,7).length,7),0,100)}%`]].map(([icon,label,value]) => `<article class="home-footer-card"><span class="home-icon">${icon}</span><span><strong>${value}</strong><br><small class="home-muted">${label}</small></span></article>`).join('');
  }

  homeTab.addEventListener('click', openHome);
  tabs.addEventListener('click', event => { const button = event.target.closest('.tab[data-view]'); if (!button || button === homeTab) return; homeView.classList.remove('active'); homeTab.classList.remove('active'); homeTab.removeAttribute('aria-current'); });
  homeView.addEventListener('click', event => { if (event.target.closest('[data-home-action]')) openAppView('test', 'quick'); });
  document.querySelector('#homeAvatar')?.addEventListener('click', () => document.querySelector('#userMenuToggle')?.click());
  const observer = new MutationObserver(() => { if (homeView.classList.contains('active')) requestAnimationFrame(renderHome); });
  observer.observe(document.querySelector('#subjects') || document.body, { childList: true, subtree: true });
  requestAnimationFrame(openHome);
})();