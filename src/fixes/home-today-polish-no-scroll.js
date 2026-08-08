(() => {
  'use strict';

  if (window.FixaHomeTodayAdaptiveHeightV2) return;
  window.FixaHomeTodayAdaptiveHeightV2 = true;

  document.querySelector('#fixaHomeTodayPolishNoScrollStyle')?.remove();
  document.querySelector('#fixaHomeTodayAdaptiveHeightStyle')?.remove();

  const style = document.createElement('style');
  style.id = 'fixaHomeTodayAdaptiveHeightStyle';
  style.textContent = `
    /*
      A tela Hoje preserva toda a largura original.
      Somente medidas verticais são comprimidas quando necessário.
    */
    @media (min-width: 761px) {
      body.home-active main {
        box-sizing: border-box !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
      }

      /* Na aba Hoje não exibimos barra vertical. */
      body.home-active.fixa-home-today-fit main {
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }

      body.home-active.fixa-home-today-fit main::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      body.home-active.fixa-home-today-fit .home-view.active {
        min-height: 0 !important;
        max-height: 100% !important;
      }

      /* Primeiro nível: compactação suave. */
      body.home-active.fixa-home-today-compact main {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }

      body.home-active.fixa-home-today-compact .home-view.active > .home-shell,
      body.home-active.fixa-home-today-compact [data-home-panel="today"] > .home-shell {
        gap: 12px !important;
      }

      body.home-active.fixa-home-today-compact .home-title h2 {
        font-size: 26px !important;
        line-height: 30px !important;
      }

      body.home-active.fixa-home-today-compact .home-summary-grid {
        gap: 12px !important;
      }

      body.home-active.fixa-home-today-compact .home-card {
        min-height: 74px !important;
        padding-top: 9px !important;
        padding-bottom: 9px !important;
      }

      body.home-active.fixa-home-today-compact .home-today-grid {
        gap: 12px !important;
      }

      body.home-active.fixa-home-today-compact [data-home-panel="today"] .home-panel {
        padding-top: 13px !important;
        padding-bottom: 13px !important;
      }

      body.home-active.fixa-home-today-compact .home-panel-head {
        margin-bottom: 8px !important;
      }

      body.home-active.fixa-home-today-compact .home-study-head {
        min-height: 52px !important;
        margin-bottom: 7px !important;
      }

      body.home-active.fixa-home-today-compact .home-recommendation-list {
        gap: 8px !important;
        margin-top: 8px !important;
      }

      body.home-active.fixa-home-today-compact .home-recommendation {
        min-height: 52px !important;
        padding-top: 7px !important;
        padding-bottom: 7px !important;
      }

      body.home-active.fixa-home-today-compact .home-collection-grid {
        gap: 9px !important;
      }

      body.home-active.fixa-home-today-compact .home-collection-card {
        min-height: 104px !important;
        padding-top: 10px !important;
        padding-bottom: 10px !important;
      }

      body.home-active.fixa-home-today-compact .home-collection-head {
        margin-bottom: 6px !important;
      }

      body.home-active.fixa-home-today-compact .home-priority-item {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }

      body.home-active.fixa-home-today-compact .home-priority-head {
        margin-bottom: 5px !important;
      }

      body.home-active.fixa-home-today-compact .home-priority-sub {
        margin-top: 4px !important;
        margin-bottom: 5px !important;
      }

      /* Segundo nível: usado apenas em telas mais baixas. */
      body.home-active.fixa-home-today-tight main {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
      }

      body.home-active.fixa-home-today-tight .home-view.active > .home-shell,
      body.home-active.fixa-home-today-tight [data-home-panel="today"] > .home-shell {
        gap: 8px !important;
      }

      body.home-active.fixa-home-today-tight .home-title h2 {
        font-size: 24px !important;
        line-height: 28px !important;
      }

      body.home-active.fixa-home-today-tight .home-summary-grid {
        gap: 10px !important;
      }

      body.home-active.fixa-home-today-tight .home-card {
        min-height: 68px !important;
        padding-top: 7px !important;
        padding-bottom: 7px !important;
      }

      body.home-active.fixa-home-today-tight .home-card-number {
        font-size: 22px !important;
        line-height: 25px !important;
      }

      body.home-active.fixa-home-today-tight .home-today-grid {
        gap: 10px !important;
      }

      body.home-active.fixa-home-today-tight [data-home-panel="today"] .home-panel {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
      }

      body.home-active.fixa-home-today-tight .home-panel-head {
        margin-bottom: 6px !important;
      }

      body.home-active.fixa-home-today-tight .home-study-head {
        min-height: 46px !important;
        margin-bottom: 5px !important;
      }

      body.home-active.fixa-home-today-tight .home-kicker {
        margin-bottom: 2px !important;
        line-height: 14px !important;
      }

      body.home-active.fixa-home-today-tight .home-muted {
        line-height: 17px !important;
      }

      body.home-active.fixa-home-today-tight .home-recommendation-list {
        gap: 6px !important;
        margin-top: 5px !important;
      }

      body.home-active.fixa-home-today-tight .home-recommendation {
        min-height: 48px !important;
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }

      body.home-active.fixa-home-today-tight .home-recommendation small {
        margin-top: 1px !important;
        line-height: 14px !important;
      }

      body.home-active.fixa-home-today-tight .home-collection-grid {
        gap: 7px !important;
      }

      body.home-active.fixa-home-today-tight .home-collection-card {
        min-height: 96px !important;
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }

      body.home-active.fixa-home-today-tight .home-collection-head {
        margin-bottom: 4px !important;
      }

      body.home-active.fixa-home-today-tight .home-priority-panel .home-panel-head p {
        line-height: 15px !important;
      }

      body.home-active.fixa-home-today-tight .home-priority-scroll {
        padding-bottom: 1px !important;
      }

      body.home-active.fixa-home-today-tight .home-priority-item {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }

      body.home-active.fixa-home-today-tight .home-priority-head {
        margin-bottom: 4px !important;
      }

      body.home-active.fixa-home-today-tight .home-priority-sub {
        margin-top: 3px !important;
        margin-bottom: 4px !important;
      }
    }
  `;
  document.head.appendChild(style);

  const FIT = 'fixa-home-today-fit';
  const COMPACT = 'fixa-home-today-compact';
  const TIGHT = 'fixa-home-today-tight';

  const isDesktop = () => window.matchMedia('(min-width: 761px)').matches;

  function todayIsActive() {
    const home = document.querySelector('#home.home-view.active');
    const today = home?.querySelector('[data-home-panel="today"]');
    return Boolean(
      isDesktop()
      && document.body.classList.contains('home-active')
      && home
      && today
      && !today.hidden
    );
  }

  function mainOverflows(main) {
    if (!main) return false;
    return main.scrollHeight > main.clientHeight + 2;
  }

  let fitting = false;
  async function fitTodayHeight() {
    if (fitting) return;
    fitting = true;

    try {
      const body = document.body;
      const main = document.querySelector('.app:not(.locked) main') || document.querySelector('main');

      body.classList.remove(FIT, COMPACT, TIGHT);

      if (!todayIsActive() || !main) return;

      /* A aba Hoje nunca exibe barra vertical no desktop. */
      body.classList.add(FIT);
      main.scrollTop = 0;

      await new Promise(resolve => requestAnimationFrame(resolve));

      if (!mainOverflows(main)) return;

      /* Se passar da altura disponível, reduz apenas medidas verticais. */
      body.classList.add(COMPACT);
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (!mainOverflows(main)) return;

      /* Em telas ainda mais baixas, aplica o segundo nível. */
      body.classList.add(TIGHT);
      await new Promise(resolve => requestAnimationFrame(resolve));

      /* Mantém FIT mesmo aqui: a barra não reaparece. */
      main.scrollTop = 0;
    } finally {
      fitting = false;
    }
  }

  let queued = false;
  let lastFitRun = 0;
  function queueFit() {
    if (!todayIsActive() || document.hidden) return;
    const now = Date.now();
    if (queued || now - lastFitRun < 180) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!todayIsActive() || document.hidden) return;
      lastFitRun = Date.now();
      fitTodayHeight();
    });
  }

  window.addEventListener('resize', queueFit, { passive: true });
  window.addEventListener('orientationchange', queueFit, { passive: true });
  window.addEventListener('load', queueFit);
  window.addEventListener('pageshow', queueFit);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) queueFit();
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], #homeTopTab')) {
      setTimeout(queueFit, 0);
      setTimeout(queueFit, 180);
    }
  });

  const homeObserver = new MutationObserver(() => {
    if (todayIsActive()) queueFit();
  });
  const startObserver = () => {
    const home = document.querySelector('#home');
    if (!home) {
      setTimeout(startObserver, 250);
      return;
    }
    homeObserver.observe(home, { childList: true, subtree: false });
    queueFit();
  };

  startObserver();
})();
