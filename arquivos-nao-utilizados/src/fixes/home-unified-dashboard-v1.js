(() => {
  'use strict';

  if (window.FixaHomeUnifiedDashboardV1) return;
  window.FixaHomeUnifiedDashboardV1 = true;

  const STYLE_ID = 'fixaHomeUnifiedDashboardV1Style';
  let applying = false;
  let firstTabApplied = false;
  let refreshTimer = 0;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const icon = name => {
    const paths = {
      star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path>',
      list: '<path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>',
      chart: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.chart}</g></svg>`;
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Uma única caixa branca para todo o conteúdo do Início. */
      #home .fixa-week-analysis-shell{display:none!important}
      #home .fixa-week-main-shell{margin-bottom:20px!important}
      #home [data-home-panel="today"]>.home-shell{padding-bottom:22px!important}
      #home .fixa-week-content-tabs{gap:2px!important;overflow-x:auto!important;scrollbar-width:none!important}
      #home .fixa-week-content-tabs::-webkit-scrollbar{display:none!important}
      #home .fixa-week-content-tabs button{padding:0 12px!important}
      #home .fixa-week-content-tabs button svg{width:13px!important;height:13px!important;flex:0 0 13px!important}
      #home .fixa-week-unified-tab{display:inline-flex!important;align-items:center!important;gap:5px!important}
      #home .fixa-week-main-stage{height:255px!important;min-height:255px!important}
      #home .fixa-week-unified-pane{height:100%;min-height:0;overflow:hidden}
      #home .fixa-week-unified-pane[hidden]{display:none!important}

      /* Revisões: formato compacto da referência. */
      #home .home-study-card .home-study-head{margin:0 0 5px!important;padding-left:2px!important;overflow:visible!important}
      #home .home-study-card .home-study-head h3{padding-left:1px!important;overflow:visible!important;line-height:17px!important}
      #home .home-study-card #homeStudyText{margin:1px 0 6px!important}
      #home .home-study-card .home-focus-box{height:199px!important;max-height:199px!important;padding:0!important;overflow:hidden!important}
      #home #homeStudyRecommendations.fixa-review-reference-list{height:100%;display:grid!important;grid-template-rows:repeat(4,minmax(0,1fr)) 27px;gap:4px!important;overflow:hidden!important;padding:0!important}
      #home .fixa-review-reference-row{min-height:0;padding:5px 7px;border:1px solid #e3e9f2;border-radius:7px;background:#fff;cursor:pointer;display:grid;align-content:center;gap:3px}
      #home .fixa-review-reference-row:hover{border-color:#bdd2fb;background:#fbfdff}
      #home .fixa-review-reference-head{display:grid;grid-template-columns:minmax(0,1fr) auto 34px;gap:7px;align-items:center}
      #home .fixa-review-reference-head strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:11px}
      #home .fixa-review-reference-head span{color:#687086;font-size:7.2px;white-space:nowrap}
      #home .fixa-review-reference-head b{text-align:right;font-size:7.6px;color:#53617a}
      #home .fixa-review-reference-bar{height:3px;border-radius:999px;background:#e8edf5;overflow:hidden}
      #home .fixa-review-reference-bar span{display:block;height:100%;border-radius:inherit;background:#2563eb}
      #home .fixa-review-all{height:27px;min-height:27px;border:1px solid #dbe7fb!important;border-radius:7px!important;padding:0 8px!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#2563eb!important;background:#f6f9ff!important;font-size:7.6px!important;font-weight:850!important;box-shadow:none!important}
      #home .fixa-review-all:hover{background:#eef4ff!important}
      #home .fixa-review-empty-compact{grid-row:1/-1;display:grid;place-items:center;text-align:center;color:#687086;font-size:8.5px}

      /* Resumo das coleções em duas colunas. */
      #home .fixa-week-main-pane .home-collection-scroll{height:207px!important;max-height:207px!important;padding-right:3px!important}
      #home .home-collection-grid.fixa-week-collection-list{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
      #home .fixa-week-collection{min-height:98px!important;height:98px!important;padding:7px 8px!important}
      #home .fixa-week-collection .home-collection-name,#home .fixa-week-collection .home-collection-total{font-size:8px!important}
      #home .fixa-week-collection .home-collection-metrics{margin:5px 0 3px!important}
      #home .fixa-week-collection .home-collection-metrics b{font-size:9.5px!important}
      #home .fixa-week-collection .home-collection-metrics small{font-size:6.5px!important}
      #home .fixa-week-collection .home-collection-foot{margin-top:4px!important}

      /* Prioridades compactas. */
      #home .fixa-unified-head{margin:0 0 9px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      #home .fixa-unified-head h3{margin:0;font-size:13px;line-height:17px}
      #home .fixa-unified-head p{margin:2px 0 0;color:#7b879b;font-size:8px}
      #home .fixa-unified-priority-list{height:205px;display:grid;gap:6px;overflow-y:auto;padding-right:3px;scrollbar-width:thin}
      #home .fixa-unified-priority-row{min-height:43px;display:grid;grid-template-columns:minmax(0,1fr) 55px 38px;gap:8px;align-items:center;padding:7px 9px;border:1px solid #e5eaf2;border-radius:8px;background:#fff}
      #home .fixa-unified-priority-copy{min-width:0}.fixa-unified-priority-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.3px}.fixa-unified-priority-copy small{display:block;margin-top:2px;color:#7b879b;font-size:7.2px}
      #home .fixa-unified-priority-level{padding:3px 5px;border-radius:999px;text-align:center;font-size:7px;font-weight:850}.fixa-unified-priority-level.high{color:#c2413b;background:#fff0ef}.fixa-unified-priority-level.medium{color:#a16207;background:#fff7df}.fixa-unified-priority-level.low{color:#15803d;background:#ecf9f0}
      #home .fixa-unified-priority-score{text-align:right;font-size:8.5px;color:#53617a}

      /* Status por questão individual. */
      #home .fixa-unified-question-status{height:205px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;min-width:0}
      #home .fixa-question-group{min-width:0;border:1px solid #e5eaf2;border-radius:9px;padding:8px;background:#fff;display:grid;grid-template-rows:auto minmax(0,1fr);gap:6px;overflow:hidden}
      #home .fixa-question-group-head{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:850}.fixa-question-group-head i{width:7px;height:7px;border-radius:50%;display:block}.fixa-question-group.good .fixa-question-group-head i{background:#22c55e}.fixa-question-group.bad .fixa-question-group-head i{background:#ef6b63}
      #home .fixa-question-group-list{display:grid;align-content:start;gap:4px;overflow-y:auto;padding-right:2px;scrollbar-width:thin}
      #home .fixa-question-line{min-height:30px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;padding:5px 6px;border-bottom:1px solid #edf1f6}
      #home .fixa-question-line:last-child{border-bottom:0}
      #home .fixa-question-line strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8.5px}.fixa-question-line small{display:block;margin-top:1px;color:#8490a6;font-size:6.7px}
      #home .fixa-question-chip{padding:3px 6px;border-radius:999px;font-size:6.8px;font-weight:850;white-space:nowrap}.fixa-question-chip.good{color:#15803d;background:#eaf8ef}.fixa-question-chip.bad{color:#b45309;background:#fff5df}
      #home .fixa-question-empty{display:grid;place-items:center;height:100%;text-align:center;color:#7b879b;font-size:8px}

      /* Gráfico ocupa toda a área disponível. */
      #home .fixa-unified-chart-pane{display:grid;grid-template-rows:auto minmax(0,1fr);gap:3px}
      #home .fixa-unified-chart-pane .fixa-unified-head{margin-bottom:0!important}
      #home .fixa-unified-chart-box{height:220px;min-height:0;width:100%;overflow:hidden}
      #home .fixa-unified-chart-box svg{width:100%;height:100%;display:block}
      #home .fixa-chart-grid{stroke:#dfe7f2;stroke-width:1;stroke-dasharray:3 4}.fixa-chart-axis{fill:#7a879b;font-size:9px}.fixa-chart-line{fill:none;stroke:#2563eb;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}.fixa-chart-area{fill:url(#fixaUnifiedChartGradient)}.fixa-chart-dot{fill:#fff;stroke:#2563eb;stroke-width:2}

      /* O botão secundário Análise deixou de existir em Teste. */
      #test [data-test-panel="analysis"],#test .test-tab[data-test-panel="analysis"]{display:none!important}

      @media(max-width:900px){
        #home .fixa-week-content-tabs button{padding:0 10px!important}
        #home .home-collection-grid.fixa-week-collection-list{grid-template-columns:1fr!important}
        #home .fixa-week-collection{height:auto!important;min-height:77px!important}
      }
      @media(max-width:760px){
        #home .fixa-week-main-stage{height:auto!important;min-height:255px!important}
        #home .fixa-unified-question-status{grid-template-columns:1fr;height:auto}
        #home .fixa-question-group{min-height:170px}
      }
    `;
    document.head.appendChild(style);
  }

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  }

  function allSubjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function selectedSubjects() {
    const folderId = document.querySelector('#fixaWeekFolderFilter')?.value || 'all';
    if (folderId === 'all') return allSubjects();
    return allSubjects().filter(subject => String(subject.folder || '') === String(folderId));
  }

  function cardsFor(subject) {
    return Array.isArray(subject?.cards) ? subject.cards : [];
  }

  function dateOf(value) {
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function attemptDate(attempt) {
    return dateOf(attempt?.date || attempt?.created_at || attempt?.createdAt || attempt?.answeredAt);
  }

  function testDate(test) {
    return dateOf(test?.completedAt || test?.finishedAt || test?.date);
  }

  function attemptCorrect(attempt) {
    if (typeof attempt?.correct === 'boolean') return attempt.correct;
    const value = String(attempt?.correct ?? '').toLowerCase();
    return value === 'true' || value === '1' || value === 'sim' || value === 'yes';
  }

  function attemptsOf(card) {
    return Array.isArray(card?.attemptHistory) ? card.attemptHistory : [];
  }

  function cardTotals(card) {
    const attempts = attemptsOf(card);
    if (attempts.length) {
      const correct = attempts.filter(attemptCorrect).length;
      return { correct, wrong: attempts.length - correct, total: attempts.length };
    }
    const correct = Number(card?.totalCorrect || 0);
    const wrong = Number(card?.totalWrong || 0);
    return { correct, wrong, total: correct + wrong };
  }

  function accuracyOf(card) {
    const totals = cardTotals(card);
    return totals.total ? Math.round(totals.correct / totals.total * 100) : 0;
  }

  function latestAttempt(card) {
    return attemptsOf(card).slice().sort((a, b) => (attemptDate(b)?.getTime() || 0) - (attemptDate(a)?.getTime() || 0))[0] || null;
  }

  function reviewScore(card) {
    const totals = cardTotals(card);
    if (!totals.total) return -1;
    const accuracy = accuracyOf(card);
    const last = latestAttempt(card);
    const rating = String(card?.lastRating || last?.rating || '').toLowerCase();
    const hard = rating === 'hard' || rating.includes('dif');
    const latestCorrect = last ? attemptCorrect(last) : totals.correct >= totals.wrong;
    return (hard ? 30 : 0) + totals.wrong * 9 + Math.max(0, 75 - accuracy) + (latestCorrect ? 0 : 18);
  }

  function codeOf(card, index) {
    const code = String(card?.questionCode || card?.code || card?.id || '').trim();
    return code || `Questão ${index + 1}`;
  }

  function currentRange() {
    const active = document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
    const now = new Date();
    const startOfDay = value => { const date = new Date(value); date.setHours(0,0,0,0); return date; };
    if (active === 'today') {
      const start = startOfDay(now); const end = new Date(start); end.setHours(23,59,59,999);
      return { start, end, period: active };
    }
    if (active === 'month') {
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999), period: active };
    }
    const start = startOfDay(now); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    return { start, end, period: active };
  }

  function selectedSubjectIds() {
    return new Set(selectedSubjects().map(subject => String(subject.id || '')));
  }

  function testBelongs(test) {
    const ids = selectedSubjectIds();
    if (!ids.size || selectedSubjects().length === allSubjects().length) return true;
    if (ids.has(String(test?.subjectId || ''))) return true;
    if (Array.isArray(test?.subjectIds) && test.subjectIds.map(String).some(id => ids.has(id))) return true;
    const names = new Set(selectedSubjects().map(subject => subject.name));
    return names.has(test?.subject);
  }

  function testsInRange() {
    const range = currentRange();
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0)
      .filter(testBelongs)
      .filter(test => { const date = testDate(test); return date && date >= range.start && date <= range.end; });
  }

  function subjectReviewRows() {
    return selectedSubjects().map(subject => {
      const attempted = cardsFor(subject).map((card, index) => ({ card, index, score: reviewScore(card), accuracy: accuracyOf(card) })).filter(item => item.score >= 0);
      if (!attempted.length) return null;
      attempted.sort((a, b) => b.score - a.score);
      const recommended = attempted.slice(0, 10);
      const accuracy = Math.round(recommended.reduce((sum, item) => sum + item.accuracy, 0) / recommended.length);
      const need = recommended.filter(item => item.score >= 40).length;
      return { subject, count: recommended.length, accuracy, need, score: recommended.reduce((sum, item) => sum + item.score, 0) };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 4);
  }

  function renderReviewReference() {
    const list = document.querySelector('#homeStudyRecommendations');
    if (!list) return;
    const rows = subjectReviewRows();
    list.className = 'home-recommendation-list fixa-review-reference-list';
    if (!rows.length) {
      list.innerHTML = '<div class="fixa-review-empty-compact">Nenhuma revisão recomendada ainda. Faça alguns testes para gerar sugestões.</div>';
      return;
    }
    const rowHtml = rows.map(row => `<article class="fixa-review-reference-row" data-home-subject="${esc(row.subject.id)}" tabindex="0"><div class="fixa-review-reference-head"><strong>${esc(row.subject.name)}</strong><span>${row.count} quest${row.count === 1 ? 'ão' : 'ões'}</span><b>${row.accuracy}%</b></div><div class="fixa-review-reference-bar"><span style="width:${Math.max(3,row.accuracy)}%"></span></div></article>`).join('');
    const blanks = Array.from({ length: Math.max(0, 4 - rows.length) }, () => '<span aria-hidden="true"></span>').join('');
    list.innerHTML = `${rowHtml}${blanks}<button type="button" class="fixa-review-all">Ver todas as revisões</button>`;
    const text = document.querySelector('.home-study-card #homeStudyText');
    if (text) text.textContent = 'Questões recomendadas com base no seu desempenho.';
  }

  function subjectPriorityRows() {
    return selectedSubjects().map(subject => {
      const attempted = cardsFor(subject).map(card => ({ card, totals: cardTotals(card), accuracy: accuracyOf(card), score: reviewScore(card) })).filter(item => item.totals.total > 0);
      if (!attempted.length) return null;
      const correct = attempted.reduce((sum, item) => sum + item.totals.correct, 0);
      const total = attempted.reduce((sum, item) => sum + item.totals.total, 0);
      const accuracy = total ? Math.round(correct / total * 100) : 0;
      const review = attempted.filter(item => item.score >= 40).length;
      const priority = review * 12 + Math.max(0, 70 - accuracy) + attempted.reduce((sum, item) => sum + Math.max(0,item.score), 0) / attempted.length;
      return { subject, accuracy, review, priority };
    }).filter(Boolean).sort((a,b) => b.priority - a.priority).slice(0, 5);
  }

  function renderPriorities(panel) {
    const rows = subjectPriorityRows();
    panel.innerHTML = `<div class="fixa-unified-head"><div><h3>Prioridades</h3><p>Assuntos que mais precisam da sua atenção.</p></div></div><div class="fixa-unified-priority-list">${rows.length ? rows.map((row,index) => {
      const level = index === 0 || row.accuracy < 45 ? 'Alta' : row.accuracy < 65 ? 'Média' : 'Baixa';
      const tone = level === 'Alta' ? 'high' : level === 'Média' ? 'medium' : 'low';
      return `<div class="fixa-unified-priority-row"><span class="fixa-unified-priority-copy"><strong>${esc(row.subject.name)}</strong><small>${row.review} para reforçar</small></span><b class="fixa-unified-priority-level ${tone}">${level}</b><strong class="fixa-unified-priority-score">${row.accuracy}%</strong></div>`;
    }).join('') : '<div class="fixa-question-empty">Faça alguns testes para o Fixa identificar suas prioridades.</div>'}</div>`;
  }

  function individualQuestionRows() {
    const good = [];
    const bad = [];
    selectedSubjects().forEach(subject => cardsFor(subject).forEach((card,index) => {
      const totals = cardTotals(card);
      if (!totals.total) return;
      const accuracy = accuracyOf(card);
      const score = reviewScore(card);
      const last = latestAttempt(card);
      const latestCorrect = last ? attemptCorrect(last) : totals.correct >= totals.wrong;
      const item = { code: codeOf(card,index), subject: subject.name || 'Coleção', accuracy, attempts: totals.total };
      if (score >= 45 || accuracy < 55 || !latestCorrect) bad.push({ ...item, score });
      else if (accuracy >= 70 && latestCorrect) good.push({ ...item, score });
    }));
    good.sort((a,b) => b.accuracy - a.accuracy || b.attempts - a.attempts);
    bad.sort((a,b) => b.score - a.score || a.accuracy - b.accuracy);
    return { good: good.slice(0, 12), bad: bad.slice(0, 12) };
  }

  function questionGroup(items, type) {
    const isGood = type === 'good';
    return `<section class="fixa-question-group ${type}"><div class="fixa-question-group-head"><i></i>${isGood ? 'Questões boas' : 'Precisa revisar'}</div><div class="fixa-question-group-list">${items.length ? items.map(item => `<div class="fixa-question-line"><span><strong>${esc(item.code)}</strong><small>${esc(item.subject)} · ${item.accuracy}% de acertos</small></span><b class="fixa-question-chip ${type}">${isGood ? 'Boa' : 'Revisar'}</b></div>`).join('') : `<div class="fixa-question-empty">${isGood ? 'Nenhuma questão se destacou como boa ainda.' : 'Nenhuma questão crítica encontrada.'}</div>`}</div></section>`;
  }

  function renderQuestionStatus(panel) {
    const { good, bad } = individualQuestionRows();
    panel.innerHTML = `<div class="fixa-unified-head"><div><h3>Status das questões</h3><p>Questões individuais que estão indo bem e as que precisam de reforço.</p></div></div><div class="fixa-unified-question-status">${questionGroup(good,'good')}${questionGroup(bad,'bad')}</div>`;
  }

  function bucketChartData() {
    const range = currentRange();
    const tests = testsInRange();
    const source = [];
    if (tests.length) {
      tests.forEach(test => source.push({ date: testDate(test), correct: Number(test.score || 0), total: Number(test.total || 0) }));
    } else {
      selectedSubjects().forEach(subject => cardsFor(subject).forEach(card => attemptsOf(card).forEach(attempt => {
        const date = attemptDate(attempt);
        if (date && date >= range.start && date <= range.end) source.push({ date, correct: attemptCorrect(attempt) ? 1 : 0, total: 1 });
      })));
    }

    const formatDay = date => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][date.getDay()];
    if (range.period === 'today') {
      const total = source.reduce((sum,item) => sum + item.total,0);
      const correct = source.reduce((sum,item) => sum + item.correct,0);
      return [{ label: 'Hoje', value: total ? Math.round(correct / total * 100) : 0 }];
    }
    if (range.period === 'month') {
      const buckets = [1,8,15,22,29].map((start,index) => ({ start, end: index === 4 ? 31 : start + 6, correct:0,total:0,label:`${start}-${index === 4 ? 'fim' : start+6}` }));
      source.forEach(item => { const bucket = buckets[Math.min(4,Math.floor((item.date.getDate()-1)/7))]; bucket.correct += item.correct; bucket.total += item.total; });
      return buckets.map(item => ({ label:item.label, value:item.total ? Math.round(item.correct/item.total*100) : 0 }));
    }
    const points = [];
    for (let i=0;i<7;i+=1) {
      const date = new Date(range.start); date.setDate(date.getDate()+i);
      const same = source.filter(item => item.date && item.date.getFullYear()===date.getFullYear() && item.date.getMonth()===date.getMonth() && item.date.getDate()===date.getDate());
      const total = same.reduce((sum,item)=>sum+item.total,0);
      const correct = same.reduce((sum,item)=>sum+item.correct,0);
      points.push({ label: formatDay(date), value: total ? Math.round(correct/total*100) : 0 });
    }
    return points;
  }

  function chartSvg(points) {
    const width = 960, height = 195, left = 42, right = 18, top = 9, bottom = 27;
    const plotW = width-left-right, plotH = height-top-bottom;
    const values = points.length ? points : [{label:'-',value:0}];
    const step = values.length > 1 ? plotW/(values.length-1) : plotW/2;
    const coords = values.map((point,index) => {
      const x = values.length > 1 ? left + step*index : left + plotW/2;
      const y = top + plotH - Math.max(0,Math.min(100,point.value))/100*plotH;
      return { ...point, x, y };
    });
    const line = coords.map(point => `${point.x},${point.y}`).join(' ');
    const area = coords.length > 1 ? `M${coords[0].x},${top+plotH} L${coords.map(point => `${point.x},${point.y}`).join(' L')} L${coords[coords.length-1].x},${top+plotH} Z` : '';
    const grids = [0,25,50,75,100].map(value => {
      const y = top + plotH - value/100*plotH;
      return `<line class="fixa-chart-grid" x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"></line><text class="fixa-chart-axis" x="${left-9}" y="${y+3}" text-anchor="end">${value}%</text>`;
    }).join('');
    const labels = coords.map(point => `<text class="fixa-chart-axis" x="${point.x}" y="${height-6}" text-anchor="middle">${esc(point.label)}</text>`).join('');
    const dots = coords.map(point => `<circle class="fixa-chart-dot" cx="${point.x}" cy="${point.y}" r="4"></circle>`).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de desempenho"><defs><linearGradient id="fixaUnifiedChartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa" stop-opacity=".28"></stop><stop offset="100%" stop-color="#60a5fa" stop-opacity=".03"></stop></linearGradient></defs>${grids}${area ? `<path class="fixa-chart-area" d="${area}"></path>` : ''}<polyline class="fixa-chart-line" points="${line}"></polyline>${dots}${labels}</svg>`;
  }

  function renderChart(panel) {
    const points = bucketChartData();
    panel.classList.add('fixa-unified-chart-pane');
    panel.innerHTML = `<div class="fixa-unified-head"><div><h3>Gráfico de desempenho</h3></div></div><div class="fixa-unified-chart-box">${chartSvg(points)}</div>`;
  }

  function ensurePanel(stage, key) {
    let panel = stage.querySelector(`[data-fixa-main-panel="${key}"]`);
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'fixa-week-unified-pane';
      panel.dataset.fixaMainPanel = key;
      panel.hidden = true;
      stage.appendChild(panel);
    }
    panel.classList.add('fixa-week-unified-pane');
    return panel;
  }

  function setTabs(shell) {
    const nav = shell.querySelector('.fixa-week-content-tabs');
    if (!nav) return false;
    const wanted = [
      ['performance-goals','Desempenho e objetivos',''],
      ['review-summary','Revisões e resumo',''],
      ['activities','Atividades',''],
      ['priorities','Prioridades',icon('star')],
      ['status','Status das questões',icon('list')],
      ['chart','Gráfico de desempenho',icon('chart')]
    ];
    const existingKeys = Array.from(nav.querySelectorAll('[data-fixa-main-tab]')).map(button => button.dataset.fixaMainTab).join('|');
    const wantedKeys = wanted.map(item => item[0]).join('|');
    if (existingKeys !== wantedKeys) {
      nav.innerHTML = wanted.map(([key,label,svg]) => `<button type="button" class="fixa-week-unified-tab" role="tab" aria-selected="false" data-fixa-main-tab="${key}">${svg}${label}</button>`).join('');
    }
    return true;
  }

  function hideTestAnalysisButton() {
    const test = document.querySelector('#test');
    if (!test) return;
    test.querySelectorAll('[data-test-panel="analysis"]').forEach(button => {
      button.hidden = true;
      button.setAttribute('aria-hidden','true');
      button.tabIndex = -1;
      button.style.setProperty('display','none','important');
    });
    test.querySelectorAll('button').forEach(button => {
      if ((button.textContent || '').trim().toLowerCase() === 'análise' || (button.textContent || '').trim().toLowerCase() === 'analise') {
        button.hidden = true;
        button.setAttribute('aria-hidden','true');
        button.tabIndex = -1;
        button.style.setProperty('display','none','important');
      }
    });
  }

  function apply() {
    if (applying) return false;
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const shell = today?.querySelector('.fixa-week-main-shell');
    const stage = shell?.querySelector('.fixa-week-main-stage');
    if (!home || !today || !shell || !stage) return false;

    applying = true;
    try {
      ensureStyle();
      hideTestAnalysisButton();
      setTabs(shell);

      const oldAnalysis = today.querySelector('.fixa-week-analysis-shell');
      if (oldAnalysis) oldAnalysis.style.setProperty('display','none','important');

      const priorities = ensurePanel(stage,'priorities');
      const status = ensurePanel(stage,'status');
      const chart = ensurePanel(stage,'chart');
      renderPriorities(priorities);
      renderQuestionStatus(status);
      renderChart(chart);
      renderReviewReference();

      if (!firstTabApplied) {
        firstTabApplied = true;
        window.setTimeout(() => shell.querySelector('[data-fixa-main-tab="performance-goals"]')?.click(), 30);
      }
      return true;
    } finally {
      applying = false;
    }
  }

  function schedule(delay = 0) {
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => requestAnimationFrame(apply), delay);
  }

  function wrapDashboardRefresh() {
    const api = window.FixaHomeWeeklyDashboardV2;
    if (!api || typeof api.refresh !== 'function' || api.__unifiedDashboardWrapped) return false;
    const original = api.refresh.bind(api);
    api.refresh = (...args) => {
      const result = original(...args);
      schedule(100);
      window.setTimeout(apply, 220);
      return result;
    };
    Object.defineProperty(api,'__unifiedDashboardWrapped',{ value:true, configurable:false });
    return true;
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-week-period],[data-view="test"]')) {
      schedule(80);
      window.setTimeout(apply,180);
      window.setTimeout(hideTestAnalysisButton,100);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) schedule(100);
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule(80);
  });

  let tries = 0;
  const boot = window.setInterval(() => {
    tries += 1;
    wrapDashboardRefresh();
    hideTestAnalysisButton();
    const ready = apply();
    if ((ready && wrapDashboardRefresh() && tries >= 8) || tries >= 40) window.clearInterval(boot);
  }, 250);

  window.addEventListener('load', () => { schedule(100); window.setTimeout(apply,500); }, { once:true });
  wrapDashboardRefresh();
  schedule(0);
})();
