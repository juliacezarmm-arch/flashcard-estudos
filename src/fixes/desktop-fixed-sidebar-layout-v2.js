/* Desktop: sidebar fixa mais larga, conteúdo ocupando toda a largura e coleção atual na lateral. */
(() => {
  'use strict';

  if (window.FixaDesktopFixedSidebarLayoutV2) return;
  window.FixaDesktopFixedSidebarLayoutV2 = true;

  const DESKTOP_BREAKPOINT = 861;
  const STYLE_ID = 'fixaDesktopFixedSidebarLayoutV2Style';

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (min-width: ${DESKTOP_BREAKPOINT}px) {
      :root {
        --fixa-fixed-sidebar-width: clamp(340px, 22vw, 370px);
      }

      html,
      body {
        width: 100% !important;
        max-width: none !important;
        overflow-x: hidden !important;
      }

      #appShell.app:not(.locked) {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        grid-template-columns: var(--fixa-fixed-sidebar-width) minmax(0, 1fr) !important;
      }

      #collectionsSidebar {
        width: var(--fixa-fixed-sidebar-width) !important;
        min-width: var(--fixa-fixed-sidebar-width) !important;
        max-width: var(--fixa-fixed-sidebar-width) !important;
      }

      #appShell.app:not(.locked) > main {
        grid-column: 2 !important;
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      #appShell .topbar,
      #appShell > main > .view {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      #appShell .home-subtabs,
      #appShell #questionsHubNav,
      #appShell #test .test-tabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100% !important;
        max-width: none !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      /* A sidebar já está fixa no desktop: o botão de abrir gaveta não é necessário. */
      #appShell .mobile-menu-toggle {
        display: none !important;
      }

      #appShell .topbar > .mobile-topline {
        min-width: auto !important;
      }

      #appShell .mobile-topline-left {
        gap: 0 !important;
      }

      /* Coleções: aproveita a nova largura e permite nomes em mais de uma linha. */
      #collectionsSidebar .subject {
        height: auto !important;
        min-height: 43px !important;
        align-items: center !important;
      }

      #collectionsSidebar .subject > span:not(.collection-book-icon) {
        min-width: 0 !important;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
        line-height: 1.25 !important;
      }

      /* Coleção atual passa a viver logo abaixo de “Minhas coleções”. */
      #collectionsSidebar > #fixaActiveCollectionChip {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        min-height: 54px !important;
        height: auto !important;
        margin: -2px 0 0 !important;
        padding: 9px 11px !important;
        border: 1px solid #bfdbfe !important;
        border-radius: 10px !important;
        display: grid !important;
        grid-template-columns: 20px minmax(0, 1fr) !important;
        align-items: center !important;
        column-gap: 9px !important;
        color: #1d4ed8 !important;
        background: linear-gradient(90deg, #eff6ff 0%, #ffffff 100%) !important;
        box-shadow: 0 2px 8px rgba(37, 99, 235, .06) !important;
        box-sizing: border-box !important;
      }

      #collectionsSidebar > #fixaActiveCollectionChip svg {
        width: 19px !important;
        height: 19px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.9 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #collectionsSidebar > #fixaActiveCollectionChip span {
        min-width: 0 !important;
        display: grid !important;
        gap: 2px !important;
      }

      #collectionsSidebar > #fixaActiveCollectionChip small {
        display: block !important;
        margin: 0 !important;
        color: #2563eb !important;
        font-size: 9px !important;
        line-height: 11px !important;
        font-weight: 850 !important;
        text-transform: uppercase !important;
        letter-spacing: .025em !important;
        white-space: nowrap !important;
      }

      #collectionsSidebar > #fixaActiveCollectionChip strong {
        display: block !important;
        min-width: 0 !important;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
        color: #172033 !important;
        font-size: 12px !important;
        line-height: 15px !important;
        font-weight: 850 !important;
      }
    }
  `;
  document.head.appendChild(style);

  let frame = 0;

  function desktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function moveChipToSidebar() {
    const chip = document.querySelector('#fixaActiveCollectionChip');
    const sidebar = document.querySelector('#collectionsSidebar');
    const head = sidebar?.querySelector('.collections-drawer-head');

    if (!chip || !sidebar || !head) return false;
    if (chip.parentElement === sidebar && chip.previousElementSibling === head) return true;

    head.insertAdjacentElement('afterend', chip);
    return true;
  }

  function moveChipToMobileTopbar() {
    const chip = document.querySelector('#fixaActiveCollectionChip');
    if (!chip) return false;

    const tools = document.querySelector('#homeTopTools');
    const right = document.querySelector('.topbar-right');
    const container = tools || right;
    if (!container) return false;

    if (chip.parentElement === container) return true;

    const anchor = container === tools
      ? tools.querySelector('.fixa-streak-freeze-box, #homeTopStreak, .home-top-streak, .home-top-bell')
      : container.querySelector('#homeTopTools, .auth-panel');

    if (anchor) container.insertBefore(chip, anchor);
    else container.appendChild(chip);
    return true;
  }

  function syncPlacement() {
    frame = 0;
    if (desktop()) moveChipToSidebar();
    else moveChipToMobileTopbar();
  }

  function schedulePlacement() {
    if (frame) return;
    frame = requestAnimationFrame(syncPlacement);
  }

  const shell = document.querySelector('#appShell') || document.body;
  const observer = new MutationObserver(schedulePlacement);
  observer.observe(shell, { childList: true, subtree: true });

  window.addEventListener('resize', schedulePlacement, { passive: true });
  window.addEventListener('orientationchange', schedulePlacement, { passive: true });
  window.addEventListener('load', schedulePlacement, { once: true });
  document.addEventListener('click', () => requestAnimationFrame(schedulePlacement), true);
  document.addEventListener('change', () => requestAnimationFrame(schedulePlacement), true);

  schedulePlacement();
})();
