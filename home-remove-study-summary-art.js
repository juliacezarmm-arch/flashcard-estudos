(() => {
  'use strict';
  if (window.FixaRemoveStudySummaryArt) return;
  window.FixaRemoveStudySummaryArt = true;

  const style = document.createElement('style');
  style.id = 'fixaRemoveStudySummaryArtStyle';
  style.textContent = `
    [data-home-panel="today"] .fixa-no-decorative-art img,
    [data-home-panel="today"] .fixa-no-decorative-art .home-data-art,
    [data-home-panel="today"] .fixa-no-decorative-art .home-empty-art,
    [data-home-panel="today"] .fixa-no-decorative-art .fixa-home-corner-art,
    [data-home-panel="today"] .fixa-no-decorative-art .fixa-priority-current-art {
      display: none !important;
    }

    [data-home-panel="today"] .fixa-no-decorative-art {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
  `;
  document.head.appendChild(style);

  function cleanPanel(panel) {
    if (!panel) return;
    panel.classList.add('fixa-no-decorative-art');
    panel.classList.remove('has-home-data', 'home-has-content', 'is-home-empty');

    panel.querySelectorAll(
      ':scope > img, .home-data-art, .home-empty-art, .fixa-home-corner-art, .fixa-priority-current-art'
    ).forEach(element => element.remove());
  }

  function apply() {
    const todayPanel = document.querySelector('[data-home-panel="today"]');
    if (!todayPanel) return;

    const studyContainer = document.querySelector('#homeStudyRecommendations');
    const studyPanel = studyContainer?.closest('.home-panel') || todayPanel.querySelector('.home-study-card');

    const collectionContainer = document.querySelector('#homeCollectionSummary');
    const collectionPanel = collectionContainer?.closest('.home-panel');

    cleanPanel(studyPanel);
    cleanPanel(collectionPanel);
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

  new MutationObserver(queueApply).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'src', 'style']
  });

  window.addEventListener('load', queueApply);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], #homeTopTab')) queueApply();
  });

  queueApply();
})();
