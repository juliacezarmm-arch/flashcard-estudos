(() => {
  'use strict';

  const HOTFIX_FLAG = 'fixaHomeEncodingHotfix';
  const HOME_GUARD_ID = 'fixaHomeLayoutLoadingGuard';

  // Mantém desativados os controladores antigos embutidos em outros módulos.
  window.FixaHomeCompactHeaderRowV2 = true;
  window.FixaHomeMainPanelFillViewportV1 = true;

  function setPlainButtonLabel(button, label) {
    if (!button) return;
    const svg = button.querySelector(':scope > svg');
    if (svg) {
      const icon = svg.cloneNode(true);
      button.replaceChildren(icon, document.createTextNode(label));
      return;
    }
    if (button.textContent !== label) button.textContent = label;
  }

  function repairAnalysisLabels() {
    document.querySelectorAll('[data-home-tab="analysis"]').forEach(button => {
      if (button.textContent !== 'Análise') button.textContent = 'Análise';
    });

    document.querySelectorAll('#topAnalysisTab, .tab[data-view="analysis"]').forEach(button => {
      const text = button.textContent || '';
      if (text.includes('Ã') || text.trim() !== 'Análise') setPlainButtonLabel(button, 'Análise');
    });
  }

  function formatTestStartNote() {
    const note = document.querySelector('#testStartNote');
    const amountInput = document.querySelector('#testQuestionAmount');
    if (!note) return;

    if (typeof window.currentSubject === 'function' && typeof window.testableCards === 'function') {
      const subject = window.currentSubject();
      const count = Number(window.testableCards()?.length || 0);
      if (!subject || count <= 0) return;

      const rawAmount = Number(amountInput?.value);
      const requested = Number.isFinite(rawAmount) && rawAmount > 0 ? Math.floor(rawAmount) : 14;
      const usable = Math.min(requested, count);
      const availableText = count === 1
        ? '1 questão disponível.'
        : `${count} questões disponíveis.`;
      const selectedText = usable === 1
        ? 'Será selecionada 1 questão para este teste.'
        : `Serão selecionadas ${usable} questões para este teste.`;
      const nextText = `${availableText} ${selectedText}`;
      if (note.textContent !== nextText) note.textContent = nextText;
      return;
    }

    const replacements = new Map([
      ['questÃƒÂ£o', 'questão'],
      ['questÃƒÂµes', 'questões'],
      ['disponÃƒÂ­vel', 'disponível'],
      ['disponÃƒÂ­veis', 'disponíveis'],
      ['SerÃƒÂ¡', 'Será'],
      ['SerÃƒÂ£o', 'Serão'],
      ['questÃ£o', 'questão'],
      ['questÃµes', 'questões'],
      ['disponÃ­vel', 'disponível'],
      ['disponÃ­veis', 'disponíveis'],
      ['SerÃ¡', 'Será'],
      ['SerÃ£o', 'Serão']
    ]);
    let text = note.textContent || '';
    replacements.forEach((correct, broken) => { text = text.split(broken).join(correct); });
    if (note.textContent !== text) note.textContent = text;
  }

  function replaceObservedTestNote() {
    const current = document.querySelector('#testStartNote');
    if (!current || current.dataset.encodingHotfix === 'true') return current;

    const clone = current.cloneNode(true);
    clone.dataset.encodingHotfix = 'true';
    current.replaceWith(clone);

    const amountInput = document.querySelector('#testQuestionAmount');
    amountInput?.addEventListener('input', () => requestAnimationFrame(formatTestStartNote));
    amountInput?.addEventListener('change', () => requestAnimationFrame(formatTestStartNote));
    return clone;
  }

  function installHomeTodayBehavior() {
    const homeTab = document.querySelector('.topbar-right .tabs .tab[data-view="home"], .tab[data-view="home"]');
    if (!homeTab || homeTab.dataset.todayHotfix === 'true') return;

    homeTab.dataset.todayHotfix = 'true';
    homeTab.addEventListener('click', () => {
      queueMicrotask(() => {
        const todayTab = document.querySelector('.home-subtab[data-home-tab="today"]');
        if (todayTab) todayTab.click();
      });
    });
  }

  function installHomeRefreshGuard() {
    const dashboard = window.FixaHomeWeeklyDashboardV2;
    if (!dashboard || typeof dashboard.refresh !== 'function' || dashboard.__fixaRefreshGuardInstalled) return;

    const originalRefresh = dashboard.refresh.bind(dashboard);
    let refreshTimer = 0;
    let latestArgs = [];

    dashboard.refresh = (...args) => {
      latestArgs = args;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = 0;
        const argsToUse = latestArgs;
        latestArgs = [];
        originalRefresh(...argsToUse);
      }, 75);
    };

    Object.defineProperty(dashboard, '__fixaRefreshGuardInstalled', {
      value: true,
      configurable: false
    });
  }

  function ensureHomeLayoutLoadingGuard() {
    if (window.FixaHomeReferenceLayoutV3?.active || document.getElementById(HOME_GUARD_ID)) return;
    const style = document.createElement('style');
    style.id = HOME_GUARD_ID;
    style.textContent = '#home.home-view{visibility:hidden!important}';
    document.head.appendChild(style);
  }

  function repair() {
    repairAnalysisLabels();
    replaceObservedTestNote();
    formatTestStartNote();
    installHomeTodayBehavior();
    installHomeRefreshGuard();
  }

  if (document.documentElement.dataset[HOTFIX_FLAG] === 'true') return;
  document.documentElement.dataset[HOTFIX_FLAG] = 'true';

  ensureHomeLayoutLoadingGuard();
  repair();
  document.addEventListener('DOMContentLoaded', repair, { once: true });
  window.addEventListener('load', repair, { once: true });

  const observer = new MutationObserver(() => requestAnimationFrame(repair));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
