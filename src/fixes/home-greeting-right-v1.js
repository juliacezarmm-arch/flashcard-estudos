(() => {
  'use strict';
  if (window.FixaHomeGreetingRightV6) return;
  window.FixaHomeGreetingRightV6 = true;

  let applying = false;
  let observer = null;
  let scheduled = false;

  const important = (element, property, value) => {
    if (element) element.style.setProperty(property, value, 'important');
  };

  function ensureCompactRow(actions) {
    let row = actions.querySelector('#fixaHomeCompactTopRowV6');
    if (!row) {
      row = document.createElement('div');
      row.id = 'fixaHomeCompactTopRowV6';
      row.innerHTML = '<div class="fixa-home-compact-filters-v6"></div><div class="fixa-home-compact-greeting-v6"></div>';
      actions.prepend(row);
    }
    return row;
  }

  function apply() {
    if (applying || !window.matchMedia('(min-width: 761px)').matches) return false;

    /* Quando o layout de referência está ativo, ele é o único dono do cabeçalho da Home.
       Isso impede dois scripts de moverem filtros/saudação alternadamente. */
    if (window.FixaHomeReferenceLayoutV2?.active) return false;

    const home = document.querySelector('#home.home-view');
    const hero = home?.querySelector('.home-hero-head');
    const actions = home?.querySelector('.home-hero-actions');
    const greeting = home?.querySelector('#homeGreeting');
    const date = home?.querySelector('#homeDatePill');
    const filters = home?.querySelector('.fixa-week-filters');
    if (!home || !hero || !actions || !greeting || !date || !filters) return false;

    applying = true;
    try {
      const row = ensureCompactRow(actions);
      const left = row.querySelector('.fixa-home-compact-filters-v6');
      const right = row.querySelector('.fixa-home-compact-greeting-v6');
      if (!left || !right) return false;

      if (filters.parentElement !== left) left.appendChild(filters);
      if (greeting.parentElement !== right) right.appendChild(greeting);
      if (date.parentElement !== right) right.appendChild(date);

      important(hero, 'min-height', '38px');
      important(hero, 'height', '38px');
      important(hero, 'margin', '-24px 0 3px');
      important(hero, 'padding', '0');
      important(hero, 'display', 'block');
      important(hero, 'overflow', 'visible');

      important(actions, 'position', 'relative');
      important(actions, 'width', '100%');
      important(actions, 'height', '38px');
      important(actions, 'min-height', '38px');
      important(actions, 'display', 'block');
      important(actions, 'margin', '0');
      important(actions, 'padding', '0');

      home.querySelectorAll('.fixa-home-header-row').forEach(oldRow => {
        if (oldRow !== row) important(oldRow, 'display', 'none');
      });
      home.querySelectorAll('.fixa-week-header-stack').forEach(stack => {
        important(stack, 'display', 'none');
        important(stack, 'height', '0');
        important(stack, 'min-height', '0');
        important(stack, 'margin', '0');
        important(stack, 'padding', '0');
      });

      important(row, 'position', 'relative');
      important(row, 'width', '100%');
      important(row, 'height', '38px');
      important(row, 'min-height', '38px');
      important(row, 'display', 'block');
      important(row, 'margin', '0');
      important(row, 'padding', '0 2px');
      important(row, 'box-sizing', 'border-box');

      important(left, 'position', 'absolute');
      important(left, 'top', '0');
      important(left, 'left', '2px');
      important(left, 'height', '38px');
      important(left, 'display', 'flex');
      important(left, 'align-items', 'center');
      important(left, 'justify-content', 'flex-start');
      important(left, 'margin', '0');
      important(left, 'padding', '0');

      important(filters, 'display', 'flex');
      important(filters, 'align-items', 'center');
      important(filters, 'justify-content', 'flex-start');
      important(filters, 'flex-wrap', 'nowrap');
      important(filters, 'margin', '0');
      important(filters, 'padding', '0');
      important(filters, 'transform', 'none');

      important(right, 'position', 'absolute');
      important(right, 'top', '6px');
      important(right, 'right', '2px');
      important(right, 'height', '32px');
      important(right, 'display', 'grid');
      important(right, 'align-content', 'start');
      important(right, 'justify-items', 'end');
      important(right, 'gap', '0');
      important(right, 'margin', '0');
      important(right, 'padding', '0');
      important(right, 'text-align', 'right');

      important(greeting, 'margin', '0');
      important(greeting, 'display', 'flex');
      important(greeting, 'align-items', 'center');
      important(greeting, 'justify-content', 'flex-end');
      important(greeting, 'text-align', 'right');
      important(greeting, 'white-space', 'nowrap');
      important(greeting, 'font-size', '17px');
      important(greeting, 'line-height', '19px');
      const wave = greeting.querySelector('.home-greeting-wave');
      important(wave, 'width', '17px');
      important(wave, 'height', '17px');

      important(date, 'margin', '0');
      important(date, 'text-align', 'right');
      important(date, 'white-space', 'nowrap');
      important(date, 'font-size', '9px');
      important(date, 'line-height', '11px');

      return true;
    } finally {
      applying = false;
    }
  }

  function schedule(delay = 0) {
    if (delay > 0) {
      window.setTimeout(() => schedule(0), delay);
      return;
    }
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function watch() {
    const root = document.querySelector('#home.home-view');
    if (!root || window.FixaHomeReferenceLayoutV2?.active) {
      observer?.disconnect();
      return;
    }
    observer?.disconnect();
    observer = new MutationObserver(() => schedule(0));
    observer.observe(root, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-fixa-main-tab]')) schedule(30);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) schedule(30);
  }, true);

  window.addEventListener('fixa-cloud-data-loaded', () => {
    watch();
    schedule(0);
    schedule(100);
    schedule(400);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      watch();
      schedule(20);
    }
  });

  window.addEventListener('resize', () => schedule(20));
  window.addEventListener('load', () => {
    watch();
    schedule(0);
    schedule(250);
    schedule(700);
    schedule(1500);
  }, { once: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    watch();
    apply();
    if (window.FixaHomeReferenceLayoutV2?.active || attempts >= 100) window.clearInterval(timer);
  }, 100);
})();

