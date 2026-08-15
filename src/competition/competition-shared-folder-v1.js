(() => {
  'use strict';
  if (window.FixaCompetitionSharedFolderV1) return;
  window.FixaCompetitionSharedFolderV1 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const appData = () => (typeof data !== 'undefined' ? data : window.data);
  const uid = () => window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : null) || null;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { compId:'', dashboard:null, shared:null, rankMode:'general', modalMode:'general', loading:false };

  const folderSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></svg>';
  const refreshSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.4 5.4L4 8M5.5 15A7 7 0 0 0 17.6 18.6L20 16"/></svg>';
  const expandSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';

  const style = document.createElement('style');
  style.id = 'competitionSharedFolderV1Style';
  style.textContent = `
    .competition-v3 .cv3-dashboard{align-items:stretch!important}
    .competition-v3 .cv3-area-position{grid-column:1/4!important}
    .competition-v3 .cv3-area-ranking{grid-column:4/9!important;display:flex!important;flex-direction:column!important}
    .competition-v3 .cv10-folder-card{grid-column:9/13!important;display:flex;flex-direction:column;min-width:0}
    .competition-v3 .cv3-area-performance{grid-column:1/8!important}
    .competition-v3 .cv3-area-invite{grid-column:8/13!important}
    .competition-v3 .cv3-area-rules{grid-column:1/13!important}

    .cv10-rank-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
    .cv10-rank-head h3{margin:0!important}
    .cv10-rank-tabs{display:flex;gap:4px;padding:3px;border-radius:9px;background:#f1f5f9}
    .cv10-rank-tab{min-height:29px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:#64748b;font-size:11px;font-weight:800;box-shadow:none}
    .cv10-rank-tab.active{background:#fff;color:#2563eb;box-shadow:0 1px 4px rgba(15,23,42,.08)}
    .cv10-rank-list{display:grid;align-content:start;flex:1;min-height:118px}
    .cv10-rank-row{display:grid;grid-template-columns:30px 32px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:44px;padding:5px 8px;border-bottom:1px solid #edf1f6}
    .cv10-rank-row:last-child{border-bottom:0}
    .cv10-rank-row.me{background:#eef4ff;border-radius:9px;border-bottom-color:transparent}
    .cv10-rank-pos{font-size:12px;font-weight:900;text-align:center}
    .cv10-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:#eaf0fb;font-size:10px;font-weight:800}
    .cv10-avatar img{width:100%;height:100%;object-fit:cover}
    .cv10-rank-name{font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cv10-rank-xp{font-size:11.5px;font-weight:900;white-space:nowrap}
    .cv10-rank-empty{display:grid;place-items:center;min-height:100px;color:#64748b;font-size:11px;text-align:center}
    .cv10-rank-more{align-self:center;margin-top:8px;border:0;background:transparent;color:#2563eb;font-size:11.5px;font-weight:800;display:inline-flex;align-items:center;gap:6px;padding:5px 8px;box-shadow:none}
    .cv10-rank-more svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8}

    .cv10-folder-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .cv10-folder-head h3{margin:0!important}
    .cv10-folder-main{display:grid;grid-template-columns:48px minmax(0,1fr);gap:11px;align-items:center}
    .cv10-folder-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:#eef4ff;color:#2563eb}
    .cv10-folder-icon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    .cv10-folder-name{font-size:14px;font-weight:900;color:#172033;line-height:1.25}
    .cv10-folder-owner{margin-top:3px;color:#64748b;font-size:10.5px}
    .cv10-folder-stats{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
    .cv10-folder-stat{min-height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #e1e8f2;border-radius:9px;color:#475569;font-size:10.5px;background:#fff}
    .cv10-folder-state{margin-top:9px;padding:9px 10px;border-radius:10px;background:#f8fafc;color:#475569;font-size:10.5px;line-height:1.45}
    .cv10-folder-state.good{background:#ecfdf3;color:#15803d}
    .cv10-folder-state.warn{background:#fff7ed;color:#c2410c}
    .cv10-folder-action{margin-top:auto;padding-top:10px}
    .cv10-folder-action button{width:100%;min-height:38px;border-radius:9px;border:1px solid #2563eb;background:#2563eb;color:#fff;font-size:11.5px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 6px 14px rgba(37,99,235,.14)}
    .cv10-folder-action button.secondary{background:#fff;color:#2563eb}
    .cv10-folder-action button:disabled{opacity:.65;cursor:default}
    .cv10-folder-action svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}

    .competition-v3 .cv3-area-rules{padding-top:13px!important;padding-bottom:12px!important}
    .competition-v3 .cv3-area-rules h3{margin-bottom:10px!important}
    .competition-v3 .cv3-area-rules .cv3-stat{min-height:54px!important;padding:6px 8px!important}
    .competition-v3 .cv3-area-rules .cv3-rule-icon{width:27px!important;height:27px!important}
    .competition-v3 .cv3-area-rules .cv3-stat b{font-size:16px!important}
    .competition-v3 .cv3-area-rules .cv3-stat small{font-size:9px!important}

    .cv10-modal-bg{position:fixed;inset:0;z-index:950;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.42)}
    .cv10-modal{width:min(720px,100%);max-height:88vh;overflow:auto;background:#fff;border:1px solid #e5eaf1;border-radius:18px;box-shadow:0 26px 70px rgba(15,23,42,.24)}
    .cv10-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid #e8edf5}
    .cv10-modal-head h3{margin:0;font-size:18px;color:#172033}
    .cv10-modal-close{width:34px;height:34px;border:0;border-radius:9px;background:#f8fafc;color:#334155;font-size:22px;box-shadow:none}
    .cv10-modal-body{padding:16px 20px 20px}
    .cv10-modal-tabs{display:flex;gap:5px;padding:4px;border-radius:10px;background:#f1f5f9;width:fit-content;margin-bottom:12px}
    .cv10-modal-tab{min-height:32px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:#64748b;font-size:12px;font-weight:800;box-shadow:none}
    .cv10-modal-tab.active{background:#fff;color:#2563eb;box-shadow:0 1px 4px rgba(15,23,42,.08)}
    .cv10-modal .cv10-rank-row{min-height:48px;grid-template-columns:34px 36px minmax(0,1fr) auto}
    .cv10-modal .cv10-avatar{width:34px;height:34px}
    .cv10-modal .cv10-rank-name,.cv10-modal .cv10-rank-xp{font-size:12.5px}

    @media(max-width:980px){
      .competition-v3 .cv3-area-position,.competition-v3 .cv3-area-ranking,.competition-v3 .cv10-folder-card,.competition-v3 .cv3-area-performance,.competition-v3 .cv3-area-invite,.competition-v3 .cv3-area-rules{grid-column:1/-1!important}
    }
  `;
  document.head.appendChild(style);

  const currentCompId = () => document.querySelector('.competition-v3.active #cv3select')?.value || localStorage.getItem('fixa-selected-competition') || '';
  const localVersionKey = id => `fixa-competition-folder-version:${id}`;
  const localFolderId = id => `competition-${id}`;
  const folders = () => Array.isArray(appData()?.folders) ? appData().folders : [];
  const subjects = () => Array.isArray(appData()?.subjects) ? appData().subjects : [];
  const folderById = id => folders().find(x => String(x.id) === String(id));
  const subjectById = id => subjects().find(x => String(x.id) === String(id));
  const initials = name => String(name || 'P').split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
  const avatar = p => p?.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : esc(initials(p?.name));
  const qkey = c => String(c?.questionCode || c?.id || `${c?.q || ''}|${c?.correctAnswerText || c?.a || ''}`);

  function rankRows(rows, limit) {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) return '<div class="cv10-rank-empty">Ainda não há pontuação neste ranking.</div>';
    return list.slice(0, limit || list.length).map(p => `<div class="cv10-rank-row ${String(p.user_id) === String(uid()) ? 'me' : ''}"><span class="cv10-rank-pos">${p.position}º</span><span class="cv10-avatar">${avatar(p)}</span><span class="cv10-rank-name">${esc(String(p.user_id) === String(uid()) ? 'Você' : p.name)}</span><span class="cv10-rank-xp">${Number(p.total_xp || 0)} XP</span></div>`).join('');
  }

  function renderRanking(card) {
    const d = state.dashboard;
    if (!card || !d) return;
    const weeklyEnabled = d.competition?.weekly_ranking_enabled !== false;
    if (!weeklyEnabled) state.rankMode = 'general';
    const rows = state.rankMode === 'weekly' ? (d.weekly_ranking || []) : (d.ranking || []);
    card.innerHTML = `<div class="cv10-rank-head"><h3>Ranking</h3><div class="cv10-rank-tabs"><button class="cv10-rank-tab ${state.rankMode === 'general' ? 'active' : ''}" data-cv10-rank="general">Geral</button>${weeklyEnabled ? `<button class="cv10-rank-tab ${state.rankMode === 'weekly' ? 'active' : ''}" data-cv10-rank="weekly">Semanal</button>` : ''}</div></div><div class="cv10-rank-list">${rankRows(rows, 4)}</div><button class="cv10-rank-more" type="button" data-cv10-rank-full>${expandSvg}<span>Ver ranking completo</span></button>`;
  }

  function sharedStats(shared) {
    const subs = Array.isArray(shared?.content?.subjects) ? shared.content.subjects : [];
    return { collections:subs.length, questions:subs.reduce((sum, s) => sum + (Array.isArray(s.cards) ? s.cards.length : 0), 0) };
  }

  function renderFolderCard(card) {
    const d = state.dashboard;
    const shared = state.shared;
    if (!card || !d) return;
    const c = d.competition || {};
    const isOwner = !!c.is_owner;
    const remoteVersion = Number(shared?.version || c.shared_folder_version || 0);
    const stats = sharedStats(shared);
    const installed = isOwner ? !!folderById(c.folder_id) : !!folderById(localFolderId(c.id));
    const installedVersion = isOwner ? remoteVersion : Number(localStorage.getItem(localVersionKey(c.id)) || 0);
    const updateAvailable = !isOwner && installed && remoteVersion > installedVersion;
    const folderName = shared?.folder_name || c.folder_name || 'Pasta da competição';

    let stateClass = 'good';
    let stateHtml = '';
    let actionHtml = '';
    if (isOwner) {
      stateHtml = `<b>Você administra esta pasta</b><br>Versão compartilhada: ${remoteVersion || '—'}`;
      actionHtml = `<button type="button" data-cv10-owner-sync>${refreshSvg}<span>Sincronizar pasta</span></button>`;
    } else if (!installed) {
      stateClass = '';
      stateHtml = `<b>Pasta disponível</b><br>Adicione o conteúdo às suas coleções para começar.`;
      actionHtml = `<button type="button" data-cv10-folder-add>${folderSvg}<span>Adicionar às minhas coleções</span></button>`;
    } else if (updateAvailable) {
      stateClass = 'warn';
      stateHtml = `<b>Atualização disponível</b><br>Sua versão: ${installedVersion || '—'} · Atual: ${remoteVersion}`;
      actionHtml = `<button type="button" data-cv10-folder-update>${refreshSvg}<span>Atualizar pasta</span></button>`;
    } else {
      stateHtml = `<b>Pasta adicionada</b><br>Versão ${installedVersion || remoteVersion || '—'} · conteúdo atualizado`;
      actionHtml = `<button class="secondary" type="button" disabled>✓ <span>Atualizada</span></button>`;
    }

    card.innerHTML = `<div class="cv10-folder-head"><h3>Pasta compartilhada</h3></div><div class="cv10-folder-main"><div class="cv10-folder-icon">${folderSvg}</div><div><div class="cv10-folder-name">${esc(folderName)}</div><div class="cv10-folder-owner">${isOwner ? 'Pasta administrada por você' : 'Compartilhada pelo administrador'}</div></div></div><div class="cv10-folder-stats"><div class="cv10-folder-stat">${stats.collections} coleções</div><div class="cv10-folder-stat">${stats.questions} questões</div></div><div class="cv10-folder-state ${stateClass}">${stateHtml}</div><div class="cv10-folder-action">${actionHtml}</div>`;
  }

  function modalRanking() {
    document.querySelector('.cv10-modal-bg')?.remove();
    const bg = document.createElement('div');
    bg.className = 'cv10-modal-bg';
    bg.innerHTML = `<div class="cv10-modal" role="dialog" aria-modal="true"><div class="cv10-modal-head"><h3>Ranking completo</h3><button class="cv10-modal-close" type="button" aria-label="Fechar">×</button></div><div class="cv10-modal-body"><div class="cv10-modal-tabs"></div><div class="cv10-modal-list"></div></div></div>`;
    document.body.appendChild(bg);
    const draw = () => {
      const d = state.dashboard || {};
      const weeklyEnabled = d.competition?.weekly_ranking_enabled !== false;
      if (!weeklyEnabled) state.modalMode = 'general';
      const tabs = bg.querySelector('.cv10-modal-tabs');
      tabs.innerHTML = `<button class="cv10-modal-tab ${state.modalMode === 'general' ? 'active' : ''}" data-cv10-modal-rank="general">Ranking geral</button>${weeklyEnabled ? `<button class="cv10-modal-tab ${state.modalMode === 'weekly' ? 'active' : ''}" data-cv10-modal-rank="weekly">Ranking semanal</button>` : ''}`;
      const rows = state.modalMode === 'weekly' ? (d.weekly_ranking || []) : (d.ranking || []);
      bg.querySelector('.cv10-modal-list').innerHTML = rankRows(rows);
    };
    draw();
    bg.querySelector('.cv10-modal-close').onclick = () => bg.remove();
    bg.onclick = e => { if (e.target === bg) bg.remove(); };
    bg.addEventListener('click', e => {
      const tab = e.target.closest('[data-cv10-modal-rank]');
      if (!tab) return;
      state.modalMode = tab.dataset.cv10ModalRank;
      draw();
    });
  }

  function cleanSharedCard(card, sourceSubjectId) {
    const c = structuredClone(card || {});
    ['status','reviews','masteryCount','lastMasteryTestId','testPriority','totalCorrect','totalWrong','ratingCounts','lastRating','lostMasteryCount','attemptHistory','lastReviewedAt'].forEach(k => delete c[k]);
    c.sharedSourceSubjectId = sourceSubjectId;
    return c;
  }

  function contentHash(obj) {
    const s = JSON.stringify(obj);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16);
  }

  async function syncOwnerFolder(button) {
    const client = sb();
    const c = state.dashboard?.competition;
    if (!client || !c?.id) return;
    const folder = folderById(c.folder_id);
    if (!folder) return;
    button.disabled = true;
    button.innerHTML = `${refreshSvg}<span>Sincronizando...</span>`;
    const snapshot = {
      folder:{ id:String(folder.id), name:folder.name },
      subjects:subjects().filter(s => String(s.folder) === String(folder.id) && !s.sharedCompetitionId).map(s => ({ id:String(s.id), name:s.name, cards:(s.cards || []).map(card => cleanSharedCard(card, s.id)) }))
    };
    const { error } = await client.rpc('sync_competition_folder', { p_competition_id:c.id, p_folder_id:String(c.folder_id), p_folder_name:c.folder_name || folder.name, p_content:snapshot, p_content_hash:contentHash(snapshot) });
    if (error) {
      button.disabled = false;
      button.innerHTML = `${refreshSvg}<span>Tentar novamente</span>`;
      alert(error.message);
      return;
    }
    await refreshData(true);
  }

  function preserveProgress(oldCard) {
    if (!oldCard) return {};
    return {
      status:oldCard.status,
      reviews:oldCard.reviews,
      masteryCount:oldCard.masteryCount,
      lastMasteryTestId:oldCard.lastMasteryTestId,
      testPriority:oldCard.testPriority,
      totalCorrect:oldCard.totalCorrect,
      totalWrong:oldCard.totalWrong,
      ratingCounts:oldCard.ratingCounts,
      lastRating:oldCard.lastRating,
      lostMasteryCount:oldCard.lostMasteryCount,
      attemptHistory:oldCard.attemptHistory,
      lastReviewedAt:oldCard.lastReviewedAt
    };
  }

  async function installSharedFolder(button) {
    const shared = state.shared;
    const c = state.dashboard?.competition;
    const d = appData();
    if (!shared?.content?.folder || !c?.id || !d) return;
    button.disabled = true;
    button.innerHTML = `${refreshSvg}<span>Atualizando...</span>`;
    const fid = localFolderId(c.id);
    let folder = folderById(fid);
    if (!folder) {
      folder = { id:fid, name:`${shared.folder_name || c.folder_name || 'Pasta'} · ${c.name || 'Competição'}`, sharedCompetitionId:c.id, readOnly:true };
      d.folders.push(folder);
    } else {
      folder.name = `${shared.folder_name || c.folder_name || 'Pasta'} · ${c.name || 'Competição'}`;
    }

    const keep = new Set();
    (shared.content.subjects || []).forEach(src => {
      const sid = `competition-${c.id}-${src.id}`;
      keep.add(sid);
      let subject = subjectById(sid);
      if (!subject) {
        subject = { id:sid, name:src.name, folder:fid, cards:[], sharedCompetitionId:c.id, sharedSourceSubjectId:src.id, readOnly:true };
        d.subjects.push(subject);
      }
      const old = new Map((subject.cards || []).map(card => [qkey(card), card]));
      subject.name = src.name;
      subject.cards = (src.cards || []).map(card => {
        const progress = preserveProgress(old.get(qkey(card)));
        const merged = { ...structuredClone(card), ...progress, sharedCompetitionId:c.id, sharedSourceSubjectId:src.id };
        return typeof normalizeCard === 'function' ? normalizeCard(merged) : merged;
      });
    });
    d.subjects = d.subjects.filter(s => s.sharedCompetitionId !== c.id || keep.has(s.id));
    localStorage.setItem(localVersionKey(c.id), String(shared.version || c.shared_folder_version || 1));
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
    renderFolderCard(document.querySelector('.competition-v3.active .cv10-folder-card'));
  }

  async function fetchShared() {
    const client = sb();
    const id = currentCompId();
    if (!client || !id) return null;
    const { data, error } = await client.rpc('get_competition_folder', { p_competition_id:id });
    if (error) throw error;
    return data || {};
  }

  async function fetchDashboard() {
    const client = sb();
    const id = currentCompId();
    if (!client || !id) return null;
    const { data, error } = await client.rpc('get_competition_dashboard', { p_competition_id:id });
    if (error) throw error;
    return data || {};
  }

  function ensureFolderCard() {
    const dashboard = document.querySelector('.competition-v3.active .cv3-dashboard');
    if (!dashboard) return null;
    let card = dashboard.querySelector('.cv10-folder-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'cv3-card cv10-folder-card';
      const ranking = dashboard.querySelector('.cv3-area-ranking');
      if (ranking?.nextSibling) dashboard.insertBefore(card, ranking.nextSibling);
      else dashboard.appendChild(card);
    }
    return card;
  }

  async function refreshData(force = false) {
    const id = currentCompId();
    if (!id || state.loading) return;
    if (!force && state.compId === id && state.dashboard && state.shared) {
      renderRanking(document.querySelector('.competition-v3.active .cv3-area-ranking'));
      renderFolderCard(ensureFolderCard());
      return;
    }
    state.loading = true;
    state.compId = id;
    try {
      const [dashboard, shared] = await Promise.all([fetchDashboard(), fetchShared()]);
      if (id !== currentCompId()) return;
      state.dashboard = dashboard;
      state.shared = shared;
      const rankCard = document.querySelector('.competition-v3.active .cv3-area-ranking');
      renderRanking(rankCard);
      renderFolderCard(ensureFolderCard());
    } catch (err) {
      console.warn('[Fixa competição] não foi possível carregar pasta/ranking:', err);
    } finally {
      state.loading = false;
    }
  }

  function queueRefresh(force = false) {
    clearTimeout(queueRefresh.timer);
    queueRefresh.timer = setTimeout(() => {
      if (!document.querySelector('.competition-v3.active .cv3-dashboard')) return;
      refreshData(force);
    }, 40);
  }

  document.addEventListener('click', event => {
    const rankTab = event.target.closest('[data-cv10-rank]');
    if (rankTab) {
      state.rankMode = rankTab.dataset.cv10Rank;
      renderRanking(document.querySelector('.competition-v3.active .cv3-area-ranking'));
      return;
    }
    if (event.target.closest('[data-cv10-rank-full]')) {
      state.modalMode = state.rankMode;
      modalRanking();
      return;
    }
    const add = event.target.closest('[data-cv10-folder-add], [data-cv10-folder-update]');
    if (add) { installSharedFolder(add); return; }
    const ownerSync = event.target.closest('[data-cv10-owner-sync]');
    if (ownerSync) { syncOwnerFolder(ownerSync); return; }
    if (event.target.closest('[data-cv7-open], [data-competition-view]')) {
      setTimeout(() => queueRefresh(true), 180);
      setTimeout(() => queueRefresh(true), 700);
    }
  });

  document.addEventListener('change', event => {
    if (event.target.matches('.competition-v3 #cv3select')) {
      state.compId = '';
      state.dashboard = null;
      state.shared = null;
      setTimeout(() => queueRefresh(true), 80);
    }
  });

  window.addEventListener('fixa-xp-updated', () => queueRefresh(true));

  const view = document.querySelector('.competition-v3');
  if (view) {
    const observer = new MutationObserver(() => {
      const detail = view.matches('.active') && view.querySelector('.cv3-dashboard');
      if (!detail) return;
      if (!view.querySelector('.cv10-folder-card') || !view.querySelector('.cv10-rank-head')) queueRefresh(false);
    });
    observer.observe(view, { childList:true, subtree:true });
  }

  setTimeout(() => queueRefresh(true), 250);
  window.FixaCompetitionSharedFolderV1 = { refresh:() => queueRefresh(true) };
})();