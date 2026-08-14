/* Ícone da Competição + cabeçalho final da Home.
   Este arquivo não redesenha o dashboard. */
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
      .fixa-home-header-left #homeGreeting{margin:0!important;font-size:22px!important;line-height:26px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:5px!important;white-space:nowrap!important;text-align:left!important}
      .fixa-home-header-left #homeGreeting .home-greeting-wave{width:22px!important;height:22px!important}
      .fixa-home-header-left #homeDatePill{border:0!important;background:transparent!important;color:#64748b!important;padding:0!important;margin:0!important;font-size:12px!important;line-height:15px!important;text-align:left!important;white-space:nowrap!important}
      .fixa-home-header-right{display:flex;align-items:center;justify-content:flex-end;min-width:0;transform:translateY(6px)}
      .fixa-home-header-right .fixa-week-filters{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important}
      .fixa-home-header-right #fixaWeekFolderFilter{font-size:12.5px!important}
      .fixa-home-header-right .fixa-week-period button{font-size:12.5px!important}
      #home .fixa-week-header-stack{display:none!important}
      @media(max-width:760px){
        .fixa-home-header-row{grid-template-columns:1fr;gap:7px;align-items:start;padding:4px 0 2px}
        .fixa-home-header-right{justify-content:flex-start;width:100%;transform:none}
        .fixa-home-header-right .fixa-week-filters{width:100%;justify-content:flex-start!important;flex-wrap:wrap!important}
        .fixa-home-header-left #homeGreeting{font-size:20px!important}
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

/* Carrega uma única vez o complemento de metas, XP e proteção de sequência. */
(() => {
  'use strict';
  if (document.getElementById('fixaHomeGoalsStreakProtectionV1Loader')) return;
  const script = document.createElement('script');
  script.id = 'fixaHomeGoalsStreakProtectionV1Loader';
  script.src = 'src/fixes/home-goals-streak-protection-v1.js?v=20260814-streak-goals-v3';
  script.defer = true;
  document.head.appendChild(script);
})();

/* Ajuste visual isolado: a proteção congelada copia exatamente o tamanho da sequência. */
(() => {
  'use strict';
  if (window.FixaFrozenStreakExactSizeV1) return;
  window.FixaFrozenStreakExactSizeV1 = true;

  function findStreakBox(right) {
    return Array.from(right.querySelectorAll('button,div,span')).find(el => {
      if (el.classList.contains('fixa-streak-freeze-box')) return false;
      return /^\s*[^\d]*\d+\s+dias?\s*$/i.test((el.textContent || '').trim());
    }) || right.querySelector('[class*=streak], [class*=sequence]');
  }

  function applyFrozenSize() {
    const right = document.querySelector('.topbar-right');
    const freeze = right?.querySelector('.fixa-streak-freeze-box');
    const streak = right ? findStreakBox(right) : null;
    if (!freeze || !streak) return false;

    const rect = streak.getBoundingClientRect();
    const css = getComputedStyle(streak);
    if (!rect.width || !rect.height) return false;

    freeze.style.setProperty('width', `${rect.width}px`, 'important');
    freeze.style.setProperty('min-width', `${rect.width}px`, 'important');
    freeze.style.setProperty('max-width', `${rect.width}px`, 'important');
    freeze.style.setProperty('height', `${rect.height}px`, 'important');
    freeze.style.setProperty('min-height', `${rect.height}px`, 'important');
    freeze.style.setProperty('max-height', `${rect.height}px`, 'important');
    freeze.style.setProperty('padding', css.padding, 'important');
    freeze.style.setProperty('border-radius', css.borderRadius, 'important');
    freeze.style.setProperty('font-size', css.fontSize, 'important');
    freeze.style.setProperty('font-weight', css.fontWeight, 'important');
    freeze.style.setProperty('line-height', css.lineHeight, 'important');
    freeze.style.setProperty('box-sizing', css.boxSizing, 'important');
    freeze.style.setProperty('align-items', 'center', 'important');
    freeze.style.setProperty('justify-content', 'center', 'important');
    return true;
  }

  let queued = false;
  function queueApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyFrozenSize();
    });
  }

  const target = document.querySelector('.topbar-right') || document.querySelector('.topbar') || document.body;
  new MutationObserver(queueApply).observe(target, { childList:true, subtree:true, characterData:true });
  window.addEventListener('resize', queueApply);
  window.addEventListener('load', queueApply, { once:true });
  queueApply();
})();

