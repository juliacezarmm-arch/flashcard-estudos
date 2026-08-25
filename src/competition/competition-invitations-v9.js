(() => {
  'use strict';
  if (window.FixaCompetitionInvitationsV9?.installed) return;
  window.FixaCompetitionInvitationsV9 = { installed:true };

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const mailIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>';

  const style = document.createElement('style');
  style.id = 'competitionInvitationsV9Style';
  style.textContent = `
    .cv9-badge{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:5px;border-radius:999px;background:#2563eb;color:#fff;font-size:10px;font-weight:800}
    .cv9-badge[hidden]{display:none!important}
    .cv9-modal-bg{position:fixed;inset:0;z-index:980;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.42);backdrop-filter:blur(3px)}
    .cv9-modal{width:min(560px,100%);max-height:88vh;overflow:auto;background:#fff;border:1px solid #e5eaf1;border-radius:18px;box-shadow:0 26px 70px rgba(15,23,42,.22)}
    .cv9-modal.wide{width:min(760px,100%)}
    .cv9-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:20px 22px 14px;border-bottom:1px solid #edf1f6}
    .cv9-title{display:flex;gap:11px;align-items:flex-start}.cv9-title-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#eef4ff;color:#2563eb;font-size:18px}.cv9-title h3{margin:0 0 4px;font-size:19px;color:#172033}.cv9-title p{margin:0;color:#64748b;font-size:11px;line-height:16px}
    .cv9-close{width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:#475569;font-size:22px}.cv9-close:hover{background:#f1f5f9}
    .cv9-body{display:grid;gap:14px;padding:18px 22px 22px}.cv9-label{display:grid;gap:6px;color:#334155;font-size:12px;font-weight:800}.cv9-input-row{display:grid;grid-template-columns:1fr auto;gap:9px}.cv9-input{min-height:43px;border:1px solid #d7e2f2;border-radius:9px;padding:0 12px;font:inherit}.cv9-btn{min-height:40px;padding:8px 14px;border-radius:9px;font-size:12px;font-weight:800}.cv9-btn.primary{border:1px solid #2563eb;background:#2563eb;color:#fff}.cv9-btn.secondary{border:1px solid #d7e2f2;background:#fff;color:#172033}.cv9-btn.danger{border:1px solid #fecaca;background:#fff7f7;color:#dc2626}
    .cv9-msg{padding:10px 12px;border-radius:9px;font-size:11px;line-height:16px;background:#eef4ff;color:#1d4ed8}.cv9-msg.error{background:#fef2f2;color:#b91c1c}.cv9-msg.success{background:#ecfdf3;color:#15803d}
    .cv9-user{display:grid;grid-template-columns:44px 1fr auto;gap:11px;align-items:center;padding:12px;border:1px solid #e4eaf3;border-radius:12px}.cv9-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#eef4ff;color:#2563eb;overflow:hidden;font-weight:800}.cv9-avatar img{width:100%;height:100%;object-fit:cover}.cv9-user h4{margin:0 0 3px;font-size:13px}.cv9-user p{margin:0;color:#64748b;font-size:11px}
    .cv9-tabs{display:inline-flex;gap:4px;padding:4px;border-radius:10px;background:#f1f5f9;width:fit-content}.cv9-tab{min-height:30px;padding:0 13px;border:0;border-radius:8px;background:transparent;color:#64748b;font-size:12px;font-weight:800}.cv9-tab.active{background:#fff;color:#2563eb;box-shadow:0 1px 4px rgba(15,23,42,.08)}
    .cv9-list{display:grid;gap:9px}.cv9-item{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:13px 14px;border:1px solid #e4eaf3;border-radius:12px}.cv9-item h4{margin:0 0 4px;font-size:13px}.cv9-item p{margin:0;color:#64748b;font-size:10.5px;line-height:16px}.cv9-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.cv9-status{display:inline-flex;align-items:center;min-height:22px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:800}.cv9-status.pending{background:#fff7e6;color:#b45309}.cv9-status.accepted{background:#ecfdf3;color:#15803d}.cv9-status.declined,.cv9-status.cancelled{background:#f1f5f9;color:#64748b}.cv9-empty{padding:28px 12px;text-align:center;color:#64748b;font-size:12px}
    @media(max-width:620px){.cv9-input-row{grid-template-columns:1fr}.cv9-user,.cv9-item{grid-template-columns:1fr}.cv9-actions{justify-content:flex-start}}
  `;
  document.head.appendChild(style);

  function currentCompetitionId(){ return document.querySelector('.competition-v3 #cv3select')?.value || null; }
  function currentCompetitionClosed(){ return document.querySelector('.competition-v3 .cv3-status')?.textContent?.trim().toLowerCase().includes('encerrada') || false; }
  function initials(name){ return String(name||'U').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
  function avatar(person){ return person?.avatar_url ? `<img src="${esc(person.avatar_url)}" alt="">` : esc(initials(person?.name)); }

  function modal(title, subtitle, body, wide=false){
    const bg=document.createElement('div'); bg.className='cv9-modal-bg';
    bg.innerHTML=`<section class="cv9-modal${wide?' wide':''}" role="dialog" aria-modal="true"><header class="cv9-head"><div class="cv9-title"><div class="cv9-title-icon">✉</div><div><h3>${esc(title)}</h3><p>${esc(subtitle||'')}</p></div></div><button class="cv9-close" type="button" aria-label="Fechar">×</button></header><div class="cv9-body">${body}</div></section>`;
    document.body.appendChild(bg); const close=()=>bg.remove(); bg.querySelector('.cv9-close').onclick=close; return {bg,close};
  }

  async function copyCurrentCode(button){
    const code=document.querySelector('.competition-v3 .cv3-area-invite .cv3-code strong')?.textContent?.trim().replace(/^\S+\s+/,'') || document.querySelector('.competition-v3 .cv3-area-invite .cv3-code strong')?.textContent?.trim();
    if(!code) return;
    try{ await navigator.clipboard.writeText(code); window.FixaToast?.show?.('Código copiado.',{type:'success',id:'competition-code-copied'}); const old=button.innerHTML; button.textContent='Código copiado ✓'; setTimeout(()=>{button.innerHTML=old;},1600); }
    catch{ button.textContent='Não foi possível copiar'; }
  }

  function ensureInvitationsButton(){
    const nav=document.querySelector('.competition-v3 .cv3-secondary-nav');
    if(!nav) return null;
    let btn=nav.querySelector('[data-cv9-invitations]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='home-subtab';
      btn.dataset.cv9Invitations='1';
      btn.innerHTML=`${mailIcon}<span data-cv9-label>Convites</span><span class="cv9-badge" data-cv9-badge hidden>0</span>`;
      nav.appendChild(btn);
    }
    if(!btn.querySelector('[data-cv9-label]')){
      btn.innerHTML=`${mailIcon}<span data-cv9-label>Convites</span><span class="cv9-badge" data-cv9-badge hidden>0</span>`;
    }
    return btn;
  }

  let badgeRequest = null;
  let lastBadgeRefresh = 0;
  async function refreshBadge(force=false){
    const btn=ensureInvitationsButton();
    if(!btn||!sb()) return;

    const now=Date.now();
    if(!force && now-lastBadgeRefresh<15000) return;
    if(badgeRequest) return badgeRequest;

    badgeRequest=(async()=>{
      try{
        const {data}=await sb().rpc('list_my_competition_invitations');
        const count=Array.isArray(data)?data.length:0;
        const badge=btn.querySelector('[data-cv9-badge]');
        if(badge){
          badge.textContent=String(count);
          badge.hidden=count===0;
        }
        document.querySelectorAll('[data-cv7-invite-count]').forEach(el=>{ el.textContent=count?` ${count}`:''; });
        lastBadgeRefresh=Date.now();
      } finally {
        badgeRequest=null;
      }
    })();
    return badgeRequest;
  }

  async function inviteModal(){
    const client=sb();
    if(!client) return modal('Convidar amigos','Não foi possível carregar suas competições.','<div class="cv9-msg error">Não foi possível conectar ao servidor.</div>');

    const {data:list,error:listError}=await client.rpc('list_my_competitions');
    if(listError) return modal('Convidar amigos','Não foi possível carregar suas competições.',`<div class="cv9-msg error">${esc(listError.message)}</div>`);

    const competitions=(Array.isArray(list)?list:[]).filter(c=>c?.effective_status!=='completed');
    if(!competitions.length) return modal('Convidar amigos','Você precisa de uma competição disponível para convidar participantes.','<div class="cv9-msg">Crie ou entre em uma competição ativa ou próxima antes de convidar amigos.</div>');

    const single=competitions.length===1;
    const targetHtml=single
      ? `<div class="cv9-msg">Convidar para: <strong>${esc(competitions[0].name)}</strong></div>`
      : `<label class="cv9-label">Competição<select class="cv9-input" data-cv9-competition><option value="">Selecione a competição...</option>${competitions.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>`;

    const {bg}=modal('Convidar amigos','Digite o e-mail exato da pessoa. O Fixa não exibe listas públicas de usuários.',`${targetHtml}<label class="cv9-label">E-mail da pessoa<div class="cv9-input-row"><input class="cv9-input" type="email" data-cv9-email placeholder="exemplo@email.com"><button class="cv9-btn secondary" data-cv9-search type="button">Procurar</button></div></label><div data-cv9-result></div>`);
    const email=bg.querySelector('[data-cv9-email]'), result=bg.querySelector('[data-cv9-result]'), search=bg.querySelector('[data-cv9-search]'), competition=bg.querySelector('[data-cv9-competition]');
    const selectedCompetitionId=()=>single?competitions[0].id:(competition?.value||'');
    competition?.addEventListener('change',()=>{result.innerHTML='';});
    search.onclick=async()=>{
      const id=selectedCompetitionId();
      if(!id){result.innerHTML='<div class="cv9-msg error">Escolha uma competição.</div>';return;}
      const value=email.value.trim(); if(!value){result.innerHTML='<div class="cv9-msg error">Informe um e-mail.</div>';return;}
      search.disabled=true; search.textContent='Procurando...';
      const {data,error}=await client.rpc('lookup_competition_invitee_by_email',{p_competition_id:id,p_email:value}); search.disabled=false;search.textContent='Procurar';
      if(error){result.innerHTML=`<div class="cv9-msg error">${esc(error.message)}</div>`;return;}
      if(!data?.found){result.innerHTML=`<div class="cv9-msg error">${esc(data?.message||'Usuário não encontrado.')}</div>`;return;}
      const disabled=data.status==='pending'||data.status==='already_member';
      result.innerHTML=`<div class="cv9-user"><div class="cv9-avatar">${avatar(data)}</div><div><h4>${esc(data.name)}</h4><p>${esc(data.email)}</p>${disabled?`<p>${esc(data.message)}</p>`:''}</div><button class="cv9-btn primary" data-cv9-send type="button" ${disabled?'disabled':''}>Enviar convite</button></div><div data-cv9-sendmsg></div>`;
      const send=result.querySelector('[data-cv9-send]'); if(!send)return;
      send.onclick=async()=>{send.disabled=true;send.textContent='Enviando...';const {data:r,error:e}=await client.rpc('invite_competition_by_email',{p_competition_id:id,p_email:data.email});const box=result.querySelector('[data-cv9-sendmsg]');if(e){box.innerHTML=`<div class="cv9-msg error">${esc(e.message)}</div>`;send.disabled=false;send.textContent='Enviar convite';return;}box.innerHTML=`<div class="cv9-msg ${r?.status==='sent'?'success':''}">${esc(r?.message||'Convite enviado.')}</div>`;if(r?.status==='sent'){send.textContent='Convite enviado ✓';refreshBadge(true);}else{send.disabled=false;send.textContent='Enviar convite';}};
    };
  }

  async function invitationCenter(){
    const {bg,close}=modal('Convites','Veja os convites recebidos e acompanhe os que você enviou.','<div class="cv9-tabs"><button class="cv9-tab active" data-cv9-tab="received">Recebidos</button><button class="cv9-tab" data-cv9-tab="sent">Enviados</button></div><div data-cv9-content><div class="cv9-empty">Carregando...</div></div>',true);
    const content=bg.querySelector('[data-cv9-content]');
    async function show(type){bg.querySelectorAll('.cv9-tab').forEach(x=>x.classList.toggle('active',x.dataset.cv9Tab===type));content.innerHTML='<div class="cv9-empty">Carregando...</div>';
      if(type==='received'){
        const {data,error}=await sb().rpc('list_my_competition_invitations'); if(error){content.innerHTML=`<div class="cv9-msg error">${esc(error.message)}</div>`;return;} const rows=Array.isArray(data)?data:[];
        content.innerHTML=rows.length?`<div class="cv9-list">${rows.map(i=>`<div class="cv9-item"><div><h4>${esc(i.competition_name)}</h4><p>Convidada por ${esc(i.invited_by_name)} · ${esc(i.folder_name||'Pasta compartilhada')}</p><p>${i.ends_at?`${esc(i.starts_at)} a ${esc(i.ends_at)}`:'Tempo indeterminado'}</p></div><div class="cv9-actions"><button class="cv9-btn secondary" data-cv9-decline="${i.id}">Recusar</button><button class="cv9-btn primary" data-cv9-accept="${i.id}">Aceitar convite</button></div></div>`).join('')}</div>`:'<div class="cv9-empty">Você não tem convites pendentes.</div>';
        content.querySelectorAll('[data-cv9-accept]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {data:id,error:e}=await sb().rpc('accept_competition_invitation',{p_invitation_id:b.dataset.cv9Accept});if(e){b.disabled=false;content.insertAdjacentHTML('afterbegin',`<div class="cv9-msg error">${esc(e.message)}</div>`);return;}(window.FixaCompetitionSelection?.set ? window.FixaCompetitionSelection.set(id) : localStorage.setItem('fixa-selected-competition', id));await refreshBadge(true);close();await window.FixaCompetitionManagerV7?.loadManager?.('active');});
        content.querySelectorAll('[data-cv9-decline]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {error:e}=await sb().rpc('decline_competition_invitation',{p_invitation_id:b.dataset.cv9Decline});if(e){b.disabled=false;content.insertAdjacentHTML('afterbegin',`<div class="cv9-msg error">${esc(e.message)}</div>`);return;}await show('received');refreshBadge(true);});
      } else {
        const {data,error}=await sb().rpc('list_sent_competition_invitations',{p_competition_id:null});if(error){content.innerHTML=`<div class="cv9-msg error">${esc(error.message)}</div>`;return;}const rows=Array.isArray(data)?data:[]; const labels={pending:'Pendente',accepted:'Aceito',declined:'Recusado',cancelled:'Cancelado'};
        content.innerHTML=rows.length?`<div class="cv9-list">${rows.map(i=>`<div class="cv9-item"><div><h4>${esc(i.name)}</h4><p>${esc(i.invited_email)} · ${esc(i.competition_name)}</p></div><div class="cv9-actions"><span class="cv9-status ${esc(i.status)}">${esc(labels[i.status]||i.status)}</span>${i.status==='pending'?`<button class="cv9-btn danger" data-cv9-cancel="${i.id}">Cancelar</button>`:''}</div></div>`).join('')}</div>`:'<div class="cv9-empty">Nenhum convite enviado.</div>';
        content.querySelectorAll('[data-cv9-cancel]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {error:e}=await sb().rpc('cancel_competition_invitation',{p_invitation_id:b.dataset.cv9Cancel});if(e){b.disabled=false;content.insertAdjacentHTML('afterbegin',`<div class="cv9-msg error">${esc(e.message)}</div>`);return;}await show('sent');});
      }
    }
    bg.querySelectorAll('[data-cv9-tab]').forEach(b=>b.onclick=()=>show(b.dataset.cv9Tab));show('received');
  }

  Object.assign(window.FixaCompetitionInvitationsV9, {
    openInvite: inviteModal,
    openInvitations: invitationCenter,
    refreshBadge
  });

  /* A barra secundária possui handlers diretos próprios. Este módulo
     continua interceptando apenas as ações internas do card Convite. */
  function intercept(e){
    const share=e.target.closest('.competition-v3 .cv3-area-invite [data-share]');
    if(share){e.preventDefault();e.stopImmediatePropagation();inviteModal();return;}
    const copy=e.target.closest('.competition-v3 .cv3-area-invite [data-copy]');
    if(copy){e.preventDefault();e.stopImmediatePropagation();copyCurrentCode(copy);return;}
    if(e.target.closest('[data-competition-view]')) setTimeout(()=>refreshBadge(true),100);
  }

  document.addEventListener('click',intercept,true);
  window.addEventListener('load',()=>setTimeout(()=>refreshBadge(true),250));
  window.addEventListener('focus',()=>{
    if(document.querySelector('.competition-v3.active')) refreshBadge(false);
  });
})();