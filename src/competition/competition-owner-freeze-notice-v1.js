(() => {
  'use strict';
  if (window.FixaCompetitionOwnerFreezeNoticeV1) return;
  window.FixaCompetitionOwnerFreezeNoticeV1 = true;

  const state = { competitions: new Map(), flags: new Map(), syncing: false, lastSync: 0 };

  function client() {
    try { return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); }
    catch (_) { return null; }
  }

  function selectedCompetitionId() {
    return String(
      document.querySelector('.competition-v3.active #cv3select')?.value ||
      localStorage.getItem('fixa-selected-competition') ||
      ''
    );
  }

  function selectedCompetition() {
    return state.competitions.get(selectedCompetitionId()) || null;
  }

  function sharedFolderCard() {
    return document.querySelector('.competition-v3.active .cv3-area-folder');
  }

  function ensureStyle() {
    if (document.getElementById('fixaCompetitionOwnerFreezeNoticeV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaCompetitionOwnerFreezeNoticeV1Style';
    style.textContent = `
      .fixa-owner-freeze-notice{margin-top:9px;border:1px solid #bfdbfe;border-radius:9px;padding:8px 10px;display:flex;align-items:center;gap:7px;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:850;line-height:1.35}
      .fixa-owner-freeze-notice::before{content:'🔒';font-size:12px;line-height:1}
    `;
    document.head.appendChild(style);
  }

  function ownerFrozenItems(competitionId) {
    return (state.flags.get(String(competitionId || '')) || []).filter(item => item?.owner_reported === true);
  }

  function renderNotice() {
    const card = sharedFolderCard();
    const competition = selectedCompetition();
    let notice = card?.querySelector('.fixa-owner-freeze-notice') || null;

    if (!card || !competition) {
      notice?.remove();
      return;
    }

    const count = ownerFrozenItems(competition.id).length;
    if (!count) {
      notice?.remove();
      return;
    }

    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'fixa-owner-freeze-notice';
      const action = card.querySelector('.cv3-folder-action');
      if (action) card.insertBefore(notice, action);
      else card.appendChild(notice);
    }

    notice.textContent = competition.is_owner
      ? `Administrador congelou ${count} ${count === 1 ? 'questão' : 'questões'}.`
      : `Administrador congelou ${count} ${count === 1 ? 'questão' : 'questões'} nesta competição.`;
  }

  async function refresh(force = false) {
    const sb = client();
    if (!sb?.rpc || state.syncing) return;
    if (!force && Date.now() - state.lastSync < 12000) {
      renderNotice();
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
        next.set(String(competition.id), Array.isArray(items) ? items : []);
      }
      state.flags = next;
      state.lastSync = Date.now();
      renderNotice();
    } finally {
      state.syncing = false;
    }
  }

  ensureStyle();

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderNotice();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('fixa-cloud-data-loaded', () => refresh(true));
  window.addEventListener('fixa-competition-detail-rendered', () => refresh(true));
  window.addEventListener('focus', () => refresh(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
  window.addEventListener('load', () => setTimeout(() => refresh(true), 700), { once: true });
  setInterval(() => { if (!document.hidden) refresh(false); }, 15000);
  setTimeout(() => refresh(true), 900);
})();
