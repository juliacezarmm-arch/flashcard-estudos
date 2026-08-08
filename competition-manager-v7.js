(() => {
  'use strict';
  if (window.FixaCompetitionManagerV7) return;
  window.FixaCompetitionManagerV7 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const state = { list: [], tab: 'active', loading: false };

  const style = document.createElement('style');
  style.id = 'competitionManagerV7Style';
  style.textContent = `
    .cv7-manager { display:grid; gap:14px; }
    .cv7-manager-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:18px 20px; border:1px solid #e3e9f2; border-radius:15px; background:#fff; box-shadow:0 4px 16px rgba(15,23,42,.035); }
    .cv7-manager-head h2 { margin:0 0 5px; font-size:24px; color:#172033; }
    .cv7-manager-head p { margin:0; font-size:12px; color:#64748b; }
    .cv7-tabs { display:inline-flex; align-items:center; gap:4px; padding:4px; border-radius:10px; background:#f1f5f9; width:fit-content; max-width:100%; overflow:auto; scrollbar-width:none; }
    .cv7-tabs::-webkit-scrollbar { display:none; }
    .cv7-tab { min-height:32px; padding:0 14px; border:0; border-radius:8px; background:transparent; color:#64748b; font-size:13px; font-weight:700; white-space:nowrap; }
    .cv7-tab.active { background:#fff; color:#2563eb; box-shadow:0 1px 4px rgba(15,23,42,.08); }
    .cv7-count { display:inline-grid; place-items:center; min-width:20px; height:20px; margin-left:6px; padding:0 5px; border-radius:999px; background:#e8eef7; color:#475569; font-size:10px; font-weight:800; }
    .cv7-tab.active .cv7-count { background:#eef4ff; color:#2563eb; }
    .cv7-list { display:grid; gap:10px; }
    .cv7-card { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:16px; align-items:center; padding:16px 18px; border:1px solid #e3e9f2; border-radius:14px; background:#fff; box-shadow:0 4px 14px rgba(15,23,42,.03); }
    .cv7-card-main { min-width:0; }
    .cv7-card-title { display:flex; gap:9px; align-items:center; flex-wrap:wrap; }
    .cv7-card h3 { margin:0; font-size:16px; color:#172033; }
    .cv7-status { display:inline-flex; align-items:center; gap:6px; min-height:24px; padding:0 9px; border-radius:999px; font-size:10px; font-weight:800; }
    .cv7-status::before { content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }
    .cv7-status.active { background:#ecfdf3; color:#15803d; }
    .cv7-status.upcoming { background:#eef4ff; color:#2563eb; }
    .cv7-status.completed { background:#f1f5f9; color:#64748b; }
    .cv7-meta { display:flex; flex-wrap:wrap; gap:7px 14px; margin-top:8px; color:#64748b; font-size:11px; }
    .cv7-meta b { color:#334155; }
    .cv7-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
    .cv7-open { min-height:38px; padding:8px 13px; border:1px solid #d7e2f2; border-radius:9px; background:#fff; color:#172033; font-size:12px; font-weight:800; }
    .cv7-open.primary { border-color:#2563eb; background:#2563eb; color:#fff; box-shadow:0 6px 14px rgba(37,99,235,.14); }
    .cv7-delete { min-height:38px; padding:8px 12px; border:1px solid #fecaca; border-radius:9px; background:#fff7f7; color:#dc2626; font-size:12px; font-weight:800; }
    .cv7-empty { min-height:250px; display:grid; place-items:center; align-content:center; gap:8px; padding:28px; border:1px solid #e3e9f2; border-radius:15px; background:#fff; text-align:center; }
    .cv7-empty-mark { width:76px; height:76px; border-radius:50%; display:grid; place-items:center; background:#eef4ff; color:#2563eb; font-size:31px; }
    .cv7-empty h3 { margin:4px 0 0; font-size:18px; color:#172033; }
    .cv7-empty p { margin:0; max-width:480px; color:#64748b; font-size:12px; line-height:18px; }
    .cv7-create { min-height:40px; padding:8px 15px; margin-top:5px; border:0; border-radius:9px; background:#2563eb; color:#fff; font-size:12px; font-weight:800; }
    .cv7-loading { padding:20px; border:1px solid #e3e9f2; border-radius:14px; background:#fff; color:#64748b; font-size:12px; }
    @media(max-width:760px){
      .cv7-manager-head { flex-direction:column; }
      .cv7-card { grid-template-columns:1fr; }
      .cv7-actions { justify-content:flex-start; }
    }
  `;
  document.head.appendChild(style);

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = d => d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem término';
  const statusLabel = s => ({ active:'Ativa', upcoming:'Próxima', completed:'Encerrada' })[s] || s;

  function root() { return document.querySelector('.competition-v3.active #cv3'); }
  function hero() { return root()?.querySelector('.cv3-hero'); }

  function clearContentAfterHero() {
    const r = root();
    const h = hero();
    if (!r || !h) return;
    [...r.children].forEach(node => {
      if (node === h || node.classList?.contains('cv3-secondary-nav')) return;
      node.remove();
    });
  }

  function counts() {
    return {
      active: state.list.filter(x => x.effective_status === 'active').length,
      upcoming: state.list.filter(x => x.effective_status === 'upcoming').length,
      completed: state.list.filter(x => x.effective_status === 'completed').length
    };
  }

  function currentItems() {
    return state.list.filter(x => x.effective_status === state.tab);
  }

  function managerHeader() {
    const c = counts();
    return `<div class="cv7-manager-head"><div><h2>Minhas competições</h2><p>Escolha uma competição ativa, acompanhe as próximas ou consulte resultados anteriores.</p></div><div class="cv7-tabs"><button class="cv7-tab ${state.tab==='active'?'active':''}" data-cv7-tab="active">Ativas <span class="cv7-count">${c.active}</span></button><button class="cv7-tab ${state.tab==='upcoming'?'active':''}" data-cv7-tab="upcoming">Próximas <span class="cv7-count">${c.upcoming}</span></button><button class="cv7-tab ${state.tab==='completed'?'active':''}" data-cv7-tab="completed">Encerradas <span class="cv7-count">${c.completed}</span></button></div></div>`;
  }

  function card(c) {
    const status = c.effective_status || 'active';
    const period = c.ends_at ? `${fmt(c.starts_at)} a ${fmt(c.ends_at)}` : `Desde ${fmt(c.starts_at)} · tempo indeterminado`;
    const actionLabel = status === 'completed' ? 'Ver resultado' : status === 'upcoming' ? 'Ver detalhes' : 'Abrir competição';
    return `<article class="cv7-card"><div class="cv7-card-main"><div class="cv7-card-title"><h3>${esc(c.name)}</h3><span class="cv7-status ${status}">${statusLabel(status)}</span></div><div class="cv7-meta"><span>${esc(period)}</span><span><b>${Number(c.my_xp||0)} XP</b></span><span>${Number(c.member_count||0)} participante${Number(c.member_count||0)===1?'':'s'}</span>${c.daily_xp_limit?`<span>limite diário ${Number(c.daily_xp_limit)} XP</span>`:''}</div></div><div class="cv7-actions"><button class="cv7-open ${status==='active'?'primary':''}" data-cv7-open="${c.id}" data-cv7-status="${status}">${actionLabel}</button>${c.is_owner?`<button class="cv7-delete" data-cv7-delete="${c.id}">Excluir</button>`:`<button class="cv7-open" data-cv7-leave="${c.id}">Sair</button>`}</div></article>`;
  }

  function render() {
    const r = root();
    if (!r) return;
    clearContentAfterHero();
    const wrap = document.createElement('section');
    wrap.className = 'cv7-manager';
    const items = currentItems();
    wrap.innerHTML = managerHeader() + (items.length ? `<div class="cv7-list">${items.map(card).join('')}</div>` : `<div class="cv7-empty"><div class="cv7-empty-mark">🏆</div><h3>${state.tab==='active'?'Nenhuma competição ativa':state.tab==='upcoming'?'Nenhuma competição agendada':'Nenhuma competição encerrada'}</h3><p>${state.tab==='active'?'Crie uma nova competição ou entre usando um código.':state.tab==='upcoming'?'Competições com data futura aparecerão aqui.':'Quando você encerrar uma competição, o resultado ficará disponível aqui.'}</p>${state.tab==='active'?'<button class="cv7-create" data-cv7-create>Criar competição</button>':''}</div>`);
    r.appendChild(wrap);
    bindManager();
  }

  async function loadManager(preferredTab) {
    if (state.loading) return;
    const client = sb();
    const r = root();
    if (!client || !r) return;
    state.loading = true;
    clearContentAfterHero();
    const loading = document.createElement('div');
    loading.className = 'cv7-loading';
    loading.textContent = 'Carregando suas competições...';
    r.appendChild(loading);
    try {
      const { data, error } = await client.rpc('list_my_competitions');
      if (error) throw error;
      state.list = Array.isArray(data) ? data : [];
      const c = counts();
      if (preferredTab) state.tab = preferredTab;
      if (state.tab === 'active' && c.active === 0) state.tab = c.upcoming ? 'upcoming' : 'completed';
      if (state.tab === 'upcoming' && c.upcoming === 0) state.tab = c.active ? 'active' : 'completed';
      if (state.tab === 'completed' && c.completed === 0) state.tab = c.active ? 'active' : 'upcoming';
      render();
    } catch (err) {
      loading.textContent = err?.message || 'Não foi possível carregar suas competições.';
    } finally {
      state.loading = false;
    }
  }

  function openCompetition(id, status) {
    localStorage.setItem('fixa-selected-competition', id);
    sessionStorage.setItem('fixa-open-competition-on-load', '1');
    if (status === 'completed') sessionStorage.setItem('fixa-open-completed-result', '1');
    else sessionStorage.removeItem('fixa-open-completed-result');
    location.reload();
  }

  function customConfirm({title,text,confirmText,onConfirm}) {
    const bg=document.createElement('div');
    bg.className='cv3-confirm-bg';
    bg.innerHTML=`<div class="cv3-confirm" role="dialog" aria-modal="true"><div class="cv3-confirm-head"><div class="cv3-confirm-icon danger">!</div><div class="cv3-confirm-copy"><h3>${esc(title)}</h3><p>${esc(text)}</p></div></div><div class="cv3-confirm-error"></div><div class="cv3-confirm-actions"><button class="cv3-confirm-cancel" type="button">Cancelar</button><button class="cv3-confirm-danger" type="button">${esc(confirmText)}</button></div></div>`;
    document.body.appendChild(bg);
    const cancel=bg.querySelector('.cv3-confirm-cancel'), danger=bg.querySelector('.cv3-confirm-danger'), error=bg.querySelector('.cv3-confirm-error');
    cancel.onclick=()=>bg.remove();
    danger.onclick=async()=>{danger.disabled=true;danger.textContent='Aguarde...';try{const result=await onConfirm();if(result?.error)throw result.error;bg.remove();}catch(err){error.textContent=err?.message||String(err);error.classList.add('show');danger.disabled=false;danger.textContent=confirmText;}};
  }

  function bindManager() {
    document.querySelectorAll('[data-cv7-tab]').forEach(b => b.onclick = () => { state.tab = b.dataset.cv7Tab; render(); });
    document.querySelectorAll('[data-cv7-open]').forEach(b => b.onclick = () => openCompetition(b.dataset.cv7Open, b.dataset.cv7Status));
    document.querySelector('[data-cv7-create]')?.addEventListener('click', () => document.querySelector('.competition-v3 [data-create]')?.click());
    document.querySelectorAll('[data-cv7-delete]').forEach(b => b.onclick = () => customConfirm({ title:'Excluir competição?', text:'Essa ação é definitiva. Se você quer apenas finalizar e manter o resultado, use Encerrar competição.', confirmText:'Excluir', onConfirm:async()=>{const client=sb();if(!client)return{error:new Error('Não foi possível conectar ao servidor.')};const result=await client.rpc('delete_competition',{p_competition_id:b.dataset.cv7Delete});if(!result.error)await loadManager(state.tab);return result;} }));
    document.querySelectorAll('[data-cv7-leave]').forEach(b => b.onclick = () => customConfirm({ title:'Sair da competição?', text:'Você deixará de participar desta competição.', confirmText:'Sair', onConfirm:async()=>{const client=sb();if(!client)return{error:new Error('Não foi possível conectar ao servidor.')};const result=await client.rpc('leave_competition',{p_competition_id:b.dataset.cv7Leave});if(!result.error)await loadManager(state.tab);return result;} }));
  }

  async function endAndOpenManager(id) {
    const client = sb();
    if (!client) return { error:new Error('Não foi possível conectar ao servidor.') };
    const result = await client.rpc('end_competition', { p_competition_id:id });
    if (!result.error) {
      localStorage.removeItem('fixa-selected-competition');
      await loadManager();
      const c = counts();
      state.tab = c.active ? 'active' : 'completed';
      render();
    }
    return result;
  }

  function interceptActions(event) {
    const listBtn = event.target.closest('.competition-v3 [data-list]');
    if (listBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      loadManager('active');
      return;
    }
    const endBtn = event.target.closest('.competition-v3 [data-end]');
    if (endBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = document.querySelector('.competition-v3 #cv3select')?.value;
      if (!id) return;
      customConfirm({ title:'Encerrar competição?', text:'Ela sairá da tela atual e continuará disponível em Minhas competições > Encerradas. O histórico e o resultado serão preservados.', confirmText:'Encerrar', onConfirm:()=>endAndOpenManager(id) });
    }
  }

  document.addEventListener('click', interceptActions, true);

  window.addEventListener('load', () => {
    if (sessionStorage.getItem('fixa-open-competition-on-load') === '1') {
      sessionStorage.removeItem('fixa-open-competition-on-load');
      setTimeout(() => document.querySelector('[data-competition-view]')?.click(), 350);
    }
  });

  const observer = new MutationObserver(() => {
    const view = document.querySelector('.competition-v3.active');
    if (!view) return;
    const completed = view.querySelector('.cv3-status')?.textContent?.trim() === 'Encerrada';
    if (completed && sessionStorage.getItem('fixa-open-completed-result') !== '1' && !view.querySelector('.cv7-manager')) {
      setTimeout(() => loadManager('completed'), 0);
    }
    if (completed && sessionStorage.getItem('fixa-open-completed-result') === '1') {
      sessionStorage.removeItem('fixa-open-completed-result');
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.FixaCompetitionManagerV7 = { loadManager };
})();