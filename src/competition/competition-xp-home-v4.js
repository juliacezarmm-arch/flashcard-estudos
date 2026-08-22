(() => {
  'use strict';
  if (window.FixaCompetitionXpHomeV4) return;

  const getClient = () => {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== 'undefined') return supabaseClient;
    } catch {}
    return null;
  };

  const getUserId = () => {
    try {
      if (window.currentUser?.id) return window.currentUser.id;
      if (typeof currentUser !== 'undefined' && currentUser?.id) return currentUser.id;
    } catch {}
    return null;
  };

  const appData = () => {
    try {
      if (typeof data !== 'undefined') return data;
    } catch {}
    return null;
  };

  const folders = () => Array.isArray(appData()?.folders) ? appData().folders : [];
  const subjects = () => Array.isArray(appData()?.subjects) ? appData().subjects : [];
  const history = () => Array.isArray(appData()?.testHistory) ? appData().testHistory : [];

  const state = {
    competitions: [],
    summary: { total_xp: 0, today_xp: 0, by_folder: {}, by_subject: {} },
    syncing: false,
    lastSignature: ''
  };

  /*
   * Este módulo cuida dos dados de XP e dos badges de coleção/histórico.
   * Os seis cards do topo da Home pertencem exclusivamente ao renderizador
   * principal da Home (FixaHomeWeeklyDashboardV2). Não alterar #homeSummaryCards
   * aqui evita disputa de DOM, mudança de colunas e piscadas no dashboard.
   */
  const style = document.createElement('style');
  style.id = 'fixaCompetitionXpHomeV4Style';
  style.textContent = `
    .fixa-collection-xp {
      margin-left: auto;
      color: #2563eb;
      font-weight: 850;
      white-space: nowrap;
    }

    .fixa-history-xp {
      display: inline-flex;
      align-items: center;
      width: max-content;
      margin-top: 4px;
      border-radius: 999px;
      padding: 4px 8px;
      color: #1d4ed8;
      background: #eaf2ff;
      font-size: 11px;
      font-weight: 850;
    }

    .fixa-history-xp-detail {
      margin-left: 5px;
      color: #64748b;
      font-weight: 650;
    }
  `;
  document.head.appendChild(style);

  const dateKey = value => {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  };

  const subjectById = id => subjects().find(item => String(item.id) === String(id));
  const folderById = id => folders().find(item => String(item.id) === String(id));

  function testContext(item) {
    const ids = Array.isArray(item?.subjectIds) && item.subjectIds.length
      ? item.subjectIds
      : [item?.subjectId].filter(Boolean);

    for (const id of ids) {
      const subject = subjectById(id);
      if (!subject) continue;

      if (subject.sharedCompetitionId) {
        const competition = state.competitions.find(row => row.id === subject.sharedCompetitionId);
        if (competition) {
          return {
            folderId: String(competition.folder_id || ''),
            folderName: competition.folder_name || '',
            competitionId: competition.id,
            subjectIds: ids.map(String)
          };
        }
      }

      const folder = folderById(subject.folder);
      if (folder) {
        return {
          folderId: String(folder.id),
          folderName: folder.name || '',
          competitionId: null,
          subjectIds: ids.map(String)
        };
      }
    }

    return null;
  }

  function questionKey(card) {
    return String(card?.questionCode || card?.id || `${card?.q || ''}|${card?.correctAnswerText || card?.a || ''}`);
  }

  function masteredKeys(item) {
    const output = [];
    const testId = String(item?.id || '');
    if (!testId) return output;

    subjects().forEach(subject => {
      (subject.cards || []).forEach(card => {
        const gained = (card.attemptHistory || []).some(entry =>
          String(entry.testId || '') === testId
          && entry.statusBefore !== 'mastered'
          && entry.statusAfter === 'mastered'
        );
        if (gained) output.push(`${subject.sharedSourceSubjectId || subject.id}:${questionKey(card)}`);
      });
    });

    return [...new Set(output)];
  }

  async function rpc(name, args) {
    const client = getClient();
    if (!client) return { data: null, error: new Error('Supabase indisponível.') };
    return client.rpc(name, args);
  }

  async function loadCompetitions() {
    const { data: rows, error } = await rpc('list_my_competitions', {});
    if (!error && Array.isArray(rows)) state.competitions = rows;
  }

  function matchingCompetitions(context) {
    if (!context) return [];
    if (context.competitionId) {
      return state.competitions.filter(item => item.id === context.competitionId);
    }
    return state.competitions.filter(item => String(item.folder_id || '') === String(context.folderId || ''));
  }

  async function recordTest(item) {
    const context = testContext(item);
    const day = dateKey(item.date);
    if (!context || !day || !item.id) return;

    const meta = {
      accuracy: Number(item.total || 0) > 0 ? Math.round(Number(item.score || 0) / Number(item.total || 0) * 100) : 0,
      question_count: Math.max(0, Number(item.total || 0)),
      mastered_question_keys: masteredKeys(item),
      folder_id: context.folderId,
      folder_name: context.folderName,
      subject: item.subject || ''
    };

    const { data: general } = await rpc('record_user_xp', {
      p_event_type: 'test_completed',
      p_source_key: `test:${item.id}`,
      p_occurred_on: day,
      p_folder_id: context.folderId,
      p_folder_name: context.folderName,
      p_subject_ids: context.subjectIds,
      p_metadata: meta
    });

    const breakdown = {
      questions: Number(general?.question_points || item.total || 0),
      mastery: Number(general?.mastery_bonus_points || 0),
      review: 0,
      total: Number(general?.event_points || item.xp || 0)
    };

    for (const competition of matchingCompetitions(context)) {
      await rpc('award_competition_xp', {
        p_competition_id: competition.id,
        p_event_type: 'test_completed',
        p_source_key: `test:${item.id}`,
        p_occurred_on: day,
        p_metadata: meta
      });
    }

    if (item.mode === 'review') {
      const reviewSource = `review:${item.id}`;
      const { data: reviewGeneral } = await rpc('record_user_xp', {
        p_event_type: 'review_completed',
        p_source_key: reviewSource,
        p_occurred_on: day,
        p_folder_id: context.folderId,
        p_folder_name: context.folderName,
        p_subject_ids: context.subjectIds,
        p_metadata: meta
      });

      breakdown.review = Number(reviewGeneral?.event_points || 10);
      breakdown.total += breakdown.review;

      for (const competition of matchingCompetitions(context)) {
        await rpc('award_competition_xp', {
          p_competition_id: competition.id,
          p_event_type: 'review_completed',
          p_source_key: reviewSource,
          p_occurred_on: day,
          p_metadata: meta
        });
      }
    }

    item.xp = breakdown.total;
    item.xpBreakdown = breakdown;
  }

  function groupedByDay(items) {
    const map = new Map();
    items.forEach(item => {
      const day = dateKey(item.date);
      if (!day) return;
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(item);
    });
    return map;
  }

  function previousDay(day) {
    const date = new Date(`${day}T12:00:00`);
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  async function recordDailyGoalsAndStreaks(items) {
    const byDay = groupedByDay(items);
    const days = [...byDay.keys()].sort();

    for (const day of days) {
      const dayItems = byDay.get(day);
      const totalQuestions = dayItems.reduce((sum, item) => sum + Math.max(0, Number(item.total || 0)), 0);
      const contexts = dayItems.map(testContext).filter(Boolean);

      if (totalQuestions >= 30) {
        await rpc('record_user_xp', {
          p_event_type: 'daily_goal',
          p_source_key: `daily-goal:${day}`,
          p_occurred_on: day,
          p_folder_id: null,
          p_folder_name: null,
          p_subject_ids: [],
          p_metadata: { question_count: totalQuestions }
        });

        for (const competition of state.competitions) {
          const compQuestions = dayItems.reduce((sum, item) => {
            const context = testContext(item);
            const matches = context && matchingCompetitions(context).some(row => row.id === competition.id);
            return sum + (matches ? Math.max(0, Number(item.total || 0)) : 0);
          }, 0);

          if (compQuestions >= 30) {
            await rpc('award_competition_xp', {
              p_competition_id: competition.id,
              p_event_type: 'daily_goal',
              p_source_key: `daily-goal:${day}`,
              p_occurred_on: day,
              p_metadata: { question_count: compQuestions }
            });
          }
        }
      }

      if (byDay.has(previousDay(day))) {
        await rpc('record_user_xp', {
          p_event_type: 'streak_bonus',
          p_source_key: `streak:${day}`,
          p_occurred_on: day,
          p_folder_id: null,
          p_folder_name: null,
          p_subject_ids: [],
          p_metadata: { consecutive_day: true }
        });

        for (const competition of state.competitions) {
          const studiedToday = contexts.some(context => matchingCompetitions(context).some(row => row.id === competition.id));
          const studiedYesterday = (byDay.get(previousDay(day)) || []).some(item => {
            const context = testContext(item);
            return context && matchingCompetitions(context).some(row => row.id === competition.id);
          });

          if (studiedToday && studiedYesterday) {
            await rpc('award_competition_xp', {
              p_competition_id: competition.id,
              p_event_type: 'streak_bonus',
              p_source_key: `streak:${day}`,
              p_occurred_on: day,
              p_metadata: { consecutive_day: true }
            });
          }
        }
      }
    }
  }

  function homeSummarySignature(summary) {
    try {
      return JSON.stringify({
        total_xp: Number(summary?.total_xp || 0),
        today_xp: Number(summary?.today_xp || 0),
        by_folder: summary?.by_folder || {},
        by_subject: summary?.by_subject || {}
      });
    } catch (_) {
      return '';
    }
  }

  async function refreshSummary() {
    const previousSignature = homeSummarySignature(state.summary);
    const { data: summary, error } = await rpc('get_user_xp_summary', {});
    if (!error && summary) state.summary = summary;
    renderXpUi();

    const changed = !error && summary && homeSummarySignature(state.summary) !== previousSignature;
    if (changed && typeof window.FixaHomeWeeklyDashboardV2?.refresh === 'function') {
      requestAnimationFrame(() => window.FixaHomeWeeklyDashboardV2.refresh());
    }
  }

  function renderCollectionXp() {
    const bySubject = state.summary.by_subject || {};
    document.querySelectorAll('#homeCollectionSummary [data-home-subject]').forEach(card => {
      const subjectId = card.dataset.homeSubject;
      const points = Number(bySubject[subjectId] || 0);
      const foot = card.querySelector('.home-collection-foot');
      if (!foot) return;

      let xp = foot.querySelector('.fixa-collection-xp');
      if (!xp) {
        xp = document.createElement('span');
        xp.className = 'fixa-collection-xp';
        foot.appendChild(xp);
      }
      const next = `${points} XP`;
      if (xp.textContent !== next) xp.textContent = next;
    });
  }

  function renderHistoryXp() {
    const rows = document.querySelectorAll('#testHistory .history-item');
    rows.forEach((row, index) => {
      const item = history()[index];
      if (!item) return;

      let badge = row.querySelector('.fixa-history-xp');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'fixa-history-xp';
        row.appendChild(badge);
      }

      const breakdown = item.xpBreakdown || {};
      const details = [];
      if (Number(breakdown.questions || 0)) details.push(`${breakdown.questions} por questões`);
      if (Number(breakdown.mastery || 0)) details.push(`${breakdown.mastery} por domínio`);
      if (Number(breakdown.review || 0)) details.push(`${breakdown.review} por revisão`);
      const next = `+${Number(item.xp || 0)} XP${details.length ? `<span class="fixa-history-xp-detail">${details.join(' · ')}</span>` : ''}`;
      if (badge.innerHTML !== next) badge.innerHTML = next;
    });
  }

  function renderXpUi() {
    renderCollectionXp();
    renderHistoryXp();
  }

  let renderTimer = 0;
  let renderFrame = 0;

  function queueRenderXpUi(delay = 120) {
    if (document.hidden || renderTimer || renderFrame) return;
    renderTimer = window.setTimeout(() => {
      renderTimer = 0;
      renderFrame = requestAnimationFrame(() => {
        renderFrame = 0;
        renderXpUi();
      });
    }, delay);
  }

  function testXpAlreadySynced(item) {
    return Boolean(item?.xpBreakdown && Object.prototype.hasOwnProperty.call(item, 'xp'));
  }

  async function syncAll(force = false) {
    if (state.syncing || !getClient() || !getUserId() || !appData()) return;
    const signature = history().map(item => `${item.id}:${item.total}:${item.mode}:${item.date}`).join('|');
    if (!force && signature === state.lastSignature) {
      queueRenderXpUi(250);
      return;
    }

    state.syncing = true;
    try {
      const recentHistory = history().slice(0, 100);
      const pendingTests = recentHistory.filter(item => !testXpAlreadySynced(item));

      if (pendingTests.length) {
        await loadCompetitions();
        for (const item of pendingTests) await recordTest(item);
        await recordDailyGoalsAndStreaks(recentHistory);
        try {
          if (typeof save === 'function') save();
        } catch {}
        try {
          if (typeof renderTestHistory === 'function') renderTestHistory();
        } catch {}
      }

      state.lastSignature = signature;
      await refreshSummary();
      queueRenderXpUi(0);
    } finally {
      state.syncing = false;
    }
  }

  /* Observa apenas para reanexar badges quando listas forem recriadas.
     A rotina é idempotente e não toca mais nos cards-resumo da Home. */
  const observer = new MutationObserver(() => queueRenderXpUi(300));
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"], #homeTopTab, [data-test-panel="history"], [data-competition-view]')) {
      setTimeout(() => syncAll(true), 100);
    }
  });

  window.addEventListener('fixa-xp-updated', () => refreshSummary());
  window.addEventListener('load', () => setTimeout(() => syncAll(true), 600));
  setInterval(() => {
    if (!document.hidden) syncAll(false);
  }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(() => syncAll(false), 500);
  });
  setTimeout(() => syncAll(true), 800);

  window.FixaCompetitionXpHomeV4 = {
    sync: () => syncAll(true),
    refresh: refreshSummary,
    get summary() { return state.summary; }
  };
})();