/* Painel branco principal: ocupa o restante da tela e só rola quando o conteúdo precisar. */
(() => {
  'use strict';
  if (window.FixaHomeMainPanelFillViewportV1) return;
  window.FixaHomeMainPanelFillViewportV1 = true;

  const STYLE_ID = 'fixaHomeMainPanelFillViewportStyle';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #home .fixa-week-main-shell{
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        margin-bottom:0!important;
      }
      #home .fixa-week-content-tabs{
        flex:0 0 auto!important;
      }
      #home .fixa-week-main-stage{
        flex:1 1 auto!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        scrollbar-width:thin;
        overscroll-behavior:contain;
      }
      #home .fixa-week-main-stage>[data-fixa-main-panel]{
        min-height:100%!important;
        height:auto!important;
        overflow:visible!important;
      }
      #home .fixa-week-main-stage>[data-fixa-main-panel][hidden]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function resizePanel() {
    ensureStyle();
    const shell = document.querySelector('#home .fixa-week-main-shell');
    if (!shell || shell.offsetParent === null) return false;

    const top = shell.getBoundingClientRect().top;
    const bottomGap = 8;
    const available = Math.max(240, Math.floor(window.innerHeight - top - bottomGap));

    shell.style.setProperty('height', `${available}px`, 'important');
    shell.style.setProperty('min-height', `${available}px`, 'important');
    shell.style.setProperty('max-height', `${available}px`, 'important');
    return true;
  }

  let frame = 0;
  function scheduleResize() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(resizePanel);
  }

  window.addEventListener('resize', scheduleResize);
  window.addEventListener('load', scheduleResize, { once:true });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-week-period]')) {
      requestAnimationFrame(scheduleResize);
    }
  }, true);
  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) requestAnimationFrame(scheduleResize);
  }, true);

  const observer = new MutationObserver(scheduleResize);
  observer.observe(document.body, { childList:true, subtree:true });
  scheduleResize();
})();

/* Tipografia da Home: aumenta a leitura sem alterar dimensões ou espaçamentos dos componentes. */
(() => {
  'use strict';
  if (window.FixaHomeComfortTypographyV1) return;
  window.FixaHomeComfortTypographyV1 = true;

  const style = document.createElement('style');
  style.id = 'fixaHomeComfortTypographyStyle';
  style.textContent = `
    @media (min-width:861px){
      #home .fixa-week-top-head h3{font-size:13px!important;line-height:16px!important}
      #home .fixa-week-top-head>b{font-size:11px!important}
      #home .fixa-week-top-card>small{font-size:9.5px!important;line-height:11px!important}
      #home .fixa-week-day i{font-size:10px!important}
      #home .fixa-week-day b{font-size:9px!important}

      #home .fixa-week-summary-card strong{font-size:12px!important;line-height:14px!important}
      #home .fixa-week-summary-card small{font-size:9.5px!important;line-height:11px!important}

      #home .fixa-week-content-tabs button{font-size:11px!important}
      #home .fixa-week-main-pane .home-panel-head h3,
      #home .home-study-card .home-study-head h3{font-size:13px!important;line-height:17px!important}
      #home .home-study-card #homeStudyText{font-size:9.5px!important}

      #home .fixa-week-performance-row>span{font-size:10.5px!important}
      #home .fixa-week-performance-row>b{font-size:11.5px!important}
      #home .fixa-week-goal-head strong{font-size:10.5px!important;line-height:12px!important}
      #home .fixa-week-goal-head small{font-size:8.5px!important}
      #home .fixa-goal-reward{font-size:8px!important}
      #home .fixa-week-add-goals{font-size:9px!important}

      #home .fixa-review-reference-head strong{font-size:10px!important;line-height:12px!important}
      #home .fixa-review-reference-head span{font-size:8.5px!important}
      #home .fixa-review-reference-head b{font-size:8.5px!important}
      #home .fixa-review-all{font-size:9px!important}
      #home .fixa-review-empty-compact{font-size:9.5px!important}

      #home .fixa-week-collection .home-collection-name,
      #home .fixa-week-collection .home-collection-total{font-size:9.5px!important}
      #home .fixa-week-collection .home-collection-metrics b{font-size:10.5px!important}
      #home .fixa-week-collection .home-collection-metrics small{font-size:7.5px!important}
      #home .fixa-week-collection .home-collection-foot>span,
      #home .fixa-collection-xp{font-size:8.5px!important}

      #home .fixa-unified-head h3{font-size:14px!important;line-height:18px!important}
      #home .fixa-unified-head p{font-size:9px!important}
      #home .fixa-unified-priority-copy strong{font-size:10.5px!important}
      #home .fixa-unified-priority-copy small{font-size:8.5px!important}
      #home .fixa-unified-priority-level{font-size:8px!important}
      #home .fixa-unified-priority-score{font-size:9.5px!important}

      #home .fixa-question-group-head{font-size:10px!important}
      #home .fixa-question-line strong{font-size:9.5px!important}
      #home .fixa-question-line small{font-size:8px!important}
      #home .fixa-question-chip{font-size:8px!important}
      #home .fixa-question-empty{font-size:9px!important}

      #home .fixa-week-activities-panel .home-panel-head h3{font-size:13px!important}
      #home .home-activity-title{font-size:10px!important}
      #home .home-activity-time,
      #home .home-activity-body small,
      #home .home-test-meta{font-size:8.5px!important}
      #home .home-test-name,
      #home .home-test-score{font-size:10px!important}

      #home .fixa-chart-axis{font-size:10px!important}
    }
  `;
  document.head.appendChild(style);
})();
