(() => {
  'use strict';
  if (window.FixaSecondaryContentSpacingV1) return;
  window.FixaSecondaryContentSpacingV1 = true;

  const style = document.createElement('style');
  style.id = 'secondaryContentSpacingV1Style';
  style.textContent = `
    /*
      PADRÃO ÚNICO DE ESPAÇAMENTO ENTRE NAVEGAÇÃO SECUNDÁRIA E CONTEÚDO.
      A aba Teste é a referência aprovada: não acrescenta margem/gap
      estrutural além do próprio contorno dos componentes.
    */

    /* TESTE — referência. */
    #appShell #test.view.active {
      gap: 0 !important;
    }

    #appShell #test.view .test-tabs {
      margin-bottom: 0 !important;
    }

    #test.view .test-layout {
      margin-top: 0 !important;
    }

    /* QUESTÕES — mesma distância do Teste. */
    #appShell #questionsHubNav {
      margin-bottom: 0 !important;
    }

    body.questions-hub-active #appShell.app:not(.locked) > main {
      row-gap: 0 !important;
    }

    body.questions-hub-active #manage.view.active,
    body.questions-hub-active #add.view.active {
      margin-top: 0 !important;
    }

    /* COMPETIÇÃO — barra própria + #cv3 começam em sequência, sem gap extra. */
    #appShell .competition-v3.active {
      gap: 0 !important;
      row-gap: 0 !important;
    }

    #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
      margin-bottom: 0 !important;
    }

    #appShell .competition-v3 > #cv3 {
      margin-top: 0 !important;
    }

    /* INÍCIO — atualmente a barra secundária externa fica oculta no layout
       aprovado; se voltar a ser exibida, segue o mesmo padrão do Teste. */
    #appShell .home-view .home-subtabs {
      margin-bottom: 0 !important;
    }

    #appShell .home-view .home-subtabs + * {
      margin-top: 0 !important;
    }

    /*
      ALINHAMENTO VERTICAL COM QUESTÕES.
      Questões é a referência. Início continua com o pequeno ajuste já aprovado.
      Teste e Competição são alinhados pela PRÓPRIA barra secundária, em vez de
      deslocar o view inteiro. O margin-bottom negativo acompanha o deslocamento
      visual e preserva a distância original entre a barra e o conteúdo abaixo.
    */
    @media (min-width: 861px) {
      #appShell #home.home-view.active {
        margin-top: -6px !important;
      }

      #appShell #test.view.active {
        margin-top: 0 !important;
      }

      #appShell #test.view .test-tabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        transform: translateY(-6px) !important;
        margin-bottom: -6px !important;
      }
    }

    /* Espaçamentos INTERNOS da Competição continuam independentes:
       hero -> dashboard/estado vazio não faz parte da barra secundária. */
    .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state {
      margin-top: 7px !important;
    }

    .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
      margin-top: 7px !important;
    }

    @media (max-width: 760px) {
      #appShell #test.view.active,
      #appShell .competition-v3.active {
        gap: 0 !important;
        row-gap: 0 !important;
      }

      #appShell #test.view .test-tabs,
      #appShell #questionsHubNav,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs,
      #appShell .home-view .home-subtabs {
        margin-bottom: 0 !important;
        transform: none !important;
      }

      /* MOBILE — todas as navegações secundárias seguem o padrão visual
         aprovado da Competição: fundo único claro, rolagem horizontal,
         botões neutros e aba ativa branca com destaque azul. */
      #appShell #test.view .test-tabs,
      #appShell #questionsHubNav,
      #appShell .home-view .home-subtabs,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs {
        width: 100% !important;
        min-height: 48px !important;
        height: auto !important;
        padding: 5px 6px !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        border: 0 !important;
        border-radius: 11px !important;
        background: #f1f5f9 !important;
        box-shadow: none !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch;
      }

      #appShell #test.view .test-tabs::-webkit-scrollbar,
      #appShell #questionsHubNav::-webkit-scrollbar,
      #appShell .home-view .home-subtabs::-webkit-scrollbar,
      #appShell .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
        display: none !important;
      }

      #appShell #test.view .test-tabs button,
      #appShell #questionsHubNav .questions-hub-button,
      #appShell .home-view .home-subtabs .home-subtab,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab {
        width: auto !important;
        min-width: max-content !important;
        height: 38px !important;
        min-height: 38px !important;
        padding: 0 14px !important;
        flex: 0 0 auto !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        border: 0 !important;
        border-radius: 8px !important;
        color: #64748b !important;
        background: transparent !important;
        box-shadow: none !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      #appShell #test.view .test-tabs button svg,
      #appShell #questionsHubNav .questions-hub-button svg,
      #appShell .home-view .home-subtabs .home-subtab svg,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
      }

      #appShell #test.view .test-tabs button.active,
      #appShell #questionsHubNav .questions-hub-button.active,
      #appShell .home-view .home-subtabs .home-subtab.active,
      #appShell .competition-v3 .cv3-secondary-nav .home-subtab.active {
        color: #2563eb !important;
        background: #ffffff !important;
        box-shadow: 0 1px 5px rgba(15,23,42,.10) !important;
      }

      .competition-v3 #cv3 > .cv3-hero + .cv3-empty.cv3-empty-state,
      .competition-v3 #cv3 > .cv3-hero + .cv3-skeleton {
        margin-top: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

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
