/* Atualiza a Home uma única vez quando os dados reais terminarem de carregar.
   Evita o estado falso com 0 coleções/questões sem reintroduzir a oscilação antiga. */
(() => {
  'use strict';
  if (window.FixaHomeDataReadyRefreshV1) return;
  window.FixaHomeDataReadyRefreshV1 = true;

  let completed = false;
  let attempts = 0;

  function dataIsReady() {
    try {
      if (typeof data === 'undefined' || !data) return false;
      const subjects = Array.isArray(data.subjects) ? data.subjects : [];
      const tests = Array.isArray(data.testHistory) ? data.testHistory : [];
      const cards = subjects.reduce((sum, subject) => {
        return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
      }, 0);
      return subjects.length > 0 || cards > 0 || tests.length > 0;
    } catch (_) {
      return false;
    }
  }

  function refreshHomeWhenReady() {
    if (completed || !dataIsReady()) return false;

    const weeklyRefresh = window.FixaHomeWeeklyDashboardV2?.refresh;
    if (typeof weeklyRefresh !== 'function') return false;

    weeklyRefresh();
    window.FixaHomeUnifiedDashboardV2?.refresh?.();
    completed = true;
    return true;
  }

  const timer = window.setInterval(() => {
    attempts += 1;
    if (refreshHomeWhenReady() || attempts >= 120) {
      window.clearInterval(timer);
    }
  }, 250);

  window.addEventListener('fixa-cloud-data-loaded', () => {
    completed = false;
    refreshHomeWhenReady();
  });

  window.addEventListener('load', () => {
    window.setTimeout(refreshHomeWhenReady, 0);
  }, { once: true });
})();
