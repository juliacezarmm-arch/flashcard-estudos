/* Recuperação segura para contas autenticadas que abrirem com o estado visual vazio.
   Não altera o banco. Apenas relê flashcard_data e reidrata a interface quando
   o Supabase possui dados e o estado local está sem coleções/questões. */
(() => {
  'use strict';

  if (window.__fixaEmptyStateRecoveryInstalled) return;
  window.__fixaEmptyStateRecoveryInstalled = true;

  let recoveryRunning = false;
  let lastRecoveredUserId = null;

  function hasVisibleContent() {
    try {
      const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
      const folders = Array.isArray(data?.folders) ? data.folders : [];
      const tests = Array.isArray(data?.testHistory) ? data.testHistory : [];
      const cards = subjects.reduce((sum, subject) => {
        return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
      }, 0);
      return subjects.length > 0 || folders.length > 0 || cards > 0 || tests.length > 0;
    } catch {
      return false;
    }
  }

  function serverDataHasContent(value) {
    const subjects = Array.isArray(value?.subjects) ? value.subjects : [];
    const folders = Array.isArray(value?.folders) ? value.folders : [];
    const tests = Array.isArray(value?.testHistory) ? value.testHistory : [];
    const cards = subjects.reduce((sum, subject) => {
      return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
    }, 0);
    return subjects.length > 0 || folders.length > 0 || cards > 0 || tests.length > 0;
  }

  async function recoverEmptyState(reason = 'verificação') {
    if (recoveryRunning || hasVisibleContent()) return false;
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    recoveryRunning = true;
    try {
      let user = typeof currentUser !== 'undefined' ? currentUser : null;

      if (!user?.id && supabaseClient.auth?.getSession) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        user = sessionData?.session?.user || null;
      }

      if (!user?.id) return false;
      if (lastRecoveredUserId === user.id && hasVisibleContent()) return true;

      const { data: row, error } = await supabaseClient
        .from(typeof cloudTable !== 'undefined' ? cloudTable : 'flashcard_data')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[Fixa] Recuperação do estado vazio falhou:', error.message);
        return false;
      }
      if (!row?.data || !serverDataHasContent(row.data)) return false;

      if (typeof loadingCloud !== 'undefined') loadingCloud = true;
      data = typeof normalizeData === 'function' ? normalizeData(row.data) : row.data;

      try {
        if (typeof storeKey !== 'undefined' && storeKey) {
          localStorage.setItem(storeKey, JSON.stringify(data));
        }
      } catch (error) {
        console.warn('[Fixa] Não foi possível atualizar o cache após recuperar os dados:', error);
      }

      lastRecoveredUserId = user.id;
      if (typeof render === 'function') render();

      try {
        const subjects = Array.isArray(data?.subjects) ? data.subjects.length : 0;
        const cards = Array.isArray(data?.subjects)
          ? data.subjects.reduce((sum, subject) => sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0), 0)
          : 0;
        window.dispatchEvent(new CustomEvent('fixa-cloud-data-loaded', {
          detail: { userId: user.id, subjects, cards, recovered: true, reason }
        }));
      } catch (_) {}

      window.FixaHomeWeeklyDashboardV2?.refresh?.();
      window.FixaHomeUnifiedDashboardV2?.refresh?.();
      return true;
    } catch (error) {
      console.error('[Fixa] Erro ao recuperar dados online da conta:', error);
      return false;
    } finally {
      if (typeof loadingCloud !== 'undefined') loadingCloud = false;
      recoveryRunning = false;
    }
  }

  function scheduleRecovery(reason) {
    window.setTimeout(() => recoverEmptyState(reason), 300);
    window.setTimeout(() => recoverEmptyState(reason), 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleRecovery('abertura'), { once: true });
  } else {
    scheduleRecovery('abertura');
  }

  window.addEventListener('focus', () => {
    if (!hasVisibleContent()) scheduleRecovery('retorno à aba');
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !hasVisibleContent()) scheduleRecovery('reativação da página');
  });

  window.FixaEmptyStateRecovery = {
    recover: recoverEmptyState,
    hasVisibleContent
  };
})();
