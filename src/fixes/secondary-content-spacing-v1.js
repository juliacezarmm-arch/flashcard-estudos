(() => {
  'use strict';
  if (window.FixaSecondaryContentSpacingV1) return;
  window.FixaSecondaryContentSpacingV1 = true;

  const style = document.createElement('style');
  style.id = 'secondaryContentSpacingV1Style';
  style.textContent = `
    /*
      PADRÃO ÚNICO DE ESPAÇAMENTO ENTRE NAVEGAÇÃO SECUNDÁRIA E CONTEÚDO.
      A aba Teste é a referência aprovada: não acrescenta margem/gap
      estrutural além do próprio contorno dos componentes.
    */

    /* TESTE — referência. */
    #appShell #test.view.active {
      gap: 0 !important;
    }

    #appShell #test.view .test-tabs {
      margin-bottom: 0 !important;
    }

    #test.view .test-layout {
      margin-top: 0 !important;
    }

    /* QUESTÕES — mesma distância do Teste. */
    #appShell #questionsHubNav {
      margin-bottom: 0 !important;
    }

    body.questions-hub-active #appShell.app:not(.locked) > main {
      row-gap: 0 !important;
    }

    body.questions-hub-active #manage.view.active,
    body.questions-hub-active #add.view.active {
      margin-top: 0 !important;
    }

    /* COMPETIÇÃO — barra própria + #cv3 começam em sequência, sem gap extra. */
    #appShell .competition-v3.active {
      gap: 0 !important;
      row-gap: 0 !important;
    }

    #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
      margin-bottom: 0 !important;
    }

    #appShell .competition-v3 > #cv3 {
      margin-top: 0 !important;
    }

    /* INÍCIO — atualmente a barra secundária externa fica oculta no layout
       aprovado; se voltar a ser exibida, segue o mesmo padrão do Teste. */
    #appShell .home-view .home-subtabs {
      margin-bottom: 0 !important;
    }

    #appShell .home-view .home-subtabs + * {
      margin-top: 0 !important;
    }

    /*
      ALINHAMENTO VERTICAL COM QUESTÕES.
      Questões é a referência. Início continua com o pequeno ajuste já aprovado.
      Teste e Competição são alinhados pela PRÓPRIA barra secundária, em vez de
      deslocar o view inteiro. O margin-bottom negativo acompanha o deslocamento
      visual e preserva a distância original entre a barra e o conteúdo abaixo.
    */
    @media (min-width: 861px) {
      #appShell #home.home-view.active {
        margin-top: -6px !important;
      }

      #appShell #test.view.active {
        margin-top: 0 !important;
      }

      #appShell #test.view .test-tabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        transform: translateY(-6px) !important;
        margin-bottom: -6px !important;
      }
    }

    /* Espaçamentos INTERNOS da Competição continuam independentes:
       hero -> dashboard/estado vazio não faz parte da barra secundária. */
    .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state {
      margin-top: 7px !important;
    }

    .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
      margin-top: 7px !important;
    }

    @media (max-width: 760px) {
      #appShell #test.view.active,
      #appShell .competition-v3.active {
        gap: 0 !important;
        row-gap: 0 !important;
      }

      #appShell #test.view .test-tabs,
      #appShell #questionsHubNav,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs,
      #appShell .home-view .home-subtabs {
        margin-bottom: 0 !important;
        transform: none !important;
      }

      .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state,
      .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
        margin-top: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
