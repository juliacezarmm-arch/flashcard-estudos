(() => {
  'use strict';

  if (window.FixaHomeReferenceLayoutV3?.active) return;

  const api = window.FixaHomeReferenceLayoutV3 = { active: true, refresh: syncAll };
  const STYLE_ID = 'fixaHomeReferenceLayoutV3Style';
  const STABLE_ID = 'fixaStableSummaryCards';

  const SUMMARY = [
    { key: 'collections', label: 'Coleções', asset: 'referencias/icone_livros_colecoes.png', tone: 'green', fallbackCaption: 'Total de coleções' },
    { key: 'questions', label: 'Questões', asset: 'referencias/ChatGPT Image 31 de jul. de 2026, 23_14_35 (2).png', tone: 'cyan', fallbackCaption: 'Total de questões' },
    { key: 'frozen', label: 'Congeladas', asset: 'referencias/icone_questoes_congeladas.svg', tone: 'blue', fallbackCaption: 'Questões congeladas' },
    { key: 'mastered', label: 'Dominadas', asset: 'referencias/icone_trofeu_dominadas.png', tone: 'orange', fallbackCaption: 'Do total' },
    { key: 'accuracy', label: 'Aproveitamento', asset: 'referencias/ChatGPT Image 1 de ago. de 2026, 12_31_23.png', tone: 'purple', fallbackCaption: 'Média do período' },
    { key: 'xp-total', label: 'XP Coleções', asset: 'referencias/icone_xp_colecoes.svg', tone: 'blue', fallbackCaption: 'Total acumulado' },
    { key: 'xp-week', label: 'XP Semana', asset: 'referencias/icone_xp_semana.svg', tone: 'blue', fallbackCaption: 'Esta semana' }
  ];

  let sourceObserver = null;
  let observedSource = null;
  let syncTimer = 0;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* A grade original continua calculando os valores, mas não é exibida.
         A faixa estável abaixo copia esses valores sem desmontar os cards visíveis. */
      #home.home-view #homeSummaryCards{display:none!important}

      #home.home-view #${STABLE_ID}{
        width:100%!important;
        display:grid!important;
        grid-template-columns:repeat(7,minmax(0,1fr))!important;
        gap:7px!important;
        margin:0!important;
        padding:0!important;
        align-items:stretch!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card{
        height:66px!important;
        min-height:66px!important;
        box-sizing:border-box!important;
        display:grid!important;
        grid-template-columns:40px minmax(0,1fr)!important;
        align-items:center!important;
        gap:9px!important;
        padding:7px 9px!important;
        border:1px solid #e3e9f2!important;
        border-radius:9px!important;
        background:#fff!important;
        box-shadow:0 1px 3px rgba(15,23,42,.04)!important;
        overflow:hidden!important;
        cursor:default!important;
        transform:none!important;
        animation:none!important;
        transition:border-color .15s ease,background-color .15s ease!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card:hover{
        border-color:#cbd8ea!important;
        background:#fbfdff!important;
        transform:none!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-icon{
        width:40px!important;
        height:40px!important;
        min-width:40px!important;
        display:grid!important;
        place-items:center!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        overflow:visible!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-icon img{
        display:block!important;
        width:40px!important;
        height:40px!important;
        max-width:40px!important;
        max-height:40px!important;
        object-fit:contain!important;
        background:transparent!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-copy{
        min-width:0!important;
        display:grid!important;
        align-content:center!important;
        gap:0!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-title{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#172033!important;
        font-size:11px!important;
        line-height:13px!important;
        font-weight:800!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-value{
        display:block!important;
        margin:0!important;
        color:#172033!important;
        font-size:20px!important;
        line-height:21px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        animation:none!important;
        transition:none!important;
      }
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="collections"] .fixa-stable-summary-value{color:#15803d!important}
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="questions"] .fixa-stable-summary-value{color:#0891b2!important}
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="frozen"] .fixa-stable-summary-value,
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="xp-total"] .fixa-stable-summary-value,
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="xp-week"] .fixa-stable-summary-value{color:#2563eb!important}
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="mastered"] .fixa-stable-summary-value{color:#d97706!important}
      #home.home-view #${STABLE_ID} .fixa-stable-summary-card[data-summary-key="accuracy"] .fixa-stable-summary-value{color:#7c3aed!important}
      #home.home-view #${STABLE_ID} .fixa-stable-summary-caption{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#64748b!important;
        font-size:9px!important;
        line-height:10px!important;
        font-weight:550!important;
      }

      /* Remove somente as duas ações visuais solicitadas; a lógica de período e atividades permanece intacta. */
      #home.home-view [data-fixa-week-period="week"],
      #home.home-view [data-fixa-main-tab="activities"]{display:none!important}

      /* Cabeçalho mais próximo e compacto. */
      #home.home-view .home-hero-head{margin-bottom:8px!important}
      #home.home-view .fixa-reference-header-row{min-height:44px!important;gap:18px!important}
      #home.home-view .fixa-week-filters{gap:8px!important}
      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter{
        height:38px!important;
        min-height:38px!important;
        padding:0 10px!important;
        border-radius:9px!important;
        gap:7px!important;
      }
      #home.home-view .fixa-week-folder-filter{width:250px!important;min-width:250px!important}
      #home.home-view .fixa-reference-collection-filter{width:315px!important;min-width:315px!important}
      #home.home-view .fixa-week-folder-filter select,
      #home.home-view .fixa-reference-collection-filter select{
        height:36px!important;
        font-size:12px!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting{
        font-size:20px!important;
        line-height:22px!important;
      }
      #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{
        width:19px!important;
        height:19px!important;
      }
      #home.home-view .fixa-reference-header-right #homeDatePill{
        font-size:11px!important;
        line-height:14px!important;
      }

      /* Período ocupa menos altura. */
      #home.home-view .fixa-reference-period-row{
        min-height:34px!important;
        margin:6px 0 7px!important;
      }
      #home.home-view .fixa-reference-period-row .fixa-week-period{gap:4px!important}
      #home.home-view .fixa-reference-period-row .fixa-week-period button{
        height:34px!important;
        min-height:34px!important;
        padding:0 14px!important;
        border-radius:8px!important;
        font-size:11px!important;
      }

      /* Segunda faixa compacta sem alterar sequência, tempo ou objetivos. */
      #home.home-view #homeFooterStats{
        height:116px!important;
        min-height:116px!important;
        gap:9px!important;
        margin:0 0 9px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-card{
        height:116px!important;
        min-height:116px!important;
        padding:11px 13px!important;
        border-radius:10px!important;
      }
      #home.home-view #homeFooterStats .fixa-week-top-head h3{font-size:13px!important;line-height:16px!important}
      #home.home-view #homeFooterStats .fixa-week-main-value{font-size:23px!important;line-height:25px!important}
      #home.home-view #homeFooterStats .fixa-week-symbol{width:27px!important;height:27px!important;border-radius:8px!important}
      #home.home-view #homeFooterStats .fixa-week-days{margin-top:5px!important;gap:4px!important}
      #home.home-view #homeFooterStats .fixa-week-day i{width:27px!important;height:27px!important;font-size:11px!important}

      /* Área de desenvolvimento: alvo de 235 px em desktop. */
      #home.home-view .fixa-week-main-shell{
        margin:0 0 12px!important;
        border-radius:11px!important;
      }
      #home.home-view .fixa-week-main-shell .fixa-week-main-stage{
        height:235px!important;
        min-height:235px!important;
        max-height:235px!important;
        padding:9px 11px!important;
        overflow:hidden!important;
      }
      #home.home-view .fixa-week-main-pane .home-collection-scroll{
        height:190px!important;
        max-height:190px!important;
      }
      #home.home-view .home-collection-grid.fixa-week-collection-list{gap:6px!important}
      #home.home-view .fixa-week-collection{
        height:96px!important;
        min-height:96px!important;
        padding:7px 8px!important;
        border-radius:8px!important;
      }
      #home.home-view .fixa-week-collection .home-collection-name,
      #home.home-view .fixa-week-collection .home-collection-total{font-size:8.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics b{font-size:9.5px!important}
      #home.home-view .fixa-week-collection .home-collection-metrics small{font-size:6.8px!important}
      #home.home-view .fixa-unified-head{margin-bottom:6px!important}
      #home.home-view .fixa-unified-head h3{font-size:12px!important;line-height:15px!important}
      #home.home-view .fixa-unified-head p{font-size:8px!important}
      #home.home-view .fixa-unified-priority-list,
      #home.home-view .fixa-unified-question-status{height:187px!important}
      #home.home-view .fixa-unified-chart-box{height:198px!important}

      @media(max-width:1159px){
        #home.home-view #${STABLE_ID}{grid-template-columns:repeat(4,minmax(0,1fr))!important}
      }
      @media(max-width:900px){
        #home.home-view #${STABLE_ID}{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{width:100%!important;min-width:0!important}
      }
      @media(max-width:760px){
        #home.home-view #${STABLE_ID}{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        #home.home-view #${STABLE_ID} .fixa-stable-summary-card{height:auto!important;min-height:62px!important}
        #home.home-view #homeFooterStats{height:auto!important;min-height:0!important}
        #home.home-view .fixa-week-main-shell .fixa-week-main-stage{height:auto!important;min-height:235px!important;max-height:none!important}
      }
      @media(max-width:440px){
        #home.home-view #${STABLE_ID}{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }

  function dataRef() {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  }

  function allSubjects() {
    return Array.isArray(dataRef()?.subjects) ? dataRef().subjects : [];
  }

  function selectedSubjects() {
    const folder = document.querySelector('#fixaWeekFolderFilter')?.value || 'all';
    const subject = document.querySelector('#fixaReferenceCollectionFilter')?.value || 'all';
    return allSubjects().filter(item => {
      if (folder !== 'all' && String(item?.folder || '') !== String(folder)) return false;
      if (subject !== 'all' && String(item?.id || '') !== String(subject)) return false;
      return true;
    });
  }

  function cardsFor(subject) {
    return Array.isArray(subject?.cards) ? subject.cards : [];
  }

  function isFrozen(card) {
    const raw = String(card?.status || '').trim().toLowerCase();
    return raw === 'frozen' || raw.includes('congel');
  }

  function frozenCount() {
    return selectedSubjects().reduce((sum, subject) => sum + cardsFor(subject).filter(isFrozen).length, 0);
  }

  function sourceCards() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return new Map();
    return new Map(Array.from(grid.querySelectorAll('.fixa-week-summary-card')).map(card => {
      const label = card.querySelector('strong')?.textContent?.trim() || card.dataset.fixaSummaryKey || '';
      return [label, {
        value: card.querySelector('.home-card-number')?.textContent?.trim() || '',
        caption: card.querySelector('small')?.textContent?.trim() || ''
      }];
    }).filter(([label]) => label));
  }

  function createStableCard(item) {
    const card = document.createElement('article');
    card.className = 'fixa-stable-summary-card';
    card.dataset.summaryKey = item.key;
    card.setAttribute('aria-label', item.label);
    card.innerHTML = `
      <span class="fixa-stable-summary-icon ${item.tone}"><img src="${encodeURI(item.asset)}" alt="" aria-hidden="true"></span>
      <span class="fixa-stable-summary-copy">
        <strong class="fixa-stable-summary-title">${item.label}</strong>
        <span class="fixa-stable-summary-value">0</span>
        <small class="fixa-stable-summary-caption">${item.fallbackCaption}</small>
      </span>`;
    return card;
  }

  function ensureStableGrid() {
    const source = document.querySelector('#homeSummaryCards');
    if (!source?.parentElement) return null;

    let stable = document.getElementById(STABLE_ID);
    if (!stable) {
      stable = document.createElement('section');
      stable.id = STABLE_ID;
      stable.setAttribute('aria-label', 'Resumo do estudo');
      const fragment = document.createDocumentFragment();
      SUMMARY.forEach(item => fragment.appendChild(createStableCard(item)));
      stable.appendChild(fragment);
    }
    if (stable.parentElement !== source.parentElement || stable.nextElementSibling !== source) {
      source.parentElement.insertBefore(stable, source);
    }
    return stable;
  }

  function updateText(element, value) {
    if (!element) return;
    const next = String(value ?? '');
    if (element.textContent !== next) element.textContent = next;
  }

  function syncSummary() {
    const stable = ensureStableGrid();
    if (!stable) return false;
    const source = sourceCards();

    SUMMARY.forEach(item => {
      const card = stable.querySelector(`[data-summary-key="${item.key}"]`);
      if (!card) return;
      let value = '0';
      let caption = item.fallbackCaption;

      if (item.key === 'frozen') {
        value = frozenCount();
      } else {
        const original = source.get(item.label);
        if (original) {
          if (original.value !== '') value = original.value;
          if (original.caption !== '') caption = original.caption;
        }
      }

      updateText(card.querySelector('.fixa-stable-summary-value'), value);
      updateText(card.querySelector('.fixa-stable-summary-caption'), caption);
    });
    return true;
  }

  function scheduleSummary(delay = 90) {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      syncTimer = 0;
      syncSummary();
    }, delay);
  }

  function observeSource() {
    const source = document.querySelector('#homeSummaryCards');
    if (!source || source === observedSource) return;
    sourceObserver?.disconnect();
    observedSource = source;
    sourceObserver = new MutationObserver(() => scheduleSummary(90));
    sourceObserver.observe(source, { childList: true, subtree: true, characterData: true });
  }

  function keepActivitiesFromBeingHiddenActive() {
    const activities = document.querySelector('#home [data-fixa-main-tab="activities"]');
    if (!activities) return;
    const selected = activities.classList.contains('active') || activities.getAttribute('aria-selected') === 'true';
    if (!selected) return;
    const fallback = document.querySelector('#home [data-fixa-main-tab="performance-goals"]') || document.querySelector('#home [data-fixa-main-tab="review-summary"]');
    fallback?.click();
  }

  function syncAll() {
    ensureStyle();
    observeSource();
    keepActivitiesFromBeingHiddenActive();
    syncSummary();
    return true;
  }

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter,#fixaReferenceCollectionFilter')) scheduleSummary(0);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-fixa-week-period],[data-fixa-main-tab],[data-view="home"],#homeTopTab')) scheduleSummary(100);
  });
  window.addEventListener('fixa-xp-updated', () => scheduleSummary(120));
  window.addEventListener('load', () => scheduleSummary(0), { once: true });

  const rootObserver = new MutationObserver(() => {
    ensureStyle();
    observeSource();
    scheduleSummary(90);
  });
  rootObserver.observe(document.documentElement, { childList: true, subtree: true });

  ensureStyle();
  syncAll();
})();
