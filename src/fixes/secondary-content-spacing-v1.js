(() => {
  'use strict';
  if (window.FixaSecondaryContentSpacingV1) return;
  window.FixaSecondaryContentSpacingV1 = true;

  const style = document.createElement('style');
  style.id = 'secondaryContentSpacingV1Style';
  style.textContent = `
    /*
      Mantém um ritmo vertical semelhante entre Início, Questões, Teste
      e Competição sem alterar tamanhos ou largura dos componentes.
    */

    /*
      Questões é a referência visual: aproximadamente 6px entre a barra
      secundária e a primeira caixa de conteúdo.
      No Teste, o gap do próprio view somava espaço ao margin da barra.
    */
    #appShell #test.view.active {
      gap: 6px !important;
    }

    #appShell #test.view .test-tabs {
      margin-bottom: 0 !important;
    }

    #test.view .test-layout {
      margin-top: 0 !important;
    }

    /*
      Na Competição, a barra secundária e o conteúdo #cv3 são filhos diretos
      da tela. O gap fica em 6px e a barra não acrescenta margem extra.
    */
    #appShell .competition-v3.active {
      gap: 6px !important;
    }

    #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
      margin-bottom: 0 !important;
    }

    /*
      Competição sem dados: cria apenas um pequeno respiro adicional entre
      o cabeçalho "Competição" e o cartão de estado vazio.
    */
    .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state {
      margin-top: 7px !important;
    }

    /* O esqueleto de carregamento segue o mesmo ritmo do conteúdo final. */
    .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
      margin-top: 7px !important;
    }

    @media (max-width: 760px) {
      #appShell #test.view.active,
      #appShell .competition-v3.active {
        gap: 6px !important;
      }

      #appShell #test.view .test-tabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        margin-bottom: 0 !important;
      }

      .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state,
      .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
        margin-top: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();