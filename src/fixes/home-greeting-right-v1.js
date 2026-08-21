(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV2) return;
  window.FixaHomeGreetingRightV2 = true;

  let applying = false;
  let observer = null;

  const style = document.createElement('style');
  style.id = 'fixaHomeGreetingRightV2Style';
  style.textContent = `
    @media (min-width: 761px) {
      #home .fixa-home-header-row {
        width: 100% !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        align-items: center !important;
      }

      #home .fixa-home-header-left {
        min-width: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }

      #home .fixa-home-header-left .fixa-week-filters {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        flex-wrap: nowrap !important;
      }

      #home .fixa-home-header-right {
        min-width: 0 !important;
        display: grid !important;
        align-content: center !important;
        justify-items: end !important;
        justify-content: end !important;
        gap: 1px !important;
        transform: none !important;
        text-align: right !important;
      }

      #home .fixa-home-header-right #homeGreeting {
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        text-align: right !important;
        white-space: nowrap !important;
      }

      #home .fixa-home-header-right #homeDatePill {
        margin: 0 !important;
        text-align: right !important;
        white-space: nowrap !important;
      }
    }
  `;
  document.head.appendChild(style);

  function apply() {
    if (applying || !window.matchMedia('(min-width: 761px)').matches) return false;

    const home = document.querySelector('#home.home-view');
    const row = home?.querySelector('.fixa-home-header-row');
    const left = row?.querySelector('.fixa-home-header-left');
    const right = row?.querySelector('.fixa-home-header-right');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    const filters = home?.querySelector('.fixa-week-filters');
    if (!row || !left || !right || !greeting || !date || !filters) return false;

    applying = true;
    try {
      if (filters.parentElement !== left) left.appendChild(filters);
      if (greeting.parentElement !== right) right.appendChild(greeting);
      if (date.parentElement !== right) right.appendChild(date);
      return true;
    } finally {
      applying = false;
    }
  }

  function schedule(delay = 0) {
    window.setTimeout(() => requestAnimationFrame(apply), delay);
  }

  function watch() {
    const actions = document.querySelector('#home .home-hero-actions');
    if (!actions || observer) return;
    observer = new MutationObserver(() => schedule(0));
    observer.observe(actions, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-fixa-main-tab]')) {
      schedule(30);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) schedule(30);
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule(30);
  });

  window.addEventListener('resize', () => schedule(20));
  window.addEventListener('load', () => {
    watch();
    schedule(0);
    schedule(300);
    schedule(900);
  }, { once: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    watch();
    if (apply() || attempts >= 30) window.clearInterval(timer);
  }, 100);
})();
