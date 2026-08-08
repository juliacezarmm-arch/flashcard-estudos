(() => {
  'use strict';
  if (window.FixaCompetitionSecondaryTabsPlacementV2) return;
  window.FixaCompetitionSecondaryTabsPlacementV2 = true;

  document.querySelector('#competitionSecondaryTabsPlacementStyle')?.remove();

  const style = document.createElement('style');
  style.id = 'competitionSecondaryTabsPlacementStyleV2';
  style.textContent = `
    /*
      Ações secundárias da Competição usam o MESMO padrão visual das
      subabas de Início: .home-subtabs + .home-subtab.
    */
    .competition-v3 .cv3-secondary-nav.home-subtabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 38px;
      width: fit-content;
      max-width: 100%;
      margin: 0;
      padding: 4px;
      border-radius: 10px;
      background: #f1f5f9;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
    }

    .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
      display: none;
    }

    .competition-v3 .cv3-secondary-nav .home-subtab {
      flex: 0 0 auto;
      min-width: 0 !important;
      width: auto !important;
      min-height: 30px !important;
      padding: 0 14px !important;
      border: 0 !important;
      border-radius: 8px !important;
      background: transparent !important;
      color: #64748b !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      box-shadow: none !important;
      white-space: nowrap;
    }

    .competition-v3 .cv3-secondary-nav .home-subtab:hover,
    .competition-v3 .cv3-secondary-nav .home-subtab:focus-visible {
      color: #2563eb !important;
      background: rgba(255,255,255,.7) !important;
    }

    .competition-v3 .cv3-secondary-nav .home-subtab.active {
      color: #2563eb !important;
      background: #fff !important;
      box-shadow: 0 1px 4px rgba(15,23,42,.08) !important;
    }

    .competition-v3 .cv3-secondary-nav .cv3-icon {
      width: 15px !important;
      height: 15px !important;
      margin-right: 5px;
      stroke-width: 1.8;
    }

    .competition-v3 .cv3-hero-tools {
      justify-items: stretch;
    }

    .competition-v3 .cv3-hero-tools > .cv3-actions {
      display: none !important;
    }

    @media (max-width: 700px) {
      .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  function normalizeButton(button) {
    button.classList.remove('tab', 'cv3-primary', 'active');
    button.classList.add('home-subtab');

    if (button.matches('[data-create]')) {
      button.setAttribute('aria-label', 'Criar competição');
    }
  }

  function reposition() {
    const view = document.querySelector('.competition-v3');
    const root = view?.querySelector('#cv3');
    const hero = root?.querySelector('.cv3-hero');
    const actions = hero?.querySelector('.cv3-actions');
    if (!view || !root || !hero || !actions) return;

    let nav = root.querySelector(':scope > .cv3-secondary-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'home-subtabs cv3-secondary-nav';
      nav.setAttribute('aria-label', 'Ações da competição');
      root.insertBefore(nav, hero);
    } else {
      nav.classList.add('home-subtabs');
    }

    [...actions.children].forEach(button => {
      normalizeButton(button);
      nav.appendChild(button);
    });
  }

  let queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      reposition();
    });
  }

  const observer = new MutationObserver(queue);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view]')) {
      queue();
      setTimeout(queue, 50);
      setTimeout(queue, 250);
    }
  });

  window.addEventListener('load', queue);
  queue();
})();