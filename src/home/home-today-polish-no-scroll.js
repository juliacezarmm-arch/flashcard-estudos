(() => {
  'use strict';

  if (window.FixaHomeWeeklyDashboardV2?.refresh) return;
  const api = window.FixaHomeWeeklyDashboardV2 = { refresh: null };

  const state = {
    folderId: 'all',
    period: 'week',
    mainTab: 'review-summary',
    analysisTab: 'priorities'
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
      snow: '<path d="M12 3v18M5.6 6.5l12.8 11M18.4 6.5l-12.8 11"></path><path d="m9 4.8 3 3 3-3M9 19.2l3-3 3 3M4.8 9l4.1 1.1-1.1-4.1M19.2 15l-4.1-1.1 1.1 4.1M19.2 9l-4.1 1.1 1.1-4.1M4.8 15l4.1-1.1-1.1 4.1"></path>',
      list: '<path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>',
      star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.chart}</g></svg>`;
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

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
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      const [year, month, day] = value.trim().split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function testDate(test) {
    return dateOf(test?.completedOn || test?.occurredOn || test?.occurred_on || test?.completedAt || test?.finishedAt || test?.date);
  }

  function localDateKey(value) {
    const date = value instanceof Date ? value : dateOf(value);
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function startOfDay(base = new Date()) {
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function endOfDay(base = new Date()) {
    const date = new Date(base);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  function startOfWeek(base = new Date()) {
    const date = startOfDay(base);
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
    if (state.period === 'today') return { start: startOfDay(now), end: endOfDay(now) };
    if (state.period === 'month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }
    return { start: startOfWeek(now), end: endOfWeek(now) };
  }

  function periodWord() {
    return state.period === 'today' ? 'hoje' : state.period === 'month' ? 'mês' : 'semana';
  }

  function periodTitle() {
    return state.period === 'today' ? 'Hoje' : state.period === 'month' ? 'Mês' : 'Semana';
  }

  function periodXpCaption() {
    return state.period === 'today' ? 'XP de hoje' : state.period === 'month' ? 'XP do mês' : 'XP da semana';
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

  function testXp(test) {
    const direct = Number(test?.xp ?? test?.xpBreakdown?.total ?? test?.points);
    if (Number.isFinite(direct) && direct > 0) return Math.max(0, direct);
    return Math.max(0, Number(test?.total || test?.question_count || 0) || 0);
  }

  function periodXpSummary() {
    const api = window.FixaCompetitionXpHomeV4;
    const range = currentRange();
    const snapshot = api?.periodSummary?.(localDateKey(range.start), localDateKey(range.end));
    return snapshot?.ready ? snapshot.summary || null : null;
  }

  function mapNumber(map, key) {
    const id = String(key || '');
    if (!map || !Object.prototype.hasOwnProperty.call(map, id)) return null;
    const value = Number(map[id]);
    return Number.isFinite(value) ? Math.max(0, value) : null;
  }

  function scopedPeriodXp(fallback, subjectId = '') {
    const summary = periodXpSummary();
    const local = Math.max(0, Number(fallback || 0));
    if (!summary) return local;
    if (subjectId) {
      const subjectValue = mapNumber(summary.by_subject, subjectId);
      return subjectValue === null ? local : subjectValue;
    }
    if (state.folderId !== 'all') {
      const folderValue = mapNumber(summary.by_folder, state.folderId);
      return folderValue === null ? local : Math.max(local, folderValue);
    }
    const total = Number(summary.total_xp);
    return Number.isFinite(total) ? Math.max(local, total) : local;
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
    const fallbackXp = tests.reduce((sum, test) => sum + testXp(test), 0);
    const xp = scopedPeriodXp(fallbackXp, subject.id);
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
      return date ? localDateKey(date) : '';
    }).filter(Boolean));
    (window.FixaHomeGoalsStreakProtectionV1?.protection?.protected_days || []).forEach(value => {
      const date = dateOf(value);
      if (date) dates.add(localDateKey(date));
    });
    if (!dates.size) return 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    const todayKey = localDateKey(cursor);
    if (!dates.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (true) {
      const key = localDateKey(cursor);
      if (!dates.has(key)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function masteredInRange() {
    const { start, end } = currentRange();
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

  function cardsTouchedInRange() {
    const { start, end } = currentRange();
    return allCards().filter(({ card }) => (Array.isArray(card.attemptHistory) ? card.attemptHistory : []).some(attempt => {
      const date = dateOf(attempt.created_at || attempt.createdAt || attempt.answeredAt || attempt.date);
      return date && date >= start && date <= end;
    }));
  }

  function userId() {
    try { return currentUser?.id || window.currentUser?.id || 'local'; } catch (_) { return window.currentUser?.id || 'local'; }
  }

  function periodKeyDate() {
    const now = new Date();
    if (state.period === 'today') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (state.period === 'month') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const start = startOfWeek(now);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  }

  function goalsKey() {
    if (state.period === 'week') return `fixa:weekly-goals:${userId()}:${periodKeyDate()}`;
    return `fixa:${state.period}-goals:${userId()}:${periodKeyDate()}`;
  }

  function defaultGoals() {
    if (state.period === 'today') return { questions: 20, tests: 2, mastered: 5 };
    if (state.period === 'month') return { questions: 240, tests: 24, mastered: 80 };
    return { questions: 60, tests: 6, mastered: 20 };
  }

  function periodGoals() {
    const defaults = defaultGoals();
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

  function goalProgress() {
    const goals = periodGoals();
    const tests = testsInRange();
    const values = {
      questions: tests.reduce((sum, test) => sum + Number(test.total || 0), 0),
      tests: tests.length,
      mastered: masteredInRange()
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
    if (state.period === 'today') {
      const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(start);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
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

  function fillFolderFilter() {
    const select = document.querySelector('#fixaWeekFolderFilter');
    if (!select) return;
    const previous = state.folderId;
    const options = folders();
    const expected = ['all', ...options.map(folder => String(folder.id))];
    const current = [...select.options].map(option => option.value);
    if (current.length !== expected.length || current.some((value, index) => value !== expected[index])) {
      select.innerHTML = '<option value="all">Todas as pastas</option>' + options.map(folder => `<option value="${esc(folder.id)}">${esc(folder.name)}</option>`).join('');
    }
    state.folderId = options.some(folder => String(folder.id) === String(previous)) ? String(previous) : 'all';
    if (select.value !== state.folderId) select.value = state.folderId;
  }

  function renderTopCards() {
    const target = document.querySelector('#homeFooterStats');
    if (!target) return;
    const tests = testsInRange();
    const studiedMs = tests.reduce((sum, test) => sum + Number(test.durationMs || 0), 0);
    const goal = goalProgress();
    const streak = consecutiveStreak();
    const weekStart = startOfWeek(new Date());
    const studiedDays = new Set(completedTests().map(test => {
      const date = testDate(test);
      return date ? localDateKey(date) : '';
    }));
    const letters = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const key = localDateKey(date);
      const active = studiedDays.has(key);
      return `<span class="fixa-week-day${active ? ' active' : ''}"><i>${active ? '✓' : ''}</i><b>${letters[index]}</b></span>`;
    }).join('');
    const targetMs = state.period === 'today' ? 2 * 60 * 60 * 1000 : state.period === 'month' ? 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
    const timeProgress = clamp(studiedMs / targetMs * 100);
    const timeTitle = state.period === 'today' ? 'Tempo estudado hoje' : state.period === 'month' ? 'Tempo estudado no mês' : 'Tempo estudado na semana';
    const timeTarget = state.period === 'today' ? 'Meta diária: 2h' : state.period === 'month' ? 'Meta mensal: 24h' : 'Meta semanal: 6h';
    const goalTitle = state.period === 'today' ? 'Objetivo do dia' : state.period === 'month' ? 'Objetivo do mês' : 'Objetivo da semana';

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
        <strong class="fixa-week-main-value">${goal.percent}%</strong><small>Progresso geral dos objetivos</small>
        <div class="home-progress"><span style="width:${goal.percent}%"></span></div>
      </article>`;

    const datePill = document.querySelector('#homeDatePill');
    if (datePill) datePill.textContent = rangeLabel();
  }

  function createSummaryCard([ico, label, value, caption, tone]) {
    const card = document.createElement('article');
    card.className = `home-card fixa-week-summary-card${label.startsWith('XP') ? ' fixa-xp-card' : ''}`;
    card.dataset.fixaSummaryKey = label;
    card.innerHTML = `<span class="fixa-week-summary-icon ${tone}">${icon(ico)}</span><span><strong></strong><span class="home-card-number"></span><small class="home-muted"></small></span>`;
    updateSummaryCard(card, [ico, label, value, caption, tone]);
    return card;
  }

  function updateSummaryCard(card, [ico, label, value, caption, tone]) {
    card.className = `home-card fixa-week-summary-card${label.startsWith('XP') ? ' fixa-xp-card' : ''}`;
    card.dataset.fixaSummaryKey = label;
    const iconBox = card.querySelector('.fixa-week-summary-icon');
    if (iconBox) {
      iconBox.className = `fixa-week-summary-icon ${tone}`;
      if (iconBox.dataset.fixaIcon !== ico) {
        iconBox.dataset.fixaIcon = ico;
        iconBox.innerHTML = icon(ico);
      }
    }
    const title = card.querySelector('strong');
    const number = card.querySelector('.home-card-number');
    const small = card.querySelector('small');
    if (title && title.textContent !== String(label)) title.textContent = label;
    if (number && number.textContent !== String(value)) number.textContent = value;
    if (small && small.textContent !== String(caption)) small.textContent = caption;
  }

  function renderSummaryCards() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return;
    const all = allCards();
    const frozen = all.filter(item => statusOf(item.card) === 'frozen').length;
    const cards = all.filter(item => statusOf(item.card) !== 'frozen');
    const mastered = cards.filter(item => statusOf(item.card) === 'mastered').length;
    const tests = testsInRange();
    const total = tests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const score = tests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const fallbackXp = tests.reduce((sum, test) => sum + testXp(test), 0);
    const xp = scopedPeriodXp(fallbackXp);
    const rows = [
      ['books', 'Coleções', subjects().length, 'Total de coleções', 'green'],
      ['question', 'Questões', cards.length, 'Total de questões', 'cyan'],
      ['snow', 'Congeladas', frozen, 'Questões congeladas', 'ice'],
      ['trophy', 'Dominadas', mastered, `${percent(mastered, cards.length)}% do total`, 'orange'],
      ['chart', 'Aproveitamento', `${percent(score, total)}%`, `Média de ${periodWord()}`, 'purple'],
      ['target', 'XP Coleções', xp, periodXpCaption(), 'blue']
    ];

    grid.classList.add('fixa-week-summary');
    const current = [...grid.children];
    const sameStructure = current.length === rows.length
      && rows.every((row, index) => current[index]?.dataset?.fixaSummaryKey === row[1]);

    if (!sameStructure) {
      const fragment = document.createDocumentFragment();
      rows.forEach(row => fragment.appendChild(createSummaryCard(row)));
      grid.replaceChildren(fragment);
      return;
    }

    rows.forEach((row, index) => updateSummaryCard(current[index], row));
  }

  function reviewItems() {
    return subjects().map(subject => ({ subject, stats: subjectStats(subject) }))
      .filter(item => item.stats.review > 0)
      .sort((a, b) => b.stats.review - a.stats.review || b.stats.total - a.stats.total);
  }

  function renderReviews() {
    const list = document.querySelector('#homeStudyRecommendations');
    if (!list) return;
    const items = reviewItems().slice(0, 20);
    const planned = items.reduce((sum, item) => sum + Math.min(10, Math.max(1, item.stats.review)), 0);

    list.className = 'home-recommendation-list fixa-week-review-list';
    list.innerHTML = items.length ? items.map(({ subject, stats }) => {
      const target = Math.min(10, Math.max(1, stats.review));
      const done = Math.min(target, stats.answered);
      const progress = percent(done, target);
      return `<article class="fixa-week-review" data-home-subject="${esc(subject.id)}" tabindex="0">
        <div class="fixa-week-review-head"><strong>${esc(subject.name)}</strong><span>Meta: ${target} questões</span></div>
        <div class="fixa-week-review-meta"><span>${done} de ${target} concluídas</span><b>${progress}%</b></div>
        <div class="fixa-week-review-progress"><span style="width:${progress}%"></span></div>
      </article>`;
    }).join('') : '<p class="home-muted">Nenhuma revisão pendente para esta seleção.</p>';

    const title = document.querySelector('.home-study-card h3');
    const kicker = document.querySelector('.home-study-card .home-kicker');
    const text = document.querySelector('#homeStudyText');
    if (kicker) kicker.textContent = '';
    if (title) title.textContent = state.period === 'today' ? 'Revisões para hoje' : state.period === 'month' ? 'Revisões para o mês' : 'Revisões para a semana';
    if (text) text.textContent = items.length ? `${planned} questões planejadas para ${periodWord()}.` : 'Nenhuma revisão pendente para este período.';
  }

  function renderCollections() {
    const grid = document.querySelector('#homeCollectionSummary');
    if (!grid) return;
    const items = subjects().map(subject => ({ subject, stats: subjectStats(subject) }));
    grid.className = 'home-collection-grid fixa-week-collection-list';
    grid.innerHTML = items.length ? items.map(({ subject, stats }) => `
      <article class="home-collection-card fixa-week-collection" data-home-subject="${esc(subject.id)}" tabindex="0">
        <div class="home-collection-head"><div class="home-collection-name"><span class="fixa-week-folder-mini">${icon('folder')}</span><span>${esc(subject.name)}</span></div><span class="home-collection-total">${stats.total} questões</span></div>
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
    const range = currentRange();
    const studyDays = new Set(tests.map(test => {
      const date = testDate(test);
      return date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
    }).filter(Boolean));
    const span = range.end.getTime() - range.start.getTime() + 1;
    const prevStart = new Date(range.start.getTime() - span);
    const prevEnd = new Date(range.start.getTime() - 1);
    const prevTests = completedTests().filter(test => {
      const date = testDate(test);
      return date && date >= prevStart && date <= prevEnd;
    });
    const prevTotal = prevTests.reduce((sum, test) => sum + Number(test.total || 0), 0);
    const prevScore = prevTests.reduce((sum, test) => sum + Number(test.score || 0), 0);
    const currentAccuracy = total ? percent(score, total) : 0;
    const previousAccuracy = prevTotal ? percent(prevScore, prevTotal) : 0;
    const evolution = prevTotal ? currentAccuracy - previousAccuracy : 0;
    const maxDays = state.period === 'today' ? 1 : state.period === 'month' ? new Date(range.end).getDate() : 7;
    const rows = [
      ['target', 'Média de acertos', total ? `${currentAccuracy}%` : 'Sem dados', 'blue'],
      ['chart', 'Evolução em relação ao período anterior', prevTotal ? `${evolution > 0 ? '+' : ''}${evolution}%` : 'Sem dados', evolution >= 0 ? 'green' : 'orange'],
      ['question', 'Questões respondidas', String(total), 'blue'],
      ['calendar', 'Dias estudados', `${studyDays.size} de ${maxDays}`, 'blue'],
      ['chart', `Média dos testes de ${periodWord()}`, total ? `${percent(score, total)}%` : 'Sem dados', 'blue'],
      ['clock', 'Tempo médio por questão', total ? formatDuration(duration / total) : 'Sem dados', 'blue'],
      ['target', 'Melhor resultado', tests.length ? `${best} acertos` : 'Sem dados', 'orange'],
      ['target', 'Acertos mais recentes', latest, 'green']
    ];
    list.className = 'home-simple-list fixa-week-performance-list';
    list.innerHTML = rows.map(([ico, label, value, tone]) => `<li class="fixa-week-performance-row"><span><i class="${tone}">${icon(ico)}</i>${label}</span><b>${value}</b></li>`).join('');
  }

  function renderGoals() {
    const list = document.querySelector('#homeGoals');
    if (!list) return;
    const progress = goalProgress();
    const suffix = state.period === 'today' ? 'hoje' : state.period === 'month' ? 'neste mês' : 'nesta semana';
    const rows = [
      ['question', `Resolver questões ${suffix}`, progress.values.questions, progress.goals.questions],
      ['flag', `Fazer testes ${suffix}`, progress.values.tests, progress.goals.tests],
      ['target', `Dominar questões ${suffix}`, progress.values.mastered, progress.goals.mastered]
    ];
    list.className = 'home-goal-list fixa-week-goal-list';
    list.innerHTML = rows.map(([ico, label, current, target], index) => `<li class="fixa-week-goal"><div class="fixa-week-goal-head"><i>${icon(ico)}</i><span><strong>${label}</strong><small>${current} / ${target}</small></span><b class="fixa-goal-reward">+${[20,25,40][index] || 20} XP</b></div><div class="home-progress"><span style="width:${Math.max(2, clamp(current / target * 100))}%"></span></div></li>`).join('');

    const title = document.querySelector('.fixa-week-goals-panel .home-panel-head h3');
    if (title) title.innerHTML = `${icon('target')}Objetivos de ${periodWord()}`;
  }

  function priorityRows() {
    return subjects().map(subject => {
      const stats = subjectStats(subject);
      const tests = subjectTests(subject);
      const errors = tests.reduce((sum, test) => sum + Math.max(0, Number(test.total || 0) - Number(test.score || 0)), 0);
      const priority = stats.review * 4 + errors * 3 + Math.max(0, 60 - stats.accuracy);
      return { subject, stats, priority, errors };
    }).filter(item => item.stats.total > 0).sort((a, b) => b.priority - a.priority).slice(0, 8);
  }

  function renderPriorities() {
    const box = document.querySelector('#fixaWeekPriorities');
    if (!box) return;
    const rows = priorityRows();
    box.innerHTML = rows.length ? rows.map((item, index) => {
      const level = index === 0 ? 'Alta' : item.priority > 40 ? 'Média' : 'Baixa';
      const tone = level === 'Alta' ? 'high' : level === 'Média' ? 'medium' : 'low';
      return `<div class="fixa-week-priority-row">
        <span><strong>${esc(item.subject.name)}</strong><small>${item.stats.review} para revisar · ${item.errors} erros no período</small></span>
        <b class="${tone}">${level}</b><strong>${item.stats.accuracy}%</strong>
      </div>`;
    }).join('') : '<p class="home-muted">Sem prioridades suficientes neste período.</p>';
  }

  function renderStatus() {
    const box = document.querySelector('#fixaWeekStatus');
    if (!box) return;
    const touched = cardsTouchedInRange().filter(({ card }) => statusOf(card) !== 'frozen');
    const counts = { mastered: 0, learning: 0, review: 0, unseen: 0 };
    touched.forEach(({ card }) => { counts[statusOf(card)] += 1; });
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
    box.innerHTML = `<div class="fixa-week-status-copy"><p class="home-muted">Questões movimentadas em ${periodWord()}.</p><div class="fixa-week-status-list">${rows.map(([tone, label, count]) => `<div><i class="${tone}"></i><span>${label}</span><b>${count}</b><small>${percent(count, total)}%</small></div>`).join('')}</div></div><div class="fixa-week-donut" style="background:conic-gradient(#22c55e 0 ${stop1}%,#3b82f6 ${stop1}% ${stop2}%,#f59e0b ${stop2}% ${stop3}%,#ef4444 ${stop3}% 100%)"><span><b>${total}</b><small>Total</small></span></div>`;
  }

  function chartPoints() {
    const tests = testsInRange();
    const range = currentRange();
    if (state.period === 'today') {
      const buckets = Array.from({ length: 6 }, (_, index) => ({ label: `${index * 4}h`, score: 0, total: 0 }));
      tests.forEach(test => {
        const date = testDate(test);
        if (!date) return;
        const bucket = Math.min(5, Math.floor(date.getHours() / 4));
        buckets[bucket].score += Number(test.score || 0);
        buckets[bucket].total += Number(test.total || 0);
      });
      return buckets.map(bucket => ({ label: bucket.label, value: percent(bucket.score, bucket.total) }));
    }
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
      return {
        label: labels[index],
        value: percent(daily.reduce((sum, test) => sum + Number(test.score || 0), 0), daily.reduce((sum, test) => sum + Number(test.total || 0), 0))
      };
    });
  }

  function renderChart() {
    const box = document.querySelector('#homeChart');
    if (!box) return;
    const points = chartPoints();
    const width = 900;
    const height = 210;
    const left = 46;
    const right = 14;
    const top = 16;
    const bottom = 34;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const x = index => left + (points.length === 1 ? plotW / 2 : index * plotW / (points.length - 1));
    const y = value => top + (100 - clamp(value)) / 100 * plotH;
    const coords = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
    const grid = [0, 25, 50, 75, 100].map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#e8edf5" stroke-width="1"/><text x="6" y="${y(value) + 4}" font-size="10" fill="#8a94a7">${value}%</text></g>`).join('');
    const labels = points.map((point, index) => `<text x="${x(index)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#7b879b">${point.label}</text>`).join('');
    const dots = points.map((point, index) => `<circle cx="${x(index)}" cy="${y(point.value)}" r="4" fill="#fff" stroke="#2563eb" stroke-width="2"></circle>`).join('');
    box.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de desempenho em ${periodWord()}">${grid}<polyline points="${coords}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>${dots}${labels}</svg>`;
  }

  function updateTabState() {
    document.querySelectorAll('[data-fixa-main-tab]').forEach(button => {
      const active = button.dataset.fixaMainTab === state.mainTab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-fixa-main-panel]').forEach(panel => {
      panel.hidden = panel.dataset.fixaMainPanel !== state.mainTab;
    });
    document.querySelectorAll('[data-fixa-analysis-tab]').forEach(button => {
      const active = button.dataset.fixaAnalysisTab === state.analysisTab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-fixa-analysis-panel]').forEach(panel => {
      panel.hidden = panel.dataset.fixaAnalysisPanel !== state.analysisTab;
    });
  }

  function renderWeeklyDashboard() {
    if (!document.querySelector('#home.home-view')) return;
    fillFolderFilter();
    document.querySelectorAll('[data-fixa-week-period]').forEach(button => button.classList.toggle('active', button.dataset.fixaWeekPeriod === state.period));
    const todayTab = document.querySelector('[data-home-tab="today"]');
    if (todayTab) todayTab.innerHTML = `${icon('calendar')}<span>${periodTitle()}</span>`;
    renderTopCards();
    renderSummaryCards();
    renderReviews();
    renderCollections();
    renderPerformance();
    renderGoals();
    renderPriorities();
    renderStatus();
    renderChart();
    updateTabState();
  }

  function openGoalsModal() {
    document.querySelector('.fixa-week-goals-overlay')?.remove();
    const goals = periodGoals();
    const label = state.period === 'today' ? 'do dia' : state.period === 'month' ? 'do mês' : 'da semana';
    const overlay = document.createElement('div');
    overlay.className = 'fixa-week-goals-overlay';
    overlay.innerHTML = `<section class="fixa-week-goals-modal" role="dialog" aria-modal="true" aria-labelledby="fixaGoalsTitle"><header><div><h3 id="fixaGoalsTitle">Objetivos ${label}</h3><p>Defina as metas para este período. Elas ficam salvas separadamente.</p></div><button type="button" data-fixa-goals-close aria-label="Fechar">×</button></header><div class="fixa-week-goals-fields"><label>Resolver questões<input type="number" min="1" max="10000" value="${goals.questions}" data-goal="questions"></label><label>Fazer testes<input type="number" min="1" max="1000" value="${goals.tests}" data-goal="tests"></label><label>Dominar questões<input type="number" min="1" max="10000" value="${goals.mastered}" data-goal="mastered"></label></div><footer><button type="button" class="secondary" data-fixa-goals-close>Cancelar</button><button type="button" data-fixa-goals-save>Salvar objetivos</button></footer></section>`;
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
    window.FixaHomeUnifiedDashboardV2?.refresh?.();
  }

  function ensureHeader(home) {
    const hero = home.querySelector('.home-hero-head');
    const actions = home.querySelector('.home-hero-actions');
    if (!hero || !actions) return;

    let filters = home.querySelector('.fixa-week-filters');
    if (!filters) {
      filters = document.createElement('div');
      filters.className = 'fixa-week-filters';
      filters.innerHTML = `<label class="fixa-week-folder-filter">${icon('folder')}<select id="fixaWeekFolderFilter" aria-label="Filtrar por pasta"></select></label><div class="fixa-week-period" role="group" aria-label="Período do painel"><button type="button" data-fixa-week-period="today">Hoje</button><button type="button" data-fixa-week-period="week" class="active">Semana</button><button type="button" data-fixa-week-period="month">Mês</button></div>`;
      actions.appendChild(filters);
    }

    const oldTitle = hero.querySelector('.home-title');
    if (oldTitle) oldTitle.classList.add('fixa-week-title-empty');
  }

  function ensureMainPanel(today, todayShell) {
    const oldGrid = today.querySelector('.home-today-grid');
    const study = today.querySelector('.home-study-card');
    const collectionPanel = document.querySelector('#homeCollectionSummary')?.closest('.home-panel');
    const performanceList = document.querySelector('#homePerformance');
    const goalsList = document.querySelector('#homeGoals');

    let performancePanel = performanceList?.closest('.home-panel');
    if (!performancePanel) {
      performancePanel = document.createElement('article');
      performancePanel.className = 'home-panel fixa-week-performance-panel';
      performancePanel.innerHTML = `<div class="home-panel-head"><h3>${icon('chart')}Desempenho</h3></div>`;
      if (performanceList) performancePanel.appendChild(performanceList);
    }

    let goalsPanel = goalsList?.closest('.home-panel');
    if (goalsPanel) {
      goalsPanel.classList.add('fixa-week-goals-panel');
      const head = goalsPanel.querySelector('.home-panel-head');
      if (head) head.innerHTML = `<h3>${icon('target')}Objetivos</h3><button type="button" class="fixa-week-add-goals" data-fixa-add-goals>${icon('plus')}Escolher objetivos</button>`;
    }

    if (study) {
      study.querySelector('.home-icon')?.remove();
      study.querySelector('.home-kicker')?.remove();
    }

    let shell = todayShell.querySelector('.fixa-week-main-shell');
    if (!shell) {
      shell = document.createElement('section');
      shell.className = 'home-panel fixa-week-main-shell';
      shell.innerHTML = `<nav class="fixa-week-content-tabs" role="tablist" aria-label="Conteúdo do período"><button type="button" class="active" role="tab" aria-selected="true" data-fixa-main-tab="review-summary">Revisões e resumo</button><button type="button" role="tab" aria-selected="false" data-fixa-main-tab="performance-goals">Desempenho e objetivos</button></nav><div class="fixa-week-main-stage"></div>`;
    }
    const stage = shell.querySelector('.fixa-week-main-stage');

    let reviewSummary = stage.querySelector('[data-fixa-main-panel="review-summary"]');
    if (!reviewSummary) {
      reviewSummary = document.createElement('section');
      reviewSummary.className = 'fixa-week-main-pair';
      reviewSummary.dataset.fixaMainPanel = 'review-summary';
      stage.appendChild(reviewSummary);
    }

    let performanceGoals = stage.querySelector('[data-fixa-main-panel="performance-goals"]');
    if (!performanceGoals) {
      performanceGoals = document.createElement('section');
      performanceGoals.className = 'fixa-week-main-pair';
      performanceGoals.dataset.fixaMainPanel = 'performance-goals';
      performanceGoals.hidden = true;
      stage.appendChild(performanceGoals);
    }

    [study, collectionPanel].filter(Boolean).forEach(panel => {
      panel.classList.add('fixa-week-main-pane');
      panel.removeAttribute('data-fixa-main-panel');
      if (panel.parentElement !== reviewSummary) reviewSummary.appendChild(panel);
    });
    [performancePanel, goalsPanel].filter(Boolean).forEach(panel => {
      panel.classList.add('fixa-week-main-pane');
      panel.removeAttribute('data-fixa-main-panel');
      if (panel.parentElement !== performanceGoals) performanceGoals.appendChild(panel);
    });

    const summary = document.querySelector('#homeSummaryCards');
    if (summary && shell.parentElement !== todayShell) summary.insertAdjacentElement('afterend', shell);
    if (oldGrid) oldGrid.hidden = true;
    const oldPriorityPanel = document.querySelector('#homePriorities')?.closest('.home-priority-panel');
    if (oldPriorityPanel) oldPriorityPanel.hidden = true;
    return shell;
  }

  function ensureAnalysis(todayShell) {
    let shell = todayShell.querySelector('.fixa-week-analysis-shell');
    if (!shell) {
      shell = document.createElement('section');
      shell.className = 'home-panel fixa-week-analysis-shell';
      shell.innerHTML = `
        <nav class="fixa-week-content-tabs fixa-week-analysis-tabs" role="tablist" aria-label="Análise do período">
          <button type="button" class="active" role="tab" aria-selected="true" data-fixa-analysis-tab="priorities">${icon('star')}Prioridades</button>
          <button type="button" role="tab" aria-selected="false" data-fixa-analysis-tab="status">${icon('list')}Status das questões</button>
          <button type="button" role="tab" aria-selected="false" data-fixa-analysis-tab="chart">${icon('chart')}Gráfico de desempenho</button>
        </nav>
        <div class="fixa-week-analysis-stage">
          <section class="fixa-week-analysis-pane" data-fixa-analysis-panel="priorities"><div class="home-panel-head"><div><h3>Prioridades</h3><p class="home-muted">Tópicos que precisam de mais atenção em ${periodWord()}.</p></div></div><div id="fixaWeekPriorities"></div></section>
          <section class="fixa-week-analysis-pane" data-fixa-analysis-panel="status" hidden><div class="home-panel-head"><div><h3>Status das questões</h3><p class="home-muted">Situação das questões movimentadas em ${periodWord()}.</p></div></div><div id="fixaWeekStatus" class="fixa-week-status"></div></section>
          <section class="fixa-week-analysis-pane" data-fixa-analysis-panel="chart" hidden><div class="home-panel-head"><div><h3>Gráfico de desempenho</h3><p class="home-muted">Aproveitamento ao longo de ${periodWord()}.</p></div></div><div class="fixa-week-chart-wrap"></div></section>
        </div>`;
    }
    const chart = document.querySelector('#homeChart');
    const chartWrap = shell.querySelector('.fixa-week-chart-wrap');
    if (chart && chartWrap && chart.parentElement !== chartWrap) chartWrap.appendChild(chart);
    if (shell.parentElement !== todayShell) todayShell.appendChild(shell);

    shell.querySelector('[data-fixa-analysis-panel="priorities"] .home-muted').textContent = `Tópicos que precisam de mais atenção em ${periodWord()}.`;
    shell.querySelector('[data-fixa-analysis-panel="status"] .home-muted').textContent = `Situação das questões movimentadas em ${periodWord()}.`;
    shell.querySelector('[data-fixa-analysis-panel="chart"] .home-muted').textContent = `Aproveitamento ao longo de ${periodWord()}.`;
    return shell;
  }

  function setupLayout() {
    const home = document.querySelector('#home.home-view');
    const today = home?.querySelector('[data-home-panel="today"]');
    const todayShell = today?.querySelector(':scope > .home-shell');
    const nav = home?.querySelector('.home-subtabs');
    if (!home || !today || !todayShell || !nav) return false;

    nav.querySelector('[data-home-tab="progress"]')?.remove();
    nav.querySelector('[data-home-tab="analysis"]')?.remove();
    ensureHeader(home);

    const footerStats = document.querySelector('#homeFooterStats');
    const summary = document.querySelector('#homeSummaryCards');
    if (footerStats && summary && footerStats.parentElement !== todayShell) todayShell.insertBefore(footerStats, summary);

    ensureMainPanel(today, todayShell);
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
    body.home-active main{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important}
    #home.home-view{width:100%!important;max-width:none!important;overflow:visible!important}
    #home>.home-shell{gap:5px!important}
    #home .home-subtabs{margin:-4px 0 -3px!important;gap:7px!important;min-height:32px!important}
    #home .home-subtab{min-height:32px!important;padding:6px 11px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;font-size:11px!important}
    #home .home-subtab svg{width:14px;height:14px;fill:none;stroke:currentColor}
    #home .home-title.fixa-week-title-empty{display:none!important}
    .fixa-week-filters{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}
    .fixa-week-folder-filter{height:31px;min-width:184px;padding:0 8px 0 10px;border:1px solid #dbe5f4;border-radius:9px;background:#fff;display:flex;align-items:center;gap:7px;color:#53617a}
    .fixa-week-folder-filter svg{width:14px;height:14px;flex:0 0 auto}.fixa-week-folder-filter select{border:0!important;box-shadow:none!important;padding:0 22px 0 0!important;background:#fff!important;font-size:10px!important;font-weight:750!important;color:#26324b!important}
    .fixa-week-period{display:flex;gap:4px}.fixa-week-period button{height:31px;min-height:31px!important;padding:0 12px!important;border:1px solid #dbe5f4!important;border-radius:9px!important;color:#334155!important;background:#fff!important;font-size:10px!important;font-weight:800!important;box-shadow:none!important}.fixa-week-period button.active{border-color:#9fc1ff!important;color:#2563eb!important;background:#f2f7ff!important}
    [data-home-panel="today"]>.home-shell{gap:7px!important;padding-bottom:16px!important}

    #homeFooterStats{display:grid!important;grid-template-columns:1.05fr 1fr 1.05fr!important;gap:8px!important;height:auto!important;min-height:0!important}
    .fixa-week-top-card{height:96px!important;min-height:96px!important;padding:10px 13px!important;display:grid!important;grid-template-rows:auto auto auto auto!important;gap:2px!important;overflow:hidden!important}
    .fixa-week-top-head{display:flex;align-items:center;gap:7px;min-width:0}.fixa-week-top-head h3{margin:0;font-size:12px;line-height:15px;flex:1;white-space:nowrap}.fixa-week-top-head>b{color:#2563eb;font-size:10px;white-space:nowrap}.fixa-week-symbol{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-symbol.orange{background:#fff2e7;color:#ea580c}.fixa-week-symbol svg{width:14px;height:14px}
    .fixa-week-main-value{font-size:22px;line-height:24px;color:#172033}.fixa-week-top-card>small{font-size:8.5px;line-height:10px;color:#687086}.fixa-week-top-card>.home-progress{height:4px!important;margin-top:2px!important}.fixa-week-days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:3px}.fixa-week-day{display:grid;place-items:center;gap:1px;color:#64748b}.fixa-week-day i{width:22px;height:22px;border:1px solid #dde5ef;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:9px;background:#fff}.fixa-week-day.active i{border-color:#f5b071;color:#8a4300;background:#f7b373}.fixa-week-day b{font-size:8px;color:#26324b}

    #homeSummaryCards.fixa-week-summary{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important}
    .fixa-week-summary-card{height:70px!important;min-height:70px!important;padding:8px 10px!important;display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;align-items:center!important;gap:8px!important}.fixa-week-summary-card .home-card-number{font-size:19px!important;line-height:21px!important}.fixa-week-summary-card strong{font-size:10px!important;line-height:12px!important;margin-bottom:1px!important}.fixa-week-summary-card small{font-size:8px!important;line-height:9px!important}.fixa-week-summary-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center}.fixa-week-summary-icon svg{width:21px;height:21px}.fixa-week-summary-icon.green{color:#15803d;background:#effbf3}.fixa-week-summary-icon.cyan{color:#0284c7;background:#ecf8ff}.fixa-week-summary-icon.ice{color:#0f75bc;background:#eef8ff}.fixa-week-summary-icon.orange{color:#ea580c;background:#fff3e8}.fixa-week-summary-icon.purple{color:#9333ea;background:#f7efff}.fixa-week-summary-icon.blue{color:#2563eb;background:#eef4ff}

    .fixa-week-main-shell,.fixa-week-analysis-shell{width:100%!important;padding:0!important;overflow:hidden!important;border-radius:14px!important}
    .fixa-week-content-tabs{display:flex;align-items:center;gap:3px;min-height:42px;padding:4px 7px;border-bottom:1px solid #e7edf5;background:#f8faff;overflow-x:auto;scrollbar-width:none}.fixa-week-content-tabs::-webkit-scrollbar{display:none}.fixa-week-content-tabs button{min-height:33px!important;padding:0 15px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#64748b!important;font-size:10px!important;font-weight:800!important;box-shadow:none!important;white-space:nowrap}.fixa-week-content-tabs button:hover{background:#eef4ff!important;color:#2563eb!important}.fixa-week-content-tabs button.active{background:#fff!important;color:#2563eb!important;box-shadow:0 1px 4px rgba(30,64,175,.09)!important}.fixa-week-content-tabs button svg{width:14px;height:14px}
    .fixa-week-main-stage{min-height:255px;height:255px;padding:11px 13px;background:#fff}.fixa-week-main-pair{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;min-width:0}.fixa-week-main-pair[hidden]{display:none!important}.fixa-week-main-pane{height:100%!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;background:transparent!important;overflow:hidden!important}.fixa-week-main-pair>.fixa-week-main-pane:first-child{padding-right:13px!important;border-right:1px solid #edf1f6!important}.fixa-week-main-pair>.fixa-week-main-pane:last-child{padding-left:1px!important}.fixa-week-main-pane .home-panel-head{margin:0 0 8px!important;min-height:24px!important}.fixa-week-main-pane .home-panel-head h3,.home-study-card .home-study-head h3{font-size:12px!important;line-height:16px!important;margin:0!important}.home-study-card .home-study-head{margin:0 0 6px!important}.home-study-card #homeStudyText{margin:2px 0 0!important;font-size:8.5px!important}.home-study-card .home-focus-box{height:194px!important;max-height:194px!important;margin:0!important;padding:0 4px 0 0!important;border:0!important;background:transparent!important;overflow-y:auto!important;scrollbar-width:thin!important}
    .fixa-week-review-list{display:grid!important;gap:6px!important}.fixa-week-review{padding:7px 9px;border:1px solid #e2e9f3;border-radius:8px;background:#fff;cursor:pointer}.fixa-week-review-head,.fixa-week-review-meta{display:flex;justify-content:space-between;align-items:center;gap:8px}.fixa-week-review-head strong{font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fixa-week-review-head span,.fixa-week-review-meta span,.fixa-week-review-meta b{font-size:8px;color:#687086;white-space:nowrap}.fixa-week-review-progress{height:4px;margin-top:4px;border-radius:999px;background:#e8edf4;overflow:hidden}.fixa-week-review-progress span{display:block;height:100%;border-radius:inherit;background:#2563eb}
    .fixa-week-main-pane .home-collection-scroll{height:207px!important;max-height:207px!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important;padding-right:4px!important}.home-collection-grid.fixa-week-collection-list{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}.fixa-week-collection{min-height:77px!important;height:auto!important;padding:7px 9px!important}.fixa-week-collection .home-collection-head{margin-bottom:3px!important}.fixa-week-collection .home-collection-name,.fixa-week-collection .home-collection-total{font-size:9px!important}.fixa-week-collection .home-collection-metrics{margin:3px 0!important}.fixa-week-collection .home-collection-metrics b{font-size:10.5px!important}.fixa-week-collection .home-collection-metrics small{font-size:7px!important}.fixa-week-folder-mini{width:14px;height:14px;color:#2563eb}.fixa-week-folder-mini svg{width:100%;height:100%}.fixa-week-collection .home-progress{height:3px!important}.fixa-week-collection .home-collection-foot{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:7px!important;margin-top:3px!important}.fixa-week-collection .home-collection-foot>span,.fixa-collection-xp{font-size:7.5px!important}.fixa-collection-xp{color:#2563eb!important;font-weight:850!important}
    .fixa-week-performance-list{display:grid!important;grid-template-columns:1fr!important;gap:5px!important;margin:0!important;padding:0!important}.fixa-week-performance-row{min-height:45px;padding:7px 9px;border:1px solid #e4eaf3;border-radius:9px;display:flex;align-items:center;justify-content:space-between;gap:8px}.fixa-week-performance-row>span{display:flex;align-items:center;gap:7px;min-width:0;font-size:9px;color:#53617a}.fixa-week-performance-row i{width:27px;height:27px;flex:0 0 27px;border-radius:8px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-performance-row i.orange{background:#fff4e7;color:#ea580c}.fixa-week-performance-row i.green{background:#eefbf2;color:#16a34a}.fixa-week-performance-row i svg{width:14px;height:14px}.fixa-week-performance-row>b{font-size:10.5px;white-space:nowrap}
    .fixa-week-goals-panel .home-panel-head{display:flex!important;align-items:center!important;justify-content:space-between!important}.fixa-week-goals-panel .home-panel-head h3{display:flex;align-items:center;gap:6px}.fixa-week-goals-panel .home-panel-head h3 svg{width:14px;height:14px;color:#2563eb}.fixa-week-add-goals{height:27px!important;min-height:27px!important;padding:0 8px!important;display:inline-flex!important;align-items:center!important;gap:4px!important;font-size:8px!important;font-weight:800!important}.fixa-week-add-goals svg{width:10px;height:10px}.fixa-week-goal-list{display:grid!important;gap:6px!important;margin:0!important;padding:0!important}.fixa-week-goal{min-height:52px;padding:7px 9px;border:1px solid #e4eaf3;border-radius:9px;background:#fff}.fixa-week-goal-head{display:grid;grid-template-columns:25px minmax(0,1fr) auto;gap:7px;align-items:center}.fixa-goal-reward{padding:3px 6px;border-radius:999px;color:#7c3aed;background:#f3e8ff;font-size:7px;font-weight:850;white-space:nowrap}.fixa-week-goal-head>i{width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}.fixa-week-goal-head>i svg{width:13px;height:13px}.fixa-week-goal-head strong{display:block;font-size:9px;line-height:11px}.fixa-week-goal-head small{display:block;font-size:7.5px;color:#687086}.fixa-week-goal .home-progress{height:4px!important;margin-top:4px!important}

    .fixa-week-analysis-stage{height:260px;min-height:260px;padding:12px 14px;background:#fff}.fixa-week-analysis-pane{height:100%;min-height:0;overflow:hidden}.fixa-week-analysis-pane[hidden]{display:none!important}.fixa-week-analysis-pane .home-panel-head{margin:0 0 10px!important}.fixa-week-analysis-pane .home-panel-head h3{margin:0!important;font-size:13px!important;line-height:17px!important}.fixa-week-analysis-pane .home-panel-head p{margin:2px 0 0!important;font-size:9px!important}
    #fixaWeekPriorities{height:205px;overflow-y:auto;scrollbar-width:thin;display:grid;gap:7px;padding-right:4px}.fixa-week-priority-row{min-height:43px;display:grid;grid-template-columns:minmax(0,1fr) 58px 42px;align-items:center;gap:8px;padding:7px 9px;border:1px solid #e6ebf3;border-radius:8px}.fixa-week-priority-row>span{min-width:0}.fixa-week-priority-row>span>strong{display:block;font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fixa-week-priority-row>span>small{display:block;margin-top:2px;color:#7b879b;font-size:7.5px}.fixa-week-priority-row>b{padding:3px 5px;border-radius:999px;text-align:center;font-size:7.5px}.fixa-week-priority-row>b.high{color:#dc2626;background:#fff0f0}.fixa-week-priority-row>b.medium{color:#b45309;background:#fff7e6}.fixa-week-priority-row>b.low{color:#15803d;background:#effbf2}.fixa-week-priority-row>strong{text-align:right;font-size:9px;color:#53617a}
    .fixa-week-status{height:200px;display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:28px;align-items:center}.fixa-week-status-copy>.home-muted{margin-bottom:12px!important}.fixa-week-status-list{display:grid;gap:8px}.fixa-week-status-list>div{min-height:30px;display:grid;grid-template-columns:8px minmax(0,1fr) auto 34px;gap:7px;align-items:center;font-size:9px}.fixa-week-status-list i{width:8px;height:8px;border-radius:50%}.fixa-week-status-list i.green{background:#22c55e}.fixa-week-status-list i.blue{background:#3b82f6}.fixa-week-status-list i.orange{background:#f59e0b}.fixa-week-status-list i.red{background:#ef4444}.fixa-week-status-list small{color:#7b879b;text-align:right}.fixa-week-donut{width:132px;height:132px;border-radius:50%;display:grid;place-items:center;position:relative}.fixa-week-donut:after{content:"";position:absolute;inset:25px;border-radius:50%;background:#fff}.fixa-week-donut span{position:relative;z-index:1;display:grid;text-align:center}.fixa-week-donut b{font-size:22px}.fixa-week-donut small{font-size:8px;color:#687086}.fixa-week-chart-wrap,#homeChart{height:202px!important;min-height:202px!important;margin:0!important}.fixa-week-chart-wrap #homeChart svg{width:100%!important;height:100%!important;display:block!important}.fixa-week-analysis-tabs button{display:inline-flex!important;align-items:center!important;gap:6px!important}

    .fixa-week-goals-overlay{position:fixed;inset:0;z-index:1300;padding:18px;background:rgba(15,23,42,.42);display:grid;place-items:center}.fixa-week-goals-modal{width:min(520px,100%);border:1px solid #dbe5f4;border-radius:16px;background:#fff;box-shadow:0 28px 70px rgba(15,23,42,.24);overflow:hidden}.fixa-week-goals-modal header{padding:18px 20px 14px;display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #e6ecf5}.fixa-week-goals-modal h3{margin:0 0 5px;font-size:17px}.fixa-week-goals-modal p{margin:0;color:#687086;font-size:10px}.fixa-week-goals-modal header button{width:32px;height:32px;padding:0;color:#53617a;background:transparent;font-size:22px}.fixa-week-goals-fields{padding:18px 20px;display:grid;gap:11px}.fixa-week-goals-fields label{display:grid;grid-template-columns:minmax(0,1fr) 100px;align-items:center;gap:12px;font-size:11px;font-weight:750}.fixa-week-goals-fields input{height:38px;text-align:center}.fixa-week-goals-modal footer{padding:13px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e6ecf5}.fixa-week-goals-modal footer button{min-height:38px;font-size:11px;font-weight:800}.fixa-week-goals-modal footer .secondary{border:1px solid #dbe5f4;background:#fff}

    @media(max-width:1150px){#homeSummaryCards.fixa-week-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    @media(max-width:760px){.fixa-week-filters{width:100%;justify-content:stretch}.fixa-week-folder-filter{flex:1;min-width:170px}.fixa-week-period{width:100%}.fixa-week-period button{flex:1}#homeFooterStats,#homeSummaryCards.fixa-week-summary{grid-template-columns:1fr!important}.fixa-week-top-card,.fixa-week-summary-card{height:auto!important;min-height:82px!important}.fixa-week-main-stage,.fixa-week-analysis-stage{height:auto!important;min-height:280px!important}.fixa-week-main-pair{height:auto!important;grid-template-columns:1fr!important;gap:12px!important}.fixa-week-main-pair>.fixa-week-main-pane:first-child{padding-right:0!important;padding-bottom:12px!important;border-right:0!important;border-bottom:1px solid #edf1f6!important}.fixa-week-main-pair>.fixa-week-main-pane:last-child{padding-left:0!important}.fixa-week-main-pane{height:auto!important;min-height:250px!important}.home-study-card .home-focus-box,.fixa-week-main-pane .home-collection-scroll{height:240px!important;max-height:240px!important}.fixa-week-status{grid-template-columns:1fr!important;height:auto!important}.fixa-week-donut{margin:auto}.fixa-week-goals-fields label{grid-template-columns:1fr}}
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
        window.FixaHomeUnifiedDashboardV2?.refresh?.();
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
      window.FixaHomeUnifiedDashboardV2?.refresh?.();
    });

    document.addEventListener('click', event => {
      const period = event.target.closest('[data-fixa-week-period]');
      if (period) {
        state.period = ['today', 'week', 'month'].includes(period.dataset.fixaWeekPeriod) ? period.dataset.fixaWeekPeriod : 'week';
        renderWeeklyDashboard();
        window.FixaHomeUnifiedDashboardV2?.refresh?.();
        return;
      }
      const mainTab = event.target.closest('[data-fixa-main-tab]');
      if (mainTab) {
        state.mainTab = mainTab.dataset.fixaMainTab || 'review-summary';
        updateTabState();
        return;
      }
      const analysisTab = event.target.closest('[data-fixa-analysis-tab]');
      if (analysisTab) {
        state.analysisTab = analysisTab.dataset.fixaAnalysisTab || 'priorities';
        updateTabState();
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
      if (event.target.closest('[data-home-tab="today"], [data-view="home"], #homeTopTab')) queueRefresh(20);
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && document.querySelector('#home.home-view.active')) queueRefresh(30);
    });

    renderWeeklyDashboard();
    return true;
  }

  api.refresh = () => {
    if (!setupLayout()) return false;
    renderWeeklyDashboard();
    window.FixaHomeUnifiedDashboardV2?.refresh?.();
    return true;
  };

  if (!install()) document.addEventListener('DOMContentLoaded', () => install(), { once: true });
})();
