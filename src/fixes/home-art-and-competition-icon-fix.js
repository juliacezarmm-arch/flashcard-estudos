/* Ícone da Competição + cabeçalho final da Home.
   Este arquivo não carrega nem redesenha o dashboard: ele cuida somente desses dois elementos. */
(() => {
  'use strict';

  if (window.FixaCompetitionIconOnlyFix) return;
  window.FixaCompetitionIconOnlyFix = true;

  document.querySelector('#fixaHomeArtCompetitionFixStyle')?.remove();

  const TROPHY_SVG = `
    <svg class="competition-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0z"></path>
      <path d="M8 6H4v2a4 4 0 0 0 4 4"></path>
      <path d="M16 6h4v2a4 4 0 0 1-4 4"></path>
      <path d="M12 13v4M8 21h8M9 17h6"></path>
    </svg>
  `;

  const style = document.createElement('style');
  style.id = 'fixaCompetitionIconOnlyStyle';
  style.textContent = `
    [data-competition-view].tab,
    [data-view="competition"].tab {
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:9px!important;
    }
    [data-competition-view] .competition-tab-icon,
    [data-view="competition"] .competition-tab-icon {
      width:18px!important;
      height:18px!important;
      flex:0 0 18px!important;
      fill:none!important;
      stroke:currentColor!important;
      stroke-width:1.9!important;
      stroke-linecap:round!important;
      stroke-linejoin:round!important;
    }
  `;
  document.head.appendChild(style);

  function ensureCompetitionTrophy() {
    const tab = document.querySelector('[data-competition-view], [data-view="competition"]');
    if (!tab) return;

    tab.querySelectorAll('span').forEach(span => {
      if (/🏆|🥇|🥈|🥉/.test(span.textContent || '')) span.remove();
    });

    let svg = tab.querySelector('svg');
    if (!svg) {
      tab.insertAdjacentHTML('afterbegin', TROPHY_SVG);
      svg = tab.querySelector('svg');
    }
    svg?.classList.add('competition-tab-icon');
  }

  const observerTarget = document.querySelector('.topbar') || document.querySelector('header');
  if (observerTarget) {
    new MutationObserver(() => requestAnimationFrame(ensureCompetitionTrophy))
      .observe(observerTarget, { childList:true, subtree:true });
  }
  window.addEventListener('load', ensureCompetitionTrophy, { once:true });
  ensureCompetitionTrophy();
})();

/* Cabeçalho do Início: saudação à esquerda e filtros à direita, na mesma linha. */
(() => {
  'use strict';
  if (window.FixaHomeCompactHeaderRowV2) return;
  window.FixaHomeCompactHeaderRowV2 = true;

  const STYLE_ID = 'fixaHomeCompactHeaderRowStyle';
  let applying = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home .home-subtabs{display:none!important}
      #home .home-hero-head{min-height:54px!important;height:auto!important;margin:0 0 4px!important;padding:0!important;align-items:stretch!important}
      #home .home-hero-actions{width:100%!important;display:block!important;margin:0!important}
      .fixa-home-header-row{width:100%;min-height:50px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;padding:0 2px}
      .fixa-home-header-left{min-width:0;display:grid;align-content:center;justify-items:start;gap:1px}
      .fixa-home-header-left #homeGreeting{margin:0!important;font-size:20px!important;line-height:24px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:5px!important;white-space:nowrap!important;text-align:left!important}
      .fixa-home-header-left #homeGreeting .home-greeting-wave{width:20px!important;height:20px!important}
      .fixa-home-header-left #homeDatePill{border:0!important;background:transparent!important;color:#64748b!important;padding:0!important;margin:0!important;font-size:9px!important;line-height:12px!important;text-align:left!important;white-space:nowrap!important}
      .fixa-home-header-right{display:flex;align-items:center;justify-content:flex-end;min-width:0}
      .fixa-home-header-right .fixa-week-filters{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important}
      #home .fixa-week-header-stack{display:none!important}
      @media(max-width:760px){
        .fixa-home-header-row{grid-template-columns:1fr;gap:7px;align-items:start;padding:4px 0 2px}
        .fixa-home-header-right{justify-content:flex-start;width:100%}
        .fixa-home-header-right .fixa-week-filters{width:100%;justify-content:flex-start!important;flex-wrap:wrap!important}
        .fixa-home-header-left #homeGreeting{font-size:19px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    if (applying) return false;
    const home = document.querySelector('#home.home-view');
    const actions = home?.querySelector('.home-hero-actions');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    const filters = home?.querySelector('.fixa-week-filters');
    if (!home || !actions || !greeting || !date || !filters) return false;

    applying = true;
    try {
      ensureStyle();
      let row = actions.querySelector('.fixa-home-header-row');
      if (!row) {
        row = document.createElement('div');
        row.className = 'fixa-home-header-row';
        row.innerHTML = '<div class="fixa-home-header-left"></div><div class="fixa-home-header-right"></div>';
        actions.prepend(row);
      }
      const left = row.querySelector('.fixa-home-header-left');
      const right = row.querySelector('.fixa-home-header-right');
      if (greeting.parentElement !== left) left.appendChild(greeting);
      if (date.parentElement !== left) left.appendChild(date);
      if (filters.parentElement !== right) right.appendChild(filters);
      return true;
    } finally {
      applying = false;
    }
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-fixa-main-tab]')) apply();
  });

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) apply();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) apply();
  });

  window.addEventListener('load', apply, { once:true });
  apply();
})();
