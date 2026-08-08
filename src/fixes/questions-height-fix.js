(() => {
  "use strict";

  if (document.querySelector("#questionsHeightFixStyle")) return;

  const style = document.createElement("style");
  style.id = "questionsHeightFixStyle";
  style.textContent = `
    /*
      Aba Questões:
      - usa a mesma largura central da página Início;
      - mantém o resumo da coleção compacto;
      - a caixa "Questões da coleção" ocupa todo o espaço restante da tela;
      - somente a lista de questões possui rolagem interna.
    */
    @media (min-width: 761px) {
      body:has(#manage.view.active),
      #appShell.app:has(#manage.view.active) {
        height: 100dvh !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      #appShell.app:has(#manage.view.active) > main {
        height: 100dvh !important;
        min-height: 0 !important;
        overflow: hidden !important;
        grid-template-rows: 52px minmax(0, 1fr) !important;
        align-content: stretch !important;
      }

      #appShell.app:has(#manage.view.active) .topbar-title {
        display: none !important;
      }

      #manage.view.active {
        box-sizing: border-box !important;
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        height: var(--questions-manage-height, calc(100dvh - 80px)) !important;
        max-height: var(--questions-manage-height, calc(100dvh - 80px)) !important;
        min-height: 0 !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding-top: 30px !important;
        padding-bottom: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
      }

      #manage.view.active > :not(.card) {
        flex: 0 0 auto !important;
      }

      /* Resumo "cartões para estudar" mais compacto. */
      #manage.view.active > .progress-card {
        position: relative !important;
        z-index: 1 !important;
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 7px 12px 8px !important;
        gap: 5px !important;
        overflow: visible !important;
      }

      #manage.view.active .progress-hero {
        gap: 1px !important;
      }

      #manage.view.active .progress-total {
        gap: 7px !important;
      }

      #manage.view.active .progress-hero strong {
        font-size: 28px !important;
        line-height: 0.95 !important;
      }

      #manage.view.active .progress-hero > span {
        font-size: 12px !important;
        line-height: 1.15 !important;
      }

      #manage.view.active .progress-total .hero-icon,
      #manage.view.active .progress-total .hero-icon svg {
        width: 21px !important;
        height: 21px !important;
      }

      #manage.view.active .stats {
        gap: 7px !important;
      }

      #manage.view.active .stat {
        min-height: 52px !important;
        padding: 5px 9px !important;
        gap: 2px !important;
      }

      #manage.view.active .stat-icon {
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        min-height: 30px !important;
      }

      #manage.view.active .stat-icon .stat-svg,
      #manage.view.active .stat-icon svg {
        width: 16px !important;
        height: 16px !important;
      }

      #manage.view.active .stat strong {
        font-size: 18px !important;
        line-height: 1 !important;
      }

      #manage.view.active .stat span:last-child {
        font-size: 12px !important;
        line-height: 1.1 !important;
      }

      #manage.view.active .collection-bar {
        height: 6px !important;
        gap: 2px !important;
      }

      /* A caixa inferior cresce até o limite útil da tela. */
      #manage.view.active > .card {
        width: 100% !important;
        flex: 1 1 0 !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        padding-bottom: 6px !important;
      }

      #manage.view.active > .card > .section-heading {
        flex: 0 0 auto !important;
      }

      #manage.view.active #questionsContent {
        flex: 1 1 auto !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }

      #manage.view.active #questionsContent > .row {
        position: relative !important;
        z-index: 2 !important;
        flex: 0 0 auto !important;
        margin-bottom: 8px !important;
        background: rgba(255, 255, 255, 0.98) !important;
      }

      #manage.view.active #questionList {
        flex: 1 1 auto !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin-top: 0 !important;
        padding-right: 8px !important;
        padding-bottom: 2px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        scrollbar-gutter: stable !important;
        align-content: start !important;
      }
    }
  `;

  document.head.appendChild(style);

  const desktopQuery = window.matchMedia("(min-width: 761px)");
  const manage = document.querySelector("#manage");
  const bottomMargin = 10;
  let frame = 0;

  function viewportHeight() {
    return Math.round(
      window.visualViewport?.height ||
      window.innerHeight ||
      document.documentElement.clientHeight ||
      0
    );
  }

  function applyAvailableHeight() {
    frame = 0;
    if (!manage) return;

    if (!desktopQuery.matches || !manage.classList.contains("active")) {
      manage.style.removeProperty("--questions-manage-height");
      return;
    }

    const top = Math.max(0, manage.getBoundingClientRect().top);
    const available = Math.max(360, viewportHeight() - top - bottomMargin);
    manage.style.setProperty("--questions-manage-height", `${available}px`);
  }

  function scheduleHeightUpdate() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(applyAvailableHeight);
  }

  window.addEventListener("resize", scheduleHeightUpdate, { passive: true });
  window.addEventListener("orientationchange", scheduleHeightUpdate, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleHeightUpdate, { passive: true });
  desktopQuery.addEventListener?.("change", scheduleHeightUpdate);

  if (manage) {
    new MutationObserver(scheduleHeightUpdate).observe(manage, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleHeightUpdate, { once: true });
  window.addEventListener("load", scheduleHeightUpdate, { once: true });
  scheduleHeightUpdate();
  setTimeout(scheduleHeightUpdate, 120);
  setTimeout(scheduleHeightUpdate, 400);
})();
