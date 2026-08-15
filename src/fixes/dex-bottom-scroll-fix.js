(() => {
  if (document.querySelector('#dexBottomScrollFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'dexBottomScrollFixStyle';
  style.textContent = `
    /*
      Regra global de viewport do Fixa.
      Em desktop/notebook, nenhuma tela principal deve ser cortada porque
      o CSS-base usa 100vh + overflow:hidden. Quando o conteúdo ultrapassa
      a altura útil, o navegador passa a oferecer rolagem vertical normal.
      O drawer de Minhas coleções continua bloqueando o fundo enquanto aberto.
    */
    @media (min-width: 761px) {
      html {
        min-height: 100%;
        overflow-y: auto;
      }

      body:not(.collections-overlay-open):has(.app:not(.locked)) {
        height: auto !important;
        min-height: 100dvh !important;
        max-height: none !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }

      body:not(.collections-overlay-open) .app:not(.locked) {
        height: auto !important;
        min-height: 100dvh !important;
        max-height: none !important;
        overflow: visible !important;
      }

      body:not(.collections-overlay-open) .app:not(.locked) > main {
        height: auto !important;
        min-height: 100dvh !important;
        max-height: none !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        align-content: start !important;
      }

      body:not(.collections-overlay-open) .app:not(.locked) > main > .view.active,
      body:not(.collections-overlay-open) .app:not(.locked) > main > .home-view.active,
      body:not(.collections-overlay-open) .competition-v3.active,
      body:not(.collections-overlay-open) #manage.view.active,
      body:not(.collections-overlay-open) #add.view.active,
      body:not(.collections-overlay-open) #test.view.active {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow-y: visible !important;
      }

      /* Mantém um pequeno respiro no fim, sem reservar espaço artificial. */
      body:not(.collections-overlay-open) .app:not(.locked) > main > .view.active,
      body:not(.collections-overlay-open) .app:not(.locked) > main > .home-view.active,
      body:not(.collections-overlay-open) .competition-v3.active {
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
    }
  `;

  document.head.appendChild(style);
})();
