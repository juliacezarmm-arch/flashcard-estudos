(() => {
  "use strict";

  if (window.FixaAuthLoginRecovery?.installed) return;

  const GOOGLE_BUTTON_ID = "googleAuth";
  const CALLBACK_LOCK_KEY = "fixa-auth-callback-recovery";
  const LOGIN_STARTED_KEY = "fixa-google-login-started";
  let googleLoginRunning = false;
  let sessionRecoveryRunning = false;

  function authClient() {
    return typeof supabaseClient !== "undefined" ? supabaseClient : null;
  }

  function redirectUrl() {
    if (typeof authRedirectUrl === "function") return authRedirectUrl();
    if (location.hostname.endsWith("github.io")) {
      return `${location.origin}/flashcard-estudos/`;
    }
    return new URL("./", location.href.split(/[?#]/)[0]).href;
  }

  function setNotice(message, type = "info") {
    if (typeof setAuthNotice === "function") {
      setAuthNotice(message, type);
      return;
    }
    const notice = document.querySelector("#authNotice");
    if (!notice) return;
    notice.textContent = message;
    notice.classList.toggle("error", type === "error");
    notice.classList.toggle("show", Boolean(message));
  }

  function setGoogleButtonBusy(button, busy) {
    if (!button) return;
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.innerHTML;
    }
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
    if (busy) {
      button.innerHTML = '<span aria-hidden="true">↻</span><span>Redirecionando para o Google...</span>';
    } else if (button.dataset.originalLabel) {
      button.innerHTML = button.dataset.originalLabel;
    }
  }

  function callbackParams() {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    return {
      code: query.get("code"),
      error: query.get("error") || hash.get("error"),
      errorDescription: query.get("error_description") || hash.get("error_description"),
      hasCallback: Boolean(query.get("code") || query.get("error") || hash.get("access_token"))
    };
  }

  function cleanCallbackUrl() {
    if (typeof cleanAuthCallbackUrl === "function") {
      cleanAuthCallbackUrl();
      return;
    }
    if (history.replaceState) history.replaceState({}, document.title, redirectUrl());
  }

  async function applyRecoveredSession(session, source) {
    if (!session) return false;
    console.log("[Fixa Auth Recovery] Sessão recuperada:", source);
    if (typeof applyAuthSession === "function") {
      await applyAuthSession(session);
    }
    if (callbackParams().hasCallback) cleanCallbackUrl();
    sessionStorage.removeItem(CALLBACK_LOCK_KEY);
    sessionStorage.removeItem(LOGIN_STARTED_KEY);
    return true;
  }

  async function readAndApplyExistingSession(source) {
    const client = authClient();
    if (!client || sessionRecoveryRunning) return false;
    sessionRecoveryRunning = true;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return applyRecoveredSession(data?.session || null, source);
    } catch (error) {
      console.warn("[Fixa Auth Recovery] Falha ao consultar sessão:", error);
      return false;
    } finally {
      sessionRecoveryRunning = false;
    }
  }

  async function recoverOAuthCallback() {
    const client = authClient();
    const callback = callbackParams();
    if (!client || !callback.hasCallback) return;

    if (callback.error) {
      const detail = callback.errorDescription || callback.error;
      setNotice(`Não foi possível finalizar o login com Google: ${detail}`, "error");
      return;
    }

    setNotice("Finalizando o acesso pelo Google...", "success");

    await new Promise(resolve => setTimeout(resolve, 2200));
    if (await readAndApplyExistingSession("consulta após retorno do Google")) return;
    if (!callback.code) return;

    const lockValue = sessionStorage.getItem(CALLBACK_LOCK_KEY);
    const lockTime = Number(lockValue) || 0;
    if (lockTime && Date.now() - lockTime < 15000) return;
    sessionStorage.setItem(CALLBACK_LOCK_KEY, String(Date.now()));

    try {
      const { data, error } = await client.auth.exchangeCodeForSession(callback.code);
      if (error) throw error;
      if (await applyRecoveredSession(data?.session || null, "troca explícita do código PKCE")) return;
      throw new Error("O Supabase não devolveu uma sessão após confirmar o código.");
    } catch (error) {
      console.error("[Fixa Auth Recovery] Falha ao trocar código por sessão:", error);
      sessionStorage.removeItem(CALLBACK_LOCK_KEY);
      setNotice(
        "O Google autorizou o acesso, mas o navegador não conseguiu concluir a sessão. Atualize a página uma vez. Se continuar, abra o Diagnóstico do Login.",
        "error"
      );
    }
  }

  async function startGoogleLogin(event) {
    const button = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (googleLoginRunning) return;
    const client = authClient();
    if (!client) {
      setNotice("A biblioteca do Supabase não carregou. Verifique a conexão e atualize a página.", "error");
      return;
    }

    googleLoginRunning = true;
    setGoogleButtonBusy(button, true);
    setNotice("Abrindo o acesso seguro do Google...", "success");

    try {
      sessionStorage.setItem(LOGIN_STARTED_KEY, String(Date.now()));
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl(),
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (!data?.url) throw new Error("O Supabase não devolveu o endereço de autenticação.");
      window.location.assign(data.url);
    } catch (error) {
      console.error("[Fixa Auth Recovery] Não foi possível iniciar o Google:", error);
      googleLoginRunning = false;
      setGoogleButtonBusy(button, false);
      setNotice(
        error?.message === "Failed to fetch"
          ? "A rede bloqueou a conexão com o Supabase. Tente outra rede ou abra o Diagnóstico do Login."
          : `Não foi possível abrir o login com Google: ${error?.message || "erro desconhecido"}.`,
        "error"
      );
    }
  }

  function installGoogleButtonHandler() {
    const button = document.querySelector(`#${GOOGLE_BUTTON_ID}`);
    if (!button || button.dataset.fixaRecoveryHandler === "true") return;
    button.dataset.fixaRecoveryHandler = "true";
    button.addEventListener("click", startGoogleLogin, true);
  }

  function installDiagnosticLink() {
    const authCard = document.querySelector(".auth-card");
    if (!authCard || document.querySelector("#openLoginDiagnostic")) return;
    const link = document.createElement("a");
    link.id = "openLoginDiagnostic";
    link.href = "./diagnostico-login.html";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Diagnóstico do login";
    link.style.cssText = "justify-self:center;color:#64748b;font-size:12px;font-weight:650;text-decoration:none";
    link.addEventListener("mouseenter", () => { link.style.color = "#2563eb"; });
    link.addEventListener("mouseleave", () => { link.style.color = "#64748b"; });
    authCard.appendChild(link);
  }

  async function initialize() {
    installGoogleButtonHandler();
    installDiagnosticLink();
    recoverOAuthCallback();

    setTimeout(() => {
      readAndApplyExistingSession("verificação complementar ao abrir o Fixa");
    }, 1200);

    window.addEventListener("focus", () => {
      readAndApplyExistingSession("verificação ao retornar para a aba");
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) readAndApplyExistingSession("verificação ao reabrir a página");
    });
  }

  window.FixaAuthLoginRecovery = {
    installed: true,
    recover: recoverOAuthCallback,
    checkSession: readAndApplyExistingSession
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();