(() => {
  'use strict';
  if (window.FixaTopbarNavigationImmediateV1) return;
  window.FixaTopbarNavigationImmediateV1 = true;

  const style = document.createElement('style');
  style.id = 'fixaTopbarNavigationImmediateV1Style';
  style.textContent = `
    /* A navegação principal responde visualmente no mesmo instante do clique. */
    .topbar-right .tabs > .tab {
      transition: background-color .08s ease, border-color .08s ease, color .08s ease, box-shadow .08s ease !important;
    }

    .topbar-right .tabs > .tab.fixa-nav-pending,
    .topbar-right .tabs > .tab.fixa-nav-pending:hover,
    .topbar-right .tabs > .tab.fixa-nav-pending:focus,
    .topbar-right .tabs > .tab.fixa-nav-pending:focus-visible {
      color: #fff !important;
      border-color: #2563eb !important;
      background: #2563eb !important;
      box-shadow: 0 8px 18px rgba(37,99,235,.14) !important;
      outline: none !important;
    }

    .topbar-right .tabs > .tab:not(.fixa-nav-pending).fixa-nav-forced-inactive {
      color: #172033 !important;
      background: #fff !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);

  const navButtons = () => [...document.querySelectorAll('.topbar-right .tabs > .tab')];

  function markImmediate(button) {
    if (!button || button.disabled) return;
    const buttons = navButtons();
    if (!buttons.includes(button)) return;

    for (const item of buttons) {
      const selected = item === button;
      item.classList.toggle('fixa-nav-pending', selected);
      item.classList.toggle('fixa-nav-forced-inactive', !selected);
      item.classList.toggle('active', selected);
      if (selected) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }

    /*
      As funções originais continuam responsáveis por trocar o conteúdo.
      Removemos apenas as classes temporárias depois que o clique terminou,
      deixando o estado oficial assumir sem piscar.
    */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buttons.forEach(item => {
          item.classList.remove('fixa-nav-pending', 'fixa-nav-forced-inactive');
        });
      });
    });
  }

  /* pointerdown ocorre antes dos handlers de click e evita o atraso visual. */
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.('.topbar-right .tabs > .tab');
    if (button) markImmediate(button);
  }, true);

  /* Teclado/acessibilidade: garante o mesmo comportamento sem pointerdown. */
  document.addEventListener('click', event => {
    const button = event.target.closest?.('.topbar-right .tabs > .tab');
    if (button && !button.classList.contains('active')) markImmediate(button);
  }, true);
})();