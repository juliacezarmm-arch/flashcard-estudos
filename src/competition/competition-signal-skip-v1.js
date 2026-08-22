(() => {
  'use strict';
  if (window.FixaCompetitionSignalSkipV1) return;
  window.FixaCompetitionSignalSkipV1 = true;

  const state = { competitions:new Map(), flags:new Map(), syncing:false };

  function client(){
    try{return window.supabaseClient || (typeof supabaseClient!=='undefined'?supabaseClient:null);}catch(_){return null;}
  }
  function appData(){
    try{return typeof data!=='undefined'?data:window.data;}catch(_){return window.data||null;}
  }
  function subjects(){return Array.isArray(appData()?.subjects)?appData().subjects:[];}
  function currentSubjectSafe(){try{return typeof currentSubject==='function'?currentSubject():null;}catch(_){return null;}}
  function questionKey(card){return String(card?.questionCode||card?.id||`${card?.q||''}|${card?.correctAnswerText||card?.a||''}`);}
  function sourceSubjectId(subject){return String(subject?.sharedSourceSubjectId||subject?.id||'');}

  function competitionForSubject(subject){
    if(!subject)return null;
    if(subject.sharedCompetitionId)return state.competitions.get(String(subject.sharedCompetitionId))||null;
    const folderId=String(subject.folder||'');
    return [...state.competitions.values()].find(item=>item?.is_owner&&String(item.folder_id||'')===folderId)||null;
  }
  function flagId(subject,card){return `${sourceSubjectId(subject)}::${questionKey(card)}`;}
  function isFlagged(subject,card){
    const competition=competitionForSubject(subject);
    return Boolean(competition&&state.flags.get(String(competition.id))?.has(flagId(subject,card)));
  }

  function ensureStyle(){
    if(document.getElementById('fixaCompetitionSignalSkipV1Style'))return;
    const style=document.createElement('style');
    style.id='fixaCompetitionSignalSkipV1Style';
    style.textContent=`
      .fixa-signal-skip-button{min-height:30px!important;padding:5px 9px!important;font-size:11px!important;white-space:nowrap}
      .fixa-signal-skip-button:disabled{opacity:.72!important;cursor:wait!important}
      .fixa-signal-skip-toast{position:fixed;z-index:1200;top:18px;left:50%;transform:translateX(-50%);max-width:min(92vw,520px);padding:10px 14px;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;color:#1d4ed8;box-shadow:0 12px 32px rgba(15,23,42,.16);font-size:12px;font-weight:800;text-align:center}
      .fixa-signal-skip-toast.is-error{border-color:#fecaca;background:#fff1f2;color:#b91c1c}
    `;
    document.head.appendChild(style);
  }

  function toast(message,error=false){
    document.querySelector('.fixa-signal-skip-toast')?.remove();
    const item=document.createElement('div');
    item.className=`fixa-signal-skip-toast${error?' is-error':''}`;
    item.setAttribute('role','status');
    item.textContent=message;
    document.body.appendChild(item);
    setTimeout(()=>item.remove(),2200);
  }

  async function refreshFlags(){
    const sb=client();if(!sb?.rpc||state.syncing)return;
    state.syncing=true;
    try{
      const {data:list,error}=await sb.rpc('list_my_competitions',{});
      if(error||!Array.isArray(list))return;
      state.competitions=new Map(list.map(item=>[String(item.id),item]));
      const next=new Map();
      for(const competition of list){
        const {data:items,error:flagError}=await sb.rpc('list_competition_question_flags',{p_competition_id:competition.id});
        if(flagError)continue;
        next.set(String(competition.id),new Map((Array.isArray(items)?items:[]).map(item=>[`${item.subject_source_id}::${item.question_key}`,item])));
      }
      state.flags=next;
      subjects().forEach(subject=>{
        const competition=competitionForSubject(subject);if(!competition)return;
        const map=state.flags.get(String(competition.id))||new Map();
        (subject.cards||[]).forEach(card=>{card.sharedModerationFrozen=map.has(flagId(subject,card));});
      });
      ensureTestableFilter();
      ensureSignalButton();
    }finally{state.syncing=false;}
  }

  function ensureTestableFilter(){
    try{
      if(window.__fixaSignalSkipOriginalTestableCards||typeof testableCards!=='function')return;
      window.__fixaSignalSkipOriginalTestableCards=testableCards;
      window.testableCards=function(){return window.__fixaSignalSkipOriginalTestableCards().filter(card=>!card.sharedModerationFrozen);};
    }catch(_){}
  }

  function currentTestContext(){
    try{
      if(typeof testState==='undefined'||!testState?.active)return null;
      const question=testState.questions?.[testState.index];if(!question)return null;
      const subject=subjects().find(item=>String(item.id)===String(question.subjectId))||currentSubjectSafe();
      const card=Number.isInteger(question.originalIndex)?subject?.cards?.[question.originalIndex]:null;
      const competition=competitionForSubject(subject);
      return subject&&card&&competition?{question,subject,card,competition}:null;
    }catch(_){return null;}
  }

  function advanceAfterSignal(subject,card){
    try{
      if(typeof testState==='undefined'||!testState?.active)return;
      const question=testState.questions?.[testState.index];
      if(!question)return;
      const sameSubject=String(question.subjectId||'')===String(subject?.id||'');
      const sameCard=Number.isInteger(question.originalIndex)&&subject?.cards?.[question.originalIndex]===card;
      if(!sameSubject&&!sameCard)return;

      if(testState.answered&&question.isCorrect){
        testState.score=Math.max(0,Number(testState.score||0)-1);
      }
      question.signaled=true;
      testState.skipped=Number(testState.skipped||0)+1;
      testState.index+=1;
      testState.selected=null;
      testState.answered=false;

      try{if(typeof save==='function')save();}catch(_){}
      try{if(typeof renderProgress==='function')renderProgress(currentSubjectSafe()||{cards:[]});}catch(_){}
      try{if(typeof renderQuestions==='function')renderQuestions(currentSubjectSafe()||{cards:[]});}catch(_){}
      try{if(typeof renderTest==='function')renderTest();}catch(_){}
    }catch(_){}
  }

  async function signalCurrentQuestion(button){
    const context=currentTestContext();if(!context)return;
    const {subject,card,competition}=context;

    if(isFlagged(subject,card)){
      card.sharedModerationFrozen=true;
      toast('Questão já estava sinalizada. Pulando para a próxima.');
      advanceAfterSignal(subject,card);
      return;
    }

    const sb=client();if(!sb?.rpc)return toast('Não foi possível conectar para sinalizar a questão.',true);
    button.disabled=true;
    button.textContent='Sinalizando...';
    const {error}=await sb.rpc('flag_competition_question',{
      p_competition_id:competition.id,
      p_subject_source_id:sourceSubjectId(subject),
      p_question_key:questionKey(card),
      p_question_code:card.questionCode||null
    });
    if(error){
      button.disabled=false;
      button.textContent='Sinalizar questão';
      toast(error.message||'Não foi possível sinalizar a questão.',true);
      return;
    }

    const map=state.flags.get(String(competition.id))||new Map();
    map.set(flagId(subject,card),{reported_by_me:true,local:true});
    state.flags.set(String(competition.id),map);
    card.sharedModerationFrozen=true;
    toast('Questão sinalizada e congelada. Indo para a próxima.');
    advanceAfterSignal(subject,card);
    refreshFlags();
  }

  function ensureSignalButton(){
    const meta=document.querySelector('#testRunningPanel:not([hidden]) .test-running-head .meta');
    if(!meta)return;
    const context=currentTestContext();
    let button=meta.querySelector('[data-fixa-signal-skip]');
    if(!context){button?.remove();return;}
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='secondary fixa-signal-skip-button';
      button.dataset.fixaSignalSkip='1';
      button.textContent='Sinalizar questão';
      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();signalCurrentQuestion(button);});
      meta.appendChild(button);
    }
    if(isFlagged(context.subject,context.card)){
      button.textContent='Sinalizada';
    }else if(!button.disabled){
      button.textContent='Sinalizar questão';
    }
  }

  ensureStyle();
  ensureTestableFilter();
  let queued=false;
  const observer=new MutationObserver(()=>{
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;ensureTestableFilter();ensureSignalButton();});
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('fixa-cloud-data-loaded',()=>refreshFlags());
  window.addEventListener('focus',()=>refreshFlags());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFlags();});
  window.addEventListener('load',()=>setTimeout(refreshFlags,500),{once:true});
  setTimeout(refreshFlags,700);
})();
