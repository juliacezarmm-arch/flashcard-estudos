/* Temporariamente desativado para usar o carregamento nativo do Fixa.
   O fluxo original do index-base.html continua responsável por autenticação,
   leitura e gravação de flashcard_data no Supabase. */
(() => {
  'use strict';
  window.__fixaAccountDataIsolationInstalled = true;
})();
