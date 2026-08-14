(() => {
  'use strict';

  if (window.FixaHomeStudyInsightsV1) return;
  window.FixaHomeStudyInsightsV1 = true;

  const STYLE_ID = 'fixaHomeStudyInsightsV1Style';
  const REVIEW_FIRST_ART = 'referencias/home-revisar-primeiro.webp';
  const REVIEW_OK_ART = 'referencias/home-revisoes-hoje.webp';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const svg = name => {
    const paths = {
      book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2V4Z"></path><path d="M7 4v14a2 2 0 0 0 2 2"></path>',
      target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle>',
      check: '<path d="m5 12 4 4L19 6"></path>',
      alert: '<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4M12 16h.01"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.target}</g></svg>`;
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Navegação principal: mesma altura e alinhamento em todas as páginas. */
      .topbar{min-height:52px!important}
      .topbar-right .tabs .tab{height:42px!important;min-height:42px!important;padding-top:0!important;padding-bottom:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}
      main>.view.active:not(.home-view){margin-top:0!important}
      @media(min-width:761px){
        .app:has(#questions.view.active) main,.app:has(#test.view.active) main,.app:has(#competition.view.active) main{align-content:stretch!important}
        #questions.view.active,#test.view.active,#competition.view.active{align-self:start!important;margin-top:0!important}
      }

      /* Revisões. */
      .home-study-card .home-study-head{padding-left:3px!important;overflow:visible!important}
      .home-study-card .home-study-head h3{padding-left:1px!important;overflow:visible!important;line-height:17px!important}
      .fixa-review-suggestions{display:grid!important;gap:6px!important;padding:1px 2px 2px 1px!important}
      .fixa-review-card{min-height:54px;padding:7px 9px;border:1px solid #e1e8f2;border-radius:9px;background:#fff;cursor:pointer;transition:.15s ease}
      .fixa-review-card:hover{border-color:#bdd2fb;box-shadow:0 3px 10px rgba(37,99,235,.06)}
      .fixa-review-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .fixa-review-head strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px}
      .fixa-review-count{flex:0 0 auto;padding:3px 6px;border-radius:999px;color:#b45309;background:#fff4df;font-size:7.5px;font-weight:850}
      .fixa-review-action{margin:2px 0 4px;color:#687086;font-size:7.8px;line-height:10px}
      .fixa-review-progress-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#7b879b;font-size:7.3px}
      .fixa-review-progress{height:4px;margin-top:3px;border-radius:999px;background:#e9eef5;overflow:hidden}
      .fixa-review-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2563eb,#60a5fa)}
      .fixa-review-empty{height:174px;display:grid;place-items:center;text-align:center;align-content:center;gap:5px;color:#687086}
      .fixa-review-empty img{width:66px;height:66px;object-fit:contain;display:block}
      .fixa-review-empty strong{color:#334155;font-size:9.5px}.fixa-review-empty span{max-width:300px;font-size:8px;line-height:11px}

      /* Status por categoria. */
      #fixaWeekStatus.fixa-category-status{height:200px!important;display:block!important;overflow-y:auto!important;overflow-x:hidden!important;padding:1px 3px 2px 1px!important;scrollbar-width:thin}
      .fixa-category-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .fixa-category-card{min-width:0;min-height:82px;padding:8px 9px;border:1px solid #e4eaf3;border-radius:10px;background:#fff}
      .fixa-category-head{display:flex;align-items:center;gap:7px;min-width:0}
      .fixa-category-icon{width:26px;height:26px;flex:0 0 26px;border-radius:8px;display:grid;place-items:center;color:#2563eb;background:#eef4ff}.fixa-category-icon svg{width:14px;height:14px}
      .fixa-category-name{min-width:0;flex:1}.fixa-category-name strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.3px}.fixa-category-name small{display:block;margin-top:1px;color:#8490a6;font-size:7px}
      .fixa-category-chip{flex:0 0 auto;padding:3px 6px;border-radius:999px;font-size:7px;font-weight:850;white-space:nowrap}
      .fixa-category-chip.good{color:#15803d;background:#ecf9f0}.fixa-category-chip.ok{color:#a16207;background:#fff7df}.fixa-category-chip.bad{color:#c2413b;background:#fff0ef}
      .fixa-category-meta{margin:6px 0 4px;display:flex;align-items:center;justify-content:space-between;gap:6px;color:#6b778c;font-size:7.4px}.fixa-category-meta b{color:#334155;font-size:8.5px}
      .fixa-category-bar{height:4px;border-radius:999px;background:#e9eef5;overflow:hidden}.fixa-category-bar span{display:block;height:100%;border-radius:inherit}.fixa-category-bar span.good{background:#22c55e}.fixa-category-bar span.ok{background:#f59e0b}.fixa-category-bar span.bad{background:#ef6b63}
      .fixa-category-empty{height:180px;display:grid;place-items:center;text-align:center;color:#687086;font-size:9px}

      /* Prioridades + gráfico de status. */
      #fixaWeekPriorities.fixa-priority-with-donut{height:205px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 182px!important;gap:14px!important;overflow:hidden!important;padding:0!important}
      .fixa-priority-refined-list{min-width:0;display:grid;gap:6px;overflow-y:auto;padding-right:3px;scrollbar-width:thin}
      .fixa-priority-refined-row{min-height:43px;display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center;padding:6px 8px;border:1px solid #e5ebf3;border-radius:9px;background:#fff}
      .fixa-priority-refined-icon{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#2563eb;background:#eef4ff}.fixa-priority-refined-icon svg{width:14px;height:14px}.fixa-priority-refined-icon.bad{color:#dc4c45;background:#fff0ef}.fixa-priority-refined-icon.ok{color:#b77900;background:#fff7df}
      .fixa-priority-refined-copy{min-width:0}.fixa-priority-refined-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.3px}.fixa-priority-refined-copy small{display:block;margin-top:2px;color:#7b879b;font-size:7.2px}
      .fixa-priority-refined-score{text-align:right}.fixa-priority-refined-score b{display:block;font-size:10px}.fixa-priority-refined-score span{display:inline-block;margin-top:2px;padding:2px 5px;border-radius:999px;font-size:6.8px;font-weight:850}.fixa-priority-refined-score span.bad{color:#c2413b;background:#fff0ef}.fixa-priority-refined-score span.ok{color:#a16207;background:#fff7df}.fixa-priority-refined-score span.good{color:#15803d;background:#ecf9f0}
      .fixa-priority-status-summary{border-left:1px solid #edf1f6;display:grid;justify-items:center;align-content:center;gap:7px;padding-left:13px}
      .fixa-priority-status-summary>strong{font-size:9.5px;color:#334155}.fixa-insight-donut{width:122px;height:122px;border-radius:50%;display:grid;place-items:center;position:relative}.fixa-insight-donut:after{content:"";position:absolute;inset:24px;border-radius:50%;background:#fff}.fixa-insight-donut span{position:relative;z-index:1;text-align:center}.fixa-insight-donut b{display:block;font-size:20px;line-height:22px}.fixa-insight-donut small{display:block;color:#7b879b;font-size:7px}
      .fixa-donut-legend{display:grid;grid-template-columns:repeat(2,auto);gap:4px 8px;color:#687086;font-size:6.8px}.fixa-donut-legend span{display:flex;align-items:center;gap:4px}.fixa-donut-legend i{width:6px;height:6px;border-radius:50%;display:block}

      @media(max-width:760px){
        .fixa-category-status-grid{grid-template-columns:1fr}
        #fixaWeekPriorities.fixa-priority-with-donut{grid-template-columns:1fr!important;height:auto!important;overflow:visible!important}
        .fixa-priority-status-summary{border-left:0;border-top:1px solid #edf1f6;padding:12px 0 0}
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
    const subjects = allSubjects();
    if (folderId === 'all') return subjects;
    return subjects.filter(subject => String(subject.folder || '') === String(folderId));
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

  function startOfDay(base = new Date()) {
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function currentRange() {
    const period = document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
    const now = new Date();
    if (period === 'today') {
      const start = startOfDay(now);
      const end = new Date(start); end.setHours(23, 59, 59, 999);
      return { start, end, period };
    }
    if (period === 'month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        period
      };
    }
    const start = startOfDay(now);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
    return { start, end, period };
  }

  function inRange(date, range = currentRange()) {
    return Boolean(date && date >= range.start && date <= range.end);
  }

  function attemptsOf(card) {
    return Array.isArray(card?.attemptHistory) ? card.attemptHistory : [];
  }

  function attemptCorrect(attempt) {
    if (typeof attempt?.correct === 'boolean') return attempt.correct;
    const value = String(attempt?.correct ?? '').toLowerCase();
    return value === 'true' || value === '1' || value === 'sim' || value === 'yes';
  }

  function cardTotals(card) {
    const attempts = attemptsOf(card);
    let correct = attempts.filter(attemptCorrect).length;
    let wrong = Math.max(0, attempts.length - correct);
    if (!attempts.length) {
      correct = Number(card?.totalCorrect || 0);
      wrong = Number(card?.totalWrong || 0);
    }
    return { correct, wrong, total: correct + wrong };
  }

  function isMasteredCard(card) {
    const status = String(card?.status || '').toLowerCase();
    if (status === 'mastered' || status.includes('dominad')) return true;
    try { return typeof isMastered === 'function' && isMastered(card); } catch (_) { return false; }
  }

  function isFrozenCard(card) {
    const status = String(card?.status || '').toLowerCase();
    return status === 'frozen' || status.includes('congel');
  }

  function latestAttempt(card) {
    return attemptsOf(card).slice().sort((a, b) => (attemptDate(b)?.getTime() || 0) - (attemptDate(a)?.getTime() || 0))[0] || null;
  }

  function reviewNeed(card) {
    if (!card || isMasteredCard(card) || isFrozenCard(card)) return { needed: false, score: -1, hard: false };
    const totals = cardTotals(card);
    if (!totals.total) return { needed: false, score: -1, hard: false };
    const accuracy = totals.total ? Math.round(totals.correct / totals.total * 100) : 0;
    const last = latestAttempt(card);
    const rating = String(card.lastRating || last?.rating || '').toLowerCase();
    const hard = rating === 'hard' || rating.includes('dif');
    const lastDate = dateOf(card.lastReviewedAt) || attemptDate(last);
    const ageDays = lastDate ? Math.max(0, (Date.now() - lastDate.getTime()) / 86400000) : 30;
    const needed = hard || totals.wrong > totals.correct || accuracy < 70 || ageDays >= 5;
    const score = (hard ? 6 : 0) + totals.wrong * 2.5 + Math.max(0, 70 - accuracy) / 10 + Math.min(8, ageDays / 2);
    return { needed, score, hard, accuracy, ageDays };
  }

  function dateKey(date) {
    return date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
  }

  function activityDays() {
    const days = new Set();
    const tests = Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [];
    tests.forEach(test => {
      if (test?.cancelled || test?.canceled || test?.interrupted || Number(test?.total || 0) <= 0) return;
      const date = testDate(test);
      if (date) days.add(dateKey(date));
    });
    allSubjects().forEach(subject => cardsFor(subject).forEach(card => attemptsOf(card).forEach(attempt => {
      const date = attemptDate(attempt);
      if (date) days.add(dateKey(date));
    })));
    return days;
  }

  function correctedStreak(days) {
    if (!days.size) return 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function patchSequence() {
    const card = document.querySelector('#homeFooterStats .fixa-week-top-card:first-child');
    if (!card) return;
    const days = activityDays();
    const streak = correctedStreak(days);
    const label = card.querySelector('.fixa-week-top-head>b');
    if (label) label.textContent = `${streak} dia${streak === 1 ? '' : 's'} seguidos`;

    const weekStart = startOfDay(new Date());
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    card.querySelectorAll('.fixa-week-day').forEach((node, index) => {
      const date = new Date(weekStart); date.setDate(date.getDate() + index);
      const active = days.has(dateKey(date));
      node.classList.toggle('active', active);
      const circle = node.querySelector('i');
      if (circle) circle.textContent = active ? '✓' : '';
    });
  }

  function reviewGroups() {
    const range = currentRange();
    return selectedSubjects().map(subject => {
      const attempted = cardsFor(subject)
        .filter(card => !isMasteredCard(card) && !isFrozenCard(card) && cardTotals(card).total > 0)
        .map(card => ({ card, need: reviewNeed(card) }))
        .sort((a, b) => b.need.score - a.need.score);
      let candidates = attempted.filter(item => item.need.needed);
      if (!candidates.length && attempted.length) candidates = attempted.filter(item => item.need.accuracy < 85).slice(0, 5);
      if (!candidates.length) return null;
      candidates = candidates.slice(0, 10);
      const target = candidates.length;
      const hardCount = candidates.filter(item => item.need.hard).length;
      const done = candidates.filter(({ card }) => {
        const last = latestAttempt(card);
        if (!last || !inRange(attemptDate(last), range)) return false;
        const rating = String(last.rating || card.lastRating || '').toLowerCase();
        return attemptCorrect(last) || rating === 'good' || rating === 'easy';
      }).length;
      const averageScore = candidates.reduce((sum, item) => sum + item.need.score, 0) / target;
      return { subject, candidates, target, hardCount, done, averageScore };
    }).filter(Boolean).sort((a, b) => b.averageScore - a.averageScore || b.target - a.target);
  }

  function renderReviews() {
    const list = document.querySelector('#homeStudyRecommendations');
    if (!list) return;
    const groups = reviewGroups().slice(0, 4);
    const hasAnyAttempts = allSubjects().some(subject => cardsFor(subject).some(card => cardTotals(card).total > 0));

    list.className = 'home-recommendation-list fixa-review-suggestions';
    if (!groups.length) {
      const image = hasAnyAttempts ? REVIEW_OK_ART : REVIEW_FIRST_ART;
      const title = hasAnyAttempts ? 'Revisões em dia' : 'Comece pelo primeiro teste';
      const text = hasAnyAttempts
        ? 'Quando uma questão precisar de reforço, a sugestão e a barra de progresso aparecerão aqui.'
        : 'Faça um teste para o Fixa identificar as questões que merecem revisão.';
      list.innerHTML = `<div class="home-review-item fixa-review-empty"><img src="${image}" alt="" aria-hidden="true"><strong>${title}</strong><span>${text}</span></div>`;
      return;
    }

    list.innerHTML = groups.map(group => {
      const progress = group.target ? Math.min(100, Math.round(group.done / group.target * 100)) : 0;
      const action = group.hardCount
        ? `Revisar ${group.target} questão${group.target === 1 ? '' : 'ões'} difícil${group.target === 1 ? '' : 'eis'} ou com mais erros.`
        : `Reforçar ${group.target} questão${group.target === 1 ? '' : 'ões'} com menor aproveitamento.`;
      return `<article class="fixa-review-card" data-home-subject="${esc(group.subject.id)}" tabindex="0">
        <div class="fixa-review-head"><strong>${esc(group.subject.name)}</strong><span class="fixa-review-count">${group.target} para revisar</span></div>
        <p class="fixa-review-action">${action}</p>
        <div class="fixa-review-progress-meta"><span>${group.done} de ${group.target} concluídas neste período</span><b>${progress}%</b></div>
        <div class="fixa-review-progress"><span style="width:${progress}%"></span></div>
      </article>`;
    }).join('');
  }

  function cleanCategory(value, fallback) {
    const text = String(value || '').trim();
    if (!text || /^sem categoria$/i.test(text) || /^não informado$/i.test(text)) return fallback;
    return text;
  }

  function categoryStats(useAllTime = false) {
    const range = currentRange();
    const map = new Map();
    selectedSubjects().forEach(subject => {
      cardsFor(subject).forEach(card => {
        if (isFrozenCard(card)) return;
        const name = cleanCategory(card.category || card.topic || card.subtopic, subject.name || 'Sem categoria');
        if (!map.has(name)) map.set(name, { name, questions: 0, correct: 0, attempts: 0, reinforce: 0, subjects: new Set() });
        const item = map.get(name);
        item.questions += 1;
        item.subjects.add(subject.name || 'Coleção');
        if (reviewNeed(card).needed) item.reinforce += 1;
        attemptsOf(card).forEach(attempt => {
          const date = attemptDate(attempt);
          if (!useAllTime && !inRange(date, range)) return;
          item.attempts += 1;
          if (attemptCorrect(attempt)) item.correct += 1;
        });
      });
    });
    return Array.from(map.values()).map(item => {
      item.accuracy = item.attempts ? Math.round(item.correct / item.attempts * 100) : 0;
      item.tone = item.accuracy >= 75 ? 'good' : item.accuracy >= 55 ? 'ok' : 'bad';
      item.label = item.tone === 'good' ? 'Muito bem' : item.tone === 'ok' ? 'Indo bem' : 'Precisa melhorar';
      return item;
    }).filter(item => item.attempts > 0);
  }

  function statusCategories() {
    let items = categoryStats(false);
    let historical = false;
    if (!items.length) {
      items = categoryStats(true);
      historical = items.length > 0;
    }
    const toneOrder = { bad: 0, ok: 1, good: 2 };
    items.sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone] || b.attempts - a.attempts || a.name.localeCompare(b.name, 'pt-BR'));
    return { items, historical };
  }

  function renderStatusByCategory() {
    const panel = document.querySelector('[data-fixa-analysis-panel="status"]');
    const box = document.querySelector('#fixaWeekStatus');
    if (!panel || !box) return;
    const head = panel.querySelector('.home-panel-head h3');
    const sub = panel.querySelector('.home-panel-head p');
    if (head) head.textContent = 'Como você está por assunto';

    const { items, historical } = statusCategories();
    if (sub) sub.textContent = historical
      ? 'Sem tentativas neste período; mostrando seu histórico por categoria.'
      : 'Veja onde você está indo bem e o que merece mais atenção neste período.';

    box.className = 'fixa-week-status fixa-category-status';
    box.innerHTML = items.length ? `<div class="fixa-category-status-grid">${items.map(item => {
      const subjectText = item.subjects.size === 1 ? Array.from(item.subjects)[0] : `${item.subjects.size} coleções`;
      return `<article class="fixa-category-card">
        <div class="fixa-category-head"><i class="fixa-category-icon">${svg(item.tone === 'bad' ? 'alert' : item.tone === 'good' ? 'check' : 'target')}</i><span class="fixa-category-name"><strong>${esc(item.name)}</strong><small>${esc(subjectText)}</small></span><b class="fixa-category-chip ${item.tone}">${item.label}</b></div>
        <div class="fixa-category-meta"><span><b>${item.accuracy}%</b> de acertos</span><span>${item.questions} questões · ${item.reinforce} para reforçar</span></div>
        <div class="fixa-category-bar"><span class="${item.tone}" style="width:${item.accuracy}%"></span></div>
      </article>`;
    }).join('')}</div>` : '<div class="fixa-category-empty">Ainda não há respostas suficientes para avaliar seu desempenho por categoria.</div>';
  }

  function cardState(card) {
    if (isMasteredCard(card)) return 'mastered';
    const totals = cardTotals(card);
    if (totals.total > 0 && reviewNeed(card).needed) return 'review';
    if (totals.total > 0 || String(card?.status || '').toLowerCase() === 'learning') return 'learning';
    return 'unseen';
  }

  function statusCounts() {
    const counts = { mastered: 0, learning: 0, review: 0, unseen: 0 };
    selectedSubjects().forEach(subject => cardsFor(subject).forEach(card => {
      if (!isFrozenCard(card)) counts[cardState(card)] += 1;
    }));
    return counts;
  }

  function priorityCategories() {
    const source = statusCategories().items;
    return source.slice().sort((a, b) => {
      const needA = a.reinforce * 5 + Math.max(0, 70 - a.accuracy) + (a.tone === 'bad' ? 20 : 0);
      const needB = b.reinforce * 5 + Math.max(0, 70 - b.accuracy) + (b.tone === 'bad' ? 20 : 0);
      return needB - needA || b.attempts - a.attempts;
    }).slice(0, 5);
  }

  function renderPrioritiesWithDonut() {
    const panel = document.querySelector('[data-fixa-analysis-panel="priorities"]');
    const box = document.querySelector('#fixaWeekPriorities');
    if (!panel || !box) return;
    const head = panel.querySelector('.home-panel-head h3');
    const sub = panel.querySelector('.home-panel-head p');
    if (head) head.textContent = 'Prioridades';
    if (sub) sub.textContent = 'Assuntos que merecem mais atenção e a visão geral das suas questões.';

    const priorities = priorityCategories();
    const counts = statusCounts();
    const total = counts.mastered + counts.learning + counts.review + counts.unseen;
    const pct = key => total ? counts[key] / total * 100 : 0;
    const stop1 = pct('mastered');
    const stop2 = stop1 + pct('learning');
    const stop3 = stop2 + pct('review');
    const background = total
      ? `conic-gradient(#22c55e 0 ${stop1}%,#3b82f6 ${stop1}% ${stop2}%,#f59e0b ${stop2}% ${stop3}%,#e5e7eb ${stop3}% 100%)`
      : '#eef2f7';

    box.className = 'fixa-priority-with-donut';
    box.innerHTML = `<div class="fixa-priority-refined-list">${priorities.length ? priorities.map(item => `
      <div class="fixa-priority-refined-row">
        <i class="fixa-priority-refined-icon ${item.tone}">${svg(item.tone === 'bad' ? 'alert' : 'book')}</i>
        <span class="fixa-priority-refined-copy"><strong>${esc(item.name)}</strong><small>${item.reinforce} para reforçar · ${item.questions} questões</small></span>
        <span class="fixa-priority-refined-score"><b>${item.accuracy}%</b><span class="${item.tone}">${item.label}</span></span>
      </div>`).join('') : '<div class="fixa-category-empty">Faça alguns testes para criar suas prioridades.</div>'}</div>
      <aside class="fixa-priority-status-summary"><strong>Status geral</strong><div class="fixa-insight-donut" style="background:${background}"><span><b>${total}</b><small>questões</small></span></div><div class="fixa-donut-legend"><span><i style="background:#22c55e"></i>Dominadas ${counts.mastered}</span><span><i style="background:#3b82f6"></i>Em andamento ${counts.learning}</span><span><i style="background:#f59e0b"></i>Revisar ${counts.review}</span><span><i style="background:#e5e7eb"></i>Não vistas ${counts.unseen}</span></div></aside>`;
  }

  function apply() {
    if (!document.querySelector('#home.home-view')) return false;
    ensureStyle();
    patchSequence();
    renderReviews();
    renderStatusByCategory();
    renderPrioritiesWithDonut();
    return true;
  }

  let timer = 0;
  function schedule(delay = 0) {
    clearTimeout(timer);
    timer = window.setTimeout(() => requestAnimationFrame(apply), delay);
  }

  function wrapDashboardRefresh() {
    const api = window.FixaHomeWeeklyDashboardV2;
    if (!api || typeof api.refresh !== 'function' || api.__studyInsightsWrapped) return false;
    const original = api.refresh.bind(api);
    api.refresh = (...args) => {
      const result = original(...args);
      schedule(80);
      window.setTimeout(apply, 180);
      return result;
    };
    Object.defineProperty(api, '__studyInsightsWrapped', { value: true, configurable: false });
    return true;
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-analysis-tab],[data-fixa-week-period]')) {
      schedule(40);
      window.setTimeout(apply, 120);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) schedule(60);
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule(60);
  });

  let tries = 0;
  const boot = window.setInterval(() => {
    tries += 1;
    wrapDashboardRefresh();
    const ready = apply();
    if ((ready && wrapDashboardRefresh()) || tries >= 30) window.clearInterval(boot);
  }, 250);

  window.addEventListener('load', () => { schedule(80); window.setTimeout(apply, 400); }, { once: true });
  wrapDashboardRefresh();
  schedule(0);
})();
