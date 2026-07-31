(() => {
  const tabs = document.querySelector('.topbar-right .tabs');
  const questionsTab = tabs?.querySelector('[data-view="manage"]');
  const main = document.querySelector('main');
  const manage = document.querySelector('#manage');
  if (!tabs || !questionsTab || !main || !manage || document.querySelector('#home')) return;

  const style = document.createElement('style');
  style.id = 'homeDashboardStyle';
  style.textContent = `
    #subjects{align-content:start!important;grid-auto-rows:max-content!important}
    #subjects .folder-block{align-self:start;min-height:0}
    #home{gap:16px;padding-bottom:18px}
    .home-welcome{display:grid;gap:4px;padding:6px 2px}.home-welcome h2{margin:0;font-size:30px}.home-welcome p{margin:0;color:var(--muted)}
    .home-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .home-box{border:1px solid var(--line);border-radius:14px;background:#fff}
    .home-metric{min-height:110px;padding:16px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:12px}
    .home-icon{width:48px;height:48px;border-radius:999px;display:grid;place-items:center;font-size:22px;color:var(--home-color);background:var(--home-bg)}
    .home-metric div:last-child{display:grid;gap:2px}.home-metric strong{font-size:27px;line-height:1;color:var(--home-color);font-variant-numeric:tabular-nums}.home-metric b{font-size:13px}.home-metric small{color:var(--muted);font-size:11px}
    .home-actions,.home-details{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .home-action{min-height:165px;padding:20px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:18px}.home-action.study{border-color:#cfe0ff;background:#f4f8ff}.home-action.test{border-color:#cdebd6;background:#f3fbf5}
    .home-action-copy{display:grid;gap:8px}.home-action-copy h3{margin:0;font-size:18px}.home-action-copy p{margin:0;color:var(--muted);font-size:13px}.home-action-copy button{width:max-content}.home-action.test button{background:#16a34a}
    .home-progress{height:7px;border-radius:999px;overflow:hidden;background:#dfe8f6}.home-progress span{display:block;height:100%;background:var(--brand)}.home-progress-meta{display:flex;justify-content:space-between;color:var(--muted);font-size:11px}
    .home-card{min-height:280px;padding:17px;display:grid;grid-template-rows:auto 1fr auto;gap:10px}.home-card h3{margin:0;font-size:17px}.home-list{display:grid;align-content:start;gap:4px;overflow:hidden}
    .home-item{width:100%;border:0;border-bottom:1px solid #edf0f5;border-radius:0;padding:10px 2px;display:grid;grid-template-columns:minmax(0,1fr) 110px 52px;align-items:center;gap:10px;color:var(--text);background:transparent;text-align:left}.home-item:hover{color:var(--text);background:#f7faff}.home-main{min-width:0;display:grid;gap:3px}.home-main strong,.home-main small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.home-main strong{font-size:13px}.home-main small,.home-side{color:var(--muted);font-size:11px}.home-side{text-align:right}.home-bar{height:6px;border-radius:999px;overflow:hidden;background:#e4e9f1}.home-bar span{display:block;height:100%;background:var(--bar)}
    .home-link{width:max-content;padding:4px 0;color:var(--brand);background:transparent;font-size:12px;font-weight:800}.home-link:hover{color:var(--brand-dark);background:transparent}.home-empty{min-height:120px;display:grid;place-content:center;color:var(--muted);font-size:13px;text-align:center}
    #collectionsSidebar .side-footer{border-top:1px solid #e4eaf3;padding-top:10px}#collectionsSidebar .app-version{width:max-content;margin:0 auto;border:1px solid #dfe7f3;border-radius:999px;padding:6px 11px;color:#71809a;background:#f8fbff;font-size:11px;line-height:1}
    @media(max-width:1050px){.home-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:760px){.home-welcome h2{font-size:24px}.home-metrics,.home-actions,.home-details{grid-template-columns:1fr}.home-action{grid-template-columns:1fr;min-height:0}.home-card{min-height:0}.home-item{grid-template-columns:minmax(0,1fr) 80px 40px}}
  `;
  document.head.appendChild(style);

  const homeTab = document.createElement('button');
  homeTab.className = 'tab';
  homeTab.id = 'topHomeTab';
  homeTab.type = 'button';
  homeTab.innerHTML = '<svg class="tab-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path></svg>Início';
  questionsTab.before(homeTab);

  const home = document.createElement('section');
  home.className = 'view';
  home.id = 'home';
  home.innerHTML = `
    <div class="home-welcome"><h2 id="homeGreeting">Olá!</h2><p>Continue firme nos seus estudos. Cada revisão conta.</p></div>
    <div class="home-metrics">
      <article class="home-box home-metric" style="--home-color:#2563eb;--home-bg:#edf4ff"><div class="home-icon">▣</div><div><strong id="homeTotal">0</strong><b>Total de questões</b><small>em todas as coleções</small></div></article>
      <article class="home-box home-metric" style="--home-color:#d97706;--home-bg:#fff4df"><div class="home-icon">▦</div><div><strong id="homeDue">0</strong><b>Para estudar</b><small>ainda não dominadas</small></div></article>
      <article class="home-box home-metric" style="--home-color:#16a34a;--home-bg:#eaf8ee"><div class="home-icon">◔</div><div><strong id="homeProgress">0%</strong><b>Progresso geral</b><small>média de domínio</small></div></article>
      <article class="home-box home-metric" style="--home-color:#7c3aed;--home-bg:#f2ecff"><div class="home-icon">◎</div><div><strong id="homeCritical">0</strong><b>Assuntos críticos</b><small>merecem atenção</small></div></article>
    </div>
    <div class="home-actions">
      <article class="home-box home-action study"><div class="home-icon" style="--home-color:#2563eb;--home-bg:#e7f0ff">▤</div><div class="home-action-copy"><h3>Continue de onde parou</h3><p id="homeCurrent">Escolha uma coleção para começar.</p><div class="home-progress"><span id="homeCurrentBar" style="width:0%"></span></div><div class="home-progress-meta"><span id="homeCurrentPct">0% concluído</span><span id="homeCurrentCount">0 de 0</span></div><button id="homeContinue" type="button">Continuar estudando</button></div></article>
      <article class="home-box home-action test"><div class="home-icon" style="--home-color:#16a34a;--home-bg:#e5f7e9">ϟ</div><div class="home-action-copy"><h3>Pronta para um desafio?</h3><p>Abra um teste rápido com a coleção selecionada.</p><button id="homeQuick" type="button">Iniciar teste rápido</button></div></article>
    </div>
    <div class="home-details">
      <article class="home-box home-card"><h3>Estudado recentemente</h3><div class="home-list" id="homeRecent"></div><button class="home-link" id="homeCollections" type="button">Ver todas as coleções →</button></article>
      <article class="home-box home-card"><h3>Assuntos que precisam de mais atenção</h3><div class="home-list" id="homeAttention"></div><button class="home-link" id="homeSubjects" type="button">Ver todos os assuntos →</button></article>
    </div>`;
  manage.before(home);

  let collapsedOnce = false;
  const getSubjects = () => Array.isArray(data?.subjects) ? data.subjects : [];
  const getCards = subject => Array.isArray(subject?.cards) ? subject.cards : [];
  const isPracticed = card => Number(card?.reviews||0)>0 || Number(card?.totalCorrect||0)>0 || Number(card?.totalWrong||0)>0 || Number(card?.masteryCount||0)>0;
  const subjectStats = subject => {
    const cards = getCards(subject); const correct = cards.reduce((n,c)=>n+Number(c.totalCorrect||0),0); const wrong = cards.reduce((n,c)=>n+Number(c.totalWrong||0),0); const hard = cards.reduce((n,c)=>n+Number(c.ratingCounts?.hard||0),0); const attempts=correct+wrong;
    return {subject,cards,correct,wrong,hard,attempts,accuracy:attempts?Math.round(correct/attempts*100):0,practiced:cards.filter(isPracticed).length,last:cards.reduce((n,c)=>Math.max(n,Date.parse(c.lastReviewedAt||'')||0),0),critical:wrong>=2||hard>=2};
  };
  const folderLabel = subject => typeof folderName === 'function' ? folderName(subject.folder) : '';
  const collapseFolders = () => { if(collapsedOnce || typeof collapsedFolders==='undefined' || !Array.isArray(data?.folders)) return; collapsedFolders.clear(); data.folders.forEach(folder=>collapsedFolders.add(folder.id)); collapsedOnce=true; };
  const relative = time => { if(!time)return 'Sem registro'; const minutes=Math.floor((Date.now()-time)/60000); if(minutes<2)return 'Agora'; if(minutes<60)return `${minutes} min`; const hours=Math.floor(minutes/60); if(hours<24)return `${hours} h`; const days=Math.floor(hours/24); return days===1?'Ontem':`${days} dias`; };

  function renderHome(){
    const subjects=getSubjects(); const all=subjects.flatMap(getCards); const stats=subjects.map(subjectStats); const selected=typeof currentSubject==='function'?currentSubject():subjects[0]; const selectedStats=selected?subjectStats(selected):null;
    const target=Number(typeof MASTERY_TARGET!=='undefined'?MASTERY_TARGET:4)||4; const overall=all.length?Math.round(all.reduce((sum,card)=>sum+(card.status==='mastered'?100:Math.min(100,Number(card.masteryCount||0)/target*100)),0)/all.length):0;
    const displayName=String(el?.userDisplayName?.textContent||currentUser?.user_metadata?.full_name||'Julia').trim().split(/\s+/)[0]||'Julia'; const hour=new Date().getHours();
    home.querySelector('#homeGreeting').textContent=`${hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite'}, ${displayName}! 👋`;
    home.querySelector('#homeTotal').textContent=all.length; home.querySelector('#homeDue').textContent=all.filter(card=>card.status!=='mastered'&&card.status!=='frozen'&&!card.frozen).length; home.querySelector('#homeProgress').textContent=`${overall}%`; home.querySelector('#homeCritical').textContent=stats.filter(item=>item.critical).length;
    const total=selectedStats?.cards.length||0; const done=selectedStats?.practiced||0; const pct=total?Math.round(done/total*100):0;
    home.querySelector('#homeCurrent').textContent=selected?`${selected.name} · ${folderLabel(selected)}`:'Crie ou selecione uma coleção.'; home.querySelector('#homeCurrentBar').style.width=`${pct}%`; home.querySelector('#homeCurrentPct').textContent=`${pct}% concluído`; home.querySelector('#homeCurrentCount').textContent=`${done} de ${total}`; home.querySelector('#homeContinue').disabled=!selected;
    const recent=stats.filter(item=>item.last).sort((a,b)=>b.last-a.last).slice(0,3);
    home.querySelector('#homeRecent').innerHTML=recent.length?recent.map(item=>`<button class="home-item" type="button" data-home-subject="${item.subject.id}"><span class="home-main"><strong>${item.subject.name}</strong><small>${folderLabel(item.subject)}</small></span><span class="home-bar" style="--bar:#2563eb"><span style="width:${item.cards.length?Math.round(item.practiced/item.cards.length*100):0}%"></span></span><span class="home-side">${relative(item.last)}</span></button>`).join(''):'<div class="home-empty">As coleções estudadas aparecerão aqui.</div>';
    const attention=[...stats].sort((a,b)=>a.attempts&&!b.attempts?-1:!a.attempts&&b.attempts?1:a.accuracy-b.accuracy||b.wrong-a.wrong).slice(0,5);
    home.querySelector('#homeAttention').innerHTML=attention.length?attention.map(item=>{const value=item.attempts?item.accuracy:0;const color=!item.attempts?'#aab4c5':value<50?'#ef4444':value<70?'#f59e0b':value<90?'#22c55e':'#16a34a';return `<button class="home-item" type="button" data-home-subject="${item.subject.id}"><span class="home-main"><strong>${item.subject.name}</strong><small>${item.attempts?`${item.wrong} erro${item.wrong===1?'':'s'}`:'Sem dados'}</small></span><span class="home-bar" style="--bar:${color}"><span style="width:${value}%"></span></span><span class="home-side">${item.attempts?`${value}%`:'—'}</span></button>`}).join(''):'<div class="home-empty">Crie coleções para acompanhar suas prioridades.</div>';
  }

  function setActive(view){ tabs.querySelectorAll('.tab').forEach(button=>{const active=view==='home'?button===homeTab:button.dataset.view===view;button.classList.toggle('active',active);}); }
  function openHome(){ if(typeof closeMobileNav==='function')closeMobileNav(); document.querySelectorAll('main > .view').forEach(view=>view.classList.toggle('active',view===home)); setActive('home'); renderHome(); main.scrollTop=0; }

  const originalShowView=typeof showView==='function'?showView:null;
  if(originalShowView) showView=function(view){ if(view==='home'){openHome();return;} home.classList.remove('active'); originalShowView(view); setActive(view); };
  const originalRender=typeof render==='function'?render:null;
  if(originalRender) render=function(...args){collapseFolders();const result=originalRender(...args);renderHome();return result;};

  homeTab.addEventListener('click',openHome); home.querySelector('#homeContinue').addEventListener('click',()=>showView?.('manage')); home.querySelector('#homeQuick').addEventListener('click',()=>{showView?.('test');showTestPanel?.('quick')}); home.querySelector('#homeCollections').addEventListener('click',()=>showView?.('manage')); home.querySelector('#homeSubjects').addEventListener('click',()=>document.querySelector('#topAnalysisTab')?.click());
  home.addEventListener('click',event=>{const button=event.target.closest('[data-home-subject]');if(!button)return;data.selected=button.dataset.homeSubject;render?.();showView?.('manage');});

  const testTabs=document.querySelector('#test .test-tabs'); const analysisPanel=document.querySelector('#testPanelAnalysis'); const testView=document.querySelector('#test');
  if(testTabs&&analysisPanel&&testView){const sync=()=>testTabs.hidden=Boolean(testView.classList.contains('active')&&!analysisPanel.hidden);const observer=new MutationObserver(sync);observer.observe(testView,{attributes:true,attributeFilter:['class']});observer.observe(analysisPanel,{attributes:true,attributeFilter:['hidden']});sync();}

  collapseFolders(); if(originalRender)render(); else renderHome(); openHome();
})();
