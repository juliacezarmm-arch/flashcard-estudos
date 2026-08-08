(() => {
  'use strict';
  if (window.FixaCompetitionSecondaryTabsPlacement) return;
  window.FixaCompetitionSecondaryTabsPlacement = true;

  const style = document.createElement('style');
  style.id = 'competitionSecondaryTabsPlacementStyle';
  style.textContent = `
    .competition-v3 .cv3-secondary-nav {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .competition-v3 .cv3-secondary-nav .tab {
      flex: 0 0 auto;
    }

    .competition-v3 .cv3-secondary-nav .cv3-primary {
      min-width: 116px;
    }

    .competition-v3 .cv3-hero-tools {
      justify-items: stretch;
    }

    .competition-v3 .cv3-hero-tools > .cv3-actions {
      display: none !important;
    }

    @media (max-width: 700px) {
      .competition-v3 .cv3-secondary-nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .competition-v3 .cv3-secondary-nav .tab,
      .competition-v3 .cv3-secondary-nav .cv3-primary {
        width: 100% !important;
        min-width: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);

  function reposition() {
    const view = document.querySelector('.competition-v3');
    const root = view?.querySelector('#cv3');
    const hero = root?.querySelector('.cv3-hero');
    const actions = hero?.querySelector('.cv3-actions');
    if (!view || !root || !hero || !actions) return;

    let nav = root.querySelector(':scope > .cv3-secondary-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'cv3-secondary-nav';
      root.insertBefore(nav, hero);
    }

    [...actions.children].forEach(button => {
      if (button.matches('[data-create]')) {
        button.classList.add('cv3-primary');
        button.classList.remove('tab');
      } else {
        button.classList.add('tab');
        button.classList.remove('cv3-primary');
      }
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