(() => {
  'use strict';
  if (document.querySelector('#secondaryTabsLayoutFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'secondaryTabsLayoutFixStyle';
  style.textContent = `
    /* =========================================================
       CABEÇALHO GLOBAL DO FIXA — PADRÃO ÚNICO
       Referência aprovada:
       esquerda = menu + marca + navegação principal
       direita  = sequência + sino + perfil
       segunda linha = navegação secundária padronizada
       ========================================================= */

    @media (min-width: 861px) {
      #appShell.app:not(.locked) > main {
        width: 100% !important;
        max-width: none !important;
        padding-top: 10px !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      #appShell .topbar,
      #appShell > main > .view {
        width: 100% !important;
        max-width: none !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      /* ---------- primeira linha ---------- */
      #appShell .topbar {
        height: 56px !important;
        min-height: 56px !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 16px !important;
      }

      #appShell .topbar-title {
        display: none !important;
      }

      /* menu + F + Fixa: nunca muda de aba para aba */
      #appShell .topbar > .mobile-topline {
        width: auto !important;
        min-width: max-content !important;
        height: 56px !important;
        flex: 0 0 auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #appShell .mobile-topline-left {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
      }

      #appShell .mobile-menu-toggle {
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        min-height: 42px !important;
        padding: 0 !important;
        display: grid !important;
        place-items: center !important;
        border: 1px solid #d7e2f1 !important;
        border-radius: 10px !important;
        color: #172033 !important;
        background: #ffffff !important;
        box-shadow: 0 1px 2px rgba(15,23,42,.03) !important;
      }

      #appShell .mobile-menu-toggle:hover,
      #appShell .mobile-menu-toggle:focus-visible {
        color: #2563eb !important;
        border-color: #bfd0ee !important;
        background: #eef4ff !important;
      }

      #appShell .mobile-brand {
        display: flex !important;
        align-items: center !important;
        gap: 9px !important;
      }

      #appShell .mobile-brand-mark {
        width: 40px !important;
        height: 40px !important;
        flex: 0 0 40px !important;
        border-radius: 10px !important;
        font-size: 24px !important;
      }

      #appShell .mobile-brand-name {
        display: inline !important;
        color: #111a31 !important;
        font-size: 22px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
      }

      /* navegação principal + bloco direito */
      #appShell .topbar-right {
        width: auto !important;
        min-width: 0 !important;
        height: 56px !important;
        flex: 1 1 auto !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 10px !important;
        margin: 0 !important;
      }

      #appShell .topbar-right > .tabs {
        order: 1 !important;
        width: auto !important;
        min-width: 0 !important;
        flex: 0 0 auto !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 8px !important;
        margin: 0 !important;
      }

      /* Botões principais: mesma altura, padding, cor, borda e estados.
         A largura acompanha o texto, como na referência aprovada. */
      #appShell .topbar-right > .tabs > .tab {
        width: auto !important;
        min-width: 96px !important;
        max-width: none !important;
        height: 42px !important;
        min-height: 42px !important;
        padding: 0 15px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        border: 1px solid #d7e2f1 !important;
        border-radius: 10px !important;
        color: #172033 !important;
        background: #f8fafc !important;
        box-shadow: 0 1px 2px rgba(15,23,42,.02) !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transition: color .12s ease, background-color .12s ease, border-color .12s ease, box-shadow .12s ease !important;
      }

      #appShell .topbar-right > .tabs > .tab:hover:not(.active),
      #appShell .topbar-right > .tabs > .tab:focus-visible:not(.active) {
        color: #2563eb !important;
        border-color: #bfd0ee !important;
        background: #eef4ff !important;
        box-shadow: 0 4px 12px rgba(37,99,235,.08) !important;
      }

      #appShell .topbar-right > .tabs > .tab.active,
      #appShell .topbar-right > .tabs > .tab.active:hover,
      #appShell .topbar-right > .tabs > .tab.active:focus-visible,
      #appShell .topbar-right > .tabs > .tab.fixa-nav-pending {
        color: #ffffff !important;
        border-color: #2563eb !important;
        background: linear-gradient(135deg,#2563eb,#1d4ed8) !important;
        box-shadow: 0 8px 20px rgba(37,99,235,.18) !important;
      }

      #appShell .topbar-right > .tabs > .tab .tab-svg,
      #appShell .topbar-right > .tabs > .tab .tab-icon {
        width: 17px !important;
        height: 17px !important;
        flex: 0 0 17px !important;
      }

      /* sequência + sino: sempre no extremo direito antes do perfil */
      #appShell .topbar-right #homeTopTools {
        order: 2 !important;
        margin-left: auto !important;
        flex: 0 0 auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 8px !important;
      }

      #appShell #homeTopStreak {
        min-height: 38px !important;
        height: 38px !important;
        padding: 0 11px !important;
        border-radius: 9px !important;
      }

      #appShell .home-top-bell {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        padding: 0 !important;
        display: grid !important;
        place-items: center !important;
        color: #334155 !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      #appShell .home-top-bell:hover,
      #appShell .home-top-bell:focus-visible {
        color: #2563eb !important;
        background: #eef4ff !important;
      }

      #appShell .topbar-right > .auth-panel {
        order: 3 !important;
        width: auto !important;
        min-width: max-content !important;
        min-height: 42px !important;
        flex: 0 0 auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      #appShell .user-trigger {
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        min-height: 42px !important;
      }

      #appShell .user-avatar {
        width: 32px !important;
        height: 32px !important;
        flex-basis: 32px !important;
      }

      /* Compact/tight não pode criar um cabeçalho diferente. */
      body.fixa-desktop-compact #appShell .topbar,
      body.fixa-desktop-tight #appShell .topbar,
      body.fixa-desktop-compact #appShell .topbar-right,
      body.fixa-desktop-tight #appShell .topbar-right {
        height: 56px !important;
        min-height: 56px !important;
      }

      body.fixa-desktop-compact #appShell .topbar-right > .tabs > .tab,
      body.fixa-desktop-tight #appShell .topbar-right > .tabs > .tab {
        width: auto !important;
        min-width: 96px !important;
        height: 42px !important;
        min-height: 42px !important;
        padding: 0 15px !important;
        font-size: 13px !important;
      }

      /* =========================================================
         SEGUNDA LINHA — NAVEGAÇÃO SECUNDÁRIA ÚNICA
         ========================================================= */
      .home-subtabs,
      #questionsHubNav,
      #test .test-tabs,
      .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100% !important;
        max-width: none !important;
        min-height: 46px !important;
        height: 46px !important;
        margin-top: 0 !important;
        margin-bottom: 10px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding: 5px 6px !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        border: 0 !important;
        border-radius: 11px !important;
        background: #f1f5f9 !important;
        box-shadow: none !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
      }

      .home-subtabs::-webkit-scrollbar,
      #questionsHubNav::-webkit-scrollbar,
      #test .test-tabs::-webkit-scrollbar,
      .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
        display: none !important;
      }

      .home-subtab,
      .questions-hub-button,
      #test .test-tabs button,
      .competition-v3 .cv3-secondary-nav .home-subtab {
        width: auto !important;
        min-width: max-content !important;
        height: 36px !important;
        min-height: 36px !important;
        padding: 0 14px !important;
        flex: 0 0 auto !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        border: 0 !important;
        border-radius: 8px !important;
        color: #64748b !important;
        background: transparent !important;
        box-shadow: none !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transition: color .12s ease, background-color .12s ease, box-shadow .12s ease !important;
      }

      .home-subtab svg,
      .questions-hub-button svg,
      #test .test-tabs button svg,
      .competition-v3 .cv3-secondary-nav .home-subtab svg {
        width: 17px !important;
        height: 17px !important;
        flex: 0 0 17px !important;
      }

      .home-subtab:hover:not(.active),
      .questions-hub-button:hover:not(.active),
      #test .test-tabs button:hover:not(.active),
      .competition-v3 .cv3-secondary-nav .home-subtab:hover:not(.active) {
        color: #2563eb !important;
        background: #eaf1ff !important;
      }

      .home-subtab.active,
      .questions-hub-button.active,
      #test .test-tabs button.active,
      .competition-v3 .cv3-secondary-nav .home-subtab.active {
        color: #2563eb !important;
        background: #ffffff !important;
        box-shadow: 0 1px 4px rgba(15,23,42,.08) !important;
      }

      /* Questões é inserido diretamente em main; centraliza no mesmo eixo. */
      body.questions-hub-active #questionsHubNav {
        justify-self: center !important;
        width: 100% !important;
        max-width: none !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      /* Nas outras telas o próprio view acompanha a largura útil do main. */
      .home-view .home-subtabs,
      #test.view .test-tabs,
      .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
    }

    /* Início: subtabs sempre antes do cabeçalho da página. */
    .home-view > .home-shell > .home-subtabs {
      align-self: stretch;
    }

    .home-view > .home-shell > .home-hero-head {
      margin-top: 0 !important;
    }
  `;
  document.head.appendChild(style);

  /* Teste: garante que a troca entre Teste coleção, Teste pasta e Histórico
     deixe apenas a aba realmente clicada com o estado ativo. */
  document.addEventListener('click', event => {
    const tab = event.target.closest('#test .test-tabs [data-test-panel]');
    if (!tab) return;
    requestAnimationFrame(() => {
      const tabs = tab.closest('.test-tabs');
      if (!tabs) return;
      tabs.querySelectorAll('[data-test-panel]').forEach(button => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    });
  }, true);

  function placeHomeTabs() {
    const homeTabs = document.querySelector('.home-view .home-subtabs');
    const homeHeader = document.querySelector('.home-view .home-hero-head');
    if (!homeTabs || !homeHeader || homeTabs.parentElement !== homeHeader.parentElement) return;
    if (homeTabs.nextElementSibling === homeHeader) return;
    homeHeader.parentElement.insertBefore(homeTabs, homeHeader);
  }

  placeHomeTabs();

  const homeView = document.querySelector('.home-view');
  if (homeView) {
    const observer = new MutationObserver(() => requestAnimationFrame(placeHomeTabs));
    observer.observe(homeView, { childList: true, subtree: true });
  }
})();
