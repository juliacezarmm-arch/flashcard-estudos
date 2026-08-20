/* Fixa Data Safety Guard
   Regra permanente do projeto:
   - renderizar nunca deve persistir dados;
   - nenhum write em flashcard_data antes da hidratação online;
   - reduções massivas de matérias/cartões são bloqueadas no cliente e no banco;
   - alterações destrutivas em massa só podem ser feitas de forma administrativa e explícita.
*/
(() => {
  'use strict';

  if (window.__fixaDataSafetyGuardV1Installed) return;
  window.__fixaDataSafetyGuardV1Installed = true;

  const originalRender = typeof render === 'function' ? render : null;
  const originalSave = typeof save === 'function' ? save : null;
  const originalScheduleCloudSave = typeof scheduleCloudSave === 'function' ? scheduleCloudSave : null;
  const originalSaveCloudData = typeof saveCloudData === 'function' ? saveCloudData : null;
  const originalLoadCloudData = typeof loadCloudData === 'function' ? loadCloudData : null;

  let renderDepth = 0;
  let cloudHydrated = false;
  let loadPromise = null;
  let baseline = { subjects: 0, cards: 0 };
  let baselineUserId = null;

  function counts(value) {
    const subjects = Array.isArray(value?.subjects) ? value.subjects : [];
    const cards = subjects.reduce((sum, subject) => {
      return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
    }, 0);
    return { subjects: subjects.length, cards };
  }

  function currentCounts() {
    try {
      return counts(typeof data !== 'undefined' ? data : null);
    } catch {
      return { subjects: 0, cards: 0 };
    }
  }

  function currentUserId() {
    try {
      return typeof currentUser !== 'undefined' ? currentUser?.id || null : null;
    } catch {
      return null;
    }
  }

  function isMassiveReduction(from, to) {
    if (!from) return false;

    if (from.cards >= 20 && to.cards === 0) return true;
    if (from.subjects >= 5 && to.subjects === 0) return true;

    if (from.cards >= 50 && to.cards < Math.floor(from.cards * 0.50)) return true;
    if (from.subjects >= 10 && to.subjects < Math.floor(from.subjects * 0.50)) return true;

    return false;
  }

  function warnBlockedWrite(reason, from = baseline, to = currentCounts()) {
    console.error('[Fixa Data Safety] Salvamento bloqueado:', { reason, from, to });
    try {
      if (typeof setAuthStatus === 'function') {
        setAuthStatus('Proteção de dados: uma alteração grande foi bloqueada. Seus dados online foram preservados.', 'error');
      }
    } catch (_) {}
  }

  function cancelPendingCloudSave() {
    try {
      if (typeof saveTimer !== 'undefined' && saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
    } catch (_) {}
  }

  function finishHydratedUi(uid, reason = '') {
    const now = currentCounts();
    if (now.subjects === 0 && now.cards === 0) return false;

    try {
      if (typeof loadingCloud !== 'undefined') loadingCloud = false;
    } catch (_) {}

    baseline = now;
    baselineUserId = uid || currentUserId();
    cloudHydrated = true;

    try {
      if (typeof render === 'function') render();
    } catch (renderError) {
      console.error('[Fixa Data Safety] Não foi possível renderizar os dados já carregados:', renderError);
    }

    try {
      window.dispatchEvent(new Event('fixa-cloud-data-loaded'));
    } catch (_) {}

    if (reason) {
      console.warn('[Fixa Data Safety] Dados online carregados; falha local ignorada:', reason);
    }
    return true;
  }

  if (originalRender) {
    render = function safeRender(...args) {
      renderDepth += 1;
      try {
        return originalRender.apply(this, args);
      } finally {
        renderDepth = Math.max(0, renderDepth - 1);
      }
    };
  }

  if (originalSave) {
    save = function safeSave(...args) {
      // render() é apresentação, não mutação. Qualquer save disparado durante render é ignorado.
      if (renderDepth > 0) return;

      const now = currentCounts();

      // Antes da hidratação online, não permitir que um estado transitório vazio substitua cache/dados.
      if (!cloudHydrated && now.subjects === 0 && now.cards === 0) {
        warnBlockedWrite('estado vazio antes da hidratação online', baseline, now);
        return;
      }

      if (cloudHydrated && baselineUserId === currentUserId() && isMassiveReduction(baseline, now)) {
        warnBlockedWrite('redução massiva detectada no save()', baseline, now);
        return;
      }

      return originalSave.apply(this, args);
    };
  }

  if (originalScheduleCloudSave) {
    scheduleCloudSave = function safeScheduleCloudSave(...args) {
      if (!cloudHydrated) return;
      if (typeof loadingCloud !== 'undefined' && loadingCloud) return;

      const now = currentCounts();
      if (baselineUserId === currentUserId() && isMassiveReduction(baseline, now)) {
        warnBlockedWrite('redução massiva detectada antes de agendar write', baseline, now);
        return;
      }

      return originalScheduleCloudSave.apply(this, args);
    };
  }

  if (originalSaveCloudData) {
    saveCloudData = async function safeSaveCloudData(...args) {
      // Segunda checagem obrigatória no momento real do write.
      if (!cloudHydrated) return;
      if (typeof loadingCloud !== 'undefined' && loadingCloud) return;

      const uid = currentUserId();
      const now = currentCounts();

      if (baselineUserId === uid && isMassiveReduction(baseline, now)) {
        warnBlockedWrite('redução massiva detectada no write ao Supabase', baseline, now);
        return;
      }

      const result = await originalSaveCloudData.apply(this, args);

      // Crescimentos e alterações sem perda estrutural passam a ser o novo baseline.
      if (
        uid &&
        (now.cards >= baseline.cards || now.subjects >= baseline.subjects) &&
        !isMassiveReduction(baseline, now)
      ) {
        baseline = now;
        baselineUserId = uid;
      }

      return result;
    };
  }

  if (originalLoadCloudData) {
    loadCloudData = function safeLoadCloudData(...args) {
      const uid = currentUserId();

      if (loadPromise) return loadPromise;

      cloudHydrated = false;
      cancelPendingCloudSave();

      loadPromise = (async () => {
        try {
          const result = await originalLoadCloudData.apply(this, args);
          finishHydratedUi(uid);
          return result;
        } catch (error) {
          // O carregador original atribui os dados do Supabase antes de tentar gravar o cache local.
          // Se essa etapa local falhar (ex.: quota do localStorage), os dados online já estão íntegros
          // em memória e devem ser exibidos em vez de deixar a Home presa no estado vazio inicial.
          if (finishHydratedUi(uid, error?.message || String(error))) return;

          cloudHydrated = false;
          throw error;
        } finally {
          loadPromise = null;
        }
      })();

      return loadPromise;
    };
  }

  window.FixaDataSafetyGuard = {
    installed: true,
    counts: currentCounts,
    baseline: () => ({ ...baseline }),
    isHydrated: () => cloudHydrated,
    isMassiveReduction: (from, to) => isMassiveReduction(from, to)
  };
})();
