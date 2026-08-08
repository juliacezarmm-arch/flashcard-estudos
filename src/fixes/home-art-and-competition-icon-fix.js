/* Mantém somente o ícone vetorial da Competição.
   As ilustrações da tela Hoje são controladas por home-empty-state-art.js. */
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

  const observer = new MutationObserver(() => requestAnimationFrame(ensureCompetitionTrophy));
  observer.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('load', ensureCompetitionTrophy);
  ensureCompetitionTrophy();
})();
