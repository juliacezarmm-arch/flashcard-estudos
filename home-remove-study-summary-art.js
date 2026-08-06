(() => {
  'use strict';
  if (window.FixaRemoveStudySummaryArtV2) return;
  window.FixaRemoveStudySummaryArtV2 = true;

  document.querySelector('#fixaRemoveStudySummaryArtStyle')?.remove();

  const style = document.createElement('style');
  style.id = 'fixaRemoveStudySummaryArtStyleV2';
  style.textContent = `
    /* Remove definitivamente qualquer desenho decorativo do Estude Agora. */
    [data-home-panel="today"] .home-study-card img,
    [data-home-panel="today"] .home-study-card picture,
    [data-home-panel="today"] .home-study-card .home-data-art,
    [data-home-panel="today"] .home-study-card .home-empty-art,
    [data-home-panel="today"] .home-study-card .fixa-home-corner-art,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations) img,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations) picture,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations) .home-data-art,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations) .home-empty-art,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations) .fixa-home-corner-art,

    /* Remove definitivamente qualquer desenho decorativo do Resumo das coleções. */
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) img,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) picture,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) .home-data-art,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) .home-empty-art,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) .fixa-home-corner-art,
    #homeStudyRecommendations img,
    #homeStudyRecommendations picture,
    #homeCollectionSummary img,
    #homeCollectionSummary picture {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      max-width: 0 !important;
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      pointer-events: none !important;
    }

    [data-home-panel="today"] .home-study-card,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations),
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary) {
      padding-left: 20px !important;
      padding-right: 20px !important;
      background-image: none !important;
    }

    [data-home-panel="today"] .home-study-card::before,
    [data-home-panel="today"] .home-study-card::after,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations)::before,
    [data-home-panel="today"] .home-panel:has(#homeStudyRecommendations)::after,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary)::before,
    [data-home-panel="today"] .home-panel:has(#homeCollectionSummary)::after {
      content: none !important;
      display: none !important;
      background: none !important;
      background-image: none !important;
    }
  `;
  document.head.appendChild(style);

  function removeVisuals(panel) {
    if (!panel) return;

    panel.classList.remove(
      'has-home-data',
      'home-has-content',
      'is-home-empty',
      'fixa-home-empty-dashboard'
    );

    panel.style.setProperty('padding-left', '20px', 'important');
    panel.style.setProperty('padding-right', '20px', 'important');
    panel.style.setProperty('background-image', 'none', 'important');

    panel.querySelectorAll(
      'img, picture, .home-data-art, .home-empty-art, .fixa-home-corner-art, .fixa-priority-current-art'
    ).forEach(element => {
      element.remove();
    });
  }

  function apply() {
    const today = document.querySelector('[data-home-panel="today"]');
    const studyContainer = document.querySelector('#homeStudyRecommendations');
    const collectionContainer = document.querySelector('#homeCollectionSummary');

    const studyPanel =
      studyContainer?.closest('.home-panel') ||
      studyContainer?.closest('.home-study-card') ||
      today?.querySelector('.home-study-card');

    const collectionPanel =
      collectionContainer?.closest('.home-panel') ||
      collectionContainer?.parentElement;

    removeVisuals(studyPanel);
    removeVisuals(collectionPanel);
  }

  let queued = false;
  function queueApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  }

  const observer = new MutationObserver(queueApply);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', queueApply);
  window.addEventListener('pageshow', queueApply);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], #homeTopTab')) {
      queueApply();
      setTimeout(queueApply, 100);
      setTimeout(queueApply, 500);
    }
  });

  queueApply();
  setTimeout(queueApply, 100);
  setTimeout(queueApply, 500);
  setTimeout(queueApply, 1500);
})();
