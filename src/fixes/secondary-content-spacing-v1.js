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

      /* MOBILE — todas as navegações secundárias seguem o padrão visual
         aprovado da Competição: fundo único claro, rolagem horizontal,
         botões neutros e aba ativa branca com destaque azul. */
      #appShell #test.view .test-tabs,
      #appShell #questionsHubNav,
      #appShell .home-view .home-subtabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100% !important;
        min-height: 48px !important;
        height: auto !important;
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
        -webkit-overflow-scrolling: touch;
      }

      #appShell #test.view .test-tabs::-webkit-scrollbar,
      #appShell #questionsHubNav::-webkit-scrollbar,
      #appShell .home-view .home-subtabs::-webkit-scrollbar,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
        display: none !important;
      }

      #appShell #test.view .test-tabs button,
      #appShell #questionsHubNav .questions-hub-button,
      #appShell .home-view .home-subtabs .home-subtab,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab {
        width: auto !important;
        min-width: max-content !important;
        height: 38px !important;
        min-height: 38px !important;
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
        font-size: 14px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      #appShell #test.view .test-tabs button svg,
      #appShell #questionsHubNav .questions-hub-button svg,
      #appShell .home-view .home-subtabs .home-subtab svg,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
      }

      #appShell #test.view .test-tabs button.active,
      #appShell #questionsHubNav .questions-hub-button.active,
      #appShell .home-view .home-subtabs .home-subtab.active,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab.active {
        color: #2563eb !important;
        background: #ffffff !important;
        box-shadow: 0 1px 5px rgba(15,23,42,.10) !important;
      }

      .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state,
      .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
        margin-top: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
