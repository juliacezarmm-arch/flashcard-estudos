(() => {
  if (document.querySelector('#dexBottomScrollFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'dexBottomScrollFixStyle';
  style.textContent = `
    /*
      Correção para telas desktop/DeX de pouca altura.
      Não adiciona mais 88px artificiais ao final de TODAS as páginas,
      pois isso criava espaço vazio e uma barra de rolagem desnecessária.
    */
    @media (min-width: 761px) and (max-height: 950px) {
      main {
        scroll-padding-bottom: env(safe-area-inset-bottom, 0px);
        overscroll-behavior-y: contain;
      }

      /* A tela Hoje usa a altura real disponível da janela. */
      body.home-active:not(.home-activity-active) main {
        padding-bottom: 10px !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      body.home-active:not(.home-activity-active) main::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      body.home-active:not(.home-activity-active) main > .home-view.active {
        padding-bottom: 0 !important;
      }

      /*
        A aba Atividade pode ter conteúdo maior; nela a rolagem continua
        disponível, mas sem os 88px extras que existiam anteriormente.
      */
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
        padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)) !important;
      }

      /* Outras telas mantêm apenas um respiro pequeno, sem reserva artificial. */
      body:not(.home-active) main > .view.active {
        padding-bottom: 12px;
      }
    }
  `;

  document.head.appendChild(style);
})();
