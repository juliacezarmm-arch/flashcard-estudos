(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV1) return;
  window.FixaHomeGreetingRightV1 = true;

  const style = document.createElement('style');
  style.id = 'fixaHomeGreetingRightV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      #home .home-hero-actions {
        position: relative !important;
      }

      #home .fixa-week-greeting-slot {
        position: absolute !important;
        top: 0 !important;
        right: 2px !important;
        width: auto !important;
        min-height: 25px !important;
        text-align: right !important;
        z-index: 2;
      }

      #home .fixa-week-date-slot {
        position: absolute !important;
        top: 25px !important;
        right: 2px !important;
        width: auto !important;
        min-height: 13px !important;
        text-align: right !important;
        z-index: 2;
      }

      #home .fixa-week-greeting-slot #homeGreeting {
        justify-content: flex-end !important;
        text-align: right !important;
      }

      #home .fixa-week-control-slot {
        justify-content: flex-start !important;
        padding-top: 38px !important;
      }

      #home .fixa-week-filters {
        justify-content: flex-start !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
