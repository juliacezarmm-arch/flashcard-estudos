/* Fixa Data Safety Guard
   Protege contra sobrescritas grandes acidentais sem bloquear edições normais.
   Criar/editar questões, grupos, testes e competições continua salvando.
 */
(() => {
  'use strict';

  if (window.__fixaDataSafetyGuardV2Installed) return;
  window.__fixaDataSafetyGuardV2Installed = true;

  const originalNormalizeData = typeof normalizeData === 'function' ? normalizeData : null;
  const originalRender = typeof render === 'function' ? render : null;
  const originalSave = typeof save === 'function' ? save : null;
  const originalScheduleCloudSave = typeof scheduleCloudSave === 'function' ? scheduleCloudSave : null;
  const originalSaveCloudData = typeof saveCloudData === 'function' ? saveCloudData : null;
  const originalLoadCloudData = typeof loadCloudData === 'function' ? loadCloudData : null;

  let renderDepth = 0;
  let cloudHydrated = false;
  let loadPromise = null;
  let integrityIssue = false;
  let lastCloudRefreshAt = 0;
  let lastWarningAt = 0;
  let sessionMutationAt = 0;
  let activeSessionUserId = null;

  const storageKey = (() => {
    try { return typeof storeKey !== 'undefined' ? storeKey : 'flashcard-estudos-v2'; }
    catch (_) { return 'flashcard-estudos-v2'; }
  })();
  const safeSnapshotKey = `${storageKey}-safe-snapshot`;
  const forceCloudRestoreKey = `${storageKey}-force-cloud-restore`;
  const syncMetaKey = `${storageKey}-sync-meta`;
  const LOCAL_UPLOAD_WINDOW_MS = 24 * 60 * 60 * 1000;

  function cloneValue(value) {
    try { return structuredClone(value); }
    catch (_) {
      try { return JSON.parse(JSON.stringify(value)); }
      catch (_) { return null; }
    }
  }

  function userStorageKey(userId) {
    return userId ? `${storageKey}:user:${userId}` : storageKey;
  }

  function emptyDataSnapshot() {
    const value = { selected: '', folders: [], testHistory: [], subjects: [] };
    return originalNormalizeData ? originalNormalizeData(value) : value;
  }

  function readUserSnapshot(userId) {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(userStorageKey(userId));
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function persistUserSnapshot(userId, value) {
    if (!userId || !value) return;
    try { localStorage.setItem(userStorageKey(userId), JSON.stringify(value)); }
    catch (_) {}
  }

  function readStoredData() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function readSafeSnapshot() {
    try {
      const raw = localStorage.getItem(safeSnapshotKey);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function persistSafeSnapshot() {
    try {
      if (!safeSnapshot) return;
      localStorage.setItem(safeSnapshotKey, JSON.stringify(safeSnapshot));
      persistUserSnapshot(currentUserId(), safeSnapshot);
    } catch (_) {}
  }

  function hasForcedCloudRestore() {
    try { return Boolean(localStorage.getItem(forceCloudRestoreKey)); }
    catch (_) { return false; }
  }

  function clearForcedCloudRestore() {
    try { localStorage.removeItem(forceCloudRestoreKey); }
    catch (_) {}
  }

  function readSyncMeta() {
    try {
      const raw = localStorage.getItem(syncMetaKey);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeSyncMeta(next) {
    try {
      localStorage.setItem(syncMetaKey, JSON.stringify({ ...readSyncMeta(), ...next }));
    } catch (_) {}
  }

  function pendingSyncAt() {
    try {
      const key = typeof pendingSyncKey !== 'undefined' ? pendingSyncKey : storageKey + '-pending-cloud-sync';
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  }

  function clearPendingLocalCloudSync() {
    try {
      if (typeof clearPendingCloudSync === 'function') clearPendingCloudSync();
      else localStorage.removeItem(storageKey + '-pending-cloud-sync');
    } catch (_) {}
  }

  function isValidSubject(subject) {
    return Boolean(subject) && typeof subject === 'object' && !Array.isArray(subject);
  }

  function counts(value) {
    const folders = Array.isArray(value?.folders) ? value.folders : [];
    const subjects = Array.isArray(value?.subjects) ? value.subjects.filter(isValidSubject) : [];
    const cards = subjects.reduce((sum, subject) => sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0), 0);
    const history = Array.isArray(value?.testHistory) ? value.testHistory.length : 0;
    const groups = folders.reduce((sum, folder) => sum + (Array.isArray(folder?.collectionGroups) ? folder.collectionGroups.length : 0), 0);
    return { folders: folders.length, subjects: subjects.length, cards, history, groups };
  }

  function currentData() {
    try { return typeof data !== 'undefined' ? data : null; }
    catch (_) { return null; }
  }

  function currentCounts() {
    return counts(currentData());
  }

  function currentUserId() {
    try { return typeof currentUser !== 'undefined' ? currentUser?.id || null : null; }
    catch (_) { return null; }
  }

  function richnessScore(count) {
    return (count.cards * 10) + (count.subjects * 5) + (count.folders * 3) + (count.history * 2) + (count.groups * 4);
  }

  function stableSubjectKey(subject) {
    return String(subject?.id || subject?.name || '').trim().toLowerCase();
  }

  function stableCardKey(subject, card, index) {
    const subjectKey = stableSubjectKey(subject);
    const cardKey = String(card?.id || card?.questionCode || card?.q || index || '').trim().toLowerCase();
    return `${subjectKey}|${cardKey}`;
  }

  function identitySet(value) {
    const set = new Set();
    const subjects = Array.isArray(value?.subjects) ? value.subjects.filter(isValidSubject) : [];
    subjects.forEach(subject => {
      const subjectKey = stableSubjectKey(subject);
      if (subjectKey) set.add(`s:${subjectKey}`);
      (Array.isArray(subject.cards) ? subject.cards : []).forEach((card, index) => {
        const key = stableCardKey(subject, card, index);
        if (key) set.add(`c:${key}`);
      });
    });
    return set;
  }

  function overlapRatio(a, b) {
    const left = identitySet(a);
    const right = identitySet(b);
    const base = Math.min(left.size, right.size);
    if (!base) return 1;
    let matches = 0;
    left.forEach(key => { if (right.has(key)) matches += 1; });
    return matches / base;
  }

  function hasFreshLocalMutation() {
    const uid = currentUserId();
    const meta = readSyncMeta();
    const metaUserId = meta.lastLocalMutationUserId || null;
    if (metaUserId && uid && metaUserId !== uid) return false;
    if (sessionMutationAt && Date.now() - sessionMutationAt <= LOCAL_UPLOAD_WINDOW_MS) return true;
    const pendingAt = metaUserId === uid ? pendingSyncAt() : 0;
    if (pendingAt && Date.now() - pendingAt <= LOCAL_UPLOAD_WINDOW_MS) return true;
    const metaAt = Number(meta.lastLocalMutationAt || 0);
    return Boolean(metaUserId === uid && metaAt && Date.now() - metaAt <= LOCAL_UPLOAD_WINDOW_MS);
  }

  function richestSnapshot(a, b) {
    if (!a) return cloneValue(b);
    if (!b) return cloneValue(a);
    return richnessScore(counts(b)) > richnessScore(counts(a)) ? cloneValue(b) : cloneValue(a);
  }

  let safeSnapshot = richestSnapshot(richestSnapshot(cloneValue(currentData()), readStoredData()), readSafeSnapshot());
  let baseline = counts(safeSnapshot || currentData());
  let baselineUserId = currentUserId();

  function isMassiveReduction(from, to) {
    if (!from || !to) return false;

    if (from.cards >= 20 && to.cards === 0) return true;
    if (from.subjects >= 5 && to.subjects === 0) return true;
    if (from.folders >= 2 && to.folders <= 1 && (to.subjects < from.subjects || to.cards < from.cards)) return true;
    if (from.history >= 8 && to.history === 0) return true;
    if (from.groups >= 2 && to.groups === 0 && to.subjects >= Math.floor(from.subjects * 0.8)) return true;

    if (from.cards >= 50 && to.cards < Math.floor(from.cards * 0.5)) return true;
    if (from.subjects >= 10 && to.subjects < Math.floor(from.subjects * 0.5)) return true;
    if (from.history >= 20 && to.history < Math.floor(from.history * 0.5)) return true;

    return false;
  }

  function rememberSafeSnapshot() {
    const snapshot = cloneValue(currentData());
    if (!snapshot) return;
    const now = counts(snapshot);
    if (!safeSnapshot || richnessScore(now) >= richnessScore(counts(safeSnapshot))) {
      safeSnapshot = snapshot;
      persistSafeSnapshot();
      baseline = now;
      baselineUserId = currentUserId();
    }
  }

  function trustCurrentCloudSnapshot(reason = 'cloud') {
    const snapshot = cloneValue(currentData());
    if (!snapshot) return;
    const now = counts(snapshot);
    safeSnapshot = snapshot;
    persistSafeSnapshot();
    baseline = now;
    baselineUserId = currentUserId();
    writeSyncMeta({
      lastCloudHydrateAt: Date.now(),
      lastCloudHydrateReason: reason,
      lastCloudHydrateUserId: currentUserId(),
      lastCloudHydrateCounts: now
    });
  }

  function prepareAccountSession(userId = currentUserId(), { renderNow = true } = {}) {
    if (!userId || activeSessionUserId === userId) return false;
    const previousMeta = readSyncMeta();
    activeSessionUserId = userId;
    sessionMutationAt = 0;

    if (previousMeta.lastLocalMutationUserId && previousMeta.lastLocalMutationUserId !== userId) {
      clearPendingLocalCloudSync();
    }

    const accountSnapshot = readUserSnapshot(userId);
    const nextData = accountSnapshot ? cloneValue(accountSnapshot) : emptyDataSnapshot();
    if (!nextData) return false;

    data = originalNormalizeData ? originalNormalizeData(nextData) : nextData;
    localStorage.setItem(storageKey, JSON.stringify(data));
    safeSnapshot = cloneValue(data);
    persistSafeSnapshot();
    baseline = counts(data);
    baselineUserId = userId;
    cloudHydrated = false;
    if (typeof loadingCloud !== 'undefined') loadingCloud = false;
    if (renderNow && typeof render === 'function') render();
    return true;
  }

  function warnBlockedWrite(reason, from = counts(safeSnapshot), to = currentCounts()) {
    console.error('[Fixa Data Safety] Salvamento grande bloqueado:', { reason, from, to });
    const now = Date.now();
    if (now - lastWarningAt < 1200) return;
    lastWarningAt = now;
    try {
      if (typeof setAuthStatus === 'function') {
        setAuthStatus('Proteção de dados: bloqueei uma troca suspeita. Importações e edições normais continuam salvando.', 'error');
      }
    } catch (_) {}
  }

  function markLocalMutation(reason = 'save') {
    if (!cloudHydrated && !hasForcedCloudRestore()) return;
    const now = Date.now();
    sessionMutationAt = now;
    writeSyncMeta({
      lastLocalMutationAt: now,
      lastLocalMutationReason: reason,
      lastLocalMutationUserId: currentUserId(),
      lastLocalMutationCounts: currentCounts()
    });
  }

  function applySafeSnapshot({ renderNow = true } = {}) {
    if (!safeSnapshot) return false;
    const safe = cloneValue(safeSnapshot);
    if (!safe) return false;

    data = originalNormalizeData ? originalNormalizeData(safe) : safe;
    localStorage.setItem(storageKey, JSON.stringify(data));
    safeSnapshot = cloneValue(data);
    persistSafeSnapshot();
    baseline = counts(data);
    baselineUserId = currentUserId();
    cloudHydrated = true;
    if (typeof loadingCloud !== 'undefined') loadingCloud = false;
    if (renderNow && typeof render === 'function') render();
    window.dispatchEvent(new Event('fixa-cloud-data-loaded'));
    return true;
  }

  function restoreSafeSnapshot(reason) {
    if (!safeSnapshot) return false;
    const safe = cloneValue(safeSnapshot);
    if (!safe || !isMassiveReduction(counts(safe), currentCounts())) return false;

    try {
      const restored = applySafeSnapshot();
      warnBlockedWrite(reason, counts(safe), currentCounts());
      return restored;
    } catch (error) {
      console.error('[Fixa Data Safety] Não consegui restaurar a cópia local segura:', error);
      return false;
    }
  }

  function markPendingLocalCloudSync() {
    try {
      const key = typeof pendingSyncKey !== 'undefined' ? pendingSyncKey : storageKey + '-pending-cloud-sync';
      localStorage.setItem(key, String(Date.now()));
    } catch (_) {}
  }

  function hasPendingLocalCloudSync() {
    try {
      const key = typeof pendingSyncKey !== 'undefined' ? pendingSyncKey : `${storageKey}-pending-cloud-sync`;
      return Boolean(localStorage.getItem(key));
    } catch (_) {
      return false;
    }
  }

  function cancelPendingCloudSave() {
    try {
      if (typeof saveTimer !== 'undefined' && saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
    } catch (_) {}
  }

  async function fetchCloudSnapshot() {
    try {
      if (!currentUserId() || typeof supabaseClient === 'undefined' || !supabaseClient) return null;
      const table = typeof cloudTable !== 'undefined' ? cloudTable : 'flashcard_data';
      const { data: row, error } = await supabaseClient
        .from(table)
        .select('data, updated_at')
        .eq('user_id', currentUserId())
        .maybeSingle();
      if (error) {
        console.warn('[Fixa Data Safety] Não consegui conferir o Supabase antes do upload:', error.message);
        return { error };
      }
      return row || null;
    } catch (error) {
      console.warn('[Fixa Data Safety] Erro ao conferir Supabase antes do upload:', error);
      return { error };
    }
  }

  function localUploadDecision(row, reason = 'sync') {
    if (hasForcedCloudRestore()) return { allow: true, reason: 'restauração manual confirmada' };
    if (row?.error) return { allow: false, reason: 'não consegui confirmar a versão online' };
    if (!row?.data) return hasFreshLocalMutation()
      ? { allow: true, reason: 'sem dados online e mudança local recente' }
      : { allow: false, silent: true, resetEmpty: true, reason: 'sem dados online para esta conta e sem alteração local recente' };

    const localValue = currentData();
    const localCount = counts(localValue);
    const cloudCount = counts(row.data);
    const cloudUpdatedAt = Date.parse(row.updated_at || '') || 0;
    const pendingAt = Math.max(pendingSyncAt(), Number(readSyncMeta().lastLocalMutationAt || 0), sessionMutationAt || 0);
    const freshLocal = hasFreshLocalMutation();

    if (isMassiveReduction(cloudCount, localCount)) {
      return { allow: false, reason: 'local perderia muitos dados que existem online', cloudCount, localCount };
    }

    if (cloudUpdatedAt > pendingAt && !freshLocal) {
      return { allow: false, reason: 'Supabase é mais novo que o cache local', cloudCount, localCount };
    }

    const overlap = overlapRatio(localValue, row.data);
    const bothHaveContent = cloudCount.cards >= 20 && localCount.cards >= 20;
    const veryDifferent = bothHaveContent && overlap < 0.55;
    if (veryDifferent && !freshLocal) {
      return { allow: false, reason: 'cache local parece ser de outra versão antiga', cloudCount, localCount, overlap };
    }

    if (!freshLocal && (cloudCount.cards || cloudCount.subjects || cloudCount.folders)) {
      return { allow: false, reason: 'não há alteração local recente para enviar', cloudCount, localCount };
    }

    return { allow: true, reason, cloudCount, localCount, overlap };
  }

  function applyCloudSnapshot(row, reason) {
    if (!row?.data) return false;
    try {
      data = originalNormalizeData ? originalNormalizeData(row.data) : row.data;
      localStorage.setItem(storageKey, JSON.stringify(data));
      clearPendingLocalCloudSync();
      cloudHydrated = true;
      if (typeof loadingCloud !== 'undefined') loadingCloud = false;
      trustCurrentCloudSnapshot(reason);
      if (typeof render === 'function') render();
      window.dispatchEvent(new Event('fixa-cloud-data-loaded'));
      console.warn('[Fixa Data Safety] Mantive o Supabase como fonte principal:', { reason, counts: currentCounts() });
      return true;
    } catch (error) {
      console.error('[Fixa Data Safety] Não consegui aplicar dados do Supabase:', error);
      return false;
    }
  }

  async function uploadLocalDataToCloud(reason, { skipDecision = false } = {}) {
    if (!originalSaveCloudData || !currentUserId()) return false;
    const row = skipDecision ? null : await fetchCloudSnapshot();
    const decision = skipDecision ? { allow: true, reason } : localUploadDecision(row, reason);
    if (!decision.allow) {
      if (!decision.silent) warnBlockedWrite(decision.reason, decision.cloudCount || counts(row?.data), decision.localCount || currentCounts());
      if (row?.data) applyCloudSnapshot(row, decision.reason);
      else if (decision.resetEmpty) {
        data = emptyDataSnapshot();
        localStorage.setItem(storageKey, JSON.stringify(data));
        safeSnapshot = cloneValue(data);
        persistSafeSnapshot();
        clearPendingLocalCloudSync();
        if (typeof render === 'function') render();
      }
      return false;
    }
    markPendingLocalCloudSync();
    cloudHydrated = true;
    if (typeof cloudReady !== 'undefined') cloudReady = true;
    if (typeof loadingCloud !== 'undefined') loadingCloud = false;
    const result = await originalSaveCloudData();
    clearForcedCloudRestore();
    writeSyncMeta({
      lastCloudUploadAt: Date.now(),
      lastCloudUploadReason: decision.reason,
      lastCloudUploadCounts: currentCounts()
    });
    rememberSafeSnapshot();
    return result !== false;
  }

  async function uploadSafeSnapshotToCloud(reason) {
    if (!originalSaveCloudData || !currentUserId()) return false;
    try {
      applySafeSnapshot({ renderNow: true });
      markPendingLocalCloudSync();
      cloudHydrated = true;
      if (typeof cloudReady !== 'undefined') cloudReady = true;
      if (typeof loadingCloud !== 'undefined') loadingCloud = false;
      if (typeof setAuthStatus === 'function') {
        setAuthStatus('Restaurando seus dados online para sincronizar com outros navegadores...');
      }
      await uploadLocalDataToCloud(reason, { skipDecision: true });
      if (typeof setAuthStatus === 'function') {
        setAuthStatus('Dados restaurados online. Recarregue os outros navegadores para sincronizar.');
      }
      console.warn('[Fixa Data Safety] Cópia segura enviada ao Supabase:', { reason, counts: currentCounts() });
      return true;
    } catch (error) {
      console.error('[Fixa Data Safety] Não consegui enviar a cópia segura ao Supabase:', error);
      if (typeof setAuthStatus === 'function') {
        setAuthStatus('Restaurado neste navegador, mas ainda não consegui salvar online. Tente recarregar logada.', 'error');
      }
      return false;
    }
  }

  if (originalNormalizeData) {
    normalizeData = function safeNormalizeData(value) {
      integrityIssue = false;
      if (value && typeof value === 'object' && Array.isArray(value.subjects)) {
        const invalidCount = value.subjects.reduce((sum, subject) => sum + (isValidSubject(subject) ? 0 : 1), 0);
        if (invalidCount > 0) {
          integrityIssue = true;
          console.error('[Fixa Data Safety] Estrutura inválida recebida em subjects:', { invalidCount });
          value = { ...value, subjects: value.subjects.filter(isValidSubject) };
        }
      }
      return originalNormalizeData(value);
    };
  }

  if (originalRender) {
    render = function safeRender(...args) {
      renderDepth += 1;
      try { return originalRender.apply(this, args); }
      finally { renderDepth = Math.max(0, renderDepth - 1); }
    };
  }

  if (originalSave) {
    save = function safeSave(...args) {
      if (renderDepth > 0) return;
      const reference = counts(safeSnapshot || null);
      const now = currentCounts();

      if (safeSnapshot && isMassiveReduction(reference, now)) {
        warnBlockedWrite('redução massiva detectada no save()', reference, now);
        return;
      }

      const result = originalSave.apply(this, args);
      markLocalMutation('save');
      if (!integrityIssue) rememberSafeSnapshot();
      return result;
    };
  }

  if (originalScheduleCloudSave) {
    scheduleCloudSave = function safeScheduleCloudSave(...args) {
      const reference = counts(safeSnapshot || null);
      const now = currentCounts();
      if (safeSnapshot && isMassiveReduction(reference, now)) {
        warnBlockedWrite('redução massiva detectada antes do envio online', reference, now);
        return;
      }
      if (!cloudHydrated && !hasPendingLocalCloudSync()) return;
      if (typeof loadingCloud !== 'undefined' && loadingCloud && !hasPendingLocalCloudSync()) return;
      return originalScheduleCloudSave.apply(this, args);
    };
  }

  if (originalSaveCloudData) {
    saveCloudData = async function safeSaveCloudData(...args) {
      const reference = counts(safeSnapshot || null);
      const now = currentCounts();
      if (safeSnapshot && isMassiveReduction(reference, now)) {
        warnBlockedWrite('redução massiva detectada no write ao Supabase', reference, now);
        return;
      }
      if (!cloudHydrated && !hasPendingLocalCloudSync()) return;
      if (typeof loadingCloud !== 'undefined' && loadingCloud) return;

      const uploaded = await uploadLocalDataToCloud('alteração local recente');
      if (!integrityIssue) rememberSafeSnapshot();
      return uploaded;
    };
  }

  if (originalLoadCloudData) {
    loadCloudData = function safeLoadCloudData(...args) {
      if (loadPromise) return loadPromise;
      prepareAccountSession(currentUserId(), { renderNow: false });
      const forcedRestore = hasForcedCloudRestore();
      const before = counts(safeSnapshot || currentData());
      cloudHydrated = false;
      cancelPendingCloudSave();

      loadPromise = (async () => {
        try {
          const result = await originalLoadCloudData.apply(this, args);
          if (result?.loadError) return result;

          const after = currentCounts();
          if (forcedRestore) {
            const reason = 'restauração local solicitada';
            applySafeSnapshot({ renderNow: true });
            await uploadSafeSnapshotToCloud(reason);
            return { ...result, blockedCloudReduction: true, forcedCloudRestore: true, needsCloudUpload: false };
          }

          if (safeSnapshot && isMassiveReduction(before, after)) {
            console.warn('[Fixa Data Safety] Supabase menor que a cópia local; mantendo Supabase como principal sem restauração automática.', {
              cloudCounts: after,
              localSafeCounts: before
            });
          }

          cloudHydrated = true;
          trustCurrentCloudSnapshot('carga online normal');
          window.dispatchEvent(new Event('fixa-cloud-data-loaded'));

          if (result?.needsCloudUpload && originalSaveCloudData && !isMassiveReduction(before, currentCounts())) {
            await uploadLocalDataToCloud('alteração local pendente');
            rememberSafeSnapshot();
          }
          return result;
        } catch (error) {
          cloudHydrated = true;
          rememberSafeSnapshot();
          window.dispatchEvent(new Event('fixa-cloud-data-loaded'));
          throw error;
        } finally {
          loadPromise = null;
        }
      })();

      return loadPromise;
    };

    const refreshFromCloud = () => {
      const now = Date.now();
      if (!currentUserId() || now - lastCloudRefreshAt < 1500) return;
      lastCloudRefreshAt = now;
      loadCloudData().catch(error => {
        console.warn('[Fixa Sync] Não foi possível atualizar os dados online:', error);
      });
    };

    window.addEventListener('focus', refreshFromCloud);
    window.addEventListener('online', refreshFromCloud);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshFromCloud();
    });
  }

  window.FixaDataSafetyGuard = {
    installed: true,
    version: 6,
    counts: currentCounts,
    prepareAccountSession,
    baseline: () => ({ ...baseline }),
    isHydrated: () => cloudHydrated,
    hasIntegrityIssue: () => integrityIssue,
    isMassiveReduction,
    rememberSafeSnapshot
  };
})();