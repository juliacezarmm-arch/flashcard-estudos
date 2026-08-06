/* Remove ilustrações grandes adicionadas e garante troféu no botão Competição */
(() => {
  "use strict";

  if (window.FixaHomeArtCompetitionFix) return;

  const TROPHY_SVG = `
    <svg class="competition-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0z"></path>
      <path d="M8 6H4v2a4 4 0 0 0 4 4"></path>
      <path d="M16 6h4v2a4 4 0 0 1-4 4"></path>
      <path d="M12 13v4M8 21h8M9 17h6"></path>
    </svg>
  `;

  const style = document.createElement("style");
  style.id = "fixaHomeArtCompetitionFixStyle";
  style.textContent = `
    /* As imagens grandes foram acrescentadas pelo módulo de estados vazios.
       As imagens originais dos cards continuam preservadas. */
    .home-empty-art[data-home-art="study"],
    .home-empty-art[data-home-art="priorities"] {
      display: none !important;
    }

    /* Mantém o espaço do conteúdo limpo, sem reservar área para as figuras grandes. */
    .home-study-card.is-home-empty,
    .home-priority-panel.is-home-empty {
      padding-right: 18px !important;
    }

    /* O ícone da competição segue o mesmo padrão visual dos demais botões do topo. */
    [data-competition-view].tab,
    [data-view="competition"].tab {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 9px !important;
    }

    [data-competition-view] .competition-tab-icon,
    [data-view="competition"] .competition-tab-icon {
      width: 18px !important;
      height: 18px !important;
      flex: 0 0 18px !important;
      fill: none !important;
      stroke: currentColor !important;
      stroke-width: 1.9 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
  `;
  document.head.appendChild(style);

  function removeLargeHomeArts() {
    document.querySelectorAll(
      '.home-empty-art[data-home-art="study"], .home-empty-art[data-home-art="priorities"]'
    ).forEach(image => image.remove());
  }

  function ensureCompetitionTrophy() {
    const tab = document.querySelector('[data-competition-view], [data-view="competition"]');
    if (!tab) return;

    const currentSvg = tab.querySelector("svg");
    if (currentSvg) {
      currentSvg.classList.add("competition-tab-icon");
      return;
    }

    tab.insertAdjacentHTML("afterbegin", TROPHY_SVG);
  }

  function applyFixes() {
    removeLargeHomeArts();
    ensureCompetitionTrophy();
  }

  const observer = new MutationObserver(applyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", applyFixes);
  document.addEventListener("click", event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], [data-competition-view]')) {
      requestAnimationFrame(applyFixes);
    }
  });

  applyFixes();
  window.FixaHomeArtCompetitionFix = true;
})();
