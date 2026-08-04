(() => {
  if (document.querySelector('#dexBottomScrollFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'dexBottomScrollFixStyle';
  style.textContent = `
    /*
      Mantém o final das páginas acessível em telas desktop de pouca altura,
      especialmente no Samsung DeX, cuja barra inferior pode sobrepor o navegador.
    */
    @media (min-width: 761px) and (max-height: 950px) {
      main {
        padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px)) !important;
        scroll-padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
        overscroll-behavior-y: contain;
      }

      /* Libera a rolagem das telas que antes ficavam presas à altura da janela. */
      body.home-active.home-activity-active,
      body.home-active.home-activity-active main,
      body.home-active.home-activity-active .home-view.active,
      body.home-active.home-activity-active .home-view.active > .home-shell,
      body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"],
      body.home-active.home-activity-active .home-view.active > .home-shell > section[data-home-panel="activity"] > .home-shell {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow-y: visible !important;
      }

      body.home-active.home-activity-active main {
        overflow-y: auto !important;
      }

      /* Espaço final comum para todas as abas. */
      main > .view.active,
      main > .home-view.active {
        padding-bottom: 12px;
      }
    }
  `;

  document.head.appendChild(style);
})();
