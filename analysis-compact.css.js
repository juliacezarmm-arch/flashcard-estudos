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
    }

    [data-analysis-tab-panel="priorities"] .analysis-two-column {
      grid-template-columns: minmax(260px, 0.72fr) minmax(420px, 1.28fr);
    }

    #analysisStudyNow::-webkit-scrollbar,
    #analysisSubjects::-webkit-scrollbar,
    #analysisCritical::-webkit-scrollbar,
    #analysisNearMastered::-webkit-scrollbar {
      width: 7px;
    }

    #analysisStudyNow::-webkit-scrollbar-thumb,
    #analysisSubjects::-webkit-scrollbar-thumb,
    #analysisCritical::-webkit-scrollbar-thumb,
    #analysisNearMastered::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #b8c1d1;
    }

    #analysisStudyNow::-webkit-scrollbar-track,
    #analysisSubjects::-webkit-scrollbar-track,
    #analysisCritical::-webkit-scrollbar-track,
    #analysisNearMastered::-webkit-scrollbar-track {
      background: transparent;
    }

    #testPanelAnalysis .analysis-card {
      padding: 14px;
    }

    #testPanelAnalysis .analysis-card-head {
      margin-bottom: 9px;
    }

    #testPanelAnalysis .analysis-card-head h3 {
      font-size: 17px;
      line-height: 1.25;
    }

    #testPanelAnalysis .analysis-card-head h4 {
      font-size: 14px;
      line-height: 1.25;
    }

    #testPanelAnalysis .analysis-inner-tab {
      font-size: 12px;
    }

    #testPanelAnalysis .analysis-stat span,
    #testPanelAnalysis .analysis-review-card p,
    #testPanelAnalysis .analysis-note,
    #testPanelAnalysis .analysis-footnote,
    #testPanelAnalysis .analysis-review-tags {
      font-size: 12px;
      line-height: 1.35;
    }

    #testPanelAnalysis .analysis-stat small {
      font-size: 10px;
      line-height: 1.25;
    }

    [data-analysis-tab-panel="priorities"] .analysis-subcard,
    [data-analysis-tab-panel="status"] .analysis-subcard {
      height: 250px;
      padding: 12px;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
    }

    #analysisStudyNow,
    #analysisSubjects,
    #analysisCritical,
    #analysisNearMastered {
      min-height: 0;
      max-height: 198px;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 5px;
      padding-bottom: 4px;
      scrollbar-width: thin;
      scrollbar-color: #b8c1d1 transparent;
      align-content: start;
    }

    #analysisStudyNow,
    #analysisCritical,
    #analysisNearMastered {
      gap: 6px;
    }

    #analysisStudyNow .analysis-list-item,
    #analysisCritical .analysis-list-item,
    #analysisNearMastered .analysis-list-item {
      min-height: 48px;
      padding: 7px 8px;
      gap: 7px;
    }

    #analysisStudyNow .analysis-list-item {
      cursor: default;
      pointer-events: none;
    }

    #testPanelAnalysis .analysis-list-main {
      gap: 2px;
    }

    #testPanelAnalysis .analysis-list-main strong {
      font-size: 12px;
      line-height: 1.2;
    }

    #testPanelAnalysis .analysis-list-main small,
    #testPanelAnalysis .analysis-list-side {
      font-size: 10px;
      line-height: 1.2;
    }

    #testPanelAnalysis .analysis-rank {
      width: 19px;
      height: 19px;
      margin-right: 6px;
      font-size: 10px;
    }

    #analysisSubjects {
      gap: 6px;
    }

    #analysisSubjects .analysis-topic-row {
      display: grid;
      grid-template-columns: minmax(150px, 1.2fr) minmax(140px, 1fr) auto;
      gap: 8px;
      align-items: center;
      font-size: 10px;
      line-height: 1.2;
    }

    #analysisSubjects .analysis-topic-name {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    #analysisSubjects .analysis-topic-progress {
      grid-template-columns: 30px 1fr;
      gap: 5px;
    }

    #analysisSubjects .analysis-mini-bar {
      height: 4px;
    }

    @media (max-width: 900px) {
      [data-analysis-tab-panel="priorities"] .analysis-two-column {
        grid-template-columns: minmax(220px, 0.8fr) minmax(330px, 1.2fr);
      }
    }

    @media (max-width: 760px) {
      [data-analysis-tab-panel="priorities"] .analysis-two-column {
        grid-template-columns: 1fr;
      }

      [data-analysis-tab-panel="priorities"] .analysis-subcard,
      [data-analysis-tab-panel="status"] .analysis-subcard {
        height: 230px;
      }

      #analysisStudyNow,
      #analysisSubjects,
      #analysisCritical,
      #analysisNearMastered {
        max-height: 178px;
      }

      #analysisSubjects .analysis-topic-row {
        grid-template-columns: minmax(90px, 1fr) minmax(100px, 1fr) auto;
        gap: 6px;
      }
    }
  `;
  document.head.appendChild(style);

  const escape = value => typeof escapeHtml === 'function'
    ? escapeHtml(value)
    : String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[character]);

  let renderingAnalysisLists = false;
  let renderScheduled = false;

  function currentMetrics() {
    if (typeof analysisScopeSubjects !== 'function' || typeof analysisSubjectMetrics !== 'function') return [];
    return analysisScopeSubjects()
      .map(analysisSubjectMetrics)
      .sort((a, b) => b.score - a.score || a.accuracy - b.accuracy);
  }

  function renderStudyNow(metrics) {
    const container = document.querySelector('#analysisStudyNow');
    if (!container) return;

    const priorities = metrics.filter(metric => metric.score > 0 || metric.total > 0);
    const html = priorities.length
      ? priorities.map((metric, index) => {
          const reason = metric.lost
            ? `${metric.lost} perda${metric.lost === 1 ? '' : 's'} de domínio`
            : metric.wrong
              ? `${metric.wrong} erro${metric.wrong === 1 ? '' : 's'}`
              : `${metric.hard} avaliação${metric.hard === 1 ? '' : 'ões'} Difícil`;
          return `<div class="analysis-list-item" role="group" aria-label="Registro de prioridade: ${escape(metric.subject.name)}"><span class="analysis-list-main"><strong><span class="analysis-rank" style="--analysis-item-color:${index === 0 ? '#ef4444' : '#f59e0b'}">${index + 1}</span>${escape(metric.subject.name)}</strong><small>Aproveitamento: ${metric.accuracy}%</small></span><span class="analysis-list-side" style="--analysis-item-color:${index === 0 ? '#ef4444' : '#f59e0b'}">${escape(reason)}</span></div>`;
        }).join('')
      : '<p class="hint">Ainda não há prioridades suficientes para registrar.</p>';

    if (container.innerHTML !== html) container.innerHTML = html;
  }

  function renderAllAnalysisSubjects(metrics) {
    const container = document.querySelector('#analysisSubjects');
    if (!container || typeof analysisBarStatus !== 'function') return;

    const html = metrics.length
      ? metrics.map(metric => {
          const status = analysisBarStatus(metric.accuracy, metric.total > 0);
          return `<div class="analysis-topic-row"><span class="analysis-topic-name" title="${escape(metric.subject.name)}">${escape(metric.subject.name)}</span><span class="analysis-topic-progress"><strong>${metric.accuracy}%</strong><span class="analysis-mini-bar" style="--bar-color:${status.color}"><span style="width:${metric.accuracy}%"></span></span></span><span class="analysis-situation" style="--bar-color:${status.color}">${escape(status.label)}</span></div>`;
        }).join('')
      : '<p class="hint">Sem assuntos avaliados.</p>';

    if (container.innerHTML !== html) container.innerHTML = html;
  }

  function renderAnalysisLists() {
    if (renderingAnalysisLists) return;
    renderingAnalysisLists = true;
    const metrics = currentMetrics();
    renderStudyNow(metrics);
    renderAllAnalysisSubjects(metrics);
    renderingAnalysisLists = false;
  }

  function scheduleAnalysisListsRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      renderAnalysisLists();
    });
  }

  ['#analysisStudyNow', '#analysisSubjects'].forEach(selector => {
    const container = document.querySelector(selector);
    if (container) new MutationObserver(scheduleAnalysisListsRender).observe(container, { childList: true });
  });

  document.querySelectorAll('[data-test-panel="analysis"], [data-analysis-tab="priorities"]').forEach(button => {
    button.addEventListener('click', scheduleAnalysisListsRender);
  });

  scheduleAnalysisListsRender();
})();
