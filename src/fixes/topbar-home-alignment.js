/* Densidade responsiva do conteúdo do Fixa.
   IMPORTANTE: este módulo NÃO controla mais o cabeçalho nem as abas secundárias.
   O padrão global de navegação fica exclusivamente em secondary-tabs-layout-fix.js. */
(() => {
  'use strict';
  if (document.querySelector('#fixaTopbarHomeAlignment')) return;

  const style = document.createElement('style');
  style.id = 'fixaTopbarHomeAlignment';
  style.textContent = `
    /* Laptop / desktop menor: compacta somente o CONTEÚDO da Competição. */
    @media (min-width: 861px) {
      body.fixa-desktop-compact .competition-v3.active {
        gap: 7px !important;
        margin-bottom: 4px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-card {
        padding: 11px 13px !important;
        border-radius: 12px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero {
        padding: 9px 12px !important;
        gap: 12px !important;
        min-height: 72px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-icon {
        width: 50px !important;
        height: 50px !important;
        border-radius: 14px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-icon .cv3-icon {
        width: 26px !important;
        height: 26px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-copy h2 {
        margin-bottom: 3px !important;
        font-size: 22px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-copy p {
        font-size: 9.5px !important;
        line-height: 1.35 !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-hero-tools select {
        min-height: 36px !important;
        font-size: 11px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-dashboard {
        gap: 7px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-card h3 {
        font-size: 15px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-section-head {
        margin-bottom: 8px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position {
        padding: 11px 13px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position {
        gap: 12px !important;
        margin: 5px 0 8px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-medal {
        width: 62px !important;
        height: 62px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position-medal-svg {
        width: 38px !important;
        height: 38px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-position-copy b {
        font-size: 29px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-xp {
        margin-top: 4px !important;
        font-size: 15px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-meta,
      body.fixa-desktop-compact .competition-v3 .cv3-note,
      body.fixa-desktop-compact .competition-v3 .cv3-muted {
        font-size: 9.5px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-note {
        margin-top: 7px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-row-actions {
        margin-top: 9px !important;
        gap: 7px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-position .cv3-row-actions > button {
        min-height: 34px !important;
        font-size: 11px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 150px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-rank {
        min-height: 42px !important;
        padding: 5px 8px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-avatar {
        width: 30px !important;
        height: 30px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-performance,
      body.fixa-desktop-compact .competition-v3 .cv3-area-invite {
        min-height: 108px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-stats,
      body.fixa-desktop-compact .competition-v3 .cv3-rule-row {
        gap: 6px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-performance .cv3-stat {
        min-height: 62px !important;
        padding: 5px 6px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-stat b {
        font-size: 15px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-stat small {
        margin-top: 2px !important;
        font-size: 8.5px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-rule-icon {
        width: 27px !important;
        height: 27px !important;
        margin-bottom: 3px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-invite .cv3-code {
        min-height: 38px !important;
        padding: 4px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-invite .cv3-code strong {
        min-height: 29px !important;
        font-size: 12px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-rules {
        padding-top: 10px !important;
        padding-bottom: 9px !important;
      }

      body.fixa-desktop-compact .competition-v3 .cv3-area-rules .cv3-rule-row > * {
        min-height: 48px !important;
        padding-top: 5px !important;
        padding-bottom: 5px !important;
      }

      /* Notebook baixo: ainda mais compacto, mas SEM tocar no cabeçalho. */
      body.fixa-desktop-tight .competition-v3.active {
        gap: 5px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-card {
        padding: 9px 11px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-hero {
        min-height: 62px !important;
        padding: 7px 10px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-hero-icon {
        width: 44px !important;
        height: 44px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-hero-copy h2 {
        font-size: 20px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-dashboard {
        gap: 5px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-position .cv3-medal {
        width: 56px !important;
        height: 56px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-position .cv3-position-copy b {
        font-size: 27px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 128px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-performance,
      body.fixa-desktop-tight .competition-v3 .cv3-area-invite {
        min-height: 94px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-performance .cv3-stat {
        min-height: 54px !important;
      }

      body.fixa-desktop-tight .competition-v3 .cv3-area-rules .cv3-rule-row > * {
        min-height: 42px !important;
      }
    }

    /* Tablet normal: somente densidade do conteúdo da Competição.
       Cabeçalho continua pertencendo ao sistema global/mobile existente. */
    @media (min-width: 600px) and (max-width: 860px) {
      .competition-v3.active {
        gap: 6px !important;
        margin-bottom: 5px !important;
      }

      .competition-v3 .cv3-card {
        padding: 9px 10px !important;
        border-radius: 11px !important;
      }

      .competition-v3 .cv3-hero {
        grid-template-columns: 44px minmax(0,1fr) minmax(140px,180px) !important;
        gap: 9px !important;
        padding: 8px 10px !important;
        min-height: 62px !important;
      }

      .competition-v3 .cv3-hero-icon {
        width: 44px !important;
        height: 44px !important;
        border-radius: 12px !important;
      }

      .competition-v3 .cv3-hero-icon .cv3-icon {
        width: 24px !important;
        height: 24px !important;
      }

      .competition-v3 .cv3-hero-copy h2 {
        margin-bottom: 2px !important;
        font-size: 19px !important;
      }

      .competition-v3 .cv3-hero-copy p {
        font-size: 8.5px !important;
        line-height: 1.3 !important;
      }

      .competition-v3 .cv3-hero-tools select {
        min-height: 34px !important;
        font-size: 10px !important;
      }

      .competition-v3 .cv3-dashboard {
        gap: 6px !important;
      }

      .competition-v3 .cv3-card h3 {
        font-size: 14px !important;
      }

      .competition-v3 .cv3-section-head {
        margin-bottom: 7px !important;
      }

      .competition-v3 .cv3-area-position {
        padding: 10px !important;
      }

      .competition-v3 .cv3-area-position .cv3-position {
        gap: 9px !important;
        margin: 5px 0 7px !important;
      }

      .competition-v3 .cv3-area-position .cv3-medal {
        width: 54px !important;
        height: 54px !important;
      }

      .competition-v3 .cv3-area-position .cv3-position-medal-svg {
        width: 34px !important;
        height: 34px !important;
      }

      .competition-v3 .cv3-area-position .cv3-position-copy b {
        font-size: 25px !important;
      }

      .competition-v3 .cv3-area-position .cv3-xp {
        margin-top: 3px !important;
        font-size: 14px !important;
      }

      .competition-v3 .cv3-meta,
      .competition-v3 .cv3-note,
      .competition-v3 .cv3-muted {
        font-size: 8.5px !important;
      }

      .competition-v3 .cv3-area-position .cv3-note {
        margin-top: 6px !important;
      }

      .competition-v3 .cv3-area-position .cv3-row-actions {
        margin-top: 7px !important;
        gap: 5px !important;
      }

      .competition-v3 .cv3-area-position .cv3-row-actions > button {
        min-height: 31px !important;
        font-size: 9.5px !important;
      }

      .competition-v3 .cv3-rank-tabs {
        gap: 12px !important;
      }

      .competition-v3 .cv3-rank-tab {
        padding-bottom: 6px !important;
        font-size: 9.5px !important;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 126px !important;
      }

      .competition-v3 .cv3-rank {
        min-height: 38px !important;
        padding: 4px 6px !important;
      }

      .competition-v3 .cv3-avatar {
        width: 27px !important;
        height: 27px !important;
      }

      .competition-v3 .cv3-rank-name,
      .competition-v3 .cv3-rank-xp {
        font-size: 10px !important;
      }

      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        min-height: 96px !important;
      }

      .competition-v3 .cv3-stats,
      .competition-v3 .cv3-rule-row {
        gap: 5px !important;
      }

      .competition-v3 .cv3-area-performance .cv3-stat {
        min-height: 54px !important;
        padding: 4px !important;
      }

      .competition-v3 .cv3-stat b {
        font-size: 14px !important;
      }

      .competition-v3 .cv3-stat small {
        margin-top: 1px !important;
        font-size: 7.5px !important;
      }

      .competition-v3 .cv3-rule-icon {
        width: 24px !important;
        height: 24px !important;
        margin-bottom: 2px !important;
      }

      .competition-v3 .cv3-area-invite .cv3-invite-actions .tab,
      .competition-v3 .cv3-area-invite .cv3-header-copy-btn {
        min-height: 27px !important;
        height: 27px !important;
        padding: 0 6px !important;
        font-size: 8.5px !important;
      }

      .competition-v3 .cv3-area-invite .cv3-code {
        min-height: 34px !important;
        padding: 3px !important;
      }

      .competition-v3 .cv3-area-invite .cv3-code strong {
        min-height: 27px !important;
        font-size: 11px !important;
      }

      .competition-v3 .cv3-area-rules {
        padding-top: 8px !important;
        padding-bottom: 7px !important;
      }

      .competition-v3 .cv3-area-rules .cv3-rule-row > * {
        min-height: 42px !important;
        padding: 4px !important;
      }
    }
  `;

  document.head.appendChild(style);

  const COMPACT = 'fixa-desktop-compact';
  const TIGHT = 'fixa-desktop-tight';
  const TABLET = 'fixa-tablet-normal';
  let resizeQueued = false;

  function applyDensity() {
    const body = document.body;
    if (!body) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const desktop = w >= 861;
    const tablet = w >= 600 && w <= 860;

    body.classList.toggle(COMPACT, desktop && (w <= 1450 || h <= 850));
    body.classList.toggle(TIGHT, desktop && (w <= 1250 || h <= 790));
    body.classList.toggle(TABLET, tablet);
  }

  function queueDensity() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      applyDensity();
    });
  }

  applyDensity();
  window.addEventListener('resize', queueDensity, { passive: true });
  window.addEventListener('orientationchange', queueDensity, { passive: true });
  window.addEventListener('pageshow', queueDensity, { passive: true });
})();

/* Resposta visual imediata da navegação principal.
   Apenas estado visual; dimensões pertencem ao módulo global de cabeçalho. */
(() => {
  'use strict';
  if (window.FixaTopbarNavigationImmediateV1) return;
  window.FixaTopbarNavigationImmediateV1 = true;

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
