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

  function writeUserCache(userId) {
    if (!userId) return;
    try {
      localStorage.setItem(userStorageKey(userId), JSON.stringify(data));
      localStorage.setItem(ACTIVE_USER_KEY, userId);
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

  loadCloudData = async function loadAccountCloudData() {
    if (!currentUser?.id || !supabaseClient) return;

    const userId = currentUser.id;
    hydratedUserId = null;
    loadingCloud = true;

    const { data: row, error } = await supabaseClient
      .from(cloudTable)
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (currentUser?.id !== userId) {
      loadingCloud = false;
      return;
    }

    if (error) {
      console.warn("[Fixa] Não foi possível carregar os dados desta conta:", error.message);
      data = readUserCache(userId) || emptyData();
      setAuthStatus("Conectado, mas não consegui carregar os dados online agora.");
    } else if (row?.data) {
      data = normalizeData(row.data);
      writeUserCache(userId);
      hydratedUserId = userId;
      setAuthStatus("Dados carregados com segurança para esta conta.");
    } else {
      data = readUserCache(userId) || emptyData();
      writeUserCache(userId);
      hydratedUserId = userId;
      setAuthStatus("Conta nova preparada.");
    }

    quarantineLegacyCache();
    loadingCloud = false;
    render();
  };

  function resetVisibleData() {
    hydratedUserId = null;
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

      hydratedUserId = null;
      const previousUserId = localStorage.getItem(ACTIVE_USER_KEY);
      if (previousUserId && previousUserId !== nextUser.id) {
        data = emptyData();
        render();
      }

      currentUser = nextUser;
      cloudReady = true;
      await loadCloudData();
    }, 0);
  }

  if (supabaseClient?.auth) {
    supabaseClient.auth.onAuthStateChange(handleAccountChange);
  }

  setTimeout(() => {
    if (currentUser?.id) {
      loadCloudData().catch(error => {
        console.error("[Fixa] Falha ao isolar os dados da conta:", error);
      });
    } else {
      quarantineLegacyCache();
    }
  }, 0);
})();
