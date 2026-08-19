/* Recuperação segura para contas autenticadas cujo estado visual perdeu matérias/cartões.
   Não altera o banco. Compara o estado local com flashcard_data e reidrata a interface
   somente quando o Supabase possui mais matérias/cartões do que a tela atual. */
(() => {
  'use strict';

  if (window.__fixaEmptyStateRecoveryInstalled) return;
  window.__fixaEmptyStateRecoveryInstalled = true;

  let recoveryRunning = false;

  function counts(value) {
    const subjects = Array.isArray(value?.subjects) ? value.subjects : [];
    const cards = subjects.reduce((sum, subject) => {
      return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
    }, 0);
    return { subjects: subjects.length, cards };
  }

  function localCounts() {
    try {
      return counts(typeof data !== 'undefined' ? data : null);
    } catch {
      return { subjects: 0, cards: 0 };
    }
  }

  function needsRecovery() {
    const local = localCounts();
    return local.subjects === 0 || local.cards === 0;
  }

  async function recoverMissingStudyData(reason = 'verificação') {
    if (recoveryRunning || !needsRecovery()) return false;
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    recoveryRunning = true;
    try {
      let user = typeof currentUser !== 'undefined' ? currentUser : null;

      if (!user?.id && supabaseClient.auth?.getSession) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        user = sessionData?.session?.user || null;
      }

      if (!user?.id) return false;

      const { data: row, error } = await supabaseClient
        .from(typeof cloudTable !== 'undefined' ? cloudTable : 'flashcard_data')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[Fixa] Recuperação de matérias/questões falhou:', error.message);
        return false;
      }
      if (!row?.data) return false;

      const server = counts(row.data);
      const before = localCounts();
      if (server.subjects === 0 || server.cards === 0) return false;
      if (before.subjects >= server.subjects && before.cards >= server.cards) return false;

      let nextData = row.data;
      if (typeof normalizeData === 'function') {
        try {
          const normalized = normalizeData(row.data);
          const normalizedCounts = counts(normalized);
          if (
            normalizedCounts.subjects >= server.subjects
            && normalizedCounts.cards >= server.cards
          ) {
            nextData = normalized;
          }
        } catch (error) {
          console.warn('[Fixa] normalizeData falhou durante a recuperação; usando dados online originais.', error);
        }
      }

      if (typeof loadingCloud !== 'undefined') loadingCloud = true;
      data = nextData;

      try {
        if (typeof storeKey !== 'undefined' && storeKey) {
          localStorage.setItem(storeKey, JSON.stringify(data));
        }
      } catch (error) {
        console.warn('[Fixa] Não foi possível atualizar o cache após recuperar os dados:', error);
      }

      if (typeof render === 'function') render();

      const after = localCounts();
      console.info('[Fixa] Dados de estudo recuperados do Supabase:', {
        reason,
        before,
        server,
        after
      });

      try {
        window.dispatchEvent(new CustomEvent('fixa-cloud-data-loaded', {
          detail: {
            userId: user.id,
            subjects: after.subjects,
            cards: after.cards,
            recovered: true,
            reason
          }
        }));
      } catch (_) {}

      window.FixaHomeWeeklyDashboardV2?.refresh?.();
      window.FixaHomeUnifiedDashboardV2?.refresh?.();
      return after.subjects > 0 && after.cards > 0;
    } catch (error) {
      console.error('[Fixa] Erro ao recuperar matérias/questões da conta:', error);
      return false;
    } finally {
      if (typeof loadingCloud !== 'undefined') loadingCloud = false;
      recoveryRunning = false;
    }
  }

  function scheduleRecovery(reason) {
    [250, 900, 2200, 4500].forEach(delay => {
      window.setTimeout(() => recoverMissingStudyData(reason), delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleRecovery('abertura'), { once: true });
  } else {
    scheduleRecovery('abertura');
  }

  window.addEventListener('focus', () => {
    if (needsRecovery()) scheduleRecovery('retorno à aba');
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && needsRecovery()) scheduleRecovery('reativação da página');
  });

  window.FixaEmptyStateRecovery = {
    recover: recoverMissingStudyData,
    needsRecovery,
    counts: localCounts
  };
})();
