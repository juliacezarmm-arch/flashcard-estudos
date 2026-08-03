(() => {
  const STYLE_ID = 'fixaProgressObjectivesSummaryFix';
  const STORE_KEY = 'flashcard-estudos-v2';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      [data-home-panel="progress"] .home-progress-bottom-row{height:204px!important;min-height:204px!important;align-items:stretch!important;overflow:visible!important}
      [data-home-panel="progress"] .home-progress-bottom-row>.home-panel{height:100%!important;padding:12px 14px!important;overflow:visible!important;border-radius:14px!important}
      [data-home-panel="progress"] .home-progress-bottom-row .home-panel-head{height:24px!important;min-height:24px!important;margin:0 0 8px!important}
      [data-home-panel="progress"] .home-progress-bottom-row .home-panel-head h3{margin:0!important;font-size:14px!important;line-height:19px!important;gap:8px!important}
      [data-home-panel="progress"] .home-goal-list{display:flex!important;flex-direction:column!important;gap:6px!important;margin:0!important;padding:0!important}
      [data-home-panel="progress"] .home-goal-item{height:46px!important;min-height:46px!important;padding:6px 10px!important;display:grid!important;grid-template-rows:24px 5px!important;gap:4px!important;border-radius:9px!important}
      [data-home-panel="progress"] .home-goal-head{height:24px!important;display:grid!important;grid-template-columns:24px minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important}
      [data-home-panel="progress"] .home-goal-copy{display:contents!important}
      [data-home-panel="progress"] .home-goal-icon{width:24px!important;height:24px!important;border-radius:7px!important}
      [data-home-panel="progress"] .home-goal-icon .home-svg{width:15px!important;height:15px!important}
      [data-home-panel="progress"] .home-goal-head span{font-size:11px!important;line-height:15px!important;font-weight:600!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      [data-home-panel="progress"] .home-goal-head b{font-size:10px!important;line-height:14px!important;min-width:36px!important;text-align:right!important;white-space:nowrap!important}
      [data-home-panel="progress"] .home-goal-item>.home-progress{width:calc(100% - 32px)!important;height:5px!important;margin:0 0 0 32px!important;background:#e7edf4!important}
      [data-home-panel="progress"] .home-period-list{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,65px)!important;gap:8px!important}
      [data-home-panel="progress"] .home-period-item{height:65px!important;min-height:65px!important;padding:8px 11px!important;display:grid!important;grid-template-columns:24px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;border-radius:10px!important;background:linear-gradient(135deg,rgba(238,244,255,.9),rgba(248,250,255,.96))!important}
      [data-home-panel="progress"] .home-period-icon{width:24px!important;height:24px!important;border-radius:7px!important}
      [data-home-panel="progress"] .home-period-icon .home-svg{width:15px!important;height:15px!important}
      [data-home-panel="progress"] .home-period-copy b{font-size:20px!important;line-height:22px!important}
      [data-home-panel="progress"] .home-period-copy span{font-size:9px!important;line-height:12px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      @media(max-width:760px){[data-home-panel="progress"] .home-progress-bottom-row,[data-home-panel="progress"] .home-progress-bottom-row>.home-panel{height:auto!important;min-height:0!important}}
    `;
    document.head.appendChild(style);
  }

  function parseGoal(item){
    const node=item.querySelector('.home-goal-head b,.home-goal-copy b,b');
    const m=String(node?.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
    if(!m)return null;
    const current=Number(m[1]);
    const target=Number(m[2]);
    if(!Number.isFinite(current)||!Number.isFinite(target)||target<=0)return null;
    return {current,target,ratio:Math.min(1,Math.max(0,current/target))};
  }

  function updateObjectives(){
    const list=document.querySelector('#homeGoals');
    if(!list)return;
    const items=[...list.querySelectorAll('.home-goal-item')].slice(0,3);
    if(!items.length)return;
    const labels=['Revisar questões nesta semana','Fazer testes nesta semana','Dominar questões nesta semana'];
    items.forEach((item,index)=>{
      const label=item.querySelector('.home-goal-head span,.home-goal-copy span');
      if(label&&label.textContent!==labels[index])label.textContent=labels[index];
      const goal=parseGoal(item);
      const fill=item.querySelector('.home-progress span');
      if(fill&&goal)fill.style.width=`${Math.round(goal.ratio*100)}%`;
    });
    const goals=items.map(parseGoal).filter(Boolean);
    if(!goals.length)return;
    const completed=goals.filter(goal=>goal.current>=goal.target).length;
    const percent=Math.round(goals.reduce((sum,goal)=>sum+goal.ratio,0)/goals.length*100);
    const weekly=document.querySelectorAll('#homeFooterStats .home-progress-card')[2];
    if(!weekly)return;
    const title=weekly.querySelector('h3');
    const value=weekly.querySelector('.home-progress-value strong');
    const caption=weekly.querySelector(':scope>p');
    const fill=weekly.querySelector(':scope>.home-progress span');
    if(title&&title.textContent!=='Objetivo da semana')title.textContent='Objetivo da semana';
    if(value&&value.textContent!==`${percent}%`)value.textContent=`${percent}%`;
    const captionText=`${completed} de ${goals.length} objetivos concluídos`;
    if(caption&&caption.textContent!==captionText)caption.textContent=captionText;
    if(fill)fill.style.width=`${percent}%`;
  }

  function readData(){
    try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{};}catch{return {};}
  }

  function dateOf(value){
    if(!value)return null;
    const date=new Date(value);
    return Number.isNaN(date.getTime())?null:date;
  }

  function range7(){
    const end=new Date();
    end.setHours(23,59,59,999);
    const start=new Date(end);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate()-6);
    return {start,end};
  }

  function inside(value,range){
    const date=dateOf(value);
    return Boolean(date&&date>=range.start&&date<=range.end);
  }

  function summaryValues(){
    const data=readData();
    const range=range7();
    const testsRaw=Array.isArray(data.testHistory)?data.testHistory:[];
    const testIds=new Set();
    const tests=[];
    testsRaw.forEach((test,index)=>{
      if(!test||test.cancelled||test.canceled||test.interrupted||test.inProgress||Number(test.total||0)<=0)return;
      if(!inside(test.completedAt||test.finishedAt||test.date,range))return;
      const id=String(test.id||`${test.subjectId||test.subject||'test'}-${test.completedAt||test.finishedAt||test.date||index}`);
      if(testIds.has(id))return;
      testIds.add(id);
      tests.push(test);
    });

    const attempts=[];
    const attemptIds=new Set();
    const subjects=Array.isArray(data.subjects)?data.subjects:[];
    subjects.forEach((subject,subjectIndex)=>{
      const cards=Array.isArray(subject.cards)?subject.cards:[];
      cards.forEach((card,cardIndex)=>{
        const history=Array.isArray(card.attemptHistory)?card.attemptHistory:[];
        history.forEach((attempt,attemptIndex)=>{
          if(attempt?.correct!==true&&attempt?.correct!==false)return;
          const timestamp=attempt.created_at||attempt.createdAt||attempt.answeredAt||attempt.date;
          if(!inside(timestamp,range))return;
          const questionId=String(card.id||card.questionCode||card.code||`${subject.id||subjectIndex}-${cardIndex}`);
          const id=String(attempt.id||`${questionId}-${attempt.testId||attempt.test_id||attempt.sessionId||''}-${timestamp||attemptIndex}`);
          if(attemptIds.has(id))return;
          attemptIds.add(id);
          attempts.push({...attempt,questionId});
        });
      });
    });

    const questions=attempts.length||tests.reduce((sum,test)=>sum+Math.max(0,Number(test.total||0)),0);
    const mastered=new Set(attempts.filter(attempt=>{
      const before=String(attempt.statusBefore||attempt.status_before||'').toLowerCase();
      const after=String(attempt.statusAfter||attempt.status_after||'').toLowerCase();
      return (after.includes('master')||after.includes('dominat'))&&!(before.includes('master')||before.includes('dominat'));
    }).map(attempt=>attempt.questionId)).size;

    const sessions=[data.reviewSessions,data.studySessions,data.sessions,data.study_sessions].find(Array.isArray)||[];
    const reviewIds=new Set();
    sessions.forEach((session,index)=>{
      if(!session||session.status==='cancelled'||session.status==='abandoned')return;
      const finished=session.completed_at||session.completedAt||session.finished_at||session.finishedAt||session.date;
      const completed=session.status==='completed'||session.completed===true||Boolean(finished);
      if(!completed||!inside(finished,range))return;
      const valid=Number(session.valid_answer_count??session.validAnswerCount??session.total??0);
      if(valid<=0)return;
      reviewIds.add(String(session.id||`${session.started_at||session.startedAt||index}-${finished}`));
    });
    if(!reviewIds.size){
      tests.filter(test=>String(test.mode||test.type||'').toLowerCase().includes('review')).forEach(test=>reviewIds.add(String(test.id)));
    }

    return {tests:tests.length,questions,mastered,reviews:reviewIds.size};
  }

  function format(value){return new Intl.NumberFormat('pt-BR').format(Math.max(0,Number(value||0)));}

  function updateSummary(){
    const box=document.querySelector('#homePeriodSummary');
    if(!box)return;
    const values=summaryValues();
    const numbers=[values.tests,values.questions,values.mastered,values.reviews];
    const labels=['testes realizados','questões respondidas','questões dominadas','revisões concluídas'];
    const items=[...box.querySelectorAll('.home-period-item')];
    items.slice(0,4).forEach((item,index)=>{
      const value=item.querySelector('.home-period-copy b');
      const label=item.querySelector('.home-period-copy span');
      const nextValue=format(numbers[index]);
      if(value&&value.textContent!==nextValue)value.textContent=nextValue;
      if(label&&label.textContent!==labels[index])label.textContent=labels[index];
      item.setAttribute('aria-label',`${nextValue} ${labels[index]} nos últimos sete dias`);
    });
    const panel=box.closest('.home-panel');
    const heading=panel?.querySelector('.home-panel-head h3');
    if(heading&&!heading.querySelector('.home-progress-title-icon')){
      heading.insertAdjacentHTML('afterbegin','<span class="home-progress-title-icon" aria-hidden="true"><svg class="home-svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 9h16"></path></g></svg></span>');
    }
  }

  let queued=false;
  function apply(){queued=false;updateObjectives();updateSummary();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
  schedule();
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  window.addEventListener('load',schedule,{once:true});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
