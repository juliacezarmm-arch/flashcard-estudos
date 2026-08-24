(() => {
  'use strict';
  if (window.FixaCompetitionScoringRulesV1) return;
  window.FixaCompetitionScoringRulesV1 = true;

  const GOALS = Object.freeze([
    { key: 'questions', target: 20, reward: 20, label: 'objetivo de questões' },
    { key: 'tests', target: 2, reward: 25, label: 'objetivo de testes' },
    { key: 'mastery', target: 5, reward: 40, label: 'objetivo de domínio' }
  ]);

  let syncing = false;
  let lastSignature = '';

  const client = () => {
    try {
      return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    } catch (_) {
      return null;
    }
  };

  const appData = () => {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  };

  const subjects = () => Array.isArray(appData()?.subjects) ? appData().subjects.filter(Boolean) : [];
  const folders = () => Array.isArray(appData()?.folders) ? appData().folders.filter(Boolean) : [];
  const history = () => Array.isArray(appData()?.testHistory) ? appData().testHistory : [];

  const localDateKey = value => {
    const date = value instanceof Date ? value : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const subjectById = id => subjects().find(item => String(item?.id || '') === String(id || '')) || null;
  const folderById = id => folders().find(item => String(item?.id || '') === String(id || '')) || null;

  function testContext(item) {
    const ids = Array.isArray(item?.subjectIds) && item.subjectIds.length
      ? item.subjectIds.map(String)
      : [item?.subjectId].filter(Boolean).map(String);

    const competitionIds = new Set();
    let folder = null;
    ids.forEach(id => {
      const subject = subjectById(id);
      if (!subject) return;
      if (subject.sharedCompetitionId) competitionIds.add(String(subject.sharedCompetitionId));
      if (!folder && subject.folder) folder = folderById(subject.folder);
    });

    if (!folder && item?.folderId) folder = folderById(item.folderId);
    return {
      subjectIds: ids,
      competitionIds,
      folderId: String(folder?.id || item?.folderId || ''),
      folderName: String(folder?.name || item?.folderName || '')
    };
  }

  function matchesCompetition(item, competition) {
    const context = testContext(item);
    if (context.competitionIds.has(String(competition.id))) return true;
    if (context.folderId && String(competition.folder_id || '') === context.folderId) return true;
    if (!context.folderId && context.folderName && competition.folder_name) {
      return context.folderName.trim().toLowerCase() === String(competition.folder_name).trim().toLowerCase();
    }
    return false;
  }

  function questionKey(card) {
    return String(card?.questionCode || card?.id || `${card?.q || ''}|${card?.correctAnswerText || card?.a || ''}`);
  }

  function masteredKeys(item) {
    const testId = String(item?.id || '');
    if (!testId) return [];
    const output = [];
    subjects().forEach(subject => {
      (Array.isArray(subject?.cards) ? subject.cards : []).forEach(card => {
        const gained = (Array.isArray(card?.attemptHistory) ? card.attemptHistory : []).some(entry =>
          String(entry?.testId || '') === testId
          && entry?.statusBefore !== 'mastered'
          && entry?.statusAfter === 'mastered'
        );
        if (gained) output.push(`${subject.sharedSourceSubjectId || subject.id}:${questionKey(card)}`);
      });
    });
    return [...new Set(output)];
  }

  function patchRules() {
    const card = document.querySelector('.competition-v3.active .cv3-area-rules');
    if (!card) return;
    card.innerHTML = `
      <h3 style="margin-bottom:10px">Regras de pontuação</h3>
      <div style="margin:0 0 7px;color:#475569;font-size:11px;font-weight:800">XP da atividade</div>
      <div class="cv3-rule-row">
        <div class="cv3-stat"><b>+1 XP</b><small>por questão respondida em teste concluído</small></div>
        <div class="cv3-stat"><b>+4 XP</b><small>extras quando a questão é dominada pela primeira vez</small></div>
        <div class="cv3-stat"><b>+5 XP</b><small>por manter a sequência de estudos</small></div>
      </div>
      <div style="margin:12px 0 7px;color:#475569;font-size:11px;font-weight:800">Bônus dos objetivos</div>
      <div class="cv3-rule-row">
        <div class="cv3-stat"><b>+20 XP</b><small>ao cumprir o objetivo de questões</small></div>
        <div class="cv3-stat"><b>+25 XP</b><small>ao cumprir o objetivo de testes</small></div>
        <div class="cv3-stat"><b>+40 XP</b><small>ao cumprir o objetivo de domínio</small></div>
      </div>
      <p class="cv3-muted" style="margin-top:10px">Teste coleção e Teste pasta pontuam da mesma forma. Só testes concluídos geram XP. Questões puladas não pontuam. A mesma atividade não pontua duas vezes e o limite diário da competição continua valendo.</p>
    `;
  }

  async function awardGoal(competition, day, goal) {
    const sb = client();
    if (!sb?.rpc) return;
    await sb.rpc('award_competition_xp', {
      p_competition_id: competition.id,
      p_event_type: 'weekly_goal',
      p_source_key: `objective:${goal.key}:${day}`,
      p_occurred_on: day,
      p_metadata: {
        reward_points: goal.reward,
        goal_type: goal.key,
        goal_target: goal.target,
        folder_id: competition.folder_id || '',
        folder_name: competition.folder_name || ''
      }
    });
  }

  async function syncGoalBonuses(force = false) {
    const sb = client();
    if (syncing || !sb?.rpc || !appData()) return;

    const signature = history().map(item => `${item?.id || ''}:${item?.date || ''}:${item?.total || 0}:${item?.mode || ''}`).join('|');
    if (!force && signature && signature === lastSignature) return;
    syncing = true;
    try {
      const { data: competitions, error } = await sb.rpc('list_my_competitions', {});
      if (error || !Array.isArray(competitions)) return;

      const active = competitions.filter(item => item?.effective_status === 'active');
      if (!active.length) return;

      const byDay = new Map();
      history().forEach(item => {
        const day = localDateKey(item?.date || item?.finishedAt || item?.completedAt);
        if (!day) return;
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push(item);
      });

      for (const competition of active) {
        for (const [day, dayItems] of byDay.entries()) {
          const matched = dayItems.filter(item => matchesCompetition(item, competition));
          if (!matched.length) continue;

          const questions = matched.reduce((sum, item) => sum + Math.max(0, Number(item?.total || 0)), 0);
          const tests = matched.filter(item => Math.max(0, Number(item?.total || 0)) > 0).length;
          const mastery = new Set(matched.flatMap(masteredKeys)).size;
          const values = { questions, tests, mastery };

          for (const goal of GOALS) {
            if (values[goal.key] >= goal.target) await awardGoal(competition, day, goal);
          }
        }
      }
      lastSignature = signature;
    } catch (_) {
    } finally {
      syncing = false;
    }
  }

  window.addEventListener('fixa-competition-detail-rendered', () => {
    patchRules();
    window.setTimeout(() => syncGoalBonuses(true), 80);
  });

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      patchRules();
      syncGoalBonuses(true);
    }, 1300);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) window.setTimeout(() => syncGoalBonuses(false), 120);
  });
})();
