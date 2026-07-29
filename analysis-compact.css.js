(() => {
  const style = document.createElement('style');
  style.id = 'analysisCompactPriorityStyle';
  style.textContent = `
    [data-analysis-tab-panel="priorities"] .analysis-subcard{height:250px;padding:12px;display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden}
    [data-analysis-tab-panel="priorities"] .analysis-card-head{margin-bottom:9px}
    [data-analysis-tab-panel="priorities"] .analysis-card-head h4{font-size:14px}
    #analysisStudyNow,#analysisSubjects{min-height:0;max-height:198px;overflow-y:auto;overflow-x:hidden;padding-right:5px;scrollbar-width:thin;scrollbar-color:#b8c1d1 transparent}
    #analysisStudyNow{gap:6px;align-content:start}
    #analysisStudyNow .analysis-list-item{min-height:48px;padding:7px 8px;gap:7px}
    #analysisStudyNow .analysis-list-main{gap:2px}
    #analysisStudyNow .analysis-list-main strong{font-size:12px;line-height:1.2}
    #analysisStudyNow .analysis-list-main small,#analysisStudyNow .analysis-list-side{font-size:10px;line-height:1.2}
    #analysisStudyNow .analysis-rank{width:19px;height:19px;margin-right:6px;font-size:10px}
    #analysisSubjects{gap:6px;align-content:start}
    #analysisSubjects .analysis-topic-row{grid-template-columns:minmax(82px,1.05fr) minmax(92px,1fr) auto;gap:6px;font-size:10px;line-height:1.2}
    #analysisSubjects .analysis-topic-progress{grid-template-columns:30px 1fr;gap:5px}
    #analysisSubjects .analysis-mini-bar{height:4px}
    @media(max-width:760px){[data-analysis-tab-panel="priorities"] .analysis-subcard{height:230px}#analysisStudyNow,#analysisSubjects{max-height:178px}}
  `;
  document.head.appendChild(style);
})();
