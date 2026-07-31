(() => {
  const style = document.createElement('style');
  style.id = 'analysisPercentAlignmentStyle';
  style.textContent = `
    #analysisSubjects .analysis-topic-progress {
      grid-template-columns: 34px minmax(0, 1fr);
    }

    #analysisSubjects .analysis-topic-progress > strong {
      display: block;
      width: 100%;
      text-align: right;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
  `;
  document.head.appendChild(style);
})();
