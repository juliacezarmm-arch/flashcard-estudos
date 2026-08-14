(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV1) return;
  window.FixaHomeGoalsStreakProtectionV1 = true;

  const STYLE_ID = 'fixaHomeGoalsStreakProtectionV1Style';
  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const GOAL_REWARDS = { questions: 20, tests: 25, mastered: 40 };
  const state = {
    protection: { available: 0, maximum: 3, protected_days: [] },
    weekXp: 0,
    syncing: false
  };

  const getClient = () => {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== 'undefined') return supabaseClient;
    } catch (_) {}
    return null;
  };

  const getData = () => {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  };

  const allSubjects = () => Array.isArray(getData()?.subjects) ? getData().subjects : [];
  const history = () => Array.isArray(getData()?.testHistory) ? getData().testHistory : [];
  const cardsFor = subject => Array.isArray(subject?.cards) ? subject.cards : [];
  const attemptsOf = card => Array.isArray(card?.attemptHistory) ? card.attemptHistory : [];

  function dateOf(value) {
    const d = new Date(value || 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  function testDate(test) { return dateOf(test?.completedAt || test?.finishedAt || test?.date); }
  function attemptDate(attempt) { return dateOf(attempt?.date || attempt?.created_at || attempt?.createdAt || attempt?.answeredAt); }
  function attemptCorrect(attempt) {
    if (typeof attempt?.correct === 'boolean') return attempt.correct;
    return ['true','1','sim','yes'].includes(String(attempt?.correct ?? '').toLowerCase());
  }
  function startOfDay(base = new Date()) { const d = new Date(base); d.setHours(0,0,0,0); return d; }
  function startOfWeek(base = new Date()) { const d = startOfDay(base); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return d; }
  function localDateKey(date) {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function currentRange() {
    const period = document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
    const now = new Date();
    if (period === 'today') { const start = startOfDay(now), end = new Date(start); end.setHours(23,59,59,999); return {period,start,end}; }
    if (period === 'month') return { period, start:new Date(now.getFullYear(),now.getMonth(),1), end:new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999) };
    const start = startOfWeek(now), end = new Date(start); end.setDate(end.getDate()+6); end.setHours(23,59,59,999); return {period,start,end};
  }
  const inRange = (d, range=currentRange()) => Boolean(d && d >= range.start && d <= range.end);

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .topbar .tab,[data-view="home"].tab,[data-view="questions"].tab,[data-view="test"].tab,[data-view="competition"].tab,[data-competition-view].tab{height:38px!important;min-height:38px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}
      .fixa-streak-freeze-box{height:38px;border:1px solid #c8dcff;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:#1d4ed8;background:#edf5ff;font-size:11px;font-weight:850;box-shadow:none;white-space:nowrap;box-sizing:border-box}
      .fixa-streak-freeze-box img{width:18px;height:24px;object-fit:contain;display:block}
      .fixa-streak-freeze-box:hover{background:#e7f1ff;border-color:#b8d1ff}
      #homeSummaryCards.fixa-home-summary-with-week-xp{grid-template-columns:repeat(6,minmax(0,1fr))!important}
      .fixa-week-xp-card .home-card-number{color:#7c3aed!important}
      .fixa-performance-expanded{height:auto!important;min-height:0!important;overflow:visible!important}
      .fixa-performance-expanded .fixa-week-main-stage{height:auto!important;min-height:365px!important}
      #homePerformance.fixa-performance-extra{display:grid!important;gap:5px!important}
      .fixa-performance-extra-row{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 9px;border:1px solid #e4eaf3;border-radius:8px;background:#fff}
      .fixa-performance-extra-row span{display:flex;align-items:center;gap:7px;min-width:0;color:#53617a;font-size:8px}.fixa-performance-extra-row strong{font-size:9.5px;color:#172033;white-space:nowrap}.fixa-performance-extra-row strong.good{color:#15803d}.fixa-performance-extra-row strong.bad{color:#c2413b}
      .fixa-performance-extra-dot{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#eef4ff;color:#2563eb;font-size:11px;flex:0 0 22px}
      .fixa-goal-reward{margin-left:auto;padding:3px 6px;border-radius:999px;color:#7c3aed;background:#f3e8ff;font-size:7px;font-weight:850;white-space:nowrap}
      #homeGoalsPanel button,#homeGoals+button{ }
      @media(max-width:1080px){#homeSummaryCards.fixa-home-summary-with-week-xp{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      @media(max-width:760px){#homeSummaryCards.fixa-home-summary-with-week-xp{grid-template-columns:1fr!important}.fixa-streak-freeze-box{padding:0 8px}}
    `;
    document.head.appendChild(style);
  }

  async function rpc(name,args={}) {
    const client = getClient();
    if (!client) return { data:null, error:new Error('Supabase indisponível') };
    return client.rpc(name,args);
  }

  async function loadWeekXp() {
    const client = getClient();
    if (!client?.from) return;
    try {
      const start = startOfWeek(new Date());
      const end = new Date(start); end.setDate(end.getDate()+6);
      const { data: rows, error } = await client
        .from('user_xp_events')
        .select('points,occurred_on')
        .gte('occurred_on', localDateKey(start))
        .lte('occurred_on', localDateKey(end));
      if (!error && Array.isArray(rows)) state.weekXp = rows.reduce((sum,row)=>sum+Math.max(0,Number(row?.points||0)),0);
    } catch (_) {}
    renderWeekXpCard();
  }

  async function syncProtection() {
    if (state.syncing || !getClient()) return;
    state.syncing = true;
    try {
      const { data: result } = await rpc('sync_streak_protection', {});
      if (result) state.protection = result;
    } catch (_) {
    } finally {
      state.syncing = false;
      renderProtectionBox();
      patchSequenceWithProtectedDays();
    }
  }

  function findTopbarStreakBox() {
    const right = document.querySelector('.topbar-right');
    if (!right) return null;
    return Array.from(right.querySelectorAll('button,div,span')).find(el => {
      if (el.classList.contains('fixa-streak-freeze-box')) return false;
      const text=(el.textContent||'').trim();
      return /^\s*[^\d]*\d+\s+dias?\s*$/i.test(text) || /^\s*\d+\s+dias?\s*$/i.test(text);
    }) || right.querySelector('[class*=streak], [class*=sequence]');
  }

  function matchFreezeToStreak(box, streakBox) {
    if (!box || !streakBox) return;
    const rect = streakBox.getBoundingClientRect();
    const css = getComputedStyle(streakBox);
    if (rect.width > 0) {
      box.style.width = `${Math.round(rect.width)}px`;
      box.style.minWidth = `${Math.round(rect.width)}px`;
    }
    if (rect.height > 0) box.style.height = `${Math.round(rect.height)}px`;
    box.style.borderRadius = css.borderRadius;
    box.style.padding = css.padding;
    box.style.fontSize = css.fontSize;
    box.style.fontWeight = css.fontWeight;
  }

  function renderProtectionBox() {
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    const streakBox = findTopbarStreakBox();
    let box = right.querySelector('.fixa-streak-freeze-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'fixa-streak-freeze-box';
      box.title = 'Proteção de sequência';
      if (streakBox?.parentElement) streakBox.parentElement.insertBefore(box, streakBox);
      else right.prepend(box);
    }
    box.innerHTML = `<img src="${FROZEN_FIRE_SRC}" alt=""><span>${Math.max(0,Number(state.protection?.available||0))}</span>`;
    requestAnimationFrame(()=>matchFreezeToStreak(box,findTopbarStreakBox()));
  }

  function selectedSubjects() {
    const folderId = document.querySelector('#fixaWeekFolderFilter')?.value || 'all';
    return folderId === 'all' ? allSubjects() : allSubjects().filter(s => String(s.folder||'') === String(folderId));
  }

  function selectedTests(range=currentRange()) {
    const subjects = selectedSubjects();
    const ids = new Set(subjects.map(s=>String(s.id)));
    const names = new Set(subjects.map(s=>s.name));
    return history().filter(test => {
      if (test?.cancelled || test?.canceled || test?.interrupted || Number(test?.total||0)<=0) return false;
      const d=testDate(test); if(!inRange(d,range)) return false;
      if (subjects.length === allSubjects().length) return true;
      if (ids.has(String(test?.subjectId||''))) return true;
      if (Array.isArray(test?.subjectIds) && test.subjectIds.map(String).some(id=>ids.has(id))) return true;
      return names.has(test?.subject);
    });
  }

  function performanceStats() {
    const range=currentRange(), tests=selectedTests(range);
    const total=tests.reduce((s,t)=>s+Number(t.total||0),0), score=tests.reduce((s,t)=>s+Number(t.score||0),0);
    const accuracy=total?Math.round(score/total*100):0;
    const studyDays=new Set(tests.map(t=>{const d=testDate(t);return d?`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`:''}).filter(Boolean));

    const prevStart=new Date(range.start), prevEnd=new Date(range.end), span=range.end.getTime()-range.start.getTime()+1;
    prevStart.setTime(range.start.getTime()-span); prevEnd.setTime(range.start.getTime()-1);
    const prevTests=history().filter(t=>{const d=testDate(t);return d&&d>=prevStart&&d<=prevEnd&&Number(t.total||0)>0;});
    const prevTotal=prevTests.reduce((s,t)=>s+Number(t.total||0),0), prevScore=prevTests.reduce((s,t)=>s+Number(t.score||0),0), prevAccuracy=prevTotal?Math.round(prevScore/prevTotal*100):0;
    const evolution=prevTotal?accuracy-prevAccuracy:0;
    return {accuracy,total,studyDays:studyDays.size,evolution};
  }

  function renderPerformanceExtras() {
    const list=document.querySelector('#homePerformance'); if(!list)return;
    const stats=performanceStats(), range=currentRange();
    list.classList.add('fixa-performance-extra');
    if(list.querySelector('[data-fixa-extra="accuracy"]')) return;
    const maxDays = range.period==='today'?1:range.period==='month'?new Date(range.end).getDate():7;
    const rows=[
      ['accuracy','◎','Média de acertos',stats.total?`${stats.accuracy}%`:'Sem dados',''],
      ['evolution','↗','Evolução em relação ao período anterior',stats.total?(stats.evolution>0?`+${stats.evolution}%`:`${stats.evolution}%`):'Sem dados',stats.evolution>0?'good':stats.evolution<0?'bad':''],
      ['answered','▣','Questões respondidas',String(stats.total),''],
      ['days','▦','Dias estudados',`${stats.studyDays} de ${maxDays}`,'']
    ];
    const frag=document.createDocumentFragment();
    rows.forEach(([key,ico,label,value,tone])=>{const row=document.createElement('div');row.className='fixa-performance-extra-row';row.dataset.fixaExtra=key;row.innerHTML=`<span><i class="fixa-performance-extra-dot">${ico}</i>${label}</span><strong class="${tone}">${value}</strong>`;frag.appendChild(row);});
    list.prepend(frag);
  }

  function patchGoalCards() {
    const goals=document.querySelector('#homeGoals'); if(!goals)return;
    const cards=Array.from(goals.children);
    const rewards=[GOAL_REWARDS.questions,GOAL_REWARDS.tests,GOAL_REWARDS.mastered];
    cards.forEach((card,index)=>{
      if(card.querySelector('.fixa-goal-reward'))return;
      const head=card.querySelector('.fixa-week-goal-head') || card.firstElementChild;
      if(!head)return;
      const badge=document.createElement('b'); badge.className='fixa-goal-reward'; badge.textContent=`+${rewards[index]||20} XP`; head.appendChild(badge);
    });
  }

  function removeAddObjectiveButton() {
    const goals=document.querySelector('#homeGoals');
    const panel=goals?.closest('.home-panel') || goals?.parentElement;
    if(!panel)return;
    panel.querySelectorAll('button').forEach(button=>{
      if(/adicionar\s+objetivo/i.test(button.textContent||'')) button.remove();
    });
  }

  function goalValues() {
    const cards=Array.from(document.querySelectorAll('#homeGoals .fixa-week-goal'));
    return cards.map((card,index)=>{
      const small=card.querySelector('small')?.textContent||'';
      const match=small.match(/(\d+)\s*\/\s*(\d+)/);
      return {index,current:Number(match?.[1]||0),target:Number(match?.[2]||0),reward:[20,25,40][index]||20};
    });
  }

  async function awardCompletedGoals() {
    const uid = (()=>{try{return window.currentUser?.id || (typeof currentUser!=='undefined'?currentUser?.id:null);}catch(_){return null;}})();
    if(!uid || !getClient())return;
    const range=currentRange();
    const keyBase=`${range.period}:${range.start.toISOString().slice(0,10)}`;
    for(const goal of goalValues()){
      if(!goal.target || goal.current<goal.target)continue;
      await rpc('record_user_xp',{
        p_event_type:'weekly_goal',
        p_source_key:`home-goal:${keyBase}:${goal.index}`,
        p_occurred_on:new Date().toISOString().slice(0,10),
        p_folder_id:null,p_folder_name:null,p_subject_ids:[],
        p_metadata:{reward_points:goal.reward,goal_index:goal.index}
      });
    }
    loadWeekXp();
  }

  function removeGoalFooter() {
    document.querySelectorAll('.fixa-goal-footer').forEach(el=>el.remove());
  }

  function renderWeekXpCard() {
    const grid=document.querySelector('#homeSummaryCards');
    if(!grid)return;
    grid.classList.add('fixa-home-summary-with-week-xp');
    let card=grid.querySelector('.fixa-week-xp-card');
    if(!card){
      card=document.createElement('article');
      card.className='home-card fixa-week-xp-card';
      card.innerHTML='<span><strong>XP na semana</strong><span class="home-card-number">0 XP</span><small class="home-muted">Total acumulado na semana</small></span>';
    }
    const xpCard=grid.querySelector('.fixa-xp-card');
    if(xpCard){
      if(card.previousElementSibling!==xpCard) xpCard.insertAdjacentElement('afterend',card);
    }else if(!card.parentElement){
      grid.appendChild(card);
    }
    const number=card.querySelector('.home-card-number');
    if(number)number.textContent=`${Math.max(0,Number(state.weekXp||0))} XP`;
  }

  function patchObjectiveSummary() {
    const topCards=document.querySelectorAll('#homeFooterStats .fixa-week-top-card');
    const goalCard=topCards[2]; if(!goalCard)return;
    const small=goalCard.querySelector('small');
    if(small && /de\s+3\s+metas/i.test(small.textContent||'')) small.textContent='Progresso geral dos objetivos';
  }

  function dateKey(date){return date?`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`:'';}
  function activityDays(){
    const days=new Set();
    history().forEach(t=>{const d=testDate(t);if(d)days.add(dateKey(d));});
    allSubjects().forEach(s=>cardsFor(s).forEach(c=>attemptsOf(c).forEach(a=>{const d=attemptDate(a);if(d)days.add(dateKey(d));})));
    (state.protection?.protected_days||[]).forEach(value=>{const d=dateOf(value);if(d)days.add(dateKey(d));});
    return days;
  }
  function correctedStreak(days){if(!days.size)return 0;const cursor=new Date();cursor.setHours(12,0,0,0);if(!days.has(dateKey(cursor)))cursor.setDate(cursor.getDate()-1);let s=0;while(days.has(dateKey(cursor))){s++;cursor.setDate(cursor.getDate()-1);}return s;}

  function setTopbarStreak(streak){
    const box=findTopbarStreakBox();
    if(!box)return;
    const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(/\d+\s+dias?/i.test(node.nodeValue||'')){
        node.nodeValue=(node.nodeValue||'').replace(/\d+\s+dias?/i,`${streak} dia${streak===1?'':'s'}`);
        return;
      }
    }
    const candidate=Array.from(box.children||[]).find(el=>/\d+\s+dias?/i.test(el.textContent||''));
    if(candidate)candidate.textContent=`${streak} dia${streak===1?'':'s'}`;
  }

  function patchSequenceWithProtectedDays(){
    const days=activityDays(),streak=correctedStreak(days);
    const card=document.querySelector('#homeFooterStats .fixa-week-top-card:first-child');
    const label=card?.querySelector('.fixa-week-top-head>b');
    if(label)label.textContent=`${streak} dia${streak===1?'':'s'} seguidos`;
    setTopbarStreak(streak);
    requestAnimationFrame(()=>{
      const freeze=document.querySelector('.fixa-streak-freeze-box');
      matchFreezeToStreak(freeze,findTopbarStreakBox());
    });
  }

  function apply(){
    ensureStyle();
    renderProtectionBox();
    renderPerformanceExtras();
    patchGoalCards();
    removeAddObjectiveButton();
    removeGoalFooter();
    renderWeekXpCard();
    patchObjectiveSummary();
    patchSequenceWithProtectedDays();
    document.querySelector('.fixa-week-main-shell')?.classList.add('fixa-performance-expanded');
    awardCompletedGoals();
  }

  let timer=0;
  function schedule(delay=0){clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(apply),delay);}
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-week-period]'))schedule(30);},true);
  document.addEventListener('change',e=>{if(e.target.closest('#fixaWeekFolderFilter'))schedule(30);},true);
  window.addEventListener('load',()=>{schedule(80);syncProtection();loadWeekXp();},{once:true});
  schedule(0); syncProtection(); loadWeekXp();
})();