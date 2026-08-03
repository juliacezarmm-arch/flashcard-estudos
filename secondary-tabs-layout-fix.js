(() => {
  if (document.querySelector('#secondaryTabsLayoutFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'secondaryTabsLayoutFixStyle';
  style.textContent = `
    /* Padroniza as abas secundárias de Início, Adicionar e Teste. */
    .home-subtab,
    #add .add-mode button,
    #test .test-tabs button {
      font-size: 13px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
    }

    /* Mantém a navegação secundária do Início acima do cabeçalho. */
    .home-view > .home-shell > .home-subtabs {
      margin: 0;
      align-self: flex-start;
    }

    .home-view > .home-shell > .home-hero-head {
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  function moveHomeTabsAboveHeader() {
    const homeTabs = document.querySelector('.home-view .home-subtabs');
    const homeHeader = document.querySelector('.home-view .home-hero-head');
    if (!homeTabs || !homeHeader || homeTabs.parentElement !== homeHeader.parentElement) return;
    if (homeTabs.nextElementSibling === homeHeader) return;
    homeHeader.parentElement.insertBefore(homeTabs, homeHeader);
  }

  moveHomeTabsAboveHeader();

  const homeView = document.querySelector('.home-view');
  if (homeView) {
    new MutationObserver(moveHomeTabsAboveHeader).observe(homeView, {
      childList: true,
      subtree: true
    });
  }
})();
