(() => {
  'use strict';

  if (window.FixaHomeReadableLayoutV1) return;
  window.FixaHomeReadableLayoutV1 = true;

  const asset = file => encodeURI(`referencias/${file}`);
  const originalSummaryArt = Object.freeze({
    'Coleções': 'icone_livros_colecoes.png',
    'Questões': 'ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png',
    'Dominadas': 'icone_trofeu_dominadas.png',
    'Aproveitamento': 'ChatGPT Image 1 de ago. de 2026, 12_31_23.png'
  });

  const style = document.createElement('style');
  style.id = 'fixaHomeReadableLayoutV1Style';
  style.textContent = `
    @media (min-width: 1160px) {
      body.home-active #appShell > main {
        padding-top: 10px !important;
      }

      #home > .home-shell {
        gap: 6px !important;
      }

      #home .home-hero-head {
        min-height: 44px !important;
        align-items: flex-end !important;
      }

      #home .home-title {
        min-width: 0;
        display: grid !important;
        align-content: end !important;
        gap: 3px !important;
      }

      #home .home-title h2 {
        font-size: 26px !important;
        line-height: 1.08 !important;
      }

      #home .home-date-pill.fixa-date-under-greeting {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 11px !important;
        line-height: 1.25 !important;
        color: #64748b !important;
      }

      #home .home-hero-actions {
        align-self: flex-end !important;
        padding-bottom: 1px !important;
      }

      .fixa-week-folder-filter {
        height: 34px !important;
        min-width: 180px !important;
      }

      .fixa-week-folder-filter select {
        font-size: 11px !important;
      }

      .fixa-week-period button {
        height: 34px !important;
        padding: 0 13px !important;
        font-size: 11px !important;
      }

      .fixa-week-top-head h3 {
        font-size: 12px !important;
        line-height: 15px !important;
      }

      .fixa-week-top-head > b {
        font-size: 10px !important;
      }

      .fixa-week-main-value {
        font-size: 22px !important;
        line-height: 23px !important;
      }

      .fixa-week-top-card > small {
        font-size: 9.5px !important;
        line-height: 11px !important;
      }

      .fixa-week-day b {
        font-size: 8.5px !important;
      }

      .fixa-week-summary-card {
        height: 66px !important;
        min-height: 66px !important;
        grid-template-columns: 40px minmax(0, 1fr) !important;
        gap: 9px !important;
      }

      .fixa-week-summary-card .home-card-number {
        font-size: 20px !important;
        line-height: 21px !important;
      }

      .fixa-week-summary-card strong {
        font-size: 11px !important;
        line-height: 13px !important;
      }

      .fixa-week-summary-card small {
        font-size: 9px !important;
        line-height: 10px !important;
      }

      .fixa-week-summary-icon.fixa-original-summary-art {
        width: 40px !important;
        height: 40px !important;
        border-radius: 0 !important;
        background: transparent !important;
      }

      .fixa-week-summary-icon.fixa-original-summary-art img {
        display: block !important;
        width: 40px !important;
        height: 40px !important;
        object-fit: contain !important;
      }

      .home-today-grid > .home-panel {
        height: 204px !important;
        min-height: 204px !important;
      }

      .home-today-grid .home-panel-head h3,
      .home-study-card .home-study-head h3 {
        font-size: 12px !important;
        line-height: 15px !important;
      }

      .home-study-card #homeStudyText {
        font-size: 9px !important;
        line-height: 11px !important;
      }

      .fixa-week-review-head strong {
        font-size: 10.5px !important;
      }

      .fixa-week-review-head span,
      .fixa-week-review-meta span,
      .fixa-week-review-meta b {
        font-size: 8.5px !important;
      }

      .fixa-week-collection .home-collection-name,
      .fixa-week-collection .home-collection-total {
        font-size: 9.5px !important;
      }

      .fixa-week-collection .home-collection-metrics b {
        font-size: 11px !important;
      }

      .fixa-week-collection .home-collection-metrics small {
        font-size: 8px !important;
      }

      .fixa-week-collection .home-collection-foot > span:first-child,
      .fixa-collection-xp {
        font-size: 8.5px !important;
      }

      .fixa-week-performance-row > span {
        font-size: 9px !important;
      }

      .fixa-week-performance-row > b {
        font-size: 10px !important;
      }

      .fixa-week-add-goals {
        font-size: 8.5px !important;
      }

      .fixa-week-goal-head strong {
        font-size: 9px !important;
        line-height: 11px !important;
      }

      .fixa-week-goal-head small {
        font-size: 8px !important;
      }

      .fixa-week-analysis-card {
        height: 148px !important;
        min-height: 148px !important;
      }

      .fixa-week-analysis-card .home-panel-head h3 {
        font-size: 11px !important;
        line-height: 13px !important;
      }

      .fixa-week-analysis-card .home-panel-head p {
        font-size: 8px !important;
        line-height: 10px !important;
      }

      .fixa-week-priority-row {
        font-size: 8.8px !important;
      }

      .fixa-week-priority-row > b,
      .fixa-week-priority-row > strong,
      .fixa-week-status-list > div {
        font-size: 8px !important;
      }
    }
  `;
  document.head.appendChild(style);

  function moveDateUnderGreeting() {
    const title = document.querySelector('#home .home-title');
    const date = document.querySelector('#homeDatePill');
    const greeting = document.querySelector('#homeGreeting');
    if (!title || !date || !greeting) return;
    if (date.parentElement !== title || date.previousElementSibling !== greeting) {
      greeting.insertAdjacentElement('afterend', date);
    }
    date.classList.add('fixa-date-under-greeting');
  }

  function restoreSummaryIcons() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return;

    grid.querySelectorAll('.fixa-week-summary-card').forEach(card => {
      const label = card.querySelector('strong')?.textContent?.trim();
      const file = originalSummaryArt[label];
      if (!file) return;

      const icon = card.querySelector('.fixa-week-summary-icon');
      if (!icon) return;

      const current = icon.querySelector('img')?.dataset?.fixaOriginalFile;
      if (current === file) return;

      icon.classList.add('fixa-original-summary-art');
      icon.innerHTML = `<img src="${asset(file)}" data-fixa-original-file="${file.replace(/"/g, '&quot;')}" alt="" aria-hidden="true">`;
    });
  }

  function installSummaryObserver() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid || grid.dataset.fixaReadableObserver === '1') return;
    grid.dataset.fixaReadableObserver = '1';
    new MutationObserver(() => requestAnimationFrame(restoreSummaryIcons))
      .observe(grid, { childList: true });
  }

  function apply() {
    moveDateUnderGreeting();
    restoreSummaryIcons();
    installSummaryObserver();
  }

  function queueApply(delay = 0) {
    window.setTimeout(() => requestAnimationFrame(apply), delay);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-fixa-week-period], [data-view="home"], #homeTopTab, [data-home-tab="today"]')) {
      queueApply(20);
    }
  });

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) queueApply(20);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => queueApply(0), { once: true });
  } else {
    queueApply(0);
  }
  queueApply(120);
  queueApply(420);
})();