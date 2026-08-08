(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      .competition-v3 .cv3-hero { padding:16px 18px!important; gap:18px!important; }
      .competition-v3 .cv3-hero-icon { width:64px!important; height:64px!important; border-radius:18px!important