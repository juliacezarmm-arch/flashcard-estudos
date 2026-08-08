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

    /* Teste: o espaço de 14px estava visualmente maior que nas outras abas. */
    #test.view .test-tabs {
      margin-bottom: 7px !important;
    }

    #test.view .test-layout {
      margin-top: 0 !important;
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
      #test.view .test-tabs {
        margin-bottom: 6px !important;
      }

      .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state,
      .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
        margin-top: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();