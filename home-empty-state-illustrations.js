/* Módulo visual antigo desativado.
   Os estados vazios e as imagens da tela Hoje são controlados exclusivamente
   por home-empty-state-art.js para evitar imagens duplicadas ou incorretas. */
(() => {
  'use strict';
  document.querySelector('#homeEmptyStateIllustrationsStyle')?.remove();
  document.querySelectorAll(
    '.home-empty-art[data-home-art], .home-empty-action[data-home-action]'
  ).forEach(element => element.remove());
  document.querySelectorAll('.is-home-empty, .has-home-data').forEach(element => {
    element.classList.remove('is-home-empty', 'has-home-data');
  });
})();
