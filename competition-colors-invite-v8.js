(() => {
  'use strict';
  if (window.FixaCompetitionColorsInviteV8) return;
  window.FixaCompetitionColorsInviteV8 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  const style = document.createElement('style');
  style.id = 'competitionColorsInviteV8Style';
  style.textContent = `
    /* Paleta semântica dos indicadores da competição