/* Ordem estável dos botões primários no desktop: Início — Competição | espaço | Questões — Teste. */
(() => {
  'use strict';
  if (document.getElementById('fixaPrimaryTopbarOrderStyleV2')) return;

  const style = document.createElement('style');
  style.id = 'fixaPrimaryTopbarOrderStyleV2';
  style.textContent = `
    @media (min-width: 761px) {
      .topbar-right .tabs [data-view="home"],
      .topbar-right .tabs #homeTopTab {
        order: 1 !important;
        margin-left: 0 !important;
      }

      .topbar-right .tabs [data-competition-view],
      .topbar-right .tabs [data-view="competition"] {
        order: 2 !important;
        margin-left: 0 !important;
      }

      .topbar-right .tabs [data-view="manage"] {
        order: 3 !important;
        margin-left: 28px !important;
      }

      .topbar-right .tabs [data-view="test"] {
        order: 4 !important;
        margin-left: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* Layout final aprovado da Home + estabilização dos indicadores.
   A grade visível recebe somente um valor já estabilizado, evitando alternância
   entre estados intermediários de carregamento de desempenho e XP. */
(() => {
  'use strict';
  if (window.FixaHomeApprovedReferenceV1) return;
  window.FixaHomeApprovedReferenceV1 = true;

  const STYLE_ID = 'fixaHomeApprovedReferenceStyleV1';
  const SOURCE_ID = 'homeSummaryCards';
  const STABLE_ID = 'fixaStableSummaryCards';
  const labels = ['Coleções', 'Questões', 'Dominadas', 'Aproveitamento', 'XP Coleções', 'XP Semana'];
  let sourceObserver = null;
  let sourceElement = null;
  let timer = 0;
  let lastSignature = '';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width:861px) {
        /* Filtros quase encostados na navegação principal, como na referência aprovada. */
        #home.home-view .home-hero-head{
          min-height:44px!important;
          height:44px!important;
          margin:-26px 0 4px!important;
          padding:0!important;
          overflow:visible!important;
        }
        #home.home-view .home-hero-actions{height:44px!important;min-height:44px!important;margin:0!important;padding:0!important}
        #home.home-view .fixa-reference-header-row{
          min-height:44px!important;
          height:44px!important;
          grid-template-columns:minmax(0,1fr) auto!important;
          align-items:start!important;
          gap:18px!important;
          overflow:visible!important;
        }
        #home.home-view .fixa-reference-header-left{
          align-items:flex-start!important;
          transform:translateY(-2px)!important;
        }
        #home.home-view .fixa-week-filters{gap:10px!important;margin:0!important;transform:none!important}
        #home.home-view .fixa-week-folder-filter,
        #home.home-view .fixa-reference-collection-filter{
          height:38px!important;
          min-height:38px!important;
          border-radius:9px!important;
          padding:0 10px!important;
        }
        #home.home-view .fixa-week-folder-filter{width:272px!important;min-width:272px!important}
        #home.home-view .fixa-reference-collection-filter{width:340px!important;min-width:340px!important}
        #home.home-view .fixa-week-folder-filter select,
        #home.home-view .fixa-reference-collection-filter select{height:36px!important;font-size:12px!important}

        /* Saudação menor e um pouco mais baixa, aproximando-a dos cards de XP. */
        #home.home-view .fixa-reference-header-right{
          min-width:210px!important;
          transform:translateY(10px)!important;
          gap:0!important;
        }
        #home.home-view .fixa-reference-header-right #homeGreeting{
          font-size:18px!important;
          line-height:20px!important;
        }
        #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave{width:18px!important;height:18px!important}
        #home.home-view .fixa-reference-header-right #homeDatePill{font-size:10px!important;line-height:12px!important}

        /* Mantém as opções visíveis como na imagem aprovada. */
        #home.home-view [data-fixa-week-period="week"]{display:inline-flex!important}
        #home.home-view [data-fixa-main-tab="activities"]{display:inline-flex!important}

        /* Resumo mais próximo dos filtros e sem qualquer animação/transição de valor. */
        #home.home-view #${STABLE_ID}{margin:0!important;gap:8px!important}
        #home.home-view #${STABLE_ID} .fixa-stable-summary-card{
          height:68px!important;
          min-height:68px!important;
          animation:none!important;
          transform:none!important;
          transition:border-color .15s ease,background-color .15s ease!important;
        }
        #home.home-view #${STABLE_ID} .fixa-stable-summary-value,
        #home.home-view #${STABLE_ID} .fixa-stable-summary-title,
        #home.home-view #${STABLE_ID} .fixa-stable-summary-caption{
          animation:none!important;
          transition:none!important;
        }
        #home.home-view .fixa-reference-period-row{margin:7px 0 8px!important;min-height:34px!important}
        #home.home-view .fixa-reference-period-row .fixa-week-period button{height:34px!important;min-height:34px!important}
        #home.home-view #homeFooterStats{margin-bottom:9px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function readSource() {
    const source = document.getElementById(SOURCE_ID);
    const data = {};
    if (!source) return data;
    source.querySelectorAll('.fixa-week-summary-card').forEach(card => {
      const label = (card.querySelector('strong')?.textContent || card.dataset.fixaSummaryKey || '').trim();
      if (!labels.includes(label)) return;
      data[label] = {
        value: (card.querySelector('.home-card-number')?.textContent || '').trim(),
        caption: (card.querySelector('small')?.textContent || '').trim()
      };
    });
    return data;
  }

  function signature(data) {
    return labels.map(label => `${label}:${data[label]?.value ?? ''}:${data[label]?.caption ?? ''}`).join('|');
  }

  function applyStable(data) {
    const stable = document.getElementById(STABLE_ID);
    if (!stable) return false;
    labels.forEach(label => {
      const sourceValue = data[label];
      if (!sourceValue || sourceValue.value === '') return;
      const card = Array.from(stable.querySelectorAll('.fixa-stable-summary-card')).find(item =>
        (item.querySelector('.fixa-stable-summary-title')?.textContent || '').trim() === label
      );
      if (!card) return;
      const value = card.querySelector('.fixa-stable-summary-value');
      const caption = card.querySelector('.fixa-stable-summary-caption');
      if (value && value.textContent !== sourceValue.value) value.textContent = sourceValue.value;
      if (caption && sourceValue.caption && caption.textContent !== sourceValue.caption) caption.textContent = sourceValue.caption;
    });
    return true;
  }

  function settleAndApply() {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const first = readSource();
      const firstSignature = signature(first);
      window.setTimeout(() => {
        const second = readSource();
        const secondSignature = signature(second);
        if (firstSignature !== secondSignature) {
          settleAndApply();
          return;
        }
        if (secondSignature !== lastSignature) {
          lastSignature = secondSignature;
          applyStable(second);
        }
      }, 120);
    }, 180);
  }

  function detachOldSourceObserver() {
    const current = document.getElementById(SOURCE_ID);
    if (!current || current.dataset.fixaStableSource === 'true') return current;

    /* O layout v3 observava diretamente a grade original. Ao substituí-la por um
       clone idêntico, o observador antigo fica ligado ao nó destacado e deixa de
       propagar cada estado intermediário para os cards visíveis. */
    const clone = current.cloneNode(true);
    clone.dataset.fixaStableSource = 'true';
    current.replaceWith(clone);
    return clone;
  }

  function watchSource() {
    const source = detachOldSourceObserver() || document.getElementById(SOURCE_ID);
    if (!source || source === sourceElement) return;
    sourceObserver?.disconnect();
    sourceElement = source;
    sourceObserver = new MutationObserver(settleAndApply);
    sourceObserver.observe(source, { childList:true, subtree:true, characterData:true });
    settleAndApply();
  }

  function sync() {
    ensureStyle();
    watchSource();
    settleAndApply();
  }

  window.addEventListener('load', () => {
    sync();
    window.setTimeout(sync, 350);
    window.setTimeout(sync, 1000);
  }, { once:true });
  window.addEventListener('fixa-cloud-data-loaded', sync);
  window.addEventListener('fixa-xp-updated', sync);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period],[data-fixa-main-tab]')) window.setTimeout(sync, 40);
  }, true);
  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter,#fixaReferenceCollectionFilter')) window.setTimeout(sync, 40);
  }, true);

  let attempts = 0;
  const boot = window.setInterval(() => {
    attempts += 1;
    sync();
    if ((window.FixaHomeReferenceLayoutV2?.active && document.getElementById(STABLE_ID)) || attempts >= 80) window.clearInterval(boot);
  }, 100);
})();
