(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV1) return;
  window.FixaHomeGreetingRightV1 = true;

  const style = document.createElement('style');
  style.id = 'fixaHomeGreetingRightV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      #home .home-hero-head {
        position: relative !important;
        min-height: 70px !important;
      }

      #home .home-hero-actions {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        max-width: none !important;
        display: block !important;
        margin: 0 !important;
        pointer-events: none;
      }

      #home .fixa-week-header-stack {
        position: relative !important;
        width: 100% !important;
        min-width: 0 !important;
        height: 70px !important;
        display: block !important;
      }

      #home .fixa-week-greeting-slot {
        position: absolute !important;
        top: 0 !important;
        right: 2px !important;
        width: auto !important;
        min-height: 25px !important;
        text-align: right !important;
        z-index: 2;
        pointer-events: auto;
      }

      #home .fixa-week-date-slot {
        position: absolute !important;
        top: 25px !important;
        right: 2px !important;
        width: auto !important;
        min-height: 13px !important;
        text-align: right !important;
        z-index: 2;
        pointer-events: auto;
      }

      #home .fixa-week-greeting-slot #homeGreeting {
        justify-content: flex-end !important;
        text-align: right !important;
        white-space: nowrap !important;
      }

      #home .fixa-week-control-slot {
        position: absolute !important;
        left: 0 !important;
        bottom: 0 !important;
        width: auto !important;
        display: flex !important;
        justify-content: flex-start !important;
        padding: 0 !important;
        pointer-events: auto;
      }

      #home .fixa-week-filters {
        justify-content: flex-start !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
