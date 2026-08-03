(() => {
  const STYLE_ID = 'fixaProgressObjectivesSummaryFix';
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
      if(label)label.textContent=labels[index];
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
    if(title)title.textContent='Objetivo da semana';
    if(value)value.textContent=`${percent}%`;
    if(caption)caption.textContent=`${completed} de ${goals.length} objetivos concluídos`;
    if(fill)fill.style.width=`${percent}%`;
  }

  function updateSummary(){
    const box=document.querySelector('#homePeriodSummary');
    if(!box)return;
    const items=[...box.querySelectorAll('.home-period-item')];
    if(items[1]){
      const label=items[1].querySelector('.home-period-copy span');
      if(label)label.textContent='questões respondidas';
    }
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
