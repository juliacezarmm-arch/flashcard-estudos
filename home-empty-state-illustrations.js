(() => {
  const ASSETS = {
    study: './referencias/home-revisar-prancheta.png',
    collections: './referencias/home-resumo-colecoes.png',
    priorities: './referencias/home-revisoes-hoje.png'
  };

  const style = document.createElement('style');
  style.id = 'homeEmptyStateIllustrationsStyle';
  style.textContent = `
    [data-home-panel="today"] .home-panel {
      position: relative;
      overflow: hidden;
    }

    .home-empty-art {
      display: block;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
      transition: width .2s ease, left .2s ease, right .2s ease, bottom .2s ease, opacity .2s ease;
    }

    .home-empty-action {
      min-height: 40px;
      width: max-content;
      max-width: 100%;
      margin-top: 16px;
      padding: 10px 15px;
      border: 1px solid #cfe0ff;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #2563eb;
      background: #fff;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 6px 18px rgba(37, 99, 235, .08);
    }

    .home-empty-action:hover,
    .home-empty-action:focus-visible {
      color: #1d4ed8;
      border-color: #a9c7ff;
      background: #f7faff;
    }

    .home-empty-action svg {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .home-empty-copy {
      position: relative;
      z-index: 2;
    }

    .home-study-card.is-home-empty,
    .home-collections-card.is-home-empty {
      min-height: 255px;
      padding-right: min(45%, 265px) !important;
    }

    .home-study-card.is-home-empty .home-focus-box,
    .home-collections-card.is-home-empty .home-collection-scroll,
    .home-priority-panel.is-home-empty .home-priority-scroll {
      min-height: 0;
      overflow: visible;
    }

    .home-study-card.is-home-empty .home-empty-art,
    .home-collections-card.is-home-empty .home-empty-art {
      position: absolute;
      right: 24px;
      bottom: 16px;
      width: min(38%, 220px);
      max-height: 210px;
    }

    .home-priority-panel.is-home-empty {
      min-height: 245px;
      padding-right: min(43%, 330px) !important;
    }

    .home-priority-panel.is-home-empty .home-empty-art {
      position: absolute;
      right: 55px;
      bottom: 6px;
      width: min(34%, 255px);
      max-height: 220px;
    }

    .has-home-data {
      padding-left: 102px !important;
    }

    .has-home-data .home-empty-art {
      position: absolute;
      left: 18px;
      bottom: 16px;
      width: 70px;
      max-height: 76px;
      opacity: .92;
    }

    .home-priority-panel.has-home-data .home-empty-art {
      width: 76px;
      max-height: 72px;
    }

    @media (max-width: 860px) {
      .home-study-card.is-home-empty,
      .home-collections-card.is-home-empty,
      .home-priority-panel.is-home-empty {
        min-height: auto;
        padding-right: 18px !important;
        padding-bottom: 20px !important;
      }

      .home-study-card.is-home-empty .home-empty-art,
      .home-collections-card.is-home-empty .home-empty-art,
      .home-priority-panel.is-home-empty .home-empty-art {
        position: relative;
        right: auto;
        bottom: auto;
        width: min(72%, 230px);
        max-height: 190px;
        margin: 14px auto 0;
      }

      .has-home-data {
        padding-left: 78px !important;
      }

      .has-home-data .home-empty-art,
      .home-priority-panel.has-home-data .home-empty-art {
        left: 12px;
        bottom: 14px;
        width: 54px;
        max-height: 58px;
      }
    }
  `;
  document.head.appendChild(style);

  function svgIcon(type) {
    if (type === 'test') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l2 2 4-4"></path><path d="M5 4h14v16H5z"></path></svg>';
    if (type === 'collections') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h6l2 2h8v10H4z"></path></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l2 2 4-4"></path><circle cx="12" cy="12" r="9"></circle></svg>';
  }

  function openTest() {
    document.body.classList.remove('home-active', 'home-activity-active');
    if (typeof showView === 'function') showView('test');
    if (typeof showTestPanel === 'function') showTestPanel('quick');
    if (typeof renderTest === 'function') renderTest();
  }

  function openCollections() {
    document.body.classList.remove('home-active', 'home-activity-active');
    if (typeof showView === 'function') showView('questions');
  }

  function ensureImage(panel, key, alt) {
    let image = panel.querySelector(`.home-empty-art[data-home-art="${key}"]`);
    if (!image) {
      image = document.createElement('img');
      image.className = 'home-empty-art';
      image.dataset.homeArt = key;
      image.src = ASSETS[key];
      image.alt = alt;
      image.loading = 'eager';
      image.decoding = 'async';
      panel.appendChild(image);
    }
    return image;
  }

  function ensureButton(panel, key, label, icon, handler) {
    let button = panel.querySelector(`.home-empty-action[data-home-action="${key}"]`);
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'home-empty-action';
      button.dataset.homeAction = key;
      button.innerHTML = `${svgIcon(icon)}<span>${label}</span>`;
      button.addEventListener('click', handler);
      const anchor = panel.querySelector('.home-focus-box, .home-collection-scroll, .home-priority-scroll');
      (anchor || panel).insertAdjacentElement('afterend', button);
    }
    return button;
  }

  function hasRealContent(container, selectors) {
    if (!container) return false;
    if (selectors.some(selector => container.querySelector(selector))) return true;
    const meaningfulChildren = [...container.children].filter(child => {
      if (child.classList.contains('home-muted')) return false;
      if (child.classList.contains('home-empty-action')) return false;
      return child.textContent.trim().length > 0;
    });
    return meaningfulChildren.length > 0;
  }

  function syncPanel(panel, empty, image, button) {
    panel.classList.toggle('is-home-empty', empty);
    panel.classList.toggle('has-home-data', !empty);
    image.hidden = false;
    button.hidden = !empty;
  }

  function syncHomeEmptyStates() {
    const todayPanel = document.querySelector('[data-home-panel="today"]');
    if (!todayPanel) return;

    const studyPanel = todayPanel.querySelector('.home-study-card');
    const studyContainer = document.querySelector('#homeStudyRecommendations');
    if (studyPanel) {
      const image = ensureImage(studyPanel, 'study', 'Prancheta de revisão com lápis e planta');
      const button = ensureButton(studyPanel, 'start-test', 'Criar meu primeiro teste', 'test', openTest);
      syncPanel(studyPanel, !hasRealContent(studyContainer, ['.home-recommendation']), image, button);
    }

    const collectionContainer = document.querySelector('#homeCollectionSummary');
    const collectionPanel = collectionContainer?.closest('.home-panel');
    if (collectionPanel) {
      collectionPanel.classList.add('home-collections-card');
      const image = ensureImage(collectionPanel, 'collections', 'Livros com cartão de coleção e planta');
      const button = ensureButton(collectionPanel, 'open-collections', 'Ver minhas coleções', 'collections', openCollections);
      syncPanel(collectionPanel, !hasRealContent(collectionContainer, ['.home-collection-card']), image, button);
    }

    const priorityContainer = document.querySelector('#homePriorities');
    const priorityPanel = priorityContainer?.closest('.home-priority-panel');
    if (priorityPanel) {
      const image = ensureImage(priorityPanel, 'priorities', 'Livro aberto com materiais de revisão');
      const button = ensureButton(priorityPanel, 'start-review', 'Começar a revisar', 'review', openTest);
      syncPanel(priorityPanel, !hasRealContent(priorityContainer, ['article', 'li', '[data-home-subject]', '.home-priority-item']), image, button);
    }
  }

  let queued = false;
  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncHomeEmptyStates();
    });
  }

  const observer = new MutationObserver(queueSync);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], #homeTopTab')) queueSync();
  });
  window.addEventListener('load', queueSync);
  queueSync();
})();
