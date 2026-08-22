(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV6) return;
  window.FixaHomeGreetingRightV6 = true;

  let applying = false;
  let observer = null;
  let scheduled = false;

  const important = (element, property, value) => {
    if (element) element.style.setProperty(property, value, 'important');
  };

  function ensureCompactRow(actions) {
    let row = actions.querySelector('#fixaHomeCompactTopRowV6');
    if (!row) {
      row = document.createElement('div');
      row.id = 'fixaHomeCompactTopRowV6';
      row.innerHTML = '<div class="fixa-home-compact-filters-v6"></div><div class="fixa-home-compact-greeting-v6"></div>';
      actions.prepend(row);
    }
    return row;
  }

  function apply() {
    if (applying || !window.matchMedia('(min-width: 761px)').matches) return false;

    const home = document.querySelector('#home.home-view');
    const hero = home?.querySelector('.home-hero-head');
    const actions = home?.querySelector('.home-hero-actions');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    const filters = home?.querySelector('.fixa-week-filters');
    if (!home || !hero || !actions || !greeting || !date || !filters) return false;

    applying = true;
    try {
      const row = ensureCompactRow(actions);
      const left = row.querySelector('.fixa-home-compact-filters-v6');
      const right = row.querySelector('.fixa-home-compact-greeting-v6');
      if (!left || !right) return false;

      if (filters.parentElement !== left) left.appendChild(filters);
      if (greeting.parentElement !== right) right.appendChild(greeting);
      if (date.parentElement !== right) right.appendChild(date);

      /* Elimina a faixa antiga que reservava espaço entre a navegação e os cards. */
      important(hero, 'min-height', '42px');
      important(hero, 'height', '42px');
      important(hero, 'margin', '-12px 0 2px');
      important(hero, 'padding', '0');
      important(hero, 'display', 'block');
      important(hero, 'overflow', 'visible');

      important(actions, 'position', 'relative');
      important(actions, 'width', '100%');
      important(actions, 'height', '42px');
      important(actions, 'min-height', '42px');
      important(actions, 'display', 'block');
      important(actions, 'margin', '0');
      important(actions, 'padding', '0');

      /* Qualquer estrutura antiga do cabeçalho deixa de participar do layout. */
      home.querySelectorAll('.fixa-home-header-row').forEach(oldRow => {
        if (oldRow !== row) important(oldRow, 'display', 'none');
      });
      home.querySelectorAll('.fixa-week-header-stack').forEach(stack => {
        important(stack, 'display', 'none');
        important(stack, 'height', '0');
        important(stack, 'min-height', '0');
        important(stack, 'margin', '0');
        important(stack, 'padding', '0');
      });

      important(row, 'position', 'relative');
      important(row, 'width', '100%');
      important(row, 'height', '42px');
      important(row, 'min-height', '42px');
      important(row, 'display', 'block');
      important(row, 'margin', '0');
      important(row, 'padding', '0 2px');
      important(row, 'box-sizing', 'border-box');

      important(left, 'position', 'absolute');
      important(left, 'top', '0');
      important(left, 'left', '2px');
      important(left, 'height', '42px');
      important(left, 'display', 'flex');
      important(left, 'align-items', 'center');
      important(left, 'justify-content', 'flex-start');
      important(left, 'margin', '0');
      important(left, 'padding', '0');

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
      important(right, 'height', '42px');
      important(right, 'display', 'grid');
      important(right, 'align-content', 'start');
      important(right, 'justify-items', 'end');
      important(right, 'gap', '1px');
      important(right, 'margin', '0');
      important(right, 'padding', '0');
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
    const root = document.querySelector('#home.home-view');
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
    schedule(250);
    schedule(700);
    schedule(1500);
  }, { once: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    watch();
    apply();
    if (attempts >= 100) window.clearInterval(timer);
  }, 100);
})();

/* Ordem estável dos botões primários no desktop: Início — Competição | espaço | Questões — Teste.
   Usa a ordem nativa do flex para evitar MutationObserver e movimentação tardia de elementos. */
(() => {
  'use strict';
  if (document.getElementById('fixaPrimaryTopbarOrderStyleV2')) return;

  const style = document.createElement('style');
  style.id = 'fixaPrimaryTopbarOrderStyleV2';
  style.textContent = `
    @media (min-width: 761px) {
      .topbar-right .tabs [data-view="home"],
      .topbar-right .tabs #homeTopTab {
        order: 1 !important;
        margin-left: 0 !important;
      }

      .topbar-right .tabs [data-competition-view],
      .topbar-right .tabs [data-view="competition"] {
        order: 2 !important;
        margin-left: 0 !important;
      }

      .topbar-right .tabs [data-view="manage"] {
        order: 3 !important;
        margin-left: 28px !important;
      }

      .topbar-right .tabs [data-view="test"] {
        order: 4 !important;
        margin-left: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
