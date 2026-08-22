(() => {
  'use strict';
  if (window.FixaCompetitionParticipantExportGuardV1) return;
  window.FixaCompetitionParticipantExportGuardV1 = true;

  function currentSubjectSafe() {
    try {
      if (typeof currentSubject === 'function') return currentSubject();
      if (typeof window.currentSubject === 'function') return window.currentSubject();
    } catch (_) {}
    return null;
  }

  function isParticipantSharedSubject(subject = currentSubjectSafe()) {
    return Boolean(subject?.sharedCompetitionId && subject?.readOnly);
  }

  function syncExportVisibility() {
    const blocked = isParticipantSharedSubject();
    document.querySelectorAll('#exportCollection, [data-export-collection]').forEach(button => {
      button.hidden = blocked;
      button.setAttribute('aria-hidden', blocked ? 'true' : 'false');
      if (blocked) button.setAttribute('tabindex', '-1');
      else button.removeAttribute('tabindex');
    });
  }

  document.addEventListener('click', event => {
    const exportButton = event.target.closest('#exportCollection, [data-export-collection]');
    if (!exportButton || !isParticipantSharedSubject()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  let queued = false;
  const queueSync = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncExportVisibility();
    });
  };

  const observer = new MutationObserver(queueSync);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('.subject, [data-view="manage"], [data-view="questions"], .tab')) queueSync();
  });
  window.addEventListener('fixa-cloud-data-loaded', queueSync);
  window.addEventListener('load', queueSync, { once: true });

  queueSync();
})();
