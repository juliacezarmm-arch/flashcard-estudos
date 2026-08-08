(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      .competition-v3 .cv3-dashboard {
        align-items: stretch !important;
      }

      .competition-v3 .cv3-area-position,
      .competition-v3 .cv3-area-ranking,
      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        height: 100%;
        box-sizing: border-box;
      }

      /* Ranking: mesma altura do cartão Minha posição. */
      .competition-v3 .cv3-area-ranking {
       