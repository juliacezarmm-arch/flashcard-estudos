(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV1) return;
  window.FixaHomeGoalsStreakProtectionV1 = true;

  const STYLE_ID = 'fixaHomeGoalsStreakProtectionV1Style';
  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const GOAL_REWARDS = { questions: 20, tests: 25, mastered: 40 };
  const state = { protection: { available: 0, maximum: 3, protected_days: [] }, syncing: false };

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
      .fixa-streak-freeze-box{height:38px;min-width:68px;border:1px solid #c8dcff;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:#1d4ed8;background:#edf5ff;font-size:11px;font-weight:850;box-shadow:none;white-space:nowrap}
      .fixa-streak-freeze-box img{width:18px;height:24px;object-fit:contain;display:block}
      .fixa-streak-freeze-box:hover{background:#e7f1ff;border-color:#b8d1ff}
      .fixa-performance-expanded{height:auto!important;min-height:0!important;overflow:visible!important}
      .fixa-performance-expanded .fixa-week-main-stage{height:auto!important;min-height:365px!important}
      #homePerformance.fixa-performance-extra{display:grid!important;gap:5px!important}
      .fixa-performance-extra-row{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 9px;border:1px solid #e4eaf3;border-radius:8px;background:#fff}
      .fixa-performance-extra-row span{display:flex;align-items:center;gap:7px;min-width:0;color:#53617a;font-size:8px}.fixa-performance-extra-row strong{font-size:9.5px;color:#172033;white-space:nowrap}.fixa-performance-extra-row strong.good{color:#15803d}.fixa-performance-extra-row strong.bad{color:#c2413b}
      .fixa-performance-extra-dot{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#eef4ff;color:#2563eb;font-size:11px;flex:0 0 22px}
      .fixa-goal-reward{margin-left:auto;padding:3px 6px;border-radius:999px;color:#7c3aed;background:#f3e8ff;font-size:7px;font-weight:850;white-space:nowrap}
      .fixa-goal-footer{margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .fixa-goal-footer-card{min-height:52px;padding:8px 10px;border:1px solid #e5eaf3;border-radius:9px;background:#fafcff;display:grid;align-content:center;gap:2px}
      .fixa-goal-footer-card span{color:#6b778c;font-size:7.5px}.fixa-goal-footer-card strong{font-size:14px;color:#172033}.fixa-goal-footer-card.protection{grid-template-columns:auto 1fr;column-gap:8px}.fixa-goal-footer-card.protection img{width:24px;height:34px;object-fit:contain;grid-row:1/3}.fixa-goal-footer-card.protection strong{color:#2563eb}
      @media(max-width:760px){.fixa-goal-footer{grid-template-columns:1fr}.fixa-streak-freeze-box{min-width:56px;padding:0 8px}}
    `;
    document.head.appendChild(style);
  }

  async function rpc(name,args={}) {
    const client = getClient();
    if (!client) return { data:null, error:new Error('Supabase indisponível') };
    return client.rpc(name,args);
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
      renderGoalFooter();
      patchSequenceWithProtectedDays();
    }
  }

  function renderProtectionBox() {
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    let streakBox = Array.from(right.querySelectorAll('button,div,span')).find(el => /\bdias?\b/i.test((el.textContent||'').trim()) && !el.classList.contains('fixa-streak-freeze-box'));
    if (!streakBox) streakBox = right.querySelector('[class*=streak], [class*=sequence]');
    let box = right.querySelector('.fixa-streak-freeze-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'fixa-streak-freeze-box';
      box.title = 'Proteção de sequência';
      if (streakBox?.parentElement) streakBox.parentElement.insertBefore(box, streakBox);
      else right.prepend(box);
    }
    box.innerHTML = `<img src="${FROZEN_FIRE_SRC}" alt=""><span>${Math.max(0,Number(state.protection?.available||0))}</span>`;
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

  function goalValues() {
    const stats=performanceStats();
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
  }

  function renderGoalFooter() {
    const goals=document.querySelector('#homeGoals'); if(!goals)return;
    const panel=goals.closest('.home-panel') || goals.parentElement; if(!panel)return;
    let footer=panel.querySelector('.fixa-goal-footer');
    if(!footer){footer=document.createElement('div');footer.className='fixa-goal-footer';panel.appendChild(footer);}
    const total=goalValues().reduce((s,g)=>s+g.reward,0);
    footer.innerHTML=`<div class="fixa-goal-footer-card"><span>XP total possível neste período</span><strong>${total} XP</strong></div><div class="fixa-goal-footer-card protection"><img src="${FROZEN_FIRE_SRC}" alt=""><span>Proteção de sequência</span><strong>${Math.max(0,Number(state.protection?.available||0))} / ${Number(state.protection?.maximum||3)}</strong></div>`;
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
  function patchSequenceWithProtectedDays(){
    const card=document.querySelector('#homeFooterStats .fixa-week-top-card:first-child');if(!card)return;
    const days=activityDays(),streak=correctedStreak(days),label=card.querySelector('.fixa-week-top-head>b');
    if(label)label.textContent=`${streak} dia${streak===1?'':'s'} seguidos`;
  }

  function apply(){
    ensureStyle();
    renderProtectionBox();
    renderPerformanceExtras();
    patchGoalCards();
    renderGoalFooter();
    patchObjectiveSummary();
    patchSequenceWithProtectedDays();
    document.querySelector('.fixa-week-main-shell')?.classList.add('fixa-performance-expanded');
    awardCompletedGoals();
  }

  let timer=0;
  function schedule(delay=0){clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(apply),delay);}
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-week-period]'))schedule(30);},true);
  document.addEventListener('change',e=>{if(e.target.closest('#fixaWeekFolderFilter'))schedule(30);},true);
  window.addEventListener('load',()=>{schedule(80);syncProtection();},{once:true});
  schedule(0); syncProtection();
})();
