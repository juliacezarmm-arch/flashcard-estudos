(() => {
  'use strict';
  if (window.FixaCompetitionManagerV7) return;
  window.FixaCompetitionManagerV7 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const state = { list: [], tab: 'active', loading: false };

  const trophySvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></svg>';
  const plusSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const hashSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/></svg>';
  const mailSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';

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
    .cv7-empty { min-height:300px; display:grid; place-items:center; align-content:center; gap:10px; padding:34px 28px; border:1px solid #e3e9f2; border-radius:15px; background:#fff; text-align:center; }
    .cv7-empty-mark { width:76px; height:76px; border-radius:50%; display:grid; place-items:center; background:#eef4ff; color:#2563eb; border:1px solid #dce8ff; }
    .cv7-empty-mark svg { width:40px; height:40px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
    .cv7-empty h3 { margin:5px 0 0; font-size:20px; line-height:1.2; color:#172033; }
    .cv7-empty p { margin:0; max-width:520px; color:#64748b; font-size:13px; line-height:19px; }
    .cv7-empty-actions { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:9px; margin-top:8px; }
    .cv7-empty-action { min-height:40px; padding:8px 15px; border:1px solid #d7e2f2; border-radius:9px; background:#fff; color:#172033; display:inline-flex; align-items:center; justify-content:center; gap:7px; font-size:12px; font-weight:800; }
    .cv7-empty-action svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
    .cv7-empty-action.primary { border-color:#2563eb; background:#2563eb; color:#fff; box-shadow:0 6px 14px rgba(37,99,235,.14); }
    .cv7-loading { padding:20px; border:1px solid #e3e9f2; border-radius:14px; background:#fff; color:#64748b; font-size:12px; }
    .competition-v3.cv7-home-open .cv3-secondary-nav [data-list] { color:#2563eb !important; background:#fff !important; box-shadow:0 1px 4px rgba(15,23,42,.08) !important; }
    @media(max-width:760px){
      .cv7-manager-head { flex-direction:column; }
      .cv7-card { grid-template-columns:1fr; }
      .cv7-actions { justify-content:flex-start; }
      .cv7-empty { min-height:260px; padding:28px 18px; }
      .cv7-empty-actions { width:100%; }
      .cv7-empty-action { flex:1 1 150px; }
    }
  `;
  document.head.appendChild(style);

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = d => d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem término';
  const statusLabel = s => ({ active:'Ativa', upcoming:'Próxima', completed:'Encerrada' })[s] || s;

  function root() { return document.querySelector('.competition-v3.active #cv3'); }
  function view() { return document.querySelector('.competition-v3'); }
  function hero() { return root()?.querySelector('.cv3-hero'); }

  function setManagerActive(active) {
    const v = view();
    if (!v) return;
    v.classList.toggle('cv7-home-open', !!active);
    const nav = v.querySelector('.cv3-secondary-nav');
    nav?.querySelectorAll('.home-subtab').forEach(button => {
      const selected = !!active && button.matches('[data-list]');
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

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

  function generalEmptyState() {
    return `<div class="cv7-empty"><div class="cv7-empty-mark">${trophySvg}</div><h3>Nenhuma competição encontrada</h3><p>Crie uma competição ou entre em uma competição.</p><div class="cv7-empty-actions"><button class="cv7-empty-action primary" type="button" data-cv7-create>${plusSvg} Criar competição</button><button class="cv7-empty-action" type="button" data-cv7-join>${hashSvg} Entrar por código</button><button class="cv7-empty-action" type="button" data-cv7-invitations>${mailSvg} Convites <span data-cv7-invite-count></span></button></div></div>`;
  }

  function categoryEmptyState() {
    const copy = {
      active: ['Nenhuma competição ativa', 'As competições ativas aparecerão aqui.'],
      upcoming: ['Nenhuma competição agendada', 'Competições com data futura aparecerão aqui.'],
      completed: ['Nenhuma competição encerrada', 'Os resultados das competições finalizadas aparecerão aqui.']
    }[state.tab] || ['Nenhuma competição encontrada', 'Não há competições nesta categoria.'];
    return `<div class="cv7-empty"><div class="cv7-empty-mark">${trophySvg}</div><h3>${copy[0]}</h3><p>${copy[1]}</p></div>`;
  }

  function render() {
    const r = root();
    if (!r) return;
    clearContentAfterHero();
    setManagerActive(true);
    const wrap = document.createElement('section');
    wrap.className = 'cv7-manager';
    const items = currentItems();
    wrap.innerHTML = managerHeader() + (state.list.length === 0 ? generalEmptyState() : items.length ? `<div class="cv7-list">${items.map(card).join('')}</div>` : categoryEmptyState());
    r.appendChild(wrap);
    bindManager();
    syncEmptyInviteCount();
  }

  async function loadManager(preferredTab) {
    if (state.loading) return;
    const client = sb();
    const r = root();
    if (!client || !r) return;
    state.loading = true;
    clearContentAfterHero();
    setManagerActive(true);
    const loading = document.createElement('div');
    loading.className = 'cv7-loading';
    loading.textContent = 'Carregando suas competições...';
    r.appendChild(loading);
    try {
      const { data, error } = await client.rpc('list_my_competitions');
      if (error) throw error;
      state.list = Array.isArray(data) ? data : [];
      const c = counts();
      if (state.list.length === 0) {
        state.tab = 'active';
      } else {
        if (preferredTab) state.tab = preferredTab;
        if (state.tab === 'active' && c.active === 0) state.tab = c.upcoming ? 'upcoming' : 'completed';
        if (state.tab === 'upcoming' && c.upcoming === 0) state.tab = c.active ? 'active' : 'completed';
        if (state.tab === 'completed' && c.completed === 0) state.tab = c.active ? 'active' : 'upcoming';
      }
      render();
    } catch (err) {
      loading.textContent = err?.message || 'Não foi possível carregar suas competições.';
    } finally {
      state.loading = false;
    }
  }

  async function syncEmptyInviteCount() {
    const target = document.querySelector('[data-cv7-invite-count]');
    if (!target || !sb()) return;
    try {
      const { data } = await sb().rpc('list_my_competition_invitations');
      const count = Array.isArray(data) ? data.length : 0;
      target.textContent = count ? ` ${count}` : '';
    } catch {}
  }

  function clickSecondary(selector) {
    const button = document.querySelector(`.competition-v3 .cv3-secondary-nav ${selector}`);
    if (!button) return false;
    button.click();
    return true;
  }

  function openInvitationsFromEmpty() {
    if (clickSecondary('[data-cv9-invitations]')) return;
    window.dispatchEvent(new Event('focus'));
    setTimeout(() => clickSecondary('[data-cv9-invitations]'), 60);
  }

  function openCompetition(id, status) {
    setManagerActive(false);
    localStorage.setItem('fixa-selected-competition', id);
    sessionStorage.setItem('fixa-open-competition-on-load', '1');
    sessionStorage.setItem('fixa-open-competition-detail', '1');
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
    document.querySelector('[data-cv7-create]')?.addEventListener('click', () => clickSecondary('[data-create]'));
    document.querySelector('[data-cv7-join]')?.addEventListener('click', () => clickSecondary('[data-join]'));
    document.querySelector('[data-cv7-invitations]')?.addEventListener('click', openInvitationsFromEmpty);
    document.querySelectorAll('[data-cv7-delete]').forEach(b => b.onclick = () => customConfirm({ title:'Excluir competição?', text:'Essa ação é definitiva. Se você quer apenas finalizar e manter o resultado, use Encerrar competição.', confirmText:'Excluir', onConfirm:async()=>{const client=sb();if(!client)return{error:new Error('Não foi possível conectar ao servidor.')};const result=await client.rpc('delete_competition',{p_competition_id:b.dataset.cv7Delete});if(!result.error)await loadManager(state.tab);return result;} }));
    document.querySelectorAll('[data-cv7-leave]').forEach(b => b.onclick = () => customConfirm({ title:'Sair da competição?', text:'Você deixará de participar desta competição.', confirmText:'Sair', onConfirm:async()=>{const client=sb();if(!client)return{error:new Error('Não foi possível conectar ao servidor.')};const result=await client.rpc('leave_competition',{p_competition_id:b.dataset.cv7Leave});if(!result.error)await loadManager(state.tab);return result;} }));
  }

  async function endAndOpenManager(id) {
    const client = sb();
    if (!client) return { error:new Error('Não foi possível conectar ao servidor.') };
    const result = await client.rpc('end_competition', { p_competition_id:id });
    if (!result.error) {
      localStorage.removeItem('fixa-selected-competition');
      sessionStorage.removeItem('fixa-open-competition-detail');
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
      sessionStorage.removeItem('fixa-open-competition-detail');
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

  /* A aba principal Competição sempre abre Minhas competições.
     A única exceção é quando o usuário acabou de clicar explicitamente
     em uma competição da lista para abrir seus detalhes. */
  document.addEventListener('click', event => {
    const mainCompetitionTab = event.target.closest('[data-competition-view]');
    if (!mainCompetitionTab) return;

    const openingDetail = sessionStorage.getItem('fixa-open-competition-detail') === '1';
    if (openingDetail) {
      sessionStorage.removeItem('fixa-open-competition-detail');
      setManagerActive(false);
      return;
    }

    sessionStorage.removeItem('fixa-open-completed-result');
    window.setTimeout(() => loadManager('active'), 0);
    window.setTimeout(() => {
      if (!document.querySelector('.competition-v3.active .cv7-manager')) loadManager('active');
    }, 180);
  }, true);

  window.addEventListener('load', () => {
    if (sessionStorage.getItem('fixa-open-competition-on-load') === '1') {
      setTimeout(() => {
        document.querySelector('[data-competition-view]')?.click();
        sessionStorage.removeItem('fixa-open-competition-on-load');
      }, 350);
    }
  });

  const observer = new MutationObserver(() => {
    const v = document.querySelector('.competition-v3.active');
    if (!v) return;
    const completed = v.querySelector('.cv3-status')?.textContent?.trim() === 'Encerrada';
    if (completed && sessionStorage.getItem('fixa-open-completed-result') !== '1' && !v.querySelector('.cv7-manager')) {
      setTimeout(() => loadManager('completed'), 0);
    }
    if (completed && sessionStorage.getItem('fixa-open-completed-result') === '1') {
      sessionStorage.removeItem('fixa-open-completed-result');
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.FixaCompetitionManagerV7 = { loadManager };
})();