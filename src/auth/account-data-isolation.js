(() => {
  "use strict";

  if (window.__fixaAccountDataIsolationInstalled) return;
  window.__fixaAccountDataIsolationInstalled = true;

  const LEGACY_DATA_KEY = "flashcard-estudos-v2";
  const LEGACY_BACKUP_KEY = "flashcard-estudos-v2-legacy-backup";
  const ACTIVE_USER_KEY = "fixa-active-data-user";
  const USER_DATA_PREFIX = "flashcard-estudos-v2:user:";

  const userStorageKey = userId => `${USER_DATA_PREFIX}${userId}`;
  let hydratedUserId = null;
  let cloudLoadedUserId = null;
  let cloudLoadPromise = null;
  let authSessionApplyPromise = null;
  let authSessionApplyUserId = null;

  function emptyData() {
    try {
      return normalizeData(structuredClone(initialData));
    } catch {
      return normalizeData({ selected: "", folders: [], subjects: [], testHistory: [] });
    }
  }

  function readUserCache(userId) {
    if (!userId) return null;
    try {
      const saved = localStorage.getItem(userStorageKey(userId));
      return saved ? normalizeData(JSON.parse(saved)) : null;
    } catch (error) {
      console.warn("[Fixa] Não foi possível ler o cache desta conta:", error);
      return null;
    }
  }

  function markActiveUser(userId) {
    if (!userId) return;
    try {
      localStorage.setItem(ACTIVE_USER_KEY, userId);
    } catch (error) {
      console.warn("[Fixa] Não foi possível registrar a conta ativa:", error);
    }
  }

  function writeUserCache(userId) {
    if (!userId) return;
    markActiveUser(userId);
    try {
      localStorage.setItem(userStorageKey(userId), JSON.stringify(data));
    } catch (error) {
      console.warn("[Fixa] Não foi possível salvar o cache desta conta:", error);
    }
  }

  function quarantineLegacyCache() {
    try {
      const legacy = localStorage.getItem(LEGACY_DATA_KEY);
      if (legacy && !localStorage.getItem(LEGACY_BACKUP_KEY)) {
        localStorage.setItem(LEGACY_BACKUP_KEY, legacy);
      }
      localStorage.removeItem(LEGACY_DATA_KEY);
    } catch (error) {
      console.warn("[Fixa] Não foi possível isolar o cache antigo:", error);
    }
  }

  function announceCloudDataReady(userId) {
    try {
      const subjects = Array.isArray(data?.subjects) ? data.subjects.length : 0;
      const cards = Array.isArray(data?.subjects)
        ? data.subjects.reduce((sum, subject) => sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0), 0)
        : 0;
      window.dispatchEvent(new CustomEvent("fixa-cloud-data-loaded", {
        detail: { userId, subjects, cards }
      }));
    } catch (_) {}
  }

  const originalScheduleCloudSave = scheduleCloudSave;
  const originalSaveCloudData = saveCloudData;

  save = function saveAccountData() {
    if (!currentUser?.id || hydratedUserId !== currentUser.id) return;
    writeUserCache(currentUser.id);
    originalScheduleCloudSave();
  };

  saveCloudData = async function saveAccountCloudData() {
    if (!currentUser?.id || hydratedUserId !== currentUser.id) return;
    writeUserCache(currentUser.id);
    return originalSaveCloudData();
  };

  loadCloudData = function loadAccountCloudData() {
    if (!currentUser?.id || !supabaseClient) return Promise.resolve();

    const userId = currentUser.id;
    if (hydratedUserId === userId && cloudLoadedUserId === userId) {
      return Promise.resolve();
    }
    if (cloudLoadPromise?.userId === userId) {
      return cloudLoadPromise.promise;
    }

    const promise = (async () => {
      loadingCloud = true;

      try {
        const { data: row, error } = await supabaseClient
          .from(cloudTable)
          .select("data")
          .eq("user_id", userId)
          .maybeSingle();

        if (currentUser?.id !== userId) return;

        if (error) {
          console.warn("[Fixa] Não foi possível carregar os dados desta conta:", error.message);
          const cached = readUserCache(userId);
          if (cached) data = cached;
          setAuthStatus("Conectado, mas não consegui carregar os dados online agora.");
        } else if (row?.data) {
          data = normalizeData(row.data);
          hydratedUserId = userId;
          cloudLoadedUserId = userId;
          writeUserCache(userId);
          setAuthStatus("Dados carregados com segurança para esta conta.");
        } else {
          data = readUserCache(userId) || emptyData();
          hydratedUserId = userId;
          cloudLoadedUserId = userId;
          writeUserCache(userId);
          setAuthStatus("Conta nova preparada.");
        }

        quarantineLegacyCache();
        render();
        announceCloudDataReady(userId);
      } finally {
        loadingCloud = false;
      }
    })();

    cloudLoadPromise = { userId, promise };
    promise.finally(() => {
      if (cloudLoadPromise?.promise === promise) cloudLoadPromise = null;
    });
    return promise;
  };

  const originalApplyAuthSession = typeof applyAuthSession === "function" ? applyAuthSession : null;
  if (originalApplyAuthSession) {
    applyAuthSession = function applyHydratedAccountSession(session) {
      const nextUserId = session?.user?.id || null;

      if (
        nextUserId
        && nextUserId === currentUser?.id
        && hydratedUserId === nextUserId
        && cloudLoadedUserId === nextUserId
      ) {
        return Promise.resolve();
      }

      if (authSessionApplyPromise && authSessionApplyUserId === nextUserId) {
        return authSessionApplyPromise;
      }

      const promise = Promise.resolve(originalApplyAuthSession(session));
      authSessionApplyUserId = nextUserId;
      authSessionApplyPromise = promise;
      promise.finally(() => {
        if (authSessionApplyPromise === promise) {
          authSessionApplyPromise = null;
          authSessionApplyUserId = null;
        }
      });
      return promise;
    };
  }

  function resetVisibleData() {
    hydratedUserId = null;
    cloudLoadedUserId = null;
    cloudLoadPromise = null;
    authSessionApplyPromise = null;
    authSessionApplyUserId = null;
    data = emptyData();
    try {
      localStorage.removeItem(ACTIVE_USER_KEY);
    } catch {}
    render();
  }

  function handleAccountChange(event, session) {
    setTimeout(async () => {
      const nextUser = session?.user || null;

      if (event === "SIGNED_OUT" || !nextUser) {
        resetVisibleData();
        return;
      }

      const actualLoadedUser = hydratedUserId || currentUser?.id || null;
      const switchingUser = Boolean(actualLoadedUser && actualLoadedUser !== nextUser.id);

      if (switchingUser) {
        hydratedUserId = null;
        cloudLoadedUserId = null;
        cloudLoadPromise = null;
        authSessionApplyPromise = null;
        authSessionApplyUserId = null;
        data = emptyData();
        render();
      }

      currentUser = nextUser;
      markActiveUser(nextUser.id);
      cloudReady = true;
      await loadCloudData();
    }, 0);
  }

  if (supabaseClient?.auth) {
    supabaseClient.auth.onAuthStateChange(handleAccountChange);
  }

  setTimeout(() => {
    if (currentUser?.id) {
      markActiveUser(currentUser.id);
      loadCloudData().catch(error => {
        console.error("[Fixa] Falha ao isolar os dados da conta:", error);
      });
    } else {
      quarantineLegacyCache();
    }
  }, 0);
})();
