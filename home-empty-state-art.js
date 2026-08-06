(() => {
  const STYLE_ID = 'homeEmptyStateArtStyle';
  const ART = {
    study: 'referencias/home-revisar-primeiro.webp',
    collections: 'referencias/home-resumo-colecoes.webp',
    reviews: 'referencias/home-revisoes-hoje.webp'
  };

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .home-empty-art-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(150px,240px);align-items:center;gap:18px;min-height:180px}
      .home-empty-art-copy{display:grid;align-content:center;gap:12px;min-width:0}
      .home-empty-art{width:100%;max-width:230px;max-height:190px;object-fit:contain;justify-self:end;transition:.2s ease}
      .home-empty-action{width:max-content;max-width:100%;min-height:42px;border:1px solid #cfe0ff!important;border-radius:10px!important;padding:10px 14px!important;color:#2563eb!important;background:#fff!important;font-weight:800!important;box-shadow:0 8px 22px rgba(37,99,235,.08)!important}
      .home-empty-action:hover{color:#fff!important;background:#2563eb!important;border-color:#2563eb!important}
      .home-panel.home-has-content{position:relative}
      .home-panel.home-has-content>.home-data-art{display:flex;align-items:center;gap:10px;margin:0 0 12px 0}
      .home-data-art img{width:58px;height:58px;object-fit:contain;flex:0 0 auto}
      .home-data-art span{font-weight:800;color:#64748b;font-size:12px}
      @media(max-width:760px){.home-empty-art-wrap{grid-template-columns:1fr;min-height:0}.home-empty-art{justify-self:center;max-width:190px;order:-1}.home-empty-action{width:100%}.home-data-art img{width:48px;height:48px}}
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
    if (el.querySelector('.home-empty-art-wrap')) return true;
    if (el.querySelector('.home-recommendation,.home-collection-card,.home-priority-item,.home-review-item,[data-home-subject]')) return false;
    const text = (el.textContent || '').trim().toLowerCase();
    return !text || text.includes('aparecer') || text.includes('nenhuma') || text.includes('sem dados') || text.includes('depois do primeiro teste');
  }

  function emptyMarkup(kind, text, button, action) {
    return `<div class="home-empty-art-wrap" data-home-empty-kind="${kind}"><div class="home-empty-art-copy"><p class="home-muted">${text}</p><button class="home-empty-action" type="button" data-home-empty-action="${action}">${button}</button></div><img class="home-empty-art" src="${ART[kind]}" alt="" aria-hidden="true"></div>`;
  }

  function ensureEmptyMarkup(el, kind, text, button, action) {
    if (el.querySelector(`.home-empty-art-wrap[data-home-empty-kind="${kind}"]`)) return;
    el.innerHTML = emptyMarkup(kind, text, button, action);
  }

  function addCompactArt(panel, kind, label) {
    let art = panel.querySelector(':scope > .home-data-art');
    if (!art) {
      art = document.createElement('div');
      art.className = 'home-data-art';
      art.innerHTML = `<img src="${ART[kind]}" alt="" aria-hidden="true"><span>${label}</span>`;
      const head = panel.querySelector('.home-study-head,.home-panel-head');
      head?.insertAdjacentElement('afterend', art);
    }
    panel.classList.add('home-has-content');
  }

  function removeCompactArt(panel) {
    panel.querySelector(':scope > .home-data-art')?.remove();
    panel.classList.remove('home-has-content');
  }

  let applying = false;
  function apply() {
    if (applying) return;
    applying = true;
    try {
      const study = document.querySelector('#homeStudyRecommendations');
      const studyPanel = study?.closest('.home-panel');
      if (study && studyPanel) {
        if (isEmpty(study)) {
          ensureEmptyMarkup(study, 'study', 'Comece um teste para criarmos um plano de revisão personalizado com base no seu desempenho.', 'Criar meu primeiro teste', 'test');
          removeCompactArt(studyPanel);
        } else {
          addCompactArt(studyPanel, 'study', 'Revisão recomendada');
        }
      }

      const collections = document.querySelector('#homeCollectionSummary');
      const collectionsPanel = collections?.closest('.home-panel');
      if (collections && collectionsPanel) {
        if (isEmpty(collections)) {
          ensureEmptyMarkup(collections, 'collections', 'Suas coleções aparecerão aqui após o primeiro teste. Acompanhe seu progresso, conteúdo e desempenho.', 'Ver minhas coleções', 'questions');
          removeCompactArt(collectionsPanel);
        } else {
          addCompactArt(collectionsPanel, 'collections', 'Resumo das coleções');
        }
      }

      const reviews = document.querySelector('#homePriorities');
      const reviewsPanel = reviews?.closest('.home-panel');
      if (reviews && reviewsPanel) {
        if (isEmpty(reviews)) {
          ensureEmptyMarkup(reviews, 'reviews', 'As revisões recomendadas aparecerão aqui conforme você realiza testes e estuda suas coleções.', 'Fazer um teste agora', 'test');
          removeCompactArt(reviewsPanel);
        } else {
          addCompactArt(reviewsPanel, 'reviews', 'Revisões de hoje');
        }
      }
    } finally {
      applying = false;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-home-empty-action]');
    if (!button) return;
    button.dataset.homeEmptyAction === 'questions' ? openQuestions() : openTest();
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

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', scheduleApply);
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
    if (wrapSupabaseRpc() || wrapAttempts >= 40) window.clearInterval(wrapTimer);
  }, 250);
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

  const recoveryObserver = new MutationObserver(scheduleRecovery);
  recoveryObserver.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('online', () => {
    const retryButton = document.querySelector('[data-competition-retry]');
    if (retryButton) retryCompetition();
  });

  scheduleRecovery();
})();
