(() => {
  'use strict';
  if (window.FixaCompetitionSecondaryTabsPlacementV2) return;
  window.FixaCompetitionSecondaryTabsPlacementV2 = true;

  document.querySelector('#competitionSecondaryTabsPlacementStyle')?.remove();
  document.querySelector('#competitionSecondaryTabsPlacementStyleV2')?.remove();

  /*
    IMPORTANTE:
    O visual das abas secundárias é global e fica em
    secondary-tabs-layout-fix.js.
    Este módulo cuida apenas da posição/estrutura da navegação da Competição,
    sem definir tamanho, cor, fonte, espaçamento ou estado visual próprios.
  */
  const style = document.createElement('style');
  style.id = 'competitionSecondaryTabsPlacementStyleV3';
  style.textContent = `
    .competition-v3 .cv3-secondary-nav.home-subtabs {
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
    }

    .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
      display: none;
    }

    .competition-v3 .cv3-hero-tools {
      justify-items: stretch;
    }

    .competition-v3 .cv3-hero-tools > .cv3-actions {
      display: none !important;
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

  const view = document.querySelector('.competition-v3');
  if (view) {
    new MutationObserver(queue).observe(view, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view]')) {
      queue();
      setTimeout(queue, 50);
      setTimeout(queue, 250);
    }
  });

  window.addEventListener('load', queue, { once: true });
  queue();
})();