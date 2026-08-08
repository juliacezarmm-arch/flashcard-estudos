(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    /* Ajuste pontual da tela detalhada da Competição.
       Não altera regras, dados, XP, ranking ou navegação global. */
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

      /* Cada par de cards deve compartilhar exatamente a mesma altura da linha. */
      .competition-v3 .cv3-dashboard {
        align-items:stretch !important;
      }

      .competition-v3 .cv3-area-position,
      .competition-v3 .cv3-area-ranking,
      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        height:100% !important;
        align-self:stretch !important;
        box-sizing:border-box !important;
      }

      /* Ranking: o card acompanha Minha posição, mas as linhas internas continuam compactas. */
      .competition-v3 .cv3-area-ranking {
        display:flex !important;
        flex-direction:column !important;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list {
        flex:0 1 auto !important;
        align-content:start !important;
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
})();