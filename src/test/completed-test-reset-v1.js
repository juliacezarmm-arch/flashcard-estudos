(() => {
  'use strict';
  if (window.FixaCompletedTestResetV1) return;
  window.FixaCompletedTestResetV1 = true;

  let wasTestActive = Boolean(document.querySelector('#test')?.classList.contains('active'));
  let shouldResetOnReturn = false;
  let queued = false;

  function isCompletedTest() {
    try {
      return Boolean(
        typeof testState !== 'undefined' &&
        testState?.active &&
        Array.isArray(testState.questions) &&
        testState.questions.length > 0 &&
        Number(testState.index) >= testState.questions.length
      );
    } catch (_) {
      return false;
    }
  }

  function resetCompletedTest() {
    if (!isCompletedTest()) return false;
    try {
      if (typeof resetTestState === 'function') resetTestState();
      else return false;
      if (typeof renderTest === 'function') renderTest();
      return true;
    } catch (_) {
      return false;
    }
  }

  function syncViewState() {
    const testView = document.querySelector('#test');
    if (!testView) return;
    const isTestActive = testView.classList.contains('active');

    if (wasTestActive && !isTestActive && isCompletedTest()) {
      shouldResetOnReturn = true;
    }

    if (!wasTestActive && isTestActive && shouldResetOnReturn) {
      resetCompletedTest();
      shouldResetOnReturn = false;
    }

    wasTestActive = isTestActive;
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncViewState();
    });
  }

  const observer = new MutationObserver(queueSync);
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
    childList: true
  });

  document.addEventListener('click', event => {
    if (event.target.closest('.tab[data-view]')) queueSync();
  }, true);

  window.addEventListener('load', queueSync, { once: true });
  queueSync();
})();
