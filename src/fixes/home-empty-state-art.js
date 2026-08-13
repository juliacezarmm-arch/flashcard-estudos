(() => {
  const STYLE_ID = 'homeEmptyStateArtStyle';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .home-empty-art-copy{display:grid;align-content:center;gap:12px;min-width:0}
      .home-empty-action{width:max-content;max-width:100%;min-height:42px;border:1px solid #cfe0ff!important;border-radius:10px!important;padding:10px 14px!important;color:#2563eb!important;background:#fff!important;font-weight:800!important;box-shadow:0 8px 22px rgba(37,99,235,.08)!important}
      .home-empty-action:hover{color:#fff!important;background:#2563eb!important;border-color:#2563eb!important}
      .home-review-empty-art-wrap{display:block;min-height:0}
      .home-review-empty-art{display:none!important}
      .home-review-data-art{display:none!important}
      @media(max-width:760px){.home-empty-action{width:100%}}
    `;
    document.head.appendChild(style);
  }

  const openTest = () => {
    if (typeof showView === 'function') showView('test');
    if (typeof showTestPanel === 'function') showTestPanel('quick');
    document.querySelector('[data-view="test"]')?.click();
  };

  const openQuestions = () => {
    document.querySelector('[data-view="questions"]')?.click();
    if (typeof showView === 'function') showView('questions');
  };

  function isEmpty(el) {
    if (!el) return true;
    if (el.querySelector('.home-review-empty-art-wrap,.home-empty-copy-only')) return true;
    if (el.querySelector('.home-recommendation,.home-collection-card,.home-priority-item,.home-review-item,[data-home-subject]')) return false;
    const text = (el.textContent || '').trim().toLowerCase();
    return !text || text.includes('aparecer') || text.includes('nenhuma') || text.includes('sem dados') || text.includes('depois do primeiro teste');
  }

  function copyOnlyMarkup(text, button, action) {
    return `<div class="home-empty-copy-only"><div class="home-empty-art-copy"><p class="home-muted">${text}</p><button class="home-empty-action" type="button" data-home-empty-action="${action}">${button}</button></div></div>`;
  }

  function reviewEmptyMarkup(text, button, action) {
    return `<div class="home-review-empty-art-wrap"><div class="home-empty-art-copy"><p class="home-muted">${text}</p><button class="home-empty-action" type="button" data-home-empty-action="${action}">${button}</button></div></div>`;
  }

  function ensureCopyOnly(el, text, button, action) {
    if (el.querySelector('.home-empty-copy-only')) return;
    el.innerHTML = copyOnlyMarkup(text, button, action);
  }

  function ensureReviewEmpty(el, text, button, action) {
    if (el.querySelector('.home-review-empty-art-wrap')) return;
    el.innerHTML = reviewEmptyMarkup(text, button, action);
  }

  function removeStudyAndCollectionArt() {
    const study = document.querySelector('#homeStudyRecommendations');
    const studyPanel = study?.closest('.home-panel') || document.querySelector('.home-study-card');
    const collections = document.querySelector('#homeCollectionSummary');
    const collectionsPanel = collections?.closest('.home-panel');

    [studyPanel, collectionsPanel].forEach(panel => {
      if (!panel) return;
      panel.querySelectorAll('.home-study-art,.home-data-art,.home-empty-art,.fixa-home-corner-art,img[data-home-art="study"],img[data-home-art="collections"]').forEach(node => node.remove());
      panel.classList.remove('home-has-content','has-home-data','is-home-empty');
      panel.style.removeProperty('padding-left');
      panel.style.removeProperty('padding-right');
    });
  }

  function removeReviewCompactArt(panel) {
    if (!panel) return;
    panel.querySelectorAll(':scope > .home-review-data-art,.home-review-data-art,.home-review-empty-art').forEach(node => node.remove());
    panel.classList.remove('home-has-review-art');
  }

  let applying = false;
  function apply() {
    if (applying) return;
    applying = true;
    try {
      removeStudyAndCollectionArt();

      const study = document.querySelector('#homeStudyRecommendations');
      if (study && isEmpty(study)) {
        ensureCopyOnly(study,'Comece um teste para criarmos um plano de revisão personalizado com base no seu desempenho.','Criar meu primeiro teste','test');
      }

      const collections = document.querySelector('#homeCollectionSummary');
      if (collections && isEmpty(collections)) {
        ensureCopyOnly(collections,'Suas coleções aparecerão aqui após o primeiro teste. Acompanhe seu progresso, conteúdo e desempenho.','Ver minhas coleções','questions');
      }

      const reviews = document.querySelector('#homePriorities');
      const reviewsPanel = reviews?.closest('.home-panel');
      if (reviews && reviewsPanel) {
        removeReviewCompactArt(reviewsPanel);
        if (isEmpty(reviews)) {
          ensureReviewEmpty(reviews,'As revisões recomendadas aparecerão aqui conforme você realiza testes e estuda suas coleções.','Fazer um teste agora','test');
        }
      }
    } finally {
      applying = false;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-home-empty-action]');
    if (button) {
      button.dataset.homeEmptyAction === 'questions' ? openQuestions() : openTest();
      return;
    }

    if (event.target.closest('[data-view="home"], [data-home-tab], .home-subtab')) {
      window.setTimeout(apply, 80);
      window.setTimeout(apply, 350);
    }
  });

  let scheduled = false;
  const scheduleApply = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  };

  const observed = new WeakSet();
  function installHomeObservers() {
    [
      document.querySelector('#homeStudyRecommendations'),
      document.querySelector('#homeCollectionSummary'),
      document.querySelector('#homePriorities')
    ].filter(Boolean).forEach(node => {
      if (observed.has(node)) return;
      observed.add(node);
      new MutationObserver(scheduleApply).observe(node, { childList:true, subtree:true });
    });
  }

  let observerAttempts = 0;
  const observerTimer = window.setInterval(() => {
    observerAttempts += 1;
    installHomeObservers();
    if (observerAttempts >= 12 || document.querySelector('#homePriorities')) window.clearInterval(observerTimer);
  }, 350);

  window.addEventListener('load', () => {
    installHomeObservers();
    scheduleApply();
  }, { once:true });
  scheduleApply();
})();

(() => {
  if (window.FixaCompetitionFetchRecovery) return;
  window.FixaCompetitionFetchRecovery = true;

  const RETRYABLE_ERROR = /failed to fetch|networkerror|network request failed|load failed|fetch failed/i;
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function isRetryable(error) {
    const message = String(error?.message || error || '');
    return RETRYABLE_ERROR.test(message);
  }

  function wrapSupabaseRpc() {
    const client = window.supabaseClient;
    if (!client || typeof client.rpc !== 'function') return false;
    if (client.__fixaRpcRetryWrapped) return true;

    const originalRpc = client.rpc.bind(client);
    client.rpc = async function fixaRpcWithRetry(functionName, parameters, options) {
      let result;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          result = await originalRpc(functionName, parameters, options);
        } catch (error) {
          result = { data: null, error };
        }

        if (!result?.error || !isRetryable(result.error) || attempt === 2) return result;
        await sleep(500 * (2 ** attempt));
      }
      return result;
    };

    Object.defineProperty(client, '__fixaRpcRetryWrapped', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });
    return true;
  }

  let wrapAttempts = 0;
  const wrapTimer = window.setInterval(() => {
    wrapAttempts += 1;
    if (wrapSupabaseRpc() || wrapAttempts >= 20) window.clearInterval(wrapTimer);
  }, 500);
  wrapSupabaseRpc();

  function competitionTab() {
    return document.querySelector('[data-competition-view="v3"]');
  }

  function retryCompetition() {
    const tab = competitionTab();
    if (tab) tab.click();
  }

  function replaceTechnicalError() {
    const root = document.querySelector('.competition-v3.active #cv3');
    if (!root || root.querySelector('[data-competition-retry]')) return;

    const message = (root.textContent || '').trim();
    if (!RETRYABLE_ERROR.test(message)) return;

    root.innerHTML = `
      <div class="cv3-card" style="display:grid;gap:12px;justify-items:start">
        <h3 style="margin:0">Não foi possível carregar a competição</h3>
        <p class="cv3-muted" style="margin:0">A conexão com o servidor falhou temporariamente. Seus dados não foram apagados.</p>
        <button type="button" data-competition-retry>Tentar novamente</button>
      </div>
    `;
    root.querySelector('[data-competition-retry]')?.addEventListener('click', retryCompetition);
  }

  let recoveryScheduled = false;
  const scheduleRecovery = () => {
    if (recoveryScheduled) return;
    recoveryScheduled = true;
    requestAnimationFrame(() => {
      recoveryScheduled = false;
      wrapSupabaseRpc();
      replaceTechnicalError();
    });
  };

  function recoveryBurst() {
    [80, 350, 900].forEach(delay => window.setTimeout(scheduleRecovery, delay));
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view="v3"], .competition-v3 button, .competition-v3 select')) recoveryBurst();
  }, true);

  window.addEventListener('online', () => {
    const retryButton = document.querySelector('[data-competition-retry]');
    if (retryButton) retryCompetition();
  });

  window.addEventListener('load', recoveryBurst, { once:true });
  recoveryBurst();
})();

/* ===== Home: Atividades dentro da primeira caixa branca ===== */
(() => {
  'use strict';
  if (window.FixaHomeUnifiedActivityV1) return;
  window.FixaHomeUnifiedActivityV1 = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const tones = ['green','purple','amber','blue','pink'];

  function appData(){ try{return typeof data !== 'undefined' ? data : null;}catch(_){return null;} }
  function subjects(){ return Array.isArray(appData()?.subjects) ? appData().subjects : []; }
  function dateOf(test){ const d=new Date(test?.completedAt||test?.finishedAt||test?.date||0); return Number.isNaN(d.getTime())?null:d; }
  function subjectOf(test){ return subjects().find(s=>String(s.id||'')===String(test?.subjectId||''))||subjects().find(s=>s.name===test?.subject)||null; }
  function nameOf(test){ return test?.subject||subjectOf(test)?.name||'Coleção'; }
  function idOf(test){ return subjectOf(test)?.id||test?.subjectId||''; }
  function initials(name){ const p=String(name||'Coleção').trim().split(/\s+/).filter(Boolean); return (p.slice(0,2).map(x=>x[0]).join('')||'C').toUpperCase(); }
  function tone(name){ const n=Array.from(String(name||'')).reduce((s,c)=>s+c.charCodeAt(0),0); return tones[n%tones.length]; }
  function relative(d){ if(!d)return ''; const ms=Math.max(0,Date.now()-d.getTime()),m=Math.floor(ms/60000); if(m<1)return 'agora'; if(m<60)return `há ${m} min`; const h=Math.floor(m/60); if(h<24)return `há ${h}h`; const days=Math.floor(h/24); if(days<7)return `há ${days} dia${days===1?'':'s'}`; return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(d); }
  function attr(test){ const id=idOf(test); return id?` data-home-subject="${esc(id)}" tabindex="0"`:''; }

  function currentRange(){
    const period=document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod||'week';
    const now=new Date();
    const start=new Date(now),end=new Date(now);
    if(period==='today'){ start.setHours(0,0,0,0); end.setHours(23,59,59,999); return {start,end}; }
    if(period==='month'){ return {start:new Date(now.getFullYear(),now.getMonth(),1),end:new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999)}; }
    start.setHours(0,0,0,0); start.setDate(start.getDate()-((start.getDay()+6)%7));
    end.setTime(start.getTime()); end.setDate(end.getDate()+6); end.setHours(23,59,59,999);
    return {start,end};
  }

  function visibleTests(){
    const folder=document.querySelector('#fixaWeekFolderFilter')?.value||'all';
    const {start,end}=currentRange();
    let allowedIds=null,allowedNames=null;
    if(folder!=='all'){
      const list=subjects().filter(s=>String(s.folder||'')===String(folder));
      allowedIds=new Set(list.map(s=>String(s.id))); allowedNames=new Set(list.map(s=>s.name));
    }
    return (Array.isArray(appData()?.testHistory)?appData().testHistory:[])
      .filter(t=>!t?.cancelled&&!t?.canceled&&!t?.interrupted&&Number(t?.total||0)>0)
      .filter(t=>{ const d=dateOf(t); return d&&d>=start&&d<=end; })
      .filter(t=>{ if(!allowedIds)return true; const ids=(Array.isArray(t?.subjectIds)&&t.subjectIds.length?t.subjectIds:[t?.subjectId]).filter(Boolean).map(String); return ids.some(id=>allowedIds.has(id))||allowedNames.has(t?.subject); })
      .sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0));
  }

  function ensureStyle(){
    if(document.querySelector('#fixaHomeUnifiedActivityStyle'))return;
    const style=document.createElement('style'); style.id='fixaHomeUnifiedActivityStyle'; style.textContent=`
      #home .home-subtabs .home-subtab,#home .home-subtabs [data-home-tab]{display:none!important}
      #home .home-subtabs{background:transparent!important;border:0!important;padding-left:0!important;padding-right:0!important}
      .fixa-week-activities-panel{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;align-items:stretch!important}
      .fixa-week-activities-panel>.home-activity-panel{min-width:0!important;min-height:230px!important;max-height:270px!important;margin:0!important;overflow:hidden!important}
      .fixa-week-activities-panel .home-activity-scroll{max-height:205px!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:3px!important}
      .fixa-week-activities-panel .home-panel-head{min-height:42px!important;margin-bottom:0!important}
      .fixa-week-activities-panel .home-panel-head h3{display:flex!important;align-items:center!important;gap:7px!important}
      .fixa-week-activities-panel .home-activity-title-icon svg{width:16px!important;height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
      @media(max-width:760px){.fixa-week-activities-panel{grid-template-columns:1fr!important}.fixa-week-activities-panel>.home-activity-panel,.fixa-week-activities-panel .home-activity-scroll{max-height:none!important}}
    `; document.head.appendChild(style);
  }

  function ensureLayout(){
    const home=document.querySelector('#home.home-view');
    const today=home?.querySelector('[data-home-panel="today"]');
    const shell=today?.querySelector('.fixa-week-main-shell');
    const tabs=shell?.querySelector('.fixa-week-content-tabs');
    const stage=shell?.querySelector('.fixa-week-main-stage');
    if(!home||!today||!tabs||!stage)return false;
    ensureStyle();
    const nav=home.querySelector('.home-subtabs');
    nav?.querySelectorAll('[data-home-tab],.home-subtab').forEach(b=>b.remove());
    const greeting=home.querySelector('#homeGreeting'); if(nav&&greeting&&greeting.parentElement!==nav)nav.appendChild(greeting);
    today.hidden=false;
    let tab=tabs.querySelector('[data-fixa-main-tab="activities"]');
    if(!tab){ tab=document.createElement('button'); tab.type='button'; tab.setAttribute('role','tab'); tab.setAttribute('aria-selected','false'); tab.dataset.fixaMainTab='activities'; tab.textContent='Atividades'; tabs.appendChild(tab); }
    let panel=stage.querySelector('[data-fixa-main-panel="activities"]');
    if(!panel){ panel=document.createElement('section'); panel.className='fixa-week-main-pair fixa-week-activities-panel'; panel.dataset.fixaMainPanel='activities'; panel.hidden=true; stage.appendChild(panel); }
    const activity=home.querySelector('#homeActivity')?.closest('.home-panel');
    const tests=home.querySelector('#homeTests')?.closest('.home-panel');
    [activity,tests].filter(Boolean).forEach(card=>{ card.classList.add('fixa-week-main-pane'); card.hidden=false; if(card.parentElement!==panel)panel.appendChild(card); });
    home.querySelector('[data-home-panel="activity"]')?.setAttribute('hidden','');
    return Boolean(activity&&tests);
  }

  function render(){
    const activity=document.querySelector('#homeActivity'),testsBox=document.querySelector('#homeTests'); if(!activity||!testsBox)return;
    const recent=visibleTests().slice(0,12);
    activity.innerHTML=recent.length?recent.map(t=>`<li class="home-activity-item home-activity-clickable"${attr(t)}><span class="home-activity-time">${relative(dateOf(t))}</span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Finalizou teste em ${esc(nameOf(t))}</span><small>${Number(t.score||0)} de ${Number(t.total||0)} acertos</small></span></li>`).join(''):'<li class="home-activity-item"><span></span><span class="home-activity-timeline"><span class="home-activity-status" aria-hidden="true"></span></span><span class="home-activity-body"><span class="home-activity-title">Sua atividade aparecerá aqui.</span></span></li>';
    testsBox.innerHTML=recent.length?recent.map(t=>{ const n=nameOf(t),s=Number(t.score||0),total=Number(t.total||0),p=total?s/total*100:0,c=p>=80?'':p>=60?' is-warn':' is-bad'; return `<div class="home-test-row"${attr(t)}><span class="home-activity-avatar tone-${tone(n)}">${initials(n)}</span><span class="home-test-copy"><span class="home-test-name">${esc(n)}</span><span class="home-test-meta">${relative(dateOf(t))}</span></span><span class="home-test-score${c}">${s}/${total}</span></div>`; }).join(''):'<p class="home-muted">Nenhum teste realizado ainda.</p>';
    const clock=document.querySelector('[data-home-activity-icon="clock"]'); if(clock)clock.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>';
    const chart=document.querySelector('[data-home-activity-icon="chart"]'); if(chart)chart.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path></svg>';
  }

  let timer=0; function refresh(delay=0){ clearTimeout(timer); timer=setTimeout(()=>{ if(ensureLayout())render(); },delay); }
  document.addEventListener('click',e=>{ if(e.target.closest('[data-view="home"],#homeTopTab,[data-fixa-main-tab],[data-fixa-week-period]'))refresh(60); },true);
  document.addEventListener('change',e=>{ if(e.target.closest('#fixaWeekFolderFilter'))refresh(40); },true);
  window.addEventListener('load',()=>refresh(80),{once:true});
  let tries=0; const boot=setInterval(()=>{ tries++; const ok=ensureLayout(); if(ok)render(); if(ok||tries>=20)clearInterval(boot); },250);
  refresh(0); refresh(350);
})();
