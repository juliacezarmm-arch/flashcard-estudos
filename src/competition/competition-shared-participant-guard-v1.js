(() => {
  'use strict';
  if (window.FixaCompetitionSharedParticipantGuardV1) return;
  window.FixaCompetitionSharedParticipantGuardV1 = true;

  const state = { competitions:new Map(), flags:new Map(), syncing:false, lastSync:0 };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function client(){try{return window.supabaseClient || (typeof supabaseClient!=='undefined'?supabaseClient:null);}catch(_){return null;}}
  function appData(){try{return typeof data!=='undefined'?data:window.data;}catch(_){return window.data||null;}}
  function subjects(){return Array.isArray(appData()?.subjects)?appData().subjects:[];}
  function folders(){return Array.isArray(appData()?.folders)?appData().folders:[];}
  function currentSubjectSafe(){try{return typeof currentSubject==='function'?currentSubject():null;}catch(_){return null;}}
  function questionKey(card){return String(card?.questionCode||card?.id||`${card?.q||''}|${card?.correctAnswerText||card?.a||''}`);}
  function sourceSubjectId(subject){return String(subject?.sharedSourceSubjectId||subject?.id||'');}
  function competitionForSubject(subject){
    if(!subject)return null;
    if(subject.sharedCompetitionId)return state.competitions.get(String(subject.sharedCompetitionId))||null;
    const folderId=String(subject.folder||'');
    return [...state.competitions.values()].find(item=>item?.is_owner&&String(item.folder_id||'')===folderId)||null;
  }
  function isParticipantSharedSubject(subject){const c=competitionForSubject(subject);return Boolean(subject?.sharedCompetitionId&&subject?.readOnly&&c&&!c.is_owner);}
  function flagMap(id){return state.flags.get(String(id||''))||new Map();}
  function flagId(subject,card){return `${sourceSubjectId(subject)}::${questionKey(card)}`;}
  function flagFor(subject,card){const c=competitionForSubject(subject);return c?flagMap(c.id).get(flagId(subject,card))||null:null;}

  function applyFlagsInMemory(){
    subjects().forEach(subject=>{
      const c=competitionForSubject(subject);if(!c)return;
      const map=flagMap(c.id);
      (subject.cards||[]).forEach(card=>{card.sharedModerationFrozen=map.has(flagId(subject,card));});
    });
    window.dispatchEvent(new CustomEvent('fixa-shared-question-flags-updated'));
  }

  function showTestSignalFeedback(message,tone='success'){
    const head=document.querySelector('#testRunningPanel:not([hidden]) .test-running-head');
    const meta=head?.querySelector('.meta');
    if(!head||!meta)return false;
    let feedback=head.querySelector('.fixa-shared-signal-feedback');
    if(!feedback){
      feedback=document.createElement('div');
      feedback.className='fixa-shared-signal-feedback';
      feedback.setAttribute('role','status');
      feedback.setAttribute('aria-live','polite');
      meta.insertAdjacentElement('beforebegin',feedback);
    }
    feedback.dataset.tone=tone;
    feedback.textContent=message;
    feedback.hidden=false;
    clearTimeout(showTestSignalFeedback.timer);
    showTestSignalFeedback.timer=setTimeout(()=>{feedback.hidden=true;},3000);
    return true;
  }

  async function refreshFlags(force=false){
    const sb=client();if(!sb?.rpc||state.syncing)return;
    if(!force&&Date.now()-state.lastSync<15000)return;
    state.syncing=true;
    try{
      const {data:list,error}=await sb.rpc('list_my_competitions',{});
      if(error||!Array.isArray(list))return;
      state.competitions=new Map(list.map(item=>[String(item.id),item]));
      const next=new Map();
      for(const competition of list){
        const {data:items,error:flagError}=await sb.rpc('list_competition_question_flags',{p_competition_id:competition.id});
        if(flagError)continue;
        const map=new Map();
        (Array.isArray(items)?items:[]).forEach(item=>map.set(`${item.subject_source_id}::${item.question_key}`,item));
        next.set(String(competition.id),map);
      }
      state.flags=next;state.lastSync=Date.now();applyFlagsInMemory();applyUi();
    }finally{state.syncing=false;}
  }

  async function signalQuestion(subject,card){
    const sb=client(),competition=competitionForSubject(subject);if(!sb?.rpc||!competition||!subject||!card)return;
    const existing=flagFor(subject,card);
    if(existing){
      const message=existing.reported_by_me?'Você já sinalizou esta questão.':'Esta questão já está sinalizada para o dono da pasta.';
      if(!showTestSignalFeedback(message,'info'))alert(message);
      return;
    }
    const {error}=await sb.rpc('flag_competition_question',{
      p_competition_id:competition.id,
      p_subject_source_id:sourceSubjectId(subject),
      p_question_key:questionKey(card),
      p_question_code:card.questionCode||null
    });
    if(error){
      const message=error.message||'Não foi possível sinalizar a questão.';
      if(!showTestSignalFeedback(message,'error'))alert(message);
      return;
    }

    const localMap=flagMap(competition.id);
    localMap.set(flagId(subject,card),{reported_by_me:true,local:true});
    state.flags.set(String(competition.id),localMap);
    card.sharedModerationFrozen=true;
    applyUi();
    showTestSignalFeedback('Você sinalizou esta questão.','success');
    await refreshFlags(true);
  }

  async function resolveQuestion(competitionId,subjectSourceId,key){
    const sb=client();if(!sb?.rpc)return;
    const {error}=await sb.rpc('resolve_competition_question_flag',{p_competition_id:competitionId,p_subject_source_id:subjectSourceId,p_question_key:key});
    if(error)return alert(error.message||'Não foi possível liberar a questão.');
    await refreshFlags(true);document.querySelector('.fixa-shared-flags-modal')?.remove();await openOwnerFlagsModal(competitionId);
  }

  function ensureStyle(){
    if(document.querySelector('#fixaSharedParticipantGuardV1Style'))return;
    const style=document.createElement('style');style.id='fixaSharedParticipantGuardV1Style';style.textContent=`
      .folder-block.fixa-shared-readonly .folder-options,.folder-block.fixa-shared-readonly .subject-options{display:none!important}
      body.fixa-shared-readonly-selected #manage .quick-delete,body.fixa-shared-readonly-selected #manage [data-edit],body.fixa-shared-readonly-selected #manage [data-move],body.fixa-shared-readonly-selected #manage [data-delete]{display:none!important}
      body.fixa-shared-readonly-selected #manage .card-menu-panel [data-freeze]{display:flex!important}
      .fixa-shared-signal-button{min-height:30px!important;padding:5px 9px!important;font-size:11px!important;white-space:nowrap}
      .fixa-shared-signal-button:disabled{opacity:1!important;border-color:#bbf7d0!important;background:#f0fdf4!important;color:#166534!important;cursor:default!important}
      .fixa-shared-signal-feedback{min-height:30px;border:1px solid #bbf7d0;border-radius:9px;padding:6px 10px;display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;color:#166534;font-size:11px;font-weight:800;line-height:1.25;white-space:nowrap;box-shadow:none}
      .fixa-shared-signal-feedback::before{content:'✓';width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:#dcfce7;color:#15803d;font-size:10px;font-weight:900}
      .fixa-shared-signal-feedback[data-tone="info"]{border-color:#bfdbfe;background:#eff6ff;color:#1d4ed8}
      .fixa-shared-signal-feedback[data-tone="info"]::before{content:'i';background:#dbeafe;color:#1d4ed8}
      .fixa-shared-signal-feedback[data-tone="error"]{border-color:#fecaca;background:#fff1f2;color:#b91c1c}
      .fixa-shared-signal-feedback[data-tone="error"]::before{content:'!';background:#fee2e2;color:#b91c1c}
      .fixa-shared-signal-feedback[hidden]{display:none!important}
      .fixa-shared-flag-summary{width:100%;margin-top:9px;border:1px solid #fed7aa!important;border-radius:9px!important;padding:8px 10px!important;display:flex!important;align-items:center!important;gap:7px!important;justify-content:flex-start!important;background:#fff7ed!important;color:#c2410c!important;font-size:11px!important;font-weight:800!important;box-shadow:none!important}
      .fixa-shared-flags-body{padding:16px 20px 20px;display:grid;gap:9px;max-height:62vh;overflow:auto}
      .fixa-shared-flag-row{border:1px solid #e1e8f2;border-radius:11px;padding:12px 13px;display:grid;gap:7px;background:#fff}
      .fixa-shared-flag-row strong{font-size:13px;color:#172033}.fixa-shared-flag-row p{margin:0;color:#64748b;font-size:11px;line-height:1.45}
      .fixa-shared-flag-actions{display:flex;justify-content:flex-end;margin-top:2px}.fixa-shared-flag-row button{min-height:34px;padding:7px 11px;font-size:11px;font-weight:800}
      @media(max-width:760px){.fixa-shared-signal-feedback{order:3;width:100%;justify-content:center;white-space:normal}.test-running-head .meta{width:100%}}
    `;document.head.appendChild(style);
  }

  function annotateSidebar(){
    const d=appData();if(!d)return;
    document.querySelectorAll('.folder-block[data-folder-id]').forEach(block=>{
      const folder=folders().find(item=>String(item.id)===String(block.dataset.folderId));
      block.classList.toggle('fixa-shared-readonly',Boolean(folder?.sharedCompetitionId&&folder?.readOnly));
    });
    const selected=currentSubjectSafe();document.body.classList.toggle('fixa-shared-readonly-selected',isParticipantSharedSubject(selected));
    if(isParticipantSharedSubject(selected)){
      document.querySelectorAll('#manage [data-freeze]').forEach(button=>{
        const index=Number(button.dataset.freeze),card=selected.cards?.[index];if(!card)return;
        const flagged=Boolean(flagFor(selected,card));button.textContent=flagged?'Questão sinalizada':'Sinalizar questão';button.disabled=flagged;
      });
    }
  }

  function currentTestContext(){
    try{
      if(typeof testState==='undefined'||!testState?.active)return null;
      const question=testState.questions?.[testState.index];if(!question)return null;
      const subject=subjects().find(item=>String(item.id)===String(question.subjectId))||currentSubjectSafe();
      const card=Number.isInteger(question.originalIndex)?subject?.cards?.[question.originalIndex]:null;
      const competition=competitionForSubject(subject);return subject&&card&&competition?{subject,card,competition}:null;
    }catch(_){return null;}
  }

  function ensureTestSignalButton(){
    const meta=document.querySelector('#testRunningPanel .test-running-head .meta');if(!meta)return;
    let button=meta.querySelector('[data-shared-question-signal]');const context=currentTestContext();
    if(!context){button?.remove();meta.parentElement?.querySelector('.fixa-shared-signal-feedback')?.remove();return;}
    if(!button){
      button=document.createElement('button');button.type='button';button.className='secondary fixa-shared-signal-button';button.dataset.sharedQuestionSignal='1';meta.appendChild(button);
      button.addEventListener('click',async event=>{event.preventDefault();event.stopPropagation();const fresh=currentTestContext();if(fresh)await signalQuestion(fresh.subject,fresh.card);});
    }
    const flagged=flagFor(context.subject,context.card);button.textContent=flagged?'Sinalizada':'Sinalizar questão';button.disabled=Boolean(flagged);button.classList.toggle('is-flagged',Boolean(flagged));
  }

  function temporarilyFreezeModeratedCards(){
    const restored=[];
    subjects().forEach(subject=>(subject.cards||[]).forEach(card=>{if(!card.sharedModerationFrozen||card.status==='frozen')return;restored.push([card,card.status]);card.status='frozen';}));
    setTimeout(()=>restored.forEach(([card,status])=>{card.status=status;}),0);
  }

  function selectedCompetition(){const id=document.querySelector('.competition-v3.active #cv3select')?.value||localStorage.getItem('fixa-selected-competition')||'';return state.competitions.get(String(id))||null;}
  function sharedFolderCard(){return document.querySelector('.competition-v3.active .cv3-area-folder');}

  function renderOwnerFlagSummary(){
    const card=sharedFolderCard(),competition=selectedCompetition();
    if(!card||!competition?.is_owner){card?.querySelector('.fixa-shared-flag-summary')?.remove();return;}
    const items=[...flagMap(competition.id).values()];let button=card.querySelector('.fixa-shared-flag-summary');
    if(!items.length){button?.remove();return;}
    if(!button){button=document.createElement('button');button.type='button';button.className='fixa-shared-flag-summary';const action=card.querySelector('.cv3-folder-action');if(action)card.insertBefore(button,action);else card.appendChild(button);button.addEventListener('click',()=>openOwnerFlagsModal(competition.id));}
    button.textContent=`⚠ ${items.length} ${items.length===1?'questão sinalizada por participante':'questões sinalizadas por participantes'}`;
  }

  async function openOwnerFlagsModal(competitionId){
    const competition=state.competitions.get(String(competitionId));if(!competition?.is_owner)return;
    const sb=client();if(!sb?.rpc)return;await refreshFlags(true);
    const items=[...flagMap(competitionId).values()];const {data:folder}=await sb.rpc('get_competition_folder',{p_competition_id:competitionId});
    const subjectMap=new Map((folder?.content?.subjects||[]).map(subject=>[String(subject.id),subject]));
    document.querySelector('.fixa-shared-flags-modal')?.remove();const bg=document.createElement('div');bg.className='cv3-modal-bg fixa-shared-flags-modal';
    const rows=items.length?items.map(item=>{
      const subject=subjectMap.get(String(item.subject_source_id));const card=(subject?.cards||[]).find(candidate=>questionKey(candidate)===item.question_key);
      const reporters=(item.reporters||[]).map(person=>person.name).filter(Boolean).join(', ');
      return `<article class="fixa-shared-flag-row"><strong>${esc(item.question_code||card?.questionCode||'Questão')} · ${esc(subject?.name||'Coleção')}</strong><p>${esc(String(card?.q||'').slice(0,220)||'Questão sinalizada para revisão.')}</p><p>Sinalizada por ${esc(reporters||`${item.reporter_count||1} participante(s)`)}</p><div class="fixa-shared-flag-actions"><button type="button" data-resolve-shared-flag="${esc(item.subject_source_id)}" data-question-key="${esc(item.question_key)}">Descongelar / liberar</button></div></article>`;
    }).join(''):'<div class="cv3-empty"><p class="cv3-muted">Não há questões sinalizadas.</p></div>';
    bg.innerHTML=`<div class="cv3-modal wide" role="dialog" aria-modal="true"><div class="cv3-modal-head"><div class="cv3-modal-title"><div><h3>Questões sinalizadas</h3><p>Confira e corrija antes de liberar novamente.</p></div></div><button class="cv3-close" type="button" data-close-shared-flags aria-label="Fechar">×</button></div><div class="fixa-shared-flags-body">${rows}</div></div>`;
    document.body.appendChild(bg);bg.querySelector('[data-close-shared-flags]')?.addEventListener('click',()=>bg.remove());bg.addEventListener('click',event=>{if(event.target===bg)bg.remove();});
    bg.querySelectorAll('[data-resolve-shared-flag]').forEach(button=>button.addEventListener('click',async()=>resolveQuestion(competitionId,button.dataset.resolveSharedFlag,button.dataset.questionKey)));
  }

  function patchCollectionTestFilter(){
    try{
      if(window.__fixaSharedOriginalTestableCards||typeof testableCards!=='function')return;
      window.__fixaSharedOriginalTestableCards=testableCards;
      window.testableCards=function(){return window.__fixaSharedOriginalTestableCards().filter(card=>!card.sharedModerationFrozen);};
    }catch(_){}
  }

  function applyUi(){ensureStyle();annotateSidebar();ensureTestSignalButton();renderOwnerFlagSummary();patchCollectionTestFilter();}

  document.addEventListener('click',event=>{
    const selected=currentSubjectSafe(),readOnly=isParticipantSharedSubject(selected);
    const forbidden=event.target.closest('#manage [data-edit], #manage [data-move], #manage [data-delete], #manage .quick-delete');
    if(readOnly&&forbidden){event.preventDefault();event.stopImmediatePropagation();alert('A pasta compartilhada é somente para estudo. Participantes não podem editar ou excluir questões.');return;}
    const freeze=event.target.closest('#manage [data-freeze]');
    if(readOnly&&freeze){event.preventDefault();event.stopImmediatePropagation();const card=selected?.cards?.[Number(freeze.dataset.freeze)];if(card)signalQuestion(selected,card);return;}
    const folderMenu=event.target.closest('[data-folder-menu]');if(folderMenu){const folder=folders().find(item=>String(item.id)===String(folderMenu.dataset.folderMenu));if(folder?.sharedCompetitionId&&folder?.readOnly){event.preventDefault();event.stopImmediatePropagation();return;}}
    const subjectMenu=event.target.closest('[data-subject-menu]');if(subjectMenu){const subject=subjects().find(item=>String(item.id)===String(subjectMenu.dataset.subjectMenu));if(isParticipantSharedSubject(subject)){event.preventDefault();event.stopImmediatePropagation();return;}}
    if(event.target.closest('#startTest, .test-folder-start'))temporarilyFreezeModeratedCards();
    if(event.target.closest('[data-competition-view], .competition-v3 button, .subject, .folder-title, #test button'))setTimeout(applyUi,60);
  },true);

  let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyUi();});});observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('fixa-cloud-data-loaded',()=>refreshFlags(true));window.addEventListener('fixa-competition-detail-rendered',()=>refreshFlags(true));window.addEventListener('focus',()=>refreshFlags(false));document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFlags(false);});window.addEventListener('load',()=>setTimeout(()=>refreshFlags(true),900),{once:true});
  ensureStyle();patchCollectionTestFilter();setTimeout(()=>refreshFlags(true),1200);
})();
