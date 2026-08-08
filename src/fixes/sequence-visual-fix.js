(() => {
  if (document.querySelector('#sequenceVisualFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'sequenceVisualFixStyle';
  style.textContent = `
    /* Etapa 4A: altera somente a apresentação dos dias concluídos. */
    [data-home-panel="progress"] .home-sequence-day.is-study i,
    .home-sequence-day.is-study i {
      border-color: #f59e0b !important;
      background: #ffb13b !important;
      color: #111827 !important;
      font-size: 17px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
    }

    [data-home-panel="progress"] .home-sequence-day.is-study i > *,
    .home-sequence-day.is-study i > * {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  function applyCompletedDayChecks() {
    document.querySelectorAll('.home-sequence-day.is-study i').forEach(icon => {
      if (icon.dataset.sequenceVisualApplied === 'true') return;
      icon.dataset.sequenceVisualApplied = 'true';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✓';
    });
  }

  applyCompletedDayChecks();

  const target = document.querySelector('#homeFooterStats') || document.body;
  new MutationObserver(applyCompletedDayChecks).observe(target, {
    childList: true,
    subtree: true
  });
})();
