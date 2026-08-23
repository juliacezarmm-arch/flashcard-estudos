(() => {
  'use strict';

  const HOTFIX_FLAG = 'fixaHomeEncodingHotfix';

  /* A Home de referência assume estas duas responsabilidades. */
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

  function loadHomeReferenceLayout() {
    if (window.FixaHomeReferenceLayoutV2?.active || document.getElementById('fixaHomeReferenceLayoutV2Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaHomeReferenceLayoutV2Loader';
    script.src = 'src/fixes/home-reference-layout-v2.js?v=20260822-home-reference-target-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadHomeReferenceLayoutV3() {
    if (window.FixaHomeReferenceLayoutV3?.active || document.getElementById('fixaHomeReferenceLayoutV3Loader')) return;
    if (!window.FixaHomeReferenceLayoutV2?.active) return;
    const script = document.createElement('script');
    script.id = 'fixaHomeReferenceLayoutV3Loader';
    script.src = 'src/fixes/home-reference-layout-v3.js?v=20260823-home-reference-restore-v4';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionSignalSkip() {
    if (window.FixaCompetitionSignalSkipV1 || document.getElementById('fixaCompetitionSignalSkipV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionSignalSkipV1Loader';
    script.src = 'src/competition/competition-signal-skip-v1.js?v=20260822-signal-skip-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionOwnerFreezeSync() {
    if (window.FixaCompetitionOwnerFreezeSyncV1 || document.getElementById('fixaCompetitionOwnerFreezeSyncV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionOwnerFreezeSyncV1Loader';
    script.src = 'src/competition/competition-owner-freeze-sync-v1.js?v=20260822-owner-freeze-sync-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionFlagReview() {
    if (window.FixaCompetitionFlagReviewV1 || document.getElementById('fixaCompetitionFlagReviewV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionFlagReviewV1Loader';
    script.src = 'src/competition/competition-flag-review-v1.js?v=20260822-flag-review-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionOwnerFreezeNotice() {
    if (window.FixaCompetitionOwnerFreezeNoticeV1 || document.getElementById('fixaCompetitionOwnerFreezeNoticeV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionOwnerFreezeNoticeV1Loader';
    script.src = 'src/competition/competition-owner-freeze-notice-v1.js?v=20260822-owner-freeze-notice-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionWeeklyHistory() {
    if (window.FixaCompetitionWeeklyHistoryV1 || document.getElementById('fixaCompetitionWeeklyHistoryV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionWeeklyHistoryV1Loader';
    script.src = 'src/competition/competition-weekly-history-v1.js?v=20260822-weekly-history-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompetitionParticipantExportGuard() {
    if (window.FixaCompetitionParticipantExportGuardV1 || document.getElementById('fixaCompetitionParticipantExportGuardV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompetitionParticipantExportGuardV1Loader';
    script.src = 'src/competition/competition-participant-export-guard-v1.js?v=20260822-participant-export-guard-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadCompletedTestReset() {
    if (window.FixaCompletedTestResetV1 || document.getElementById('fixaCompletedTestResetV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaCompletedTestResetV1Loader';
    script.src = 'src/test/completed-test-reset-v1.js?v=20260822-completed-test-reset-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadTestHistoryLayout() {
    if (window.FixaTestHistoryLayoutV1 || document.getElementById('fixaTestHistoryLayoutV1Loader')) return;
    const script = document.createElement('script');
    script.id = 'fixaTestHistoryLayoutV1Loader';
    script.src = 'src/test/test-history-layout-v1.js?v=20260822-test-history-layout-v1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function repair() {
    repairAnalysisLabels();
    replaceObservedTestNote();
    formatTestStartNote();
    installHomeTodayBehavior();
    installHomeRefreshGuard();
    loadHomeReferenceLayout();
    loadHomeReferenceLayoutV3();
    loadCompetitionSignalSkip();
    loadCompetitionOwnerFreezeSync();
    loadCompetitionFlagReview();
    loadCompetitionOwnerFreezeNotice();
    loadCompetitionWeeklyHistory();
    loadCompetitionParticipantExportGuard();
    loadCompletedTestReset();
    loadTestHistoryLayout();
  }

  if (document.documentElement.dataset[HOTFIX_FLAG] === 'true') return;
  document.documentElement.dataset[HOTFIX_FLAG] = 'true';

  repair();
  document.addEventListener('DOMContentLoaded', repair, { once: true });
  window.addEventListener('load', repair, { once: true });

  const observer = new MutationObserver(() => requestAnimationFrame(repair));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
