(() => {
  const style = document.createElement('style');
  style.id = 'analysisCompactPriorityStyle';
  style.textContent = `
    #testPanelAnalysis,
    #testPanelAnalysis * {
      min-width: 0;
    }

    #analysisContent {
      max-height: none;
      overflow: visible;
      padding-right: 0;
      padding-bottom: 12px;
    }

    #analysisInsight {
      display: none !important;