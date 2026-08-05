(() => {
  "use strict";

  if (document.querySelector("#fixaCompetitionStyle")) return;

  const svg = {
    trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0z"></path><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"></path></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"></path></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"></path><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"></path></svg>',
    target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 4V2M20 12h2M12 20v2M4 12H2"></path></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 19h16M7 16V9M12 16V5M17 16v-4"></path></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 6v5h-5M4 18v-5h5"></path><path d="M18 9a7 7 0 0 0-12-3L4 8M6 15a7 7 0 0 0 12 3l2-2"></path></svg>'
  };

  const style = document.createElement("style");
  style.id = "fixaCompetitionStyle";
  style.textContent = `
    .competition-view{display:none;width:100%;max-width:1180px;margin:0 auto;color:#172033}.competition-view.active{display:block}.competition-shell{display:grid;gap:14px;padding:4px 0 22px}.competition-hero,.competition-card{border:1px solid #e1e8f2;border-radius:14px;background:#fff;box-shadow:0 4px 16px rgba(15,23,42,.04)}.competition-hero{padding:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center}.competition-title{display:flex;align-items:center;gap:14px}.competition-art{width:62px;height:62px;border-radius:16px;display:grid;place-items:center;color:#2563eb;background:#eef4ff}.competition-art svg{width:34px;height:34px}.competition-copy h2{margin:0 0 4px;font-size:25px}.competition-copy p{margin:0;color:#64748b;font-size:13px}.competition-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.competition-actions button,.competition-small-btn{min-height:38px;padding:0 13px;font-size:12px}.competition-actions svg,.competition-small-btn svg,.competition-view svg{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.competition-actions svg,.competition-small-btn svg{width:17px;height:17px}.competition-selector{display:flex;align-items:center;gap:9px}.competition-selector select{width:auto;min-width:220px;min-height:38px;font-size:12px}.competition-grid{display:grid;grid-template-columns:minmax(250px,.34fr) minmax(0,.66fr);gap:14px}.competition-left,.competition-right{display:grid;gap:14px;align-content:start}.competition-card{padding:15px}.competition-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}.competition-card-head h3{margin:0;font-size:15px}.competition-muted{color:#64748b;font-size:11px}.competition-position{display:flex;justify-content:space-between;align-items:center;gap:12px}.competition-position strong{display:block;font-size:33px;line-height:1}.competition-position b{display:block;margin-top:7px;color:#2563eb;font-size:16px}.competition-medal{font-size:42px}.competition-progress{height:8px;margin-top:13px;border-radius:999px;overflow:hidden;background:#e8edf5}.competition-progress span{display:block;height:100%;border-radius:inherit;background:#2563eb}.competition-progress-line{display:flex;justify-content:space-between;margin-top:7px;color:#64748b;font-size:11px}.competition-ranking{display:grid;gap:5px}.competition-rank-row{min-height:44px;display:grid;grid-template-columns:30px 34px minmax(0,1fr) auto;align-items:center;gap:9px;border-radius:9px;padding:5px 8px}.competition-rank-row.is-me{background:#eef4ff}.competition-rank-number{font-weight:800;text-align:center}.competition-avatar{width:32px;height:32px;border-radius:999px;display:grid;place-items:center;background:#eaf0fb;color:#315fa8;font-size:11px;font-weight:800;overflow:hidden}.competition-avatar img{width:100%;height:100%;object-fit:cover}.competition-rank-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:700}.competition-rank-xp{font-size:12px;font-weight:800}.competition-challenge h4{margin:0 0 5px;font-size:14px}.competition-challenge p{margin:0;color:#64748b;font-size:11px;line-height:1.45}.competition-bonus{display:inline-flex;margin-top:10px;border-radius:999px;padding:5px 9px;color:#be185d;background:#fff0f6;font-size:10px;font-weight:800}.competition-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.competition-metric{min-height:78px;border:1px solid #e4eaf3;border-radius:10px;padding:9px;display:grid;align-content:center;justify-items:center;text-align:center}.competition-metric strong{font-size:20px;color:#2563eb}.competition-metric span{margin-top:4px;color:#64748b;font-size:10px}.competition-activities{display:grid;gap:4px}.competition-activity{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:40px;border-bottom:1px solid #eef2f7;font-size:11px}.competition-activity:last-child{border-bottom:0}.competition-activity-icon{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;color:#15803d;background:#eaf8ee;font-size:12px}.competition-empty{min-height:280px;display:grid;place-content:center;justify-items:center;gap:10px;text-align:center}.competition-empty .competition-art{width:72px;height:72px}.competition-empty h3{margin:0;font-size:18px}.competition-empty p{max-width:480px;margin:0;color:#64748b;font-size:13px;line-height:1.5}.competition-modal-backdrop{position:fixed;inset:0;z-index:500;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.46)}.competition-modal{width:min(100%,620px);max-height:88dvh;overflow:auto;border-radius:16px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.24)}.competition-modal-head{display:flex;justify-content:space-between;align-items:center;padding:18px;border-bottom:1px solid #e6ebf3}.competition-modal-head h3{margin:0}.competition-modal-close{width:34px;height:34px;min-height:34px;padding:0;color:#475569;background:#f1f5f9}.competition-form{display:grid;gap:12px;padding:18px}.competition-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.competition-form label{font-size:12px}.competition-form input,.competition-form select,.competition-form textarea{font-size:13px}.competition-form textarea{min-height:74px}.competition-form-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}.competition-notice{display:none;border-radius:9px;padding:9px 11px;color:#1d4ed8;background:#eef4ff;font-size:12px}.competition-notice.show{display:block}.competition-notice.error{color:#b91c1c;background:#fef2f2}@media(max-width:900px){.competition-grid{grid-template-columns:1fr}.competition-hero{grid-template-columns:1fr}.competition-actions{justify-content:flex-start}}@media(max-width:620px){.competition-metrics,.competition-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.competition-title{align-items:flex-start}.competition-selector{align-items:stretch;flex-direction:column}.competition-selector select{width:100%;min-width:0}}
  `;
  document.head.appendChild(style);

  const tabs = document.querySelector('.topbar-right .tabs');
  const testTab = tabs?.querySelector('[data-view="test"]');
  const main = document.querySelector('#appShell main');
  if (!tabs || !testTab || !main || typeof supabaseClient === 'undefined') return;

  const competitionTab = document.createElement('button');
  competitionTab.className = 'tab';
  competitionTab.type = 'button';
  competitionTab.dataset.competitionView = 'competition';
  competitionTab.innerHTML = `${svg.trophy}<span>Competição</span>`;
  testTab.insertAdjacentElement('afterend', competitionTab);

  const view = document.createElement('section');
  view.className = 'competition-view';
  view.id = 'competitionView';
  view.innerHTML = '<div class="competition-shell" id="competitionShell"></div>';
  main.appendChild(view);

  const shell = view.querySelector('#competitionShell');
  const state = { list: [], selected: localStorage.getItem('fixa-selected-competition') || '', dashboard: null, loading: false };

  function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
  function initials(name){return String(name||'P').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
  function dateBR(value){if(!value)return '';return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')}
  function daysLeft(end){return Math.max(0,Math.ceil((new Date(`${end}T23:59:59`)-Date.now())/86400000))}
  function percent(value,total){return total?Math.min(100,Math.round(value/total*100)):0}
  function currentUserId(){return typeof currentUser!=='undefined'&&currentUser?.id?currentUser.id:null}
  function activeCompetition(){return state.list.find(item=>item.id===state.selected)||state.list[0]||null}

  function setNotice(node,message,error=false){node.textContent=message;node.className=`competition-notice show${error?' error':''}`}
  function eventLabel(type){return ({test_completed:'concluiu um teste',review_completed:'realizou uma revisão',daily_goal:'cumpriu a meta diária',weekly_goal:'cumpriu a meta semanal',streak_bonus:'manteve a sequência',challenge_completed:'concluiu um desafio'})[type]||'registrou uma atividade'}

  function openModal(title,body){
    const backdrop=document.createElement('div');
    backdrop.className='competition-modal-backdrop';
    backdrop.innerHTML=`<div class="competition-modal" role="dialog" aria-modal="true"><div class="competition-modal-head"><h3>${escapeHtml(title)}</h3><button class="competition-modal-close" type="button">×</button></div>${body}</div>`;
    document.body.appendChild(backdrop);
    const close=()=>backdrop.remove();
    backdrop.querySelector('.competition-modal-close').addEventListener('click',close);
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
    return {backdrop,close};
  }

  function createCompetitionModal(){
    const today=new Date().toISOString().slice(0,10);
    const end=new Date(Date.now()+6*86400000).toISOString().slice(0,10);
    const {backdrop,close}=openModal('Criar competição',`<form class="competition-form" id="competitionCreateForm"><label>Nome da competição<input name="name" required minlength="3" maxlength="80" placeholder="Ex.: Rumo à aprovação"></label><label>Descrição<textarea name="description" maxlength="280" placeholder="Explique o objetivo do grupo"></textarea></label><div class="competition-form-grid"><label>Período<select name="period"><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="custom">Personalizado</option></select></label><label>Matéria ou tema<input name="subject" maxlength="80" placeholder="Ex.: Engenharia Civil"></label><label>Data de início<input name="start" type="date" value="${today}" required></label><label>Data de término<input name="end" type="date" value="${end}" required></label><label>Limite diário de XP<input name="dailyLimit" type="number" min="50" max="2000" value="300"></label><label>Visibilidade<select name="visibility"><option value="visible">Ranking visível</option><option value="hidden">Ocultar pontuações</option><option value="silent">Modo silencioso</option></select></label></div><h4 style="margin:4px 0 0">Desafio inicial</h4><div class="competition-form-grid"><label>Título<input name="challengeTitle" value="Constância da semana" required></label><label>Tipo<select name="challengeMetric"><option value="study_days">Dias estudados</option><option value="tests">Testes concluídos</option><option value="questions">Questões respondidas</option><option value="reviews">Revisões</option><option value="sequence">Sequência</option></select></label><label>Meta<input name="challengeTarget" type="number" min="1" value="5"></label><label>Bônus de XP<input name="challengeBonus" type="number" min="0" max="2000" value="200"></label></div><div class="competition-notice" id="competitionCreateNotice"></div><div class="competition-form-actions"><button class="secondary" type="button" data-cancel>Cancelar</button><button type="submit">Criar competição</button></div></form>`);
    const form=backdrop.querySelector('form');
    const period=form.elements.period;
    period.addEventListener('change',()=>{const start=new Date(`${form.elements.start.value}T12:00:00`);if(Number.isNaN(start.getTime()))return;const d=new Date(start);period.value==='monthly'?d.setMonth(d.getMonth()+1,0):period.value==='weekly'&&d.setDate(d.getDate()+6);if(period.value!=='custom')form.elements.end.value=d.toISOString().slice(0,10)});
    backdrop.querySelector('[data-cancel]').addEventListener('click',close);
    form.addEventListener('submit',async e=>{e.preventDefault();const notice=form.querySelector('#competitionCreateNotice');const values=new FormData(form);const button=form.querySelector('[type="submit"]');button.disabled=true;const {data:created,error}=await supabaseClient.rpc('create_competition',{p_name:values.get('name'),p_description:values.get('description'),p_period_type:values.get('period'),p_starts_at:values.get('start'),p_ends_at:values.get('end'),p_subject_name:values.get('subject'),p_daily_xp_limit:Number(values.get('dailyLimit')),p_ranking_visibility:values.get('visibility'),p_challenge_title:values.get('challengeTitle'),p_challenge_metric:values.get('challengeMetric'),p_challenge_target:Number(values.get('challengeTarget')),p_challenge_bonus:Number(values.get('challengeBonus'))});button.disabled=false;if(error){setNotice(notice,error.message,true);return}state.selected=created;localStorage.setItem('fixa-selected-competition',created);close();await loadCompetitions(true)});
  }

  function joinCompetitionModal(){
    const {backdrop,close}=openModal('Entrar por código',`<form class="competition-form" id="competitionJoinForm"><label>Código do convite<input name="code" required maxlength="20" placeholder="Ex.: FIXA2026" style="text-transform:uppercase"></label><div class="competition-notice" id="competitionJoinNotice"></div><div class="competition-form-actions"><button class="secondary" type="button" data-cancel>Cancelar</button><button type="submit">Entrar na competição</button></div></form>`);
    backdrop.querySelector('[data-cancel]').addEventListener('click',close);
    const form=backdrop.querySelector('form');form.addEventListener('submit',async e=>{e.preventDefault();const notice=form.querySelector('#competitionJoinNotice');const button=form.querySelector('[type="submit"]');button.disabled=true;const {data:joined,error}=await supabaseClient.rpc('join_competition_by_code',{p_code:form.elements.code.value});button.disabled=false;if(error){setNotice(notice,error.message,true);return}state.selected=joined;localStorage.setItem('fixa-selected-competition',joined);close();await loadCompetitions(true)});
  }

  async function copyInvite(){const comp=activeCompetition();if(!comp)return;const url=new URL(location.href);url.searchParams.set('competition',comp.invite_code);const text=`${comp.name}\nCódigo: ${comp.invite_code}\n${url}`;try{await navigator.clipboard.writeText(text);alert('Convite copiado.')}catch{window.prompt('Copie o convite:',text)}}

  async function syncTestHistory(){
    if(!state.list.length||typeof data==='undefined'||!Array.isArray(data.testHistory))return;
    const tests=data.testHistory.slice(0,50);
    for(const comp of state.list.filter(x=>x.status==='active')){
      for(const item of tests){
        const occurred=(item.date||'').slice(0,10);if(!occurred||occurred<comp.starts_at||occurred>comp.ends_at)continue;
        const accuracy=item.total?Math.round(item.score/item.total*100):0;
        await supabaseClient.rpc('award_competition_xp',{p_competition_id:comp.id,p_event_type:'test_completed',p_source_key:`test:${item.id}`,p_occurred_on:occurred,p_metadata:{accuracy,question_count:item.total||0,subject:item.subject||''}});
      }
    }
  }

  async function loadCompetitions(forceDashboard=false){
    if(!currentUserId()){renderSignedOut();return}
    state.loading=true;renderLoading();
    const {data:list,error}=await supabaseClient.rpc('list_my_competitions');
    state.loading=false;if(error){renderError(error.message);return}
    state.list=Array.isArray(list)?list:[];
    if(!state.list.some(item=>item.id===state.selected))state.selected=state.list[0]?.id||'';
    if(state.selected)localStorage.setItem('fixa-selected-competition',state.selected);
    await syncTestHistory();
    if(state.selected||forceDashboard)await loadDashboard();else render();
  }

  async function loadDashboard(){
    if(!state.selected){state.dashboard=null;render();return}
    const {data:dashboard,error}=await supabaseClient.rpc('get_competition_dashboard',{p_competition_id:state.selected});
    if(error){renderError(error.message);return}
    state.dashboard=dashboard;render();
  }

  function renderHeader(){
    const comp=activeCompetition();return `<div class="competition-hero"><div class="competition-title"><div class="competition-art">${svg.trophy}</div><div class="competition-copy"><h2>Competição</h2><p>${comp?`Acompanhe sua posição e evolua com o grupo.`:'Crie desafios saudáveis e mantenha a constância nos estudos.'}</p></div></div><div class="competition-actions"><button type="button" data-create>${svg.plus} Criar competição</button><button class="secondary" type="button" data-join># Entrar por código</button>${comp?`<button class="secondary" type="button" data-invite>${svg.users} Convidar amigos</button>`:''}</div></div>${state.list.length?`<div class="competition-selector"><label class="competition-muted">Competição ativa</label><select id="competitionSelect">${state.list.map(item=>`<option value="${item.id}" ${item.id===state.selected?'selected':''}>${escapeHtml(item.name)} · ${item.member_count} participante${Number(item.member_count)===1?'':'s'}</option>`).join('')}</select><button class="secondary competition-small-btn" type="button" data-refresh>${svg.refresh} Atualizar</button></div>`:''}`;
  }

  function renderEmpty(){shell.innerHTML=renderHeader()+`<div class="competition-card competition-empty"><div class="competition-art">${svg.trophy}</div><h3>Sua primeira competição começa aqui</h3><p>Crie um grupo privado ou entre pelo código de um amigo. A pontuação valoriza testes concluídos, revisões, metas e constância, com limite diário para evitar excesso.</p><div class="competition-actions"><button type="button" data-create>${svg.plus} Criar competição</button><button class="secondary" type="button" data-join># Entrar por código</button></div></div>`;bindActions()}

  function render(){
    const d=state.dashboard;if(!state.list.length||!d?.competition){renderEmpty();return}
    const c=d.competition,me=d.me||{},ranking=Array.isArray(d.ranking)?d.ranking:[],challenge=(d.challenges||[])[0];
    const totalDays=Math.max(1,Math.ceil((new Date(`${c.ends_at}T12:00:00`)-new Date(`${c.starts_at}T12:00:00`))/86400000)+1);const elapsed=Math.max(0,totalDays-daysLeft(c.ends_at));
    const rankRows=ranking.slice(0,5).map(r=>`<div class="competition-rank-row ${r.user_id===currentUserId()?'is-me':''}"><span class="competition-rank-number">${r.position<=3?['🥇','🥈','🥉'][r.position-1]:r.position}</span><span class="competition-avatar">${r.avatar_url?`<img src="${escapeHtml(r.avatar_url)}" alt="">`:initials(r.name)}</span><span class="competition-rank-name">${escapeHtml(r.user_id===currentUserId()?'Você':r.name)}</span><span class="competition-rank-xp">${r.hide_score&&r.user_id!==currentUserId()?'Oculto':`${r.weekly_xp||0} XP`}</span></div>`).join('');
    const challengeValue=challenge?.current_value||0,challengeTarget=challenge?.target_value||1;
    shell.innerHTML=renderHeader()+`<div class="competition-grid"><div class="competition-left"><section class="competition-card"><div class="competition-card-head"><h3>Sua posição</h3><span class="competition-muted">Semana atual</span></div><div class="competition-position"><div><strong>${me.position||'—'}º lugar</strong><b>${me.weekly_xp||0} XP</b></div><span class="competition-medal">${me.position<=3?['🥇','🥈','🥉'][me.position-1]:'🏅'}</span></div><div class="competition-progress"><span style="width:${percent(elapsed,totalDays)}%"></span></div><div class="competition-progress-line"><span>Progresso da competição</span><b>${percent(elapsed,totalDays)}%</b></div><div class="competition-muted" style="margin-top:9px">${svg.clock} Termina em ${daysLeft(c.ends_at)} dia(s) · ${dateBR(c.ends_at)}</div></section><section class="competition-card competition-challenge"><div class="competition-card-head"><h3>Desafio atual</h3><span class="competition-muted">+${challenge?.bonus_xp||0} XP</span></div>${challenge?`<h4>${escapeHtml(challenge.title)}</h4><p>${escapeHtml(challenge.description||'Mantenha uma rotina de estudos saudável.')}</p><div class="competition-progress"><span style="width:${percent(challengeValue,challengeTarget)}%"></span></div><div class="competition-progress-line"><span>${challengeValue} de ${challengeTarget}</span><b>${percent(challengeValue,challengeTarget)}%</b></div><span class="competition-bonus">+ ${challenge.bonus_xp} XP de bônus</span>`:'<p>Nenhum desafio ativo.</p>'}</section><section class="competition-card"><div class="competition-card-head"><h3>Convite</h3><span class="competition-muted">Grupo privado</span></div><p class="competition-muted">Compartilhe o código apenas com quem você deseja convidar.</p><div style="margin:12px 0;border:1px solid #dbe5f5;border-radius:10px;padding:11px;display:flex;justify-content:space-between;align-items:center"><strong style="letter-spacing:.08em">${escapeHtml(c.invite_code)}</strong><button class="secondary competition-small-btn" data-invite type="button">${svg.link} Copiar</button></div></section></div><div class="competition-right"><section class="competition-card"><div class="competition-card-head"><h3>Ranking da semana</h3><span class="competition-muted">Top 5</span></div><div class="competition-ranking">${rankRows||'<p class="competition-muted">Nenhum participante ainda.</p>'}</div></section><section class="competition-card"><div class="competition-card-head"><h3>Seu desempenho</h3><span class="competition-muted">Nesta semana</span></div><div class="competition-metrics"><div class="competition-metric"><strong>${me.tests_completed||0}</strong><span>Testes concluídos</span></div><div class="competition-metric"><strong>${me.study_days||0}</strong><span>Dias estudados</span></div><div class="competition-metric"><strong>${Math.round(Number(me.average_accuracy)||0)}%</strong><span>Aproveitamento</span></div><div class="competition-metric"><strong>${me.total_xp||0}</strong><span>XP total</span></div></div></section><section class="competition-card"><div class="competition-card-head"><h3>Atividades recentes</h3><span class="competition-muted">Últimos registros</span></div><div class="competition-activities">${(d.activities||[]).slice(0,8).map(a=>`<div class="competition-activity"><span class="competition-activity-icon">✓</span><span><b>${escapeHtml(a.user_id===currentUserId()?'Você':a.name)}</b> ${eventLabel(a.event_type)}</span><b>+${a.points} XP</b></div>`).join('')||'<p class="competition-muted">As atividades aparecerão após a conclusão de testes e revisões.</p>'}</div></section></div></div>`;
    bindActions();
  }

  function bindActions(){
    shell.querySelectorAll('[data-create]').forEach(b=>b.addEventListener('click',createCompetitionModal));
    shell.querySelectorAll('[data-join]').forEach(b=>b.addEventListener('click',joinCompetitionModal));
    shell.querySelectorAll('[data-invite]').forEach(b=>b.addEventListener('click',copyInvite));
    shell.querySelector('[data-refresh]')?.addEventListener('click',()=>loadCompetitions(true));
    shell.querySelector('#competitionSelect')?.addEventListener('change',e=>{state.selected=e.target.value;localStorage.setItem('fixa-selected-competition',state.selected);loadDashboard()});
  }

  function renderLoading(){shell.innerHTML=renderHeader()+'<div class="competition-card competition-empty"><div class="competition-art">'+svg.refresh+'</div><h3>Carregando competição...</h3></div>'}
  function renderError(message){shell.innerHTML=renderHeader()+`<div class="competition-card competition-empty"><h3>Não foi possível carregar</h3><p>${escapeHtml(message)}</p><button data-refresh type="button">Tentar novamente</button></div>`;bindActions()}
  function renderSignedOut(){shell.innerHTML=renderHeader()+'<div class="competition-card competition-empty"><h3>Entre na sua conta</h3><p>A competição precisa de uma conta conectada para manter ranking, convites e pontuação sincronizados.</p></div>'}

  function openCompetition(){
    document.querySelectorAll('main > .view.active,.home-view.active').forEach(item=>item.classList.remove('active'));
    document.body.classList.remove('home-active');
    tabs.querySelectorAll('.tab').forEach(item=>item.classList.remove('active'));
    competitionTab.classList.add('active');view.classList.add('active');
    loadCompetitions();
  }
  function closeCompetition(){view.classList.remove('active');competitionTab.classList.remove('active')}
  competitionTab.addEventListener('click',openCompetition);
  tabs.querySelectorAll('.tab[data-view]').forEach(tab=>tab.addEventListener('click',closeCompetition));

  const inviteCode=new URL(location.href).searchParams.get('competition');
  if(inviteCode){setTimeout(()=>{openCompetition();setTimeout(()=>{joinCompetitionModal();const input=document.querySelector('#competitionJoinForm [name="code"]');if(input)input.value=inviteCode},250)},500)}
})();
