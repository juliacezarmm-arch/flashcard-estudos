(() => {
  'use strict';
  if (window.FixaCompetitionOwnerFreezeSyncV1) return;
  window.FixaCompetitionOwnerFreezeSyncV1 = true;

  const state = {
    competitions: new Map(),
    flags: new Map(),
    syncing: false,
    lastSync: 0
  };

  function client() {
    try { return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); }
    catch (_) { return null; }
  }

  function appData() {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  }

  function subjects() { return Array.isArray(appData()?.subjects) ? appData().subjects : []; }
  function currentSubjectSafe() { try { return typeof currentSubject === 'function' ? currentSubject() : null; } catch (_) { return null; } }
  function questionKey(card) { return String(card?.questionCode || card?.id || `${card?.q || ''}|${card?.correctAnswerText || card?.a || ''}`); }
  function sourceSubjectId(subject) { return String(subject?.sharedSourceSubjectId || subject?.id || ''); }

  function competitionForSubject(subject) {
    if (!subject) return null;
    if (subject.sharedCompetitionId) return state.competitions.get(String(subject.sharedCompetitionId)) || null;
    const folderId = String(subject.folder || '');
    return [...state.competitions.values()].find(item => item?.is_owner && String(item.folder_id || '') === folderId) || null;
  }

  function flagId(subject, card) { return `${sourceSubjectId(subject)}::${questionKey(card)}`; }
  function flagMap(competitionId) { return state.flags.get(String(competitionId || '')) || new Map(); }
  function flagFor(subject, card) {
    const competition = competitionForSubject(subject);
    return competition ? flagMap(competition.id).get(flagId(subject, card)) || null : null;
  }

  function isParticipantSubject(subject, competition = competitionForSubject(subject)) {
    return Boolean(subject?.sharedCompetitionId && subject?.readOnly && competition && !competition.is_owner);
  }

  function toast(message, error = false) {
    document.querySelector('.fixa-owner-freeze-toast')?.remove();
    const item = document.createElement('div');
    item.className = `fixa-owner-freeze-toast${error ? ' is-error' : ''}`;
    item.setAttribute('role', 'status');
    item.textContent = message;
    document.body.appendChild(item);
    setTimeout(() => item.remove(), 2400);
  }

  function ensureStyle() {
    if (document.getElementById('fixaOwnerFreezeSyncV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaOwnerFreezeSyncV1Style';
    style.textContent = `
      .fixa-owner-freeze-toast{position:fixed;z-index:1210;top:18px;left:50%;transform:translateX(-50%);max-width:min(92vw,540px);padding:10px 14px;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;color:#1d4ed8;box-shadow:0 12px 32px rgba(15,23,42,.16);font-size:12px;font-weight:800;text-align:center}
      .fixa-owner-freeze-toast.is-error{border-color:#fecaca;background:#fff1f2;color:#b91c1c}
      .fixa-shared-frozen-badge{display:none!important}
      body.fixa-shared-participant-selected #manage [data-freeze][hidden]{display:none!important}
      body.fixa-shared-participant-selected #manage [data-freeze]:disabled{opacity:1!important;cursor:default!important;color:#1d4ed8!important;background:#eff6ff!important}
    `;
    document.head.appendChild(style);
  }

  function saveData() {
    try { if (typeof save === 'function') save(); } catch (_) {}
  }

  function rerender() {
    try { if (typeof render === 'function') render(); }
    catch (_) {
      try { if (typeof renderQuestions === 'function') renderQuestions(currentSubjectSafe() || { cards: [] }); } catch (_) {}
    }
  }

  function restoreOwnerCard(card) {
    if (!card) return;
    const previous = String(card.sharedStatusBeforeModeration || '').trim();
    card.status = previous && previous !== 'frozen' ? previous : 'new';
    card.sharedModerationFrozen = false;
    delete card.sharedFrozenByCompetition;
    delete card.sharedStatusBeforeModeration;
  }

  function freezeOwnerCard(card) {
    if (!card) return;
    if (!card.sharedFrozenByCompetition) {
      const current = String(card.status || 'new');
      card.sharedStatusBeforeModeration = current === 'frozen' ? (card.sharedStatusBeforeModeration || 'new') : current;
    }
    card.sharedFrozenByCompetition = true;
    card.sharedModerationFrozen = true;
    card.status = 'frozen';
  }

  function applyFlagsToCards() {
    let changed = false;
    subjects().forEach(subject => {
      const competition = competitionForSubject(subject);
      if (!competition) return;
      const map = flagMap(competition.id);
      (subject.cards || []).forEach(card => {
        const frozen = map.has(flagId(subject, card));
        card.sharedModerationFrozen = frozen;

        if (frozen && card.status !== 'frozen') {
          freezeOwnerCard(card);
          changed = true;
        } else if (frozen && !card.sharedFrozenByCompetition) {
          card.sharedFrozenByCompetition = true;
          card.sharedStatusBeforeModeration = card.sharedStatusBeforeModeration || 'new';
          changed = true;
        } else if (!frozen && card.sharedFrozenByCompetition) {
          restoreOwnerCard(card);
          changed = true;
        }
      });
    });
    if (changed) saveData();
  }

  async function publishExistingOwnerFrozenCards() {
    const sb = client();
    if (!sb?.rpc) return false;
    let published = false;

    for (const subject of subjects()) {
      const competition = competitionForSubject(subject);
      if (!competition?.is_owner) continue;
      const map = flagMap(competition.id);

      for (const card of (subject.cards || [])) {
        if (card.status !== 'frozen' || map.has(flagId(subject, card))) continue;
        const { error } = await sb.rpc('flag_competition_question', {
          p_competition_id: competition.id,
          p_subject_source_id: sourceSubjectId(subject),
          p_question_key: questionKey(card),
          p_question_code: card.questionCode || null
        });
        if (error) continue;

        map.set(flagId(subject, card), { reported_by_me: true, owner_frozen: true, local: true });
        state.flags.set(String(competition.id), map);
        freezeOwnerCard(card);
        published = true;
      }
    }

    if (published) saveData();
    return published;
  }

  function annotateManageButtons() {
    const subject = currentSubjectSafe();
    const competition = competitionForSubject(subject);
    document.body.classList.toggle('fixa-shared-participant-selected', isParticipantSubject(subject, competition));

    document.querySelectorAll('#manage [data-freeze]').forEach(button => {
      const index = Number(button.dataset.freeze);
      const card = subject?.cards?.[index];
      const menu = button.closest('details.card-menu');
      let badge = menu?.parentElement?.querySelector(':scope > .fixa-shared-frozen-badge') || null;

      if (!card || !competition) {
        button.hidden = false;
        button.disabled = false;
        badge?.remove();
        return;
      }

      const frozen = Boolean(flagFor(subject, card) || card.sharedModerationFrozen);
      if (competition.is_owner) {
        button.hidden = false;
        button.disabled = false;
        button.textContent = frozen ? 'Descongelar / liberar' : 'Congelar cartão';
      } else {
        button.disabled = true;
        button.hidden = !frozen;
        button.textContent = 'Congelada pelo administrador';
      }
      badge?.remove();
    });
  }

  function skipFrozenParticipantQuestion() {
    try {
      if (typeof testState === 'undefined' || !testState?.active) return;
      const question = testState.questions?.[testState.index];
      if (!question) return;
      const subject = subjects().find(item => String(item.id) === String(question.subjectId)) || currentSubjectSafe();
      const competition = competitionForSubject(subject);
      if (!isParticipantSubject(subject, competition) || !Number.isInteger(question.originalIndex)) return;
      const card = subject?.cards?.[question.originalIndex];
      if (!card?.sharedModerationFrozen || question.sharedFreezeSkipped) return;

      question.sharedFreezeSkipped = true;
      if (testState.answered && question.isCorrect) testState.score = Math.max(0, Number(testState.score || 0) - 1);
      testState.skipped = Number(testState.skipped || 0) + 1;
      testState.index += 1;
      testState.selected = null;
      testState.answered = false;
      saveData();
      toast('Esta questão foi congelada pelo administrador e foi retirada do teste.');
      try { if (typeof renderTest === 'function') renderTest(); } catch (_) {}
    } catch (_) {}
  }

  async function refresh(force = false) {
    const sb = client();
    if (!sb?.rpc || state.syncing) return;
    if (!force && Date.now() - state.lastSync < 12000) {
      annotateManageButtons();
      return;
    }

    state.syncing = true;
    try {
      const { data: list, error } = await sb.rpc('list_my_competitions', {});
      if (error || !Array.isArray(list)) return;
      state.competitions = new Map(list.map(item => [String(item.id), item]));

      const next = new Map();
      for (const competition of list) {
        const { data: items, error: flagError } = await sb.rpc('list_competition_question_flags', { p_competition_id: competition.id });
        if (flagError) continue;
        next.set(String(competition.id), new Map((Array.isArray(items) ? items : []).map(item => [`${item.subject_source_id}::${item.question_key}`, item])));
      }
      state.flags = next;
      state.lastSync = Date.now();

      applyFlagsToCards();
      await publishExistingOwnerFrozenCards();
      annotateManageButtons();
      skipFrozenParticipantQuestion();
    } finally {
      state.syncing = false;
    }
  }

  async function ownerFreeze(subject, card, competition) {
    const sb = client();
    if (!sb?.rpc) return toast('Não foi possível conectar para congelar a questão.', true);

    const { error } = await sb.rpc('flag_competition_question', {
      p_competition_id: competition.id,
      p_subject_source_id: sourceSubjectId(subject),
      p_question_key: questionKey(card),
      p_question_code: card.questionCode || null
    });
    if (error) return toast(error.message || 'Não foi possível congelar a questão.', true);

    const map = flagMap(competition.id);
    map.set(flagId(subject, card), { reported_by_me: true, owner_frozen: true, local: true });
    state.flags.set(String(competition.id), map);
    freezeOwnerCard(card);
    saveData();
    rerender();
    toast('Questão congelada na competição para todos os participantes.');
    setTimeout(() => refresh(true), 150);
  }

  async function ownerRelease(subject, card, competition) {
    const sb = client();
    if (!sb?.rpc) return toast('Não foi possível conectar para liberar a questão.', true);

    const { error } = await sb.rpc('resolve_competition_question_flag', {
      p_competition_id: competition.id,
      p_subject_source_id: sourceSubjectId(subject),
      p_question_key: questionKey(card)
    });
    if (error) return toast(error.message || 'Não foi possível liberar a questão.', true);

    const map = flagMap(competition.id);
    map.delete(flagId(subject, card));
    state.flags.set(String(competition.id), map);
    restoreOwnerCard(card);
    saveData();
    rerender();
    toast('Questão descongelada e liberada para os participantes.');
    setTimeout(() => refresh(true), 150);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#manage [data-freeze]');
    if (!button) return;

    const subject = currentSubjectSafe();
    const competition = competitionForSubject(subject);
    if (!competition) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const card = subject?.cards?.[Number(button.dataset.freeze)];
    if (!card) return;

    if (!competition.is_owner) {
      toast(card.sharedModerationFrozen
        ? 'Esta questão está congelada. Somente o administrador pode liberar.'
        : 'Participantes não podem congelar ou liberar questões da competição.');
      return;
    }

    const frozen = Boolean(flagFor(subject, card) || card.sharedModerationFrozen || card.sharedFrozenByCompetition);
    if (frozen) ownerRelease(subject, card, competition);
    else ownerFreeze(subject, card, competition);
  }, true);

  ensureStyle();
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      annotateManageButtons();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('fixa-cloud-data-loaded', () => refresh(true));
  window.addEventListener('fixa-competition-detail-rendered', () => refresh(true));
  window.addEventListener('fixa-competition-flags-updated', () => refresh(true));
  window.addEventListener('focus', () => refresh(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
  window.addEventListener('load', () => setTimeout(() => refresh(true), 650), { once: true });
  setInterval(() => { if (!document.hidden) refresh(false); }, 15000);
  setTimeout(() => refresh(true), 850);
})();
