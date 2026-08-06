/* Módulo visual antigo desativado.
   O posicionamento das ilustrações da tela Hoje é controlado por
   home-empty-state-art.js, usando apenas os três desenhos aprovados. */
(() => {
  'use strict';
  document.querySelector('#fixaHomeTodayPolishNoScrollStyle')?.remove();
  document.querySelectorAll('.fixa-home-corner-art').forEach(element => element.remove());
  document.querySelectorAll('.fixa-home-hidden-original-art').forEach(element => {
    element.classList.remove('fixa-home-hidden-original-art');
  });
  document.querySelectorAll('.fixa-priority-current-art').forEach(element => {
    element.classList.remove('fixa-priority-current-art');
  });
  document.body.classList.remove('fixa-home-empty-dashboard');
  document.querySelectorAll('.fixa-home-scroll-host, .fixa-home-upper-cards').forEach(element => {
    element.classList.remove('fixa-home-scroll-host', 'fixa-home-upper-cards');
  });
})();
