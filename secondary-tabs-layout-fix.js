(() => {
  if (document.querySelector('#secondaryTabsLayoutFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'secondaryTabsLayoutFixStyle';
  style.textContent = `
    /* =========================================================
       PADRÃO GLOBAL DO CABEÇALHO DO FIXA
       Menu + Fixa + navegação principal à esquerda.
       Sequência + sino + perfil à direita.
       O mesmo componente é usado em todas as abas.
       ========================================================= */

    @media (min-width: 861px) {
      /* Usa toda a largura útil definida para o Fixa também em notebooks. */
      #appShell.app:not(.locked) > main {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      #appShell .topbar,
      #appShell > main > .view {
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      /* Duas zonas fixas: identidade/navegação e ações da conta. */
      #appShell .topbar {
        min-height: 52px !important;
        height: 52px !important;
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        align-items: center !important;
        column-gap: 16px !important;
        padding: 0 !important;
      }

      #appShell .topbar > .mobile-topline {
        width: auto !important;
        min-width: max-content !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 10px !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #appShell .topbar .topbar-right {
        width: 100% !important;
        min-width: 0 !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        align-items: center !important;
        column-gap: 18px !important;
        margin: 0 !important;
      }

      /* Navegação principal sempre começa imediatamente após o bloco Fixa. */
      #appShell .topbar-right > .tabs {
        justify-self: start !important;
        width: auto !important;
        min-width: 0 !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 !important;
      }

      /* Todos os botões principais usam exatamente a mesma caixa. */
      #appShell .topbar-right > .tabs > .tab {
        width: 118px !important;
        min-width: 118px !important;
        max-width: 118px !important;
        height: 40px !important;
        min-height: 40px !important;
        padding: 0 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        border-radius: 10px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      #appShell .topbar-right > .tabs > .tab .tab-svg,
      #appShell .topbar-right > .tabs > .tab .tab-icon {
        width: 17px !important;
        height: 17px !important;
        flex: 0 0 17px !important;
      }

      /* Ações pessoais ficam sempre ancoradas no extremo direito. */
      #appShell .topbar-right > .auth-panel {
        justify-self: end !important;
        width: auto !important;
        min-width: max-content !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        flex-wrap: nowrap !important;
        gap: 12px !important;
        margin: 0 !important;
      }

      #appShell .topbar-right > .auth-panel.signed-in {
        gap: 12px !important;
      }

      /* Em notebook baixo não mudamos a geometria do cabeçalho por aba. */
      body.fixa-desktop-compact #appShell .topbar,
      body.fixa-desktop-tight #appShell .topbar {
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        min-height: 52px !important;
        height: 52px !important;
        gap: 0 !important;
      }

      body.fixa-desktop-compact #appShell .topbar .tab,
      body.fixa-desktop-tight #appShell .topbar .tab,
      body.fixa-desktop-compact #appShell .topbar button,
      body.fixa-desktop-tight #appShell .topbar button {
        font-size: inherit;
      }

      body.fixa-desktop-compact #appShell .topbar-right > .tabs > .tab,
      body.fixa-desktop-tight #appShell .topbar-right > .tabs > .tab {
        width: 118px !important;
        min-width: 118px !important;
        max-width: 118px !important;
        height: 40px !important;
        min-height: 40px !important;
        padding: 0 10px !important;
        font-size: 13px !important;
      }

      /* =========================================================
         NAVEGAÇÃO SECUNDÁRIA GLOBAL
         Mesmo tamanho, cor, tipografia, raio e alinhamento.
         ========================================================= */
      .home-subtabs,
      #questionsHubNav,
      #test .test-tabs,
      .competition-v3 .cv3-secondary-nav.home-subtabs {
        min-height: 38px !important;
        height: 38px !important;
        width: fit-content !important;
        max-width: 100% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 4px !important;
        margin-top: 0 !important;
        margin-bottom: 8px !important;
        padding: 4px !important;
        border: 0 !important;
        border-radius: 10px !important;
        background: #f1f5f9 !important;
        box-shadow: none !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        justify-self: start !important;
        align-self: start !important;
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
        height: 30px !important;
        min-height: 30px !important;
        padding: 0 14px !important;
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
      }

      .home-subtab.active,
      .questions-hub-button.active,
      #test .test-tabs button.active,
      .competition-v3 .cv3-secondary-nav .home-subtab.active {
        color: #2563eb !important;
        background: #ffffff !important;
        box-shadow: 0 1px 4px rgba(15,23,42,.08) !important;
      }

      .home-subtab:hover:not(.active),
      .questions-hub-button:hover:not(.active),
      #test .test-tabs button:hover:not(.active),
      .competition-v3 .cv3-secondary-nav .home-subtab:hover:not(.active) {
        color: #2563eb !important;
        background: rgba(255,255,255,.65) !important;
      }

      /* Questões é o único submenu colocado diretamente dentro de main.
         O cálculo abaixo o ancora no mesmo eixo esquerdo dos views de 1180 px. */
      body.questions-hub-active #questionsHubNav {
        margin-left: max(0px, calc((100% - 1180px) / 2)) !important;
        margin-right: auto !important;
      }

      /* Home, Teste e Competição já vivem dentro do view centralizado. */
      .home-view > .home-shell > .home-subtabs,
      #test.view .test-tabs,
      .competition-v3 .cv3-secondary-nav.home-subtabs {
        margin-left: 0 !important;
        margin-right: auto !important;
      }
    }

    /* Mantém a navegação secundária do Início acima do cabeçalho. */
    .home-view > .home-shell > .home-subtabs {
      margin-top: 0;
      align-self: flex-start;
    }

    .home-view > .home-shell > .home-hero-head {
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  function moveHomeTabsAboveHeader() {
    const homeTabs = document.querySelector('.home-view .home-subtabs');
    const homeHeader = document.querySelector('.home-view .home-hero-head');
    if (!homeTabs || !homeHeader || homeTabs.parentElement !== homeHeader.parentElement) return;
    if (homeTabs.nextElementSibling === homeHeader) return;
    homeHeader.parentElement.insertBefore(homeTabs, homeHeader);
  }

  moveHomeTabsAboveHeader();

  const homeView = document.querySelector('.home-view');
  if (homeView) {
    new MutationObserver(moveHomeTabsAboveHeader).observe(homeView, {
      childList: true,
      subtree: true
    });
  }
})();
