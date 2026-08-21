(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV5) return;
  window.FixaHomeGreetingRightV5 = true;

  let applying = false;
  let observer = null;
  let scheduled = false;

  const important = (element, property, value) => {
    if (element) element.style.setProperty(property, value, 'important');
  };

  function apply() {
    if (applying || !window.matchMedia('(min-width: 761px)').matches) return false;

    const home = document.querySelector('#home.home-view');
    const hero = home?.querySelector('.home-hero-head');
    const actions = home?.querySelector('.home-hero-actions');
    const row = home?.querySelector('.fixa-home-header-row');
    const left = row?.querySelector('.fixa-home-header-left');
    const right = row?.querySelector('.fixa-home-header-right');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    const filters = home?.querySelector('.fixa-week-filters');
    if (!hero || !actions || !row || !left || !right || !greeting || !date || !filters) return false;

    applying = true;
    try {
      if (filters.parentElement !== left) left.appendChild(filters);
      if (greeting.parentElement !== right) right.appendChild(greeting);
      if (date.parentElement !== right) right.appendChild(date);

      important(hero, 'min-height', '42px');
      important(hero, 'height', '42px');
      important(hero, 'margin', '0 0 2px');
      important(hero, 'padding', '0');
      important(hero, 'align-items', 'stretch');

      important(actions, 'position', 'relative');
      important(actions, 'width', '100%');
      important(actions, 'height', '42px');
      important(actions, 'display', 'block');
      important(actions, 'margin', '0');
      important(actions, 'padding', '0');

      important(row, 'position', 'relative');
      important(row, 'width', '100%');
      important(row, 'height', '42px');
      important(row, 'min-height', '42px');
      important(row, 'display', 'block');
      important(row, 'padding', '0 2px');
      important(row, 'margin', '0');
      important(row, 'box-sizing', 'border-box');

      important(left, 'position', 'absolute');
      important(left, 'top', '0');
      important(left, 'left', '2px');
      important(left, 'right', 'auto');
      important(left, 'bottom', 'auto');
      important(left, 'width', 'auto');
      important(left, 'height', '42px');
      important(left, 'display', 'flex');
      important(left, 'align-items', 'flex-start');
      important(left, 'justify-content', 'flex-start');
      important(left, 'padding', '0');
      important(left, 'margin', '0');
      important(left, 'transform', 'none');

      important(filters, 'display', 'flex');
      important(filters, 'align-items', 'center');
      important(filters, 'justify-content', 'flex-start');
      important(filters, 'flex-wrap', 'nowrap');
      important(filters, 'margin', '0');
      important(filters, 'padding', '0');
      important(filters, 'transform', 'none');

      important(right, 'position', 'absolute');
      important(right, 'top', '0');
      important(right, 'right', '2px');
      important(right, 'left', 'auto');
      important(right, 'bottom', 'auto');
      important(right, 'width', 'auto');
      important(right, 'height', '42px');
      important(right, 'display', 'grid');
      important(right, 'align-content', 'start');
      important(right, 'justify-items', 'end');
      important(right, 'justify-content', 'end');
      important(right, 'gap', '1px');
      important(right, 'padding', '0');
      important(right, 'margin', '0');
      important(right, 'transform', 'none');
      important(right, 'text-align', 'right');

      important(greeting, 'margin', '0');
      important(greeting, 'display', 'flex');
      important(greeting, 'align-items', 'center');
      important(greeting, 'justify-content', 'flex-end');
      important(greeting, 'text-align', 'right');
      important(greeting, 'white-space', 'nowrap');

      important(date, 'margin', '0');
      important(date, 'text-align', 'right');
      important(date, 'white-space', 'nowrap');

      return true;
    } finally {
      applying = false;
    }
  }

  function schedule(delay = 0) {
    if (delay > 0) {
      window.setTimeout(() => schedule(0), delay);
      return;
    }
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function watch() {
    const root = document.querySelector('#home.home-view') || document.body;
    if (!root) return;
    observer?.disconnect();
    observer = new MutationObserver(() => schedule(0));
    observer.observe(root, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-fixa-main-tab]')) schedule(30);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) schedule(30);
  }, true);

  window.addEventListener('fixa-cloud-data-loaded', () => {
    watch();
    schedule(0);
    schedule(100);
    schedule(400);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      watch();
      schedule(20);
    }
  });

  window.addEventListener('resize', () => schedule(20));
  window.addEventListener('load', () => {
    watch();
    schedule(0);
    schedule(300);
    schedule(900);
    schedule(1800);
  }, { once: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    watch();
    apply();
    if (attempts >= 80) window.clearInterval(timer);
  }, 100);
})();
