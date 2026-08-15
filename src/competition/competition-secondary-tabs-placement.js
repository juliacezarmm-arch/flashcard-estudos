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

    Ordem fixa da Competição:
    1. Minhas competições
    2. Histórico
    3. Criar
    4. Entrar por código
    5. Convidar amigos
    6. Convites
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

  const historyIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5M12 7v5l3 2"></path></svg>';
  const usersIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  const mailIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>';

  function normalizeButton(button) {
    button.classList.remove('tab', 'cv3-primary');
    button.classList.add('home-subtab');

    if (button.matches('[data-create]')) {
      button.setAttribute('aria-label', 'Criar competição');
    }
    if (button.matches('[data-list]')) {
      button.setAttribute('aria-label', 'Minhas competições');
    }
    if (button.matches('[data-competition-history-placeholder]')) {
      button.setAttribute('aria-label', 'Histórico');
    }
    if (button.matches('[data-join]')) {
      button.setAttribute('aria-label', 'Entrar por código');
    }
    if (button.matches('[data-invite]')) {
      button.setAttribute('aria-label', 'Convidar amigos');
    }
    if (button.matches('[data-cv9-invitations]')) {
      button.setAttribute('aria-label', 'Convites');
    }
  }

  function createHistoryButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-competition-history-placeholder', '1');
    button.setAttribute('aria-label', 'Histórico');
    button.title = 'Histórico';
    button.innerHTML = `${historyIcon}<span>Histórico</span>`;
    return button;
  }

  function createInviteButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-invite', '');
    button.setAttribute('aria-label', 'Convidar amigos');
    button.innerHTML = `${usersIcon}<span>Convidar amigos</span>`;
    return button;
  }

  function createInvitationsButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-cv9-invitations', '1');
    button.setAttribute('aria-label', 'Convites');
    button.innerHTML = `${mailIcon}<span data-cv9-label>Convites</span><span class="cv9-badge" data-cv9-badge hidden>0</span>`;
    return button;
  }

  function ensureSixButtons(nav) {
    let history = nav.querySelector('[data-competition-history-placeholder]');
    if (!history) {
      history = createHistoryButton();
      nav.appendChild(history);
    }

    let invite = nav.querySelector('[data-invite]');
    if (!invite) {
      invite = createInviteButton();
      nav.appendChild(invite);
    }

    let invitations = nav.querySelector('[data-cv9-invitations]');
    if (!invitations) {
      invitations = createInvitationsButton();
      nav.appendChild(invitations);
    }

    const order = [
      nav.querySelector('[data-list]'),
      history,
      nav.querySelector('[data-create]'),
      nav.querySelector('[data-join]'),
      invite,
      invitations
    ].filter(Boolean);

    order.forEach(button => {
      normalizeButton(button);
      nav.appendChild(button);
    });
  }

  function syncActiveState(nav, root) {
    if (!nav || !root) return;

    /* Ações não ficam selecionadas só por existirem no DOM.
       Na home interna, apenas "Minhas competições" fica ativa.
       Na tela detalhada, nenhuma ação secundária fica marcada indevidamente. */
    nav.querySelectorAll('.home-subtab').forEach(button => {
      button.classList.remove('active');
      button.removeAttribute('aria-current');
      button.setAttribute('aria-pressed', 'false');
    });

    if (root.querySelector('.cv7-manager')) {
      const listButton = nav.querySelector('[data-list]');
      if (listButton) {
        listButton.classList.add('active');
        listButton.setAttribute('aria-current', 'page');
        listButton.setAttribute('aria-pressed', 'true');
      }
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

    ensureSixButtons(nav);
    syncActiveState(nav, root);
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