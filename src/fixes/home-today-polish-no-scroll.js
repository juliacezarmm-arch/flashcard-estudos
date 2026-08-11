(() => {
  'use strict';

  if (window.FixaHomeWeeklyDashboardV2) return;
  window.FixaHomeWeeklyDashboardV2 = true;

  const state = {
    folderId: 'all',
    period: 'week'
  };

  const icon = name => {
    const paths = {
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path>',
      clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
      flag: '<path d="M5 21V4"></path><path d="M5 5h11l-2 4 2 4H5"></path>',
      books: '<path d="M4 5h5v14H4zM10 4h5v15h-5zM16 7h4v12h-4z"></path>',
      question: '<circle cx="12" cy="12" r="9"></circle><path d="M9.7 9a2.5 2.5 0 1 1 3.9 2.1c-1 .7-1.6 1.1-1.6 2.4M12 17h.01"></path>',
      trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"></path><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"></path>',
      chart: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>',
      target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>',
      list: '<path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>',
      star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.chart}</g></svg>`;
  };

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  }

  function folders() {
    return Array.isArray(dataRef()?.folders) ? dataRef().folders : [];
  }

  function subjects() {
    const all = Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
    if (state.folderId === 'all') return all;
    return all.filter(subject => String(subject.folder || '') === String(state.folderId));
  }

  function selectedSubjectIds() {
    return new Set(subjects().map(subject => String(subject.id)));
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

  function startOfWeek(base = new Date()) {
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return date;
  }

  function endOfWeek(base = new Date()) {
    const date = startOfWeek(base);
    date.setDate(date.getDate() + 6);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  function currentRange() {
    const now = new Date();
    if (state.period === 'month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }
    return { start: startOfWeek(now), end: endOfWeek(now) };
  }

  function testBelongs(test) {
    if (state.folderId === 'all') return true;
    const ids = selectedSubjectIds();
    const testIds = Array.isArray(test?.subjectIds) && test.subjectIds.length
      ? test.subjectIds.map(String)
      : [test?.subjectId].filter(Boolean).map(String);
    if (testIds.some(id => ids.has(id))) return true;
    const names = new Set(subjects().map(subject => subject.name));
    return names.has(test?.subject);
  }

  function completedTests() {
    return (Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [])
      .filter(test => !test?.cancelled && !test?.canceled && !test?.interrupted && Number(test?.total || 0) > 0)
      .filter(testBelongs)
      .sort((a, b) => (testDate(b)?.getTime() || 0) - (testDate(a)?.getTime() || 0));
  }

  function testsInRange() {
    const { start, end } = currentRange();
    return completedTests().filter(test => {
      const date = testDate(test);
      return date && date >= start && date <= end;
    });
  }

  function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function percent(value, total) {
    return Number(total) > 0 ? Math.round(Number(value || 0) / Number(total) * 100) : 0;
  }

  function formatDuration(ms) {
    const seconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${String(minutes % 60).padStart(2, '0')}m`;
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

  function subjectTests(subject, pool = testsInRange()) {
    return pool.filter(test => {
      if (String(test.subjectId || '') === String(subject.id)) return true;
      if (Array.isArray(test.subjectIds) && test.subjectIds.map(String).includes(String(subject.id))) return true;
      return test.subject === subject.name;
    });
  }

  function subjectStats(subject) {
    const cards = cardsFor(subject).filter(card => statusOf(card) !== 'frozen');
    const counts = { mastered: 0, learning: 0, review: 0, unseen: 0 };
    cards.forEach(card => { counts[statusOf(card)] = (counts[statusOf(card)] || 0) + 1; });
    const tests = subjectTests(subject);
    const totalAnswered = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const totalScore = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const xp = subjectTests(subject, completedTests()).reduce((sum, test) => sum + Number(test.xp || 0), 0);
    return {
      total: cards.length,
      ...counts,
      accuracy: percent(totalScore, totalAnswered),
      answered: totalAnswered,
      xp
    };
  }

  function consecutiveStreak() {
    const dates = new Set(completedTests().map(test => {
      const date = testDate(test);
      return date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
    }).filter(Boolean));
    if (!dates.size) return 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!dates.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (true) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      if (!dates.has(key)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function masteredThisWeek() {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const mastered = new Set();
    subjects().forEach(subject => {
      cardsFor(subject).forEach((card, index) => {
        (Array.isArray(card.attemptHistory) ? card.attemptHistory : []).forEach(attempt => {
          const before = String(attempt.statusBefore || attempt.status_before || '').toLowerCase();
          const after = String(attempt.statusAfter || attempt.status_after || '').toLowerCase();
          const date = dateOf(attempt.created_at || attempt.createdAt || attempt.answeredAt || attempt.date);
          if (!date || date < start || date > end) return;
          if ((after === 'mastered' || after.includes('dominad')) && !(before === 'mastered' || before.includes('dominad'))) {
            mastered.add(`${subject.id}:${card.id || card.questionCode || index}`);
          }
        });
      });
    });
    return mastered.size;
  }

  function goalsKey() {
    const userId = (() => {
      try { return currentUser?.id || window.currentUser?.id || 'local'; } catch (_) { return 'local'; }
    })();
    const start = startOfWeek(new Date());
    const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    return `fixa:weekly-goals:${userId}:${dateKey}`;
  }

  function weeklyGoals() {
    const defaults = { questions: 60, tests: 6, mastered: 20 };
    try {
      const saved = JSON.parse(localStorage.getItem(goalsKey()) || '{}');
      return {
        questions: Math.max(1, Number(saved.questions) || defaults.questions),
        tests: Math.max(1, Number(saved.tests) || defaults.tests),
        mastered: Math.max(1, Number(saved.mastered) || defaults.mastered)
      };
    } catch (_) {
      return defaults;
    }
  }

  function weeklyGoalProgress() {
    const goals = weeklyGoals();
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const tests = completedTests().filter(test => {
      const date = testDate(test);
      return date && date >= start && date <= end;
    });
    const values = {
      questions: tests.reduce((sum, test) => sum + Number(test.total || 0), 0),
      tests: tests.length,
      mastered: masteredThisWeek()
    };
    const ratios = [
      clamp(values.questions / goals.questions * 100),
      clamp(values.tests / goals.tests * 100),
      clamp(values.mastered / goals.mastered * 100)
    ];
    return {
      goals,
      values,
      percent: Math.round(ratios.reduce((sum, value) => sum + value, 0) / 3),
      completed: ratios.filter(value => value >= 100).length
    };
  }

  function rangeLabel() {
    const { start, end } = currentRange();
    if (state.period === 'month') {
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(start);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (start.getMonth() === end.getMonth()) {
      const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(end);
      return `Semana de ${start.getDate()} a ${end.getDate()} de ${month} de ${end.getFullYear()}`;
    }
    return `Semana de ${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }

  function summaryXp() {
    const summary = window.FixaCompetitionXpHomeV4?.summary || {};
    if (state.folderId === 'all') return Number(summary.total_xp || 0);
    return Number(summary.by_folder?.[state.folderId] || 0);
  }

  function fillFolderFilter() {
    const select = document.querySelector('#fixaWeekFolderFilter');
    if (!select) return;
    const previous = state.folderId;
    select.innerHTML = '<option value="all">Todas as pastas</option>' + folders().map(folder => `<option value="${String(folder.id).replace(/"/g, '&quot;')}">${folder.name}</option>`).join('');
    state.folderId = folders().some(folder => String(folder.id) === String(previous)) ? String(previous) : 'all';
    select.value = state.folderId;
  }

  function renderTopCards() {
    const target = document.querySelector('#homeFooterStats');
    if (!target) return;
    const tests = testsInRange();
    const studiedMs = tests.reduce((sum, test) => sum + Number(test.durationMs || 0), 0);
    const goal = weeklyGoalProgress();
    const streak = consecutiveStreak();
    const weekStart = startOfWeek(new Date());
    const studiedDays = new Set(tests.map(test => {
      const date = testDate(test);
      return date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
    }));
    const letters = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const active = studiedDays.has(key);
      return `<span class="fixa-week-day${active ? ' active' : ''}"><i>${active ? '✓' : ''}</i><b>${letters[index]}</b></span>`;
    }).join('');
    const targetMs = state.period === 'month' ? 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
    const timeProgress = clamp(studiedMs / targetMs * 100);
    const timeTitle = state.period === 'month' ? 'Tempo estudado no mês' : 'Tempo estudado na semana';
    const timeTarget = state.period === 'month' ? 'Meta mensal: 24h' : 'Meta semanal: 6h';
    const goalTitle = state.period === 'month' ? 'Objetivo do mês' : 'Objetivo da semana';

    target.innerHTML = `
      <article class="home-panel fixa-week-top-card">
        <div class="fixa-week-top-head"><span class="fixa-week-symbol orange">${icon('calendar')}</span><h3>Sequência</h3><b>${streak} dia${streak === 1 ? '' : 's'} seguidos</b></div>
        <div class="fixa-week-days">${days}</div>
      </article>
      <article class="home-panel fixa-week-top-card">
        <div class="fixa-week-top-head"><span class="fixa-week-symbol blue">${icon('clock')}</span><h3>${timeTitle}</h3></div>
        <strong class="fixa-week-main-value">${formatDuration(studiedMs)}</strong><small>${timeTarget}</small>
        <div class="home-progress"><span style="width:${timeProgress}%"></span></div>
      </article>
      <article class="home-panel fixa-week-top-card">
        <div class="fixa-week-top-head"><span class="fixa-week-symbol blue">${icon('flag')}</span><h3>${goalTitle}</h3></div>
        <strong class="fixa-week-main-value">${goal.percent}%</strong><small>${goal.completed} de 3 metas concluídas</small>
        <div class="home-progress"><span style="width:${goal.percent}%"></span></div>
      </article>`;

    const datePill = document.querySelector('#homeDatePill');
    if (datePill) datePill.textContent = rangeLabel();
  }

  function renderSummaryCards() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return;
    const cards = allCards().filter(item => statusOf(item.card) !== 'frozen');
    const mastered = cards.filter(item => statusOf(item.card) === 'mastered').length;
    const tests = testsInRange();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const rows = [
      ['books', 'Coleções', subjects().length, 'Total de coleções', 'green'],
      ['question', 'Questões', cards.length, 'Total de questões', 'cyan'],
      ['trophy', 'Dominadas', mastered, `${percent(mastered, cards.length)}% do total`, 'orange'],
      ['chart', 'Aproveitamento', `${percent(score, total)}%`, state.period === 'month' ? 'Média do mês' : 'Média da semana', 'purple'],
      ['target', 'XP', summaryXp(), state.folderId === 'all' ? 'Total de todas as coleções' : 'Total da pasta selecionada', 'blue']
    ];
    grid.classList.add('fixa-week-summary');
    grid.innerHTML = rows.map(([ico, label, value, caption, tone], index) => `
      <article class="home-card fixa-week-summary-card ${index === 4 ? 'fixa-xp-card' : ''}">
        <span class="fixa-week-summary-icon ${tone}">${icon(ico)}</span>
        <span><strong>${label}</strong><span class="home-card-number">${value}</span><small class="home-muted">${caption}</small></span>
      </article>`).join('');
  }

  function reviewItems() {
    return subjects().map(subject => ({ subject, stats: subjectStats(subject) }))
      .filter(item => item.stats.review > 0)
      .sort((a, b) => b.stats.review - a.stats.review || b.stats.total - a.stats.total);
  }

  function renderReviews() {
    const list = document.querySelector('#homeStudyRecommendations');
    if (!list) return;
    const items = reviewItems().slice(0, 8);
    const periodLabel = state.period === 'month' ? 'mês' : 'semana';
    const planned = items.reduce((sum, item) => sum + Math.min(10, Math.max(1, item.stats.review)), 0);

    list.className = 'home-recommendation-list fixa-week-review-list';
    list.innerHTML = items.length ? items.map(({ subject, stats }) => {
      const target = Math.min(10, Math.max(1, stats.review));
      const done = Math.min(target, stats.answered);
      const progress = percent(done, target);
      return `<article class="fixa-week-review" data-home-subject="${String(subject.id).replace(/"/g, '&quot;')}" tabindex="0">
        <div class="fixa-week-review-head"><strong>${subject.name}</strong><span>Meta: ${target} questões</span></div>
        <div class="fixa-week-review-meta"><span>${done} de ${target} concluídas</span><b>${progress}%</b></div>
        <div class="fixa-week-review-progress"><span style="width:${progress}%"></span></div>
      </article>`;
    }).join('') : '<p class="home-muted">Nenhuma revisão pendente para esta seleção.</p>';

    const title = document.querySelector('.home-study-card h3');
    const kicker = document.querySelector('.home-study-card .home-kicker');
    const text = document.querySelector('#homeStudyText');
    if (kicker) kicker.textContent = '';
    if (title) title.textContent = state.period === 'month' ? 'Revisões para o mês' : 'Revisões para a semana';
    if (text) text.textContent = items.length ? `${planned} questões planejadas para este ${periodLabel}.` : 'Nenhuma revisão pendente para este período.';
  }

  function renderCollections() {
    const grid = document.querySelector('#homeCollectionSummary');
    if (!grid) return;
    const items = subjects().map(subject => ({ subject, stats: subjectStats(subject) }));
    grid.className = 'home-collection-grid fixa-week-collection-list';
    grid.innerHTML = items.length ? items.map(({ subject, stats }) => `
      <article class="home-collection-card fixa-week-collection" data-home-subject="${String(subject.id).replace(/"/g, '&quot;')}" tabindex="0">
        <div class="home-collection-head"><div class="home-collection-name"><span class="fixa-week-folder-mini">${icon('folder')}</span><span>${subject.name}</span></div><span class="home-collection-total">${stats.total} questões</span></div>
        <div class="home-collection-metrics"><span><b>${stats.mastered}</b><small>Dominadas</small></span><span><b>${stats.learning}</b><small>Em andamento</small></span><span><b>${stats.review}</b><small>Revisar</small></span></div>
        <div class="home-progress"><span style="width:${Math.max(2, stats.accuracy)}%"></span></div>
        <div class="home-collection-foot"><span>Aproveitamento <b>${stats.accuracy}%</b></span><span class="fixa-collection-xp">${stats.xp} XP</span></div>
      </article>`).join('') : '<p class="home-muted">Nenhuma coleção nesta seleção.</p>';
  }

  function renderPerformance() {
    const list = document.querySelector('#homePerformance');
    if (!list) return;
    const tests = testsInRange();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const duration = tests.reduce((sum, test) => sum + Number(test.durationMs || 0), 0);
    const latest = tests[0] ? `${Number(tests[0].score || 0)} de ${Number(tests[0].total || 0)}` : 'Sem dados';
    const best = tests.reduce((max, test) => Math.max(max, Number(test.score || 0)), 0);
    const rows = [
      ['chart', 'Média dos últimos testes', total ? `${percent(score, total)}%` : 'Sem dados', 'blue'],
      ['clock', 'Tempo médio por questão', total ? formatDuration(duration / total) : 'Sem dados', 'blue'],
      ['target', 'Melhor sequência', tests.length ? `${best} acertos` : 'Sem dados', 'orange'],
      ['target', 'Acertos recentes', latest, 'green']
    ];
    list.className = 'home-simple-list fixa-week-performance-list';
    list.innerHTML = rows.map(([ico, label, value, tone]) => `<li class="fixa-week-performance-row"><span><i class="${tone}">${icon(ico)}</i>${label}</span><b>${value}</b></li>`).join('');
  }

  function renderGoals() {
    const list = document.querySelector('#homeGoals');
    if (!list) return;
    const progress = weeklyGoalProgress();
    const rows = [
      ['question', 'Resolver questões nesta semana', progress.values.questions, progress.goals.questions],
      ['flag', 'Fazer testes nesta semana', progress.values.tests, progress.goals.tests],
      ['target', 'Dominar questões nesta semana', progress.values.mastered, progress.goals.mastered]
    ];
    list.className = 'home-goal-list fixa-week-goal-list';
    list.innerHTML = rows.map(([ico, label, current, target]) => `<li class="fixa-week-goal"><div class="fixa-week-goal-head"><i>${icon(ico)}</i><span><strong>${label}</strong><small>${current} / ${target}</small></span></div><div class="home-progress"><span style="width:${Math.max(2, clamp(current / target * 100))}%"></span></div></li>`).join('');
  }

  function priorityRows() {
    return subjects().map(subject => {
      const stats = subjectStats(subject);
      const tests = subjectTests(subject);
      const errors = tests.reduce((sum, test) => sum + Math.max(0, Number(test.total || 0) - Number(test.score || 0)), 0);
      const priority = stats.review * 4 + errors * 3 + Math.max(0, 60 - stats.accuracy);
      return { subject, stats, priority };
    }).filter(item => item.stats.total > 0).sort((a, b) => b.priority - a.priority).slice(0, 3);
  }

  function renderPriorities() {
    const box = document.querySelector('#fixaWeekPriorities');
    if (!box) return;
    const rows = priorityRows();
    box.innerHTML = rows.length ? rows.map((item, index) => {
      const level = index === 0 ? 'Alta' : item.priority > 40 ? 'Média' : 'Baixa';
      const tone = level === 'Alta' ? 'high' : level === 'Média' ? 'medium' : 'low';
      return `<div class="fixa-week-priority-row"><span>${item.subject.name}</span><b class="${tone}">${level}</b><strong>${item.stats.accuracy}%</strong></div>`;
    }).join('') : '<p class="home-muted">Sem prioridades suficientes ainda.</p>';
  }

  function renderStatus() {
    const box = document.querySelector('#fixaWeekStatus');
    if (!box) return;
    const counts = { mastered: 0, learning: 0, review: 0, unseen: 0 };
    allCards().forEach(({ card }) => {
      const status = statusOf(card);
      if (status !== 'frozen') counts[status] += 1;
    });
    const total = counts.mastered + counts.learning + counts.review + counts.unseen;
    const masteredPct = percent(counts.mastered, total);
    const learningPct = percent(counts.learning, total);
    const reviewPct = percent(counts.review, total);
    const stop1 = masteredPct;
    const stop2 = masteredPct + learningPct;
    const stop3 = masteredPct + learningPct + reviewPct;
    const rows = [
      ['green', 'Dominadas', counts.mastered],
      ['blue', 'Em andamento', counts.learning],
      ['orange', 'Para revisar', counts.review],
      ['red', 'Não vistas', counts.unseen]
    ];
    box.innerHTML = `<div class="fixa-week-status-list">${rows.map(([tone, label, count]) => `<div><i class="${tone}"></i><span>${label}</span><b>${count}</b><small>${percent(count, total)}%</small></div>`).join('')}</div><div class="fixa-week-donut" style="background:conic-gradient(#22c55e 0 ${stop1}%,#3b82f6 ${stop1}% ${stop2}%,#f59e0b ${stop2}% ${stop3}%,#ef4444 ${stop3}% 100%)"><span><b>${total}</b><small>Total</small></span></div>`;
  }

  function chartPoints() {
    const tests = testsInRange();
    const range = currentRange();
    if (state.period === 'month') {
      const buckets = Array.from({ length: 5 }, (_, index) => ({ label: `Sem ${index + 1}`, score: 0, total: 0 }));
      tests.forEach(test => {
        const date = testDate(test);
        if (!date) return;
        const bucket = Math.min(4, Math.floor((date.getDate() - 1) / 7));
        buckets[bucket].score += Number(test.score || 0);
        buckets[bucket].total += Number(test.total || 0);
      });
      return buckets.map(bucket => ({ label: bucket.label, value: percent(bucket.score, bucket.total) }));
    }
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(range.start);
      date.setDate(date.getDate() + index);
      const daily = tests.filter(test => {
        const itemDate = testDate(test);
        return itemDate && itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth() && itemDate.getDate() === date.getDate();
      });
      const score = daily.reduce((sum, test) => sum + Number(test.score || 0), 0);
      const total = daily.reduce((sum, test) => sum + Number(test.total || 0), 0);
      return { label: labels[index], value: percent(score, total) };
    });
  }

  function renderChart() {
    const box = document.querySelector('#homeChart');
    if (!box) return;
    const points = chartPoints();
    const width = 560;
    const height = 118;
    const left = 30;
    const right = 8;
    const top = 8;
    const bottom = 22;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const x = index => left + (points.length === 1 ? plotW / 2 : index * plotW / (points.length - 1));
    const y = value => top + (100 - clamp(value)) / 100 * plotH;
    const coords = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
    const grid = [0, 50, 100].map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#e8edf5" stroke-width="1"/><text x="1" y="${y(value) + 3}" font-size="8" fill="#8a94a7">${value}%</text></g>`).join('');
    const labels = points.map((point, index) => `<text x="${x(index)}" y="${height - 5}" text-anchor="middle" font-size="8" fill="#7b879b">${point.label}</text>`).join('');
    const dots = points.map((point, index) => `<circle cx="${x(index)}" cy="${y(point.value)}" r="3" fill="#fff" stroke="#2563eb" stroke-width="1.8"></circle>`).join('');
    box.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de desempenho no período">${grid}<polyline points="${coords}" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></polyline>${dots}${labels}</svg>`;
  }

  function renderWeeklyDashboard() {
    if (!document.querySelector('#home.home-view')) return;
    fillFolderFilter();
    document.querySelectorAll('[data-fixa-week-period]').forEach(button => button.classList.toggle('active', button.dataset.fixaWeekPeriod === state.period));
    renderTopCards();
    renderSummaryCards();
    renderReviews();
    renderCollections();
    renderPerformance();
    renderGoals();
    renderPriorities();
    renderStatus();
    renderChart();
  }

  function openGoalsModal() {
    document.querySelector('.fixa-week-goals-overlay')?.remove();
    const goals = weeklyGoals();
    const overlay = document.createElement('div');
    overlay.className = 'fixa-week-goals-overlay';
    overlay.innerHTML = `<section class="fixa-week-goals-modal" role="dialog" aria-modal="true" aria-labelledby="fixaGoalsTitle"><header><div><h3 id="fixaGoalsTitle">Objetivos da semana</h3><p>Escolha as tarefas desta semana. Na próxima semana você poderá definir outras metas.</p></div><button type="button" data-fixa-goals-close aria-label="Fechar">×</button></header><div class="fixa-week-goals-fields"><label>Resolver questões<input type="number" min="1" max="5000" value="${goals.questions}" data-goal="questions"></label><label>Fazer testes<input type="number" min="1" max="500" value="${goals.tests}" data-goal="tests"></label><label>Dominar questões<input type="number" min="1" max="5000" value="${goals.mastered}" data-goal="mastered"></label></div><footer><button type="button" class="secondary" data-fixa-goals-close>Cancelar</button><button type="button" data-fixa-goals-save>Salvar objetivos</button></footer></section>`;
    document.body.appendChild(overlay);
  }

  function saveGoalsModal() {
    const overlay = document.querySelector('.fixa-week-goals-overlay');
    if (!overlay) return;
    const next = {};
    overlay.querySelectorAll('[data-goal]').forEach(input => {
      next[input.dataset.goal] = Math.max(1, Math.floor(Number(input.value) || 1));
    });
    localStorage.setItem(goalsKey(), JSON.stringify(next));
    overlay.remove();
    renderWeeklyDashboard();
  }

  function ensureMiddleCards(today, todayShell) {
    let grid = today.querySelector('.home-today-grid');
    if (!grid) return null;

    const study = today.querySelector('.home-study-card');
    const collectionPanel = document.querySelector('#homeCollectionSummary')?.closest('.home-panel');

    let performancePanel = document.querySelector('.fixa-week-performance-panel');
    if (!performancePanel) {
      performancePanel = document.createElement('article');
      performancePanel.className = 'home-panel fixa-week-performance-panel';
      performancePanel.innerHTML = `<div class="home-panel-head"><h3>${icon('chart')}Desempenho recente</h3></div>`;
      const performance = document.querySelector('#homePerformance');
      if (performance) performancePanel.appendChild(performance);
    }

    const goalsList = document.querySelector('#homeGoals');
    let goalsPanel = goalsList?.closest('.home-panel') || document.querySelector('.fixa-week-goals-panel');
    if (goalsPanel) {
      goalsPanel.classList.add('fixa-week-goals-panel');
      const head = goalsPanel.querySelector('.home-panel-head');
      if (head) head.innerHTML = `<h3>${icon('target')}Objetivos</h3><button type="button" class="fixa-week-add-goals" data-fixa-add-goals>${icon('plus')}Adicionar</button>`;
    }

    if (study) {
      study.querySelector('.home-icon')?.remove();
      const oldTitle = study.querySelector('.home-kicker');
      if (oldTitle) oldTitle.textContent = '';
    }

    [study, collectionPanel, performancePanel, goalsPanel].filter(Boolean).forEach(card => grid.appendChild(card));
    return grid;
  }

  function ensureAnalysis(todayShell) {
    let analysisGrid = document.querySelector('.fixa-week-analysis-grid');
    if (!analysisGrid) {
      analysisGrid = document.createElement('section');
      analysisGrid.className = 'fixa-week-analysis-grid';
      analysisGrid.innerHTML = `
        <article class="home-panel fixa-week-analysis-card"><div class="home-panel-head"><div><h3>${icon('star')}Prioridades</h3><p class="home-muted">Tópicos que precisam de mais atenção.</p></div></div><div id="fixaWeekPriorities"></div></article>
        <article class="home-panel fixa-week-analysis-card"><div class="home-panel-head"><h3>${icon('list')}Status das questões</h3></div><div id="fixaWeekStatus" class="fixa-week-status"></div></article>
        <article class="home-panel fixa-week-analysis-card fixa-week-chart-card"><div class="home-panel-head"><div><h3>${icon('chart')}Gráfico de desempenho</h3><p class="home-muted">Aproveitamento médio no período.</p></div></div></article>`;
    }
    const chart = document.querySelector('#homeChart');
    const chartCard = analysisGrid.querySelector('.fixa-week-chart-card');
    if (chart && chart.parentElement !== chartCard) chartCard?.appendChild(chart);
    if (analysisGrid.parentElement !== todayShell) todayShell.appendChild(analysisGrid);
    return analysisGrid;
  }

  function setupLayout() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const todayShell = today?.querySelector(':scope > .home-shell');
    const nav = home?.querySelector('.home-subtabs');
    if (!home || !today || !todayShell || !nav) return false;

    const todayTab = nav.querySelector('[data-home-tab="today"]');
    if (todayTab) todayTab.innerHTML = `${icon('calendar')}<span>Semana</span>`;
    nav.querySelector('[data-home-tab="progress"]')?.remove();
    nav.querySelector('[data-home-tab="analysis"]')?.remove();

    const heroActions = home.querySelector('.home-hero-actions');
    if (heroActions && !document.querySelector('#fixaWeekFolderFilter')) {
      const filters = document.createElement('div');
      filters.className = 'fixa-week-filters';
      filters.innerHTML = `<label class="fixa-week-folder-filter">${icon('folder')}<select id="fixaWeekFolderFilter" aria-label="Filtrar por pasta"></select></label><div class="fixa-week-period"><button type="button" data-fixa-week-period="week" class="active">Semana</button><button type="button" data-fixa-week-period="month">Mês</button></div>`;
      heroActions.insertBefore(filters, heroActions.firstChild);
    }

    const footerStats = document.querySelector('#homeFooterStats');
    const summary = document.querySelector('#homeSummaryCards');
    if (footerStats && summary && footerStats.parentElement !== todayShell) todayShell.insertBefore(footerStats, summary);

    const oldPriorityPanel = document.querySelector('#homePriorities')?.closest('.home-priority-panel');
    if (oldPriorityPanel) oldPriorityPanel.hidden = true;

    ensureMiddleCards(today, todayShell);
    ensureAnalysis(todayShell);

    home.querySelector('[data-home-panel="progress"]')?.setAttribute('hidden', '');
    home.querySelector('[data-home-panel="analysis"]')?.setAttribute('hidden', '');
    document.body.classList.remove('fixa-home-today-fit', 'fixa-home-today-compact', 'fixa-home-today-tight');
    fillFolderFilter();
    return true;
  }

  const style = document.createElement('style');
  style.id = 'fixaHomeWeeklyDashboardStyle';
  style.textContent = `
    body.home-active main{overflow-y:auto!important;scrollbar-width:thin!important}
    #home.home-view{max-width:1280px!important;overflow:visible!important}
    #home>.home-shell{gap:5px!important}
    #home .home-subtabs{margin-top:-5px!important;margin-bottom:-1px!important;gap:7px!important;min-height:34px!important}
    #home .home-subtab{min-height:34px!important;padding:7px 12px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;font-size:11px!important}
    #home .home-subtab svg{width:14px;height:14px;fill:none;stroke:currentColor}
    #home .home-hero-head{margin-top:-3px!important;margin-bottom:0!important;min-height:40px!important;align-items:center!important;gap:8px!important}
    #home .home-title h2{font-size:23px!important;line-height:1.05!important;margin:0!important}
    #home .home-title>p,#home .home-last-label{display:none!important}
    #home .home-hero-actions{display:flex!important;align-items:center!important;gap:7px!important;flex-wrap:nowrap!important;justify-content:flex-end!important}
    #home .home-date-pill{border:0!important;background:transparent!important;color:#53617a!important;padding:2px 0!important;font-size:9px!important;white-space:nowrap!important}
    .fixa-week-filters{display:flex;align-items:center;gap:6px}
    .fixa-week-folder-filter{height:32px;min-width:160px;padding:0 7px 0 9px;border:1px solid #dbe5f4;border-radius:8px;background:#fff;display:flex;align-items:center;gap:6px;color:#53617a}
    .fixa-week-folder-filter svg{width:14px;height:14px;flex:0 0 auto}
    .fixa-week-folder-filter select{border:0!important;box-shadow:none!important;padding:0 20px 0 0!important;background:#fff!important;font-size:10px!important;font-weight:750!important;color:#26324b!important}
    .fixa-week-period{display:flex;gap:5px}.fixa-week-period button{height:32px;padding:0 11px!important;border:1px solid #dbe5f4;color:#334155;background:#fff;font-size:10px!important;font-weight:800}.fixa-week-period button.active{border-color:#9fc1ff;color:#2563eb;background:#f5f9ff}
    [data-home-panel="today"]>.home-shell{gap:7px!important;padding-bottom:6px!important}

    #homeFooterStats{display:grid!important;grid-template-columns:1.05fr 1fr 1.05fr!important;gap:8px!important;height:auto!important;min-height:0!important}
    .fixa-week-top-card{height:86px!important;min-height:86px!important;padding:9px 11px!important;display:grid!important;grid-template-rows:auto auto auto auto!important;gap:2px!important;overflow:hidden!important}
    .fixa-week-top-head{display:flex;align-items:center;gap:6px;min-width:0}.fixa-week-top-head h3{margin:0;font-size:11px;line-height:14px;flex:1;white-space:nowrap}.fixa-week-top-head>b{color:#2563eb;font-size:9px;white-space:nowrap}.fixa-week-symbol{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-symbol.orange{background:#fff2e7;color:#ea580c}.fixa-week-symbol svg{width:13px;height:13px}
    .fixa-week-main-value{font-size:20px;line-height:21px;color:#172033}.fixa-week-top-card>small{font-size:8.5px;line-height:10px;color:#687086}.fixa-week-top-card>.home-progress{height:4px!important;margin-top:1px!important}.fixa-week-days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:3px}.fixa-week-day{display:grid;place-items:center;gap:1px;color:#64748b}.fixa-week-day i{width:20px;height:20px;border:1px solid #dde5ef;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:9px;background:#fff}.fixa-week-day.active i{border-color:#f5b071;color:#8a4300;background:#f7b373}.fixa-week-day b{font-size:7.5px;color:#26324b}

    #homeSummaryCards.fixa-week-summary{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important}
    .fixa-week-summary-card{height:62px!important;min-height:62px!important;padding:7px 9px!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;align-items:center!important;gap:8px!important}
    .fixa-week-summary-card .home-card-number{font-size:18px!important;line-height:19px!important}.fixa-week-summary-card strong{font-size:10px!important;line-height:12px!important;margin-bottom:1px!important}.fixa-week-summary-card small{font-size:8px!important;line-height:9px!important}.fixa-week-summary-icon{width:34px;height:34px;border-radius:9px;display:grid;place-items:center}.fixa-week-summary-icon svg{width:20px;height:20px}.fixa-week-summary-icon.green{color:#15803d;background:#effbf3}.fixa-week-summary-icon.cyan{color:#0284c7;background:#ecf8ff}.fixa-week-summary-icon.orange{color:#ea580c;background:#fff3e8}.fixa-week-summary-icon.purple{color:#9333ea;background:#f7efff}.fixa-week-summary-icon.blue{color:#2563eb;background:#eef4ff}

    .home-today-grid{display:grid!important;grid-template-columns:1.02fr 1.08fr .96fr .94fr!important;gap:8px!important;align-items:stretch!important}
    .home-today-grid>.home-panel{height:198px!important;min-height:198px!important;padding:9px 10px!important;overflow:hidden!important}
    .home-today-grid .home-panel-head{min-height:22px!important;margin:0 0 5px!important}.home-today-grid .home-panel-head h3{font-size:11px!important;line-height:14px!important;margin:0!important}
    .home-study-card .home-study-head{min-height:34px!important;margin:0 0 4px!important}.home-study-card .home-study-head h3{font-size:11px!important;line-height:14px!important;margin:0!important}.home-study-card .home-kicker{display:none!important}.home-study-card #homeStudyText{margin:2px 0 0!important;font-size:8px!important;line-height:10px!important}.home-study-card .home-focus-box{padding:0!important;border:0!important;background:transparent!important;height:145px!important;margin-top:4px!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important}
    .fixa-week-review-list{display:grid!important;gap:5px!important}.fixa-week-review{padding:6px 7px;border:1px solid #e2e9f3;border-radius:7px;background:#fff;cursor:pointer}.fixa-week-review-head,.fixa-week-review-meta{display:flex;justify-content:space-between;align-items:center;gap:6px}.fixa-week-review-head strong{font-size:9.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fixa-week-review-head span,.fixa-week-review-meta span,.fixa-week-review-meta b{font-size:7.5px;color:#687086;white-space:nowrap}.fixa-week-review-progress{height:3px;margin-top:4px;border-radius:999px;background:#e8edf4;overflow:hidden}.fixa-week-review-progress span{display:block;height:100%;border-radius:inherit;background:#2563eb}

    .home-today-grid .home-collection-scroll{height:158px!important;max-height:158px!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important;padding-right:3px!important}.home-collection-grid.fixa-week-collection-list{display:grid!important;grid-template-columns:1fr!important;gap:5px!important}.fixa-week-collection{min-height:74px!important;height:auto!important;padding:6px 7px!important}.fixa-week-collection .home-collection-head{margin-bottom:2px!important}.fixa-week-collection .home-collection-name,.fixa-week-collection .home-collection-total{font-size:8.5px!important}.fixa-week-collection .home-collection-metrics{margin:2px 0 3px!important}.fixa-week-collection .home-collection-metrics b{font-size:10px!important}.fixa-week-collection .home-collection-metrics small{font-size:7px!important}.fixa-week-folder-mini{width:13px;height:13px;color:#2563eb}.fixa-week-folder-mini svg{width:100%;height:100%}.fixa-week-collection .home-progress{height:3px!important}.fixa-week-collection .home-collection-foot{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;margin-top:2px!important}.fixa-week-collection .home-collection-foot>span:first-child,.fixa-collection-xp{font-size:7.5px!important}.fixa-week-collection .home-collection-foot>span:first-child{color:#687086}.fixa-week-collection .home-collection-foot>span:first-child b{color:#ef4444}.fixa-collection-xp{color:#2563eb!important;font-weight:850!important}

    .fixa-week-performance-panel .home-panel-head h3{display:flex;align-items:center;gap:5px}.fixa-week-performance-panel .home-panel-head h3 svg{width:13px;height:13px;color:#2563eb}.fixa-week-performance-list{display:grid!important;gap:4px!important;margin:0!important;padding:0!important}.fixa-week-performance-row{height:35px;padding:4px 6px;border:1px solid #e4eaf3;border-radius:7px;display:flex;align-items:center;justify-content:space-between;gap:7px}.fixa-week-performance-row>span{display:flex;align-items:center;gap:5px;min-width:0;font-size:8px;color:#53617a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fixa-week-performance-row i{width:20px;height:20px;flex:0 0 20px;border-radius:6px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-performance-row i.orange{background:#fff4e7;color:#ea580c}.fixa-week-performance-row i.green{background:#eefbf2;color:#16a34a}.fixa-week-performance-row i svg{width:11px;height:11px}.fixa-week-performance-row>b{font-size:9px;white-space:nowrap}

    .fixa-week-goals-panel .home-panel-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:5px!important}.fixa-week-goals-panel .home-panel-head h3{display:flex;align-items:center;gap:5px}.fixa-week-goals-panel .home-panel-head h3 svg{width:13px;height:13px;color:#2563eb}.fixa-week-add-goals{height:25px!important;padding:0 7px!important;display:inline-flex!important;align-items:center!important;gap:4px!important;font-size:7.5px!important;font-weight:800!important}.fixa-week-add-goals svg{width:10px;height:10px}.fixa-week-goal-list{display:grid!important;gap:6px!important;margin:0!important;padding:0!important}.fixa-week-goal{min-height:45px;padding:5px 6px;border:1px solid #e4eaf3;border-radius:7px;background:#fff}.fixa-week-goal-head{display:grid;grid-template-columns:20px minmax(0,1fr);gap:5px;align-items:center}.fixa-week-goal-head>i{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-goal-head>i svg{width:11px;height:11px}.fixa-week-goal-head>span{min-width:0}.fixa-week-goal-head strong{display:block;font-size:8px;line-height:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fixa-week-goal-head small{display:block;font-size:7px;color:#687086}.fixa-week-goal .home-progress{height:3px!important;margin-top:4px!important}

    .fixa-week-analysis-grid{display:grid!important;grid-template-columns:.92fr .92fr 1.35fr!important;gap:8px!important;align-items:stretch!important}.fixa-week-analysis-card{height:142px!important;min-height:142px!important;padding:8px 10px!important;overflow:hidden!important}.fixa-week-analysis-card .home-panel-head{min-height:21px!important;margin:0 0 5px!important}.fixa-week-analysis-card .home-panel-head h3{display:flex!important;align-items:center!important;gap:5px!important;margin:0!important;font-size:10px!important;line-height:12px!important}.fixa-week-analysis-card .home-panel-head h3 svg{width:12px;height:12px;color:#2563eb}.fixa-week-analysis-card .home-panel-head p{margin:1px 0 0!important;font-size:7px!important;line-height:9px!important}
    #fixaWeekPriorities{display:grid;gap:7px;padding-top:3px}.fixa-week-priority-row{display:grid;grid-template-columns:minmax(0,1fr) 46px 32px;align-items:center;gap:5px;font-size:8px}.fixa-week-priority-row>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fixa-week-priority-row>b{padding:2px 4px;border-radius:999px;text-align:center;font-size:7px}.fixa-week-priority-row>b.high{color:#dc2626;background:#fff0f0}.fixa-week-priority-row>b.medium{color:#b45309;background:#fff7e6}.fixa-week-priority-row>b.low{color:#15803d;background:#effbf2}.fixa-week-priority-row>strong{text-align:right;font-size:8px;color:#53617a}
    .fixa-week-status{height:100px;display:grid;grid-template-columns:minmax(0,1fr) 78px;gap:7px;align-items:center}.fixa-week-status-list{display:grid;gap:5px}.fixa-week-status-list>div{display:grid;grid-template-columns:6px minmax(0,1fr) auto 23px;gap:4px;align-items:center;font-size:7.5px}.fixa-week-status-list i{width:6px;height:6px;border-radius:50%}.fixa-week-status-list i.green{background:#22c55e}.fixa-week-status-list i.blue{background:#3b82f6}.fixa-week-status-list i.orange{background:#f59e0b}.fixa-week-status-list i.red{background:#ef4444}.fixa-week-status-list small{color:#7b879b;text-align:right}.fixa-week-donut{width:74px;height:74px;border-radius:50%;display:grid;place-items:center;position:relative}.fixa-week-donut:after{content:"";position:absolute;inset:13px;border-radius:50%;background:#fff}.fixa-week-donut span{position:relative;z-index:1;display:grid;text-align:center}.fixa-week-donut b{font-size:13px}.fixa-week-donut small{font-size:6.5px;color:#687086}.fixa-week-chart-card #homeChart{height:100px!important;min-height:100px!important;margin:0!important}.fixa-week-chart-card #homeChart svg{width:100%!important;height:100%!important;display:block!important}.fixa-week-chart-card .home-chart-note{display:none!important}

    .fixa-week-goals-overlay{position:fixed;inset:0;z-index:1300;padding:18px;background:rgba(15,23,42,.42);display:grid;place-items:center}.fixa-week-goals-modal{width:min(520px,100%);border:1px solid #dbe5f4;border-radius:16px;background:#fff;box-shadow:0 28px 70px rgba(15,23,42,.24);overflow:hidden}.fixa-week-goals-modal header{padding:18px 20px 14px;display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #e6ecf5}.fixa-week-goals-modal h3{margin:0 0 5px;font-size:17px}.fixa-week-goals-modal p{margin:0;color:#687086;font-size:10px}.fixa-week-goals-modal header button{width:32px;height:32px;padding:0;color:#53617a;background:transparent;font-size:22px}.fixa-week-goals-fields{padding:18px 20px;display:grid;gap:11px}.fixa-week-goals-fields label{display:grid;grid-template-columns:minmax(0,1fr) 100px;align-items:center;gap:12px;font-size:11px;font-weight:750}.fixa-week-goals-fields input{height:38px;text-align:center}.fixa-week-goals-modal footer{padding:13px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e6ecf5}.fixa-week-goals-modal footer button{min-height:38px;font-size:11px;font-weight:800}.fixa-week-goals-modal footer .secondary{border:1px solid #dbe5f4;background:#fff}

    @media(max-width:1150px){#homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}.home-today-grid{grid-template-columns:1fr 1fr!important}.home-today-grid>.home-panel{height:210px!important}.fixa-week-analysis-grid{grid-template-columns:1fr 1fr!important}.fixa-week-chart-card{grid-column:1/-1}.fixa-week-chart-card{height:150px!important}}
    @media(max-width:760px){#home .home-hero-head{align-items:flex-start!important;gap:6px!important}.fixa-week-filters{width:100%;flex-wrap:wrap}.fixa-week-folder-filter{flex:1;min-width:180px}#homeFooterStats,#homeSummaryCards.fixa-week-summary,.home-today-grid,.fixa-week-analysis-grid{grid-template-columns:1fr!important}.home-today-grid>.home-panel{height:auto!important;min-height:0!important}.home-study-card .home-focus-box,.home-today-grid .home-collection-scroll{height:auto!important;max-height:none!important}.fixa-week-analysis-card{height:auto!important;min-height:150px!important}.fixa-week-chart-card{grid-column:auto}.fixa-week-goals-fields label{grid-template-columns:1fr}.fixa-week-status{grid-template-columns:1fr auto}}
  `;
  document.head.appendChild(style);

  let refreshTimer = 0;
  function queueRefresh(delay = 0) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      requestAnimationFrame(() => {
        setupLayout();
        renderWeeklyDashboard();
      });
    }, delay);
  }

  function install() {
    if (!setupLayout()) return false;

    document.addEventListener('change', event => {
      const select = event.target.closest('#fixaWeekFolderFilter');
      if (!select) return;
      state.folderId = select.value || 'all';
      renderWeeklyDashboard();
    });

    document.addEventListener('click', event => {
      const period = event.target.closest('[data-fixa-week-period]');
      if (period) {
        state.period = period.dataset.fixaWeekPeriod === 'month' ? 'month' : 'week';
        renderWeeklyDashboard();
        return;
      }
      if (event.target.closest('[data-fixa-add-goals]')) {
        openGoalsModal();
        return;
      }
      if (event.target.closest('[data-fixa-goals-close]') || event.target.matches('.fixa-week-goals-overlay')) {
        document.querySelector('.fixa-week-goals-overlay')?.remove();
        return;
      }
      if (event.target.closest('[data-fixa-goals-save]')) {
        saveGoalsModal();
        return;
      }
      if (event.target.closest('[data-home-tab="today"], [data-view="home"], #homeTopTab')) {
        queueRefresh(20);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && document.querySelector('#home.home-view.active')) queueRefresh(30);
    });

    renderWeeklyDashboard();
    queueRefresh(80);
    window.setTimeout(() => {
      if (document.querySelector('#home.home-view')) {
        setupLayout();
        renderWeeklyDashboard();
      }
    }, 320);
    return true;
  }

  if (!install()) document.addEventListener('DOMContentLoaded', () => install(), { once: true });
})();
