(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    /* Ajuste pontual da tela detalhada da Competição.
       Não altera regras, dados, XP, ranking ou navegação global. */

    /* Os modais da Competição mantêm apenas o fundo escurecido,
       sem blur em tela inteira. */
    .cv3-modal-bg,
    .cv9-modal-bg {
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
    }

    /* Garante que as ações secundárias permaneçam realmente clicáveis,
       mesmo quando os cards logo abaixo mudam de tamanho/estado. */
    .competition-v3 .cv3-secondary-nav {
      position:relative !important;
      z-index:3 !important;
    }

    .competition-v3 .cv3-secondary-nav .home-subtab {
      position:relative !important;
      z-index:1 !important;
      pointer-events:auto !important;
    }

    @media (min-width: 761px) {
      .competition-v3 .cv3-hero {
        padding:16px 18px !important;
        gap:18px !important;
      }

      .competition-v3 .cv3-hero-icon {
        width:64px !important;
        height:64px !important;
        border-radius:18px !important;
      }

      /* Tela inicial: mantém uma distância visual equilibrada entre
         Competição, Minhas competições e o conteúdo logo abaixo. */
      .competition-v3.cv7-home-open #cv3 > .cv3-hero + .cv7-manager {
        margin-top:10px !important;
      }

      .competition-v3.cv7-home-open .cv7-manager {
        gap:10px !important;
      }

      /* Tela detalhada: usa o mesmo espaçamento de 16px já aplicado
         entre as demais linhas de cards. */
      .competition-v3:not(.cv7-home-open) #cv3 > .cv3-hero + .cv3-dashboard {
        margin-top:16px !important;
      }

      /* Cada par de cards deve compartilhar exatamente a mesma altura da linha. */
      .competition-v3 .cv3-dashboard {
        align-items:stretch !important;
      }

      .competition-v3 .cv3-area-position,
      .competition-v3 .cv3-area-ranking,
      .competition-v3 .cv3-area-folder,
      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        height:100% !important;
        align-self:stretch !important;
        box-sizing:border-box !important;
      }

      /* Ranking: acompanha a altura da linha e mantém o link de expansão
         alinhado na base, como a ação da Pasta compartilhada. */
      .competition-v3 .cv3-area-ranking {
        display:flex !important;
        flex-direction:column !important;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list {
        flex:0 1 auto !important;
        align-content:start !important;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-more {
        margin-top:auto !important;
        min-height:38px !important;
        padding-top:10px !important;
        align-self:stretch !important;
        justify-content:center !important;
      }

      /* Regras de pontuação: reduz somente a altura interna das cinco
         caixinhas para a observação inferior continuar totalmente visível. */
      .competition-v3 .cv3-area-rules {
        padding:12px 14px !important;
      }

      .competition-v3 .cv3-area-rules > h3 {
        margin-bottom:8px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-rule-row {
        gap:7px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-stat {
        min-height:52px !important;
        padding:5px 7px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-rule-icon {
        width:26px !important;
        height:26px !important;
        margin:0 !important;
      }

      .competition-v3 .cv3-area-rules .cv3-rule-icon .cv3-icon {
        width:14px !important;
        height:14px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-stat b {
        font-size:15px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-stat small {
        margin-top:0 !important;
        font-size:9px !important;
        line-height:1.15 !important;
      }

      .competition-v3 .cv3-area-rules > .cv3-muted {
        margin:6px 0 0 !important;
        line-height:1.2 !important;
      }

      /* Convite: título/descrição à esquerda, Copiar + Compartilhar juntos no topo,
         e o código ocupando uma linha inteira logo abaixo. */
      .competition-v3 .cv3-area-invite {
        display:grid !important;
        grid-template-columns:minmax(0,1fr) auto auto !important;
        grid-template-areas:
          "invite-title invite-copy invite-share"
          "invite-text  invite-copy invite-share"
          "invite-code  invite-code invite-code" !important;
        column-gap:8px !important;
        row-gap:5px !important;
        align-content:start !important;
        align-items:start !important;
      }

      .competition-v3 .cv3-area-invite > h3 {
        grid-area:invite-title !important;
        align-self:center !important;
      }

      .competition-v3 .cv3-area-invite > .cv3-muted {
        grid-area:invite-text !important;
        margin:0 !important;
        align-self:start !important;
      }

      /* Faz apenas os filhos participarem do grid externo, sem criar outro card/wrapper visual. */
      .competition-v3 .cv3-area-invite > .cv3-code,
      .competition-v3 .cv3-area-invite > .cv3-invite-actions {
        display:contents !important;
      }

      .competition-v3 .cv3-area-invite .cv3-code > strong {
        grid-area:invite-code !important;
        width:100% !important;
        min-width:0 !important;
        box-sizing:border-box !important;
        margin-top:5px !important;
        border:1px solid #dbe5f5 !important;
      }

      .competition-v3 .cv3-area-invite [data-copy] {
        grid-area:invite-copy !important;
      }

      .competition-v3 .cv3-area-invite [data-share] {
        grid-area:invite-share !important;
      }

      .competition-v3 .cv3-area-invite [data-copy],
      .competition-v3 .cv3-area-invite [data-share] {
        align-self:start !important;
        margin:0 !important;
        white-space:nowrap !important;
      }
    }

    /* Em larguras de notebook/desktop, redistribui apenas as colunas da
       primeira linha: Minha posição cresce, Ranking diminui e Pasta ganha
       um pouco mais de largura. As linhas inferiores mantêm sua proporção. */
    @media (min-width: 1050px) {
      .competition-v3 .cv3-dashboard {
        grid-template-columns:repeat(100,minmax(0,1fr)) !important;
      }

      .competition-v3 .cv3-area-position { grid-column:1 / 30 !important; }
      .competition-v3 .cv3-area-ranking { grid-column:30 / 65 !important; }
      .competition-v3 .cv3-area-folder { grid-column:65 / 101 !important; }
      .competition-v3 .cv3-area-performance { grid-column:1 / 59 !important; }
      .competition-v3 .cv3-area-invite { grid-column:59 / 101 !important; }
      .competition-v3 .cv3-area-rules { grid-column:1 / 101 !important; }
    }

    /* Em telas menores, preservar a responsividade atual e evitar forçar o layout desktop. */
    @media (max-width: 760px) {
      .competition-v3 .cv3-area-invite > .cv3-code {
        display:grid !important;
      }

      .competition-v3 .cv3-area-invite > .cv3-invite-actions {
        display:flex !important;
      }
    }
  `;

  document.head.appendChild(style);

  /*
    Criar / Entrar continuam usando exatamente as ações oficiais anexadas
    pelo renderizador principal. Esta ponte só garante que o clique físico
    na barra superior chegue ao mesmo handler já usado pelos botões do
    estado vazio.
  */
  document.addEventListener('click', event => {
    const action = event.target.closest(
      '.competition-v3 .cv3-secondary-nav [data-create], ' +
      '.competition-v3 .cv3-secondary-nav [data-join]'
    );
    if (!action) return;

    const officialHandler = action.onclick;
    if (typeof officialHandler !== 'function') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    officialHandler.call(action, event);
  }, true);
})();