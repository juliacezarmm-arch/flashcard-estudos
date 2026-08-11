(() => {
  'use strict';

  if (window.FixaHomeTodayPeriodV1) return;
  window.FixaHomeTodayPeriodV1 = true;

  let todayActive = false;
  let refreshTimer = 0;

  const icon = name => {
    const paths = {
      clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
      chart: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>',
      target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>',
      folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.chart}</g></svg>`;
  };

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  }

  function selectedFolderId() {
    return document.querySelector('#fixaWeekFolderFilter')?.value || 'all';
  }

  function subjects() {
    const all = Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
    const folderId = selectedFolderId();
    if (folderId === 'all') return all;
    return all.filter(subject => String(subject.folder || '') === String(folderId));
  }

  function cardsFor(subject) {
    return Array.isArray(subject?.cards) ? subject.cards : [];
  }

  function allCards() {
    return subjects().flatMap(subject => cardsFor(subject).map((card, index) => ({ subject, card, index })));
  }

  function dateOf(value) {
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function testDate(test) {
    return dateOf(test?.completedAt || test?.finishedAt || test?.date);
  }

  function statusOf(card) {
    if (!card) return 'unseen';
    const raw = String(card.status || '').toLowerCase();
    if (raw === 'frozen' || raw.includes('congel')) return 'frozen';
    if (raw === 'mastered' || raw.includes('dominad')) return 'mastered';
    try { if (typeof isMastered === 'function' && isMastered(card)) return 'mastered'; } catch (_) {}
    try { if (typeof needsReview === 'function' && needsReview(card)) return 'review'; } catch (_) {}
    if (raw === 'review' || raw.includes('revis')) return 'review';
    const attempts = Number(card.attempts || card.timesAnswered || 0) + (Array.isArray(card.attemptHistory) ? card.attemptHistory.length : 0);
    if (raw === 'learning' || raw.includes('andamento') || attempts > 0) return 'learning';
    return 'unseen';
  }

  function selectedSubjectIds() {
    return new Set(subjects().map(subject => String(subject.id)));
  }

  function testBelongs(test) {
    if (selectedFolderId() === 'all') return true;
    const ids = selectedSubjectIds();
    const testIds = Array.isArray(test?.subjectIds) && test.subjectIds.length
      ? test.subjectIds.map(String)
      : [test?.subjectId].filter(Boolean).map(String);
    if (testIds.some(id => ids.has(id))) return true;
    const names = new Set(subjects().map(subject => subject.name));
    return names.has(test?.subject);
  }

  function todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  function todayTests() {
    const { start, end } = todayRange();
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0)
      .filter(testBelongs)
      .filter(test => {
        const date = testDate(test);
        return date && date >= start && date <= end;
      })
      .sort((a, b) => (testDate(b)?.getTime() || 0) - (testDate(a)?.getTime() || 0));
  }

  function subjectTests(subject) {
    return todayTests().filter(test => {
      if (String(test.subjectId || '') === String(subject.id)) return true;
      if (Array.isArray(test.subjectIds) && test.subjectIds.map(String).includes(String(subject.id))) return true;
      return test.subject === subject.name;
    });
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function formatDuration(ms) {
    const seconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${String(minutes % 60).padStart(2, '0')}m`;
  }

  function subjectStats(subject) {
    const cards = cardsFor(subject).filter(card => statusOf(card) !== 'frozen');
    const counts = { mastered: 0, learning: 0, review: 0, unseen: 0 };
    cards.forEach(card => { counts[statusOf(card)] = (counts[statusOf(card)] || 0) + 1; });
    const tests = subjectTests(subject);
    const totalAnswered = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const totalScore = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    return { total: cards.length, ...counts, accuracy: percent(totalScore, totalAnswered), answered: totalAnswered };
  }

  function todayLabel() {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    return `Hoje, ${formatted}`;
  }

  function ensureTodayButton() {
    const period = document.querySelector('.fixa-week-period');
    if (!period) return false;
    let button = period.querySelector('[data-fixa-week-period="today"]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.fixaWeekPeriod = 'today';
      button.textContent = 'Hoje';
      period.insertBefore(button, period.firstChild);
    }
    return true;
  }

  function renderTopToday() {
    const cards = document.querySelectorAll('#homeFooterStats .fixa-week-top-card');
    const timeCard = cards[1];
    if (!timeCard) return;
    const tests = todayTests();
    const studiedMs = tests.reduce((sum, test) => sum + Number(test.durationMs || 0), 0);
    const targetMs = 60 * 60 * 1000;
    const progress = clamp(studiedMs / targetMs * 100);
    const heading = timeCard.querySelector('.fixa-week-top-head h3');
    const value = timeCard.querySelector('.fixa-week-main-value');
    const small = timeCard.querySelector(':scope > small');
    const bar = timeCard.querySelector('.home-progress span');
    if (heading) heading.textContent = 'Tempo estudado hoje';
    if (value) value.textContent = formatDuration(studiedMs);
    if (small) small.textContent = 'Meta diária: 1h';
    if (bar) bar.style.width = `${progress}%`;
  }

  function renderSummaryToday() {
    const tests = todayTests();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const cards = Array.from(document.querySelectorAll('#homeSummaryCards .fixa-week-summary-card'));
    const card = cards.find(item => item.querySelector('strong')?.textContent?.trim() === 'Aproveitamento');
    if (!card) return;
    const value = card.querySelector('.home-card-number');
    const caption = card.querySelector('small');
    if (value) value.textContent = `${percent(score, total)}%`;
    if (caption) caption.textContent = 'Média de hoje';
  }

  function renderReviewsToday() {
    const list = document.querySelector('#homeStudyRecommendations');
    if (!list) return;
    const items = subjects().map(subject => ({ subject, stats: subjectStats(subject) }))
      .filter(item => item.stats.review > 0)
      .sort((a, b) => b.stats.review - a.stats.review || b.stats.total - a.stats.total)
      .slice(0, 8);
    const planned = items.reduce((sum, item) => sum + Math.min(10, Math.max(1, item.stats.review)), 0);
    list.className = 'home-recommendation-list fixa-week-review-list';
    list.innerHTML = items.length ? items.map(({ subject, stats }) => {
      const target = Math.min(10, Math.max(1, stats.review));
      const done = Math.min(target, stats.answered);
      const progress = percent(done, target);
      return `<article class="fixa-week-review" data-home-subject="${String(subject.id).replace(/"/g, '&quot;')}" tabindex="0"><div class="fixa-week-review-head"><strong>${subject.name}</strong><span>Meta: ${target} questões</span></div><div class="fixa-week-review-meta"><span>${done} de ${target} concluídas</span><b>${progress}%</b></div><div class="fixa-week-review-progress"><span style="width:${progress}%"></span></div></article>`;
    }).join('') : '<p class="home-muted">Nenhuma revisão pendente para esta seleção.</p>';
    const title = document.querySelector('.home-study-card h3');
    const text = document.querySelector('#homeStudyText');
    if (title) title.textContent = 'Revisões para hoje';
    if (text) text.textContent = items.length ? `${planned} questões planejadas para hoje.` : 'Nenhuma revisão pendente para hoje.';
  }

  function renderCollectionsToday() {
    const grid = document.querySelector('#homeCollectionSummary');
    if (!grid) return;
    const items = subjects().map(subject => ({ subject, stats: subjectStats(subject) }));
    grid.className = 'home-collection-grid fixa-week-collection-list';
    grid.innerHTML = items.length ? items.map(({ subject, stats }) => `
      <article class="home-collection-card fixa-week-collection" data-home-subject="${String(subject.id).replace(/"/g, '&quot;')}" tabindex="0">
        <div class="home-collection-head"><div class="home-collection-name"><span class="fixa-week-folder-mini">${icon('folder')}</span><span>${subject.name}</span></div><span class="home-collection-total">${stats.total} questões</span></div>
        <div class="home-collection-metrics"><span><b>${stats.mastered}</b><small>Dominadas</small></span><span><b>${stats.learning}</b><small>Em andamento</small></span><span><b>${stats.review}</b><small>Revisar</small></span></div>
        <div class="home-progress"><span style="width:${Math.max(2, stats.accuracy)}%"></span></div>
        <div class="home-collection-foot"><span>Aproveitamento <b>${stats.accuracy}%</b></span><span class="fixa-collection-xp">Hoje</span></div>
      </article>`).join('') : '<p class="home-muted">Nenhuma coleção nesta seleção.</p>';
  }

  function renderPerformanceToday() {
    const list = document.querySelector('#homePerformance');
    if (!list) return;
    const tests = todayTests();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const duration = tests.reduce((sum, test) => sum + Number(test.durationMs || 0), 0);
    const latest = tests[0] ? `${Number(tests[0].score || 0)} de ${Number(tests[0].total || 0)}` : 'Sem dados';
    const best = tests.reduce((max, test) => Math.max(max, Number(test.score || 0)), 0);
    const rows = [
      ['chart', 'Média dos testes de hoje', total ? `${percent(score, total)}%` : 'Sem dados', 'blue'],
      ['clock', 'Tempo médio por questão', total ? formatDuration(duration / total) : 'Sem dados', 'blue'],
      ['target', 'Melhor resultado de hoje', tests.length ? `${best} acertos` : 'Sem dados', 'orange'],
      ['target', 'Acertos recentes', latest, 'green']
    ];
    list.className = 'home-simple-list fixa-week-performance-list';
    list.innerHTML = rows.map(([icoName, label, value, tone]) => `<li class="fixa-week-performance-row"><span><i class="${tone}">${icon(icoName)}</i>${label}</span><b>${value}</b></li>`).join('');
  }

  function renderChartToday() {
    const box = document.querySelector('#homeChart');
    if (!box) return;
    const tests = todayTests();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const value = percent(score, total);
    const width = 560, height = 118, left = 30, right = 8, top = 8, bottom = 22;
    const plotW = width - left - right, plotH = height - top - bottom;
    const y = v => top + (100 - clamp(v)) / 100 * plotH;
    const x = left + plotW / 2;
    const grid = [0, 50, 100].map(v => `<g><line x1="${left}" y1="${y(v)}" x2="${width - right}" y2="${y(v)}" stroke="#e8edf5" stroke-width="1"/><text x="1" y="${y(v) + 3}" font-size="8" fill="#8a94a7">${v}%</text></g>`).join('');
    box.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Desempenho de hoje">${grid}<circle cx="${x}" cy="${y(value)}" r="4" fill="#fff" stroke="#2563eb" stroke-width="2"></circle><text x="${x}" y="${height - 5}" text-anchor="middle" font-size="8" fill="#7b879b">Hoje</text></svg>`;
  }

  function markTodayActive() {
    document.querySelectorAll('[data-fixa-week-period]').forEach(button => {
      button.classList.toggle('active', button.dataset.fixaWeekPeriod === 'today');
    });
  }

  function renderToday() {
    if (!todayActive || !document.querySelector('#home.home-view')) return;
    ensureTodayButton();
    markTodayActive();
    const datePill = document.querySelector('#homeDatePill');
    if (datePill) datePill.textContent = todayLabel();
    renderTopToday();
    renderSummaryToday();
    renderReviewsToday();
    renderCollectionsToday();
    renderPerformanceToday();
    renderChartToday();
  }

  function queueToday(delay = 0) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      requestAnimationFrame(renderToday);
    }, delay);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-fixa-week-period]');
    if (!button) return;
    if (button.dataset.fixaWeekPeriod === 'today') {
      event.preventDefault();
      event.stopImmediatePropagation();
      todayActive = true;
      queueToday(0);
      return;
    }
    todayActive = false;
  }, true);

  document.addEventListener('change', event => {
    if (todayActive && event.target.closest('#fixaWeekFolderFilter')) queueToday(40);
  });

  function install() {
    ensureTodayButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();

  [40, 120, 300, 700, 1400].forEach(delay => window.setTimeout(ensureTodayButton, delay));
})();