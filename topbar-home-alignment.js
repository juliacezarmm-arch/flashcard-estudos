/* Mantém o cabeçalho e todas as páginas no mesmo contêiner central */
(() => {
  "use strict";

  if (document.querySelector("#fixaTopbarHomeAlignment")) return;

  const style = document.createElement("style");
  style.id = "fixaTopbarHomeAlignment";
  style.textContent = `
    @media (min-width: 861px) {
      #appShell.app:not(.locked) > main {
        width: 100% !important;
        max-width: none !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      #appShell .topbar,
      #appShell > main > .view {
        width: min(100%, 1180px) !important;
        max-width: 1180px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #appShell .topbar,
      #appShell .mobile-topline {
        flex: 0 0 auto !important;
      }

      #appShell > main > .view.active {
        min-width: 0 !important;
      }

      /*
        Desktop compacto: usado automaticamente quando a janela tem
        menos largura/altura disponível. A estrutura continua igual;
        apenas a densidade visual é reduzida para evitar barras desnecessárias.
      */
      body.fixa-desktop-compact #appShell.app:not(.locked) > main {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
        padding-left: 18px !important;
        padding-right: 18px !important;
      }

      body.fixa-desktop-compact #appShell .topbar,
      body.fixa-desktop-compact #appShell > main > .view {
        max-width: 1120px !important;
      }

      body.fixa-desktop-compact #appShell .topbar {
        gap: 12px !important;
        min-height: 56px !important;
      }

      body.fixa-desktop-compact #appShell .topbar .tab,
      body.fixa-desktop-compact #appShell .topbar button {
        min-height: 38px !important;
      }

      body.fixa-desktop-compact .home-subtabs,
      body.fixa-desktop-compact .test-tabs,
      body.fixa-desktop-compact .questions-subtabs,
      body.fixa-desktop-compact .cv3-secondary-nav {
        margin-top: 4px !important;
        margin-bottom: 6px !important;
      }

      body.fixa-desktop-compact .competition-v3.active {
        gap: 10px !important;
        margin-bottom: 10px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-card {
        padding: 14px !important;
        border-radius: 13px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero {
        padding: 12px 15px !important;
        gap: 14px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-icon {
        width: 56px !important;
        height: 56px !important;
        border-radius: 16px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-icon .cv3-icon {
        width: 28px !important;
        height: 28px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-copy h2 {
        font-size: 23px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-dashboard {
        gap: 10px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position {
        padding: 15px 16px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position {
        margin: 8px 0 12px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-medal {
        width: 72px !important;
        height: 72px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position-medal-svg {
        width: 44px !important;
        height: 44px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position-copy b {
        font-size: 32px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-row-actions {
        margin-top: 13px !important;
        gap: 8px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-row-actions > button {
        min-height: 39px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 172px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-performance,
      body.fixa-desktop-compact .competition-v3 .cv3-area-invite {
        min-height: 132px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-performance .cv3-stat {
        min-height: 70px !important;
        padding-top: 7px !important;
        padding-bottom: 7px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-rule-row {
        gap: 7px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-rule-row > * {
        min-height: 58px !important;
      }

      /* Segundo nível para notebooks/telas ainda mais baixas. */
      body.fixa-desktop-tight #appShell.app:not(.locked) > main {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }

      body.fixa-desktop-tight #appShell .topbar,
      body.fixa-desktop-tight #appShell > main > .view {
        max-width: 1080px !important;
      }

      body.fixa-desktop-tight #appShell .topbar {
        min-height: 50px !important;
      }

      body.fixa-desktop-tight #appShell .topbar .tab,
      body.fixa-desktop-tight #appShell .topbar button {
        min-height: 34px !important;
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }

      body.fixa-desktop-tight .competition-v3.active {
        gap: 7px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-card {
        padding: 11px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-hero {
        padding: 9px 12px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-hero-icon {
        width: 50px !important;
        height: 50px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-dashboard {
        gap: 7px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 148px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-performance,
      body.fixa-desktop-tight .competition-v3 .cv3-area-invite {
        min-height: 116px !important;
      }
    }
  `;

  document.head.appendChild(style);

  const COMPACT = 'fixa-desktop-compact';
  const TIGHT = 'fixa-desktop-tight';
  let resizeQueued = false;

  function applyDesktopDensity() {
    const body = document.body;
    if (!body) return;

    const desktop = window.innerWidth >= 861;
    const compact = desktop && (window.innerWidth <= 1400 || window.innerHeight <= 820);
    const tight = desktop && (window.innerWidth <= 1180 || window.innerHeight <= 700);

    body.classList.toggle(COMPACT, compact);
    body.classList.toggle(TIGHT, tight);
  }

  function queueDesktopDensity() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      applyDesktopDensity();
    });
  }

  applyDesktopDensity();
  window.addEventListener('resize', queueDesktopDensity, { passive: true });
  window.addEventListener('orientationchange', queueDesktopDensity, { passive: true });
  window.addEventListener('pageshow', queueDesktopDensity, { passive: true });
})();

/* Resposta visual imediata da navegação principal */
(() => {
  'use strict';
  if (window.FixaTopbarNavigationImmediateV1) return;
  window.FixaTopbarNavigationImmediateV1 = true;

  const style = document.createElement('style');
  style.id = 'fixaTopbarNavigationImmediateV1Style';
  style.textContent = `
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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buttons.forEach(item => item.classList.remove('fixa-nav-pending', 'fixa-nav-forced-inactive'));
      });
    });
  }

  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.('.topbar-right .tabs > .tab');
    if (button) markImmediate(button);
  }, true);

  document.addEventListener('click', event => {
    const button = event.target.closest?.('.topbar-right .tabs > .tab');
    if (button && !button.classList.contains('active')) markImmediate(button);
  }, true);
})();
