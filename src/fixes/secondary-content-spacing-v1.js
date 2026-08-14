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
      Questões é a referência visual: aproximadamente 5–6px entre o botão
      secundário ativo e a primeira caixa de conteúdo.
      A barra do Teste já possui esse respiro interno; por isso o view não
      deve acrescentar outro gap entre a barra e o conteúdo.
    */
    #appShell #test.view.active {
      gap: 0 !important;
    }

    #appShell #test.view .test-tabs {
      margin-bottom: 0 !important;
    }

    #test.view .test-layout {
      margin-top: 0 !important;
    }

    /*
      Na Competição, a barra secundária e o conteúdo já estão visualmente
      no mesmo intervalo de Questões; mantém-se o comportamento existente.
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