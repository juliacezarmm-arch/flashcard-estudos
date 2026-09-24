/* Primeira linha da Home: compactação responsiva e selects com menu arredondado.
   Mantém os selects nativos como fonte de verdade para não alterar a lógica existente. */
(() => {
  'use strict';

  if (window.FixaHomeHeaderFirstRowPolishV1) return;
  window.FixaHomeHeaderFirstRowPolishV1 = true;

  const STYLE_ID = 'fixaHomeHeaderFirstRowPolishV1Style';
  const SMALL_DESKTOP = 1250;
  let syncing = false;
  let frame = 0;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width: 761px) {
        #home.home-view .fixa-reference-header-row {
          transform: translateY(-5px) !important;
        }

        #home.home-view .home-hero-head {
          margin-bottom: 0 !important;
        }
      }

      #home.home-view .fixa-week-folder-filter,
      #home.home-view .fixa-reference-collection-filter {
        position: relative !important;
        overflow: visible !important;
      }

      #home.home-view .fixa-week-folder-filter > select.fixa-native-select-hidden,
      #home.home-view .fixa-reference-collection-filter > select.fixa-native-select-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        min-width: 1px !important;
        min-height: 1px !important;
        margin: 0 !important;
        padding: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
        clip: rect(0 0 0 0) !important;
        clip-path: inset(50%) !important;
      }

      #home.home-view .fixa-rounded-select-trigger {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        height: 34px !important;
        margin: 0 !important;
        padding: 0 2px 0 0 !important;
        border: 0 !important;
        outline: 0 !important;
        background: transparent !important;
        color: #26324b !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        font: inherit !important;
        font-size: 12px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        text-align: left !important;
        cursor: pointer !important;
        box-shadow: none !important;
      }

      #home.home-view .fixa-rounded-select-trigger > span {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      #home.home-view .fixa-rounded-select-trigger > svg {
        width: 15px !important;
        height: 15px !important;
        min-width: 15px !important;
        flex: 0 0 15px !important;
        fill: none !important;
        stroke: #64748b !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        transition: transform .16s ease !important;
      }

      #home.home-view .fixa-rounded-select-host.is-open .fixa-rounded-select-trigger > svg {
        transform: rotate(180deg) !important;
      }

      #home.home-view .fixa-rounded-select-menu {
        position: absolute !important;
        left: -1px !important;
        right: -1px !important;
        top: calc(100% + 7px) !important;
        z-index: 5000 !important;
        max-height: 280px !important;
        padding: 6px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        border: 1px solid #d9e3f1 !important;
        border-radius: 13px !important;
        background: rgba(255,255,255,.985) !important;
        box-shadow: 0 16px 38px rgba(15,23,42,.16) !important;
        scrollbar-width: thin !important;
        scrollbar-color: #b7c2d2 transparent !important;
      }

      #home.home-view .fixa-rounded-select-menu[hidden] {
        display: none !important;
      }

      #home.home-view .fixa-rounded-select-option {
        width: 100% !important;
        min-height: 34px !important;
        padding: 7px 10px !important;
        border: 0 !important;
        border-radius: 9px !important;
        display: flex !important;
        align-items: center !important;
        color: #334155 !important;
        background: transparent !important;
        font-size: 11.5px !important;
        line-height: 15px !important;
        font-weight: 720 !important;
        text-align: left !important;
        cursor: pointer !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        box-shadow: none !important;
      }

      #home.home-view .fixa-rounded-select-option:hover,
      #home.home-view .fixa-rounded-select-option:focus-visible {
        background: #f1f6ff !important;
        color: #1d4ed8 !important;
        outline: none !important;
      }

      #home.home-view .fixa-rounded-select-option[aria-selected="true"] {
        background: #eaf2ff !important;
        color: #155be8 !important;
        font-weight: 850 !important;
      }

      @media (max-width: ${SMALL_DESKTOP}px) and (min-width: 761px) {
        #home.home-view .fixa-reference-header-right {
          min-width: 190px !important;
        }

        #home.home-view .fixa-reference-header-right #homeGreeting {
          bottom: 18px !important;
          font-size: 18px !important;
          line-height: 21px !important;
          gap: 4px !important;
        }

        #home.home-view .fixa-reference-header-right #homeGreeting .home-greeting-wave {
          width: 17px !important;
          height: 17px !important;
        }

        #home.home-view .fixa-reference-header-right #homeDatePill {
          font-size: 11px !important;
          line-height: 14px !important;
        }

        #home.home-view .fixa-week-folder-filter {
          width: 220px !important;
          min-width: 190px !important;
        }

        #home.home-view .fixa-reference-collection-filter {
          width: 270px !important;
          min-width: 220px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function closeMenus(exceptHost = null) {
    document.querySelectorAll('#home .fixa-rounded-select-host.is-open').forEach(host => {
      if (host === exceptHost) return;
      host.classList.remove('is-open');
      const trigger = host.querySelector('.fixa-rounded-select-trigger');
      const menu = host.querySelector('.fixa-rounded-select-menu');
      trigger?.setAttribute('aria-expanded', 'false');
      if (menu) menu.hidden = true;
    });
  }

  function selectedText(select) {
    const option = select?.options?.[select.selectedIndex];
    return option?.textContent?.trim() || '';
  }

  function rebuildMenu(select, host, menu) {
    if (!select || !host || !menu) return;
    const signature = Array.from(select.options).map(option => option.value + ':' + option.textContent).join('|');
    if (menu.dataset.signature === signature && menu.dataset.value === select.value) return;

    menu.dataset.signature = signature;
    menu.dataset.value = select.value;
    menu.innerHTML = '';

    Array.from(select.options).forEach(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fixa-rounded-select-option';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(option.value === select.value));
      button.dataset.value = option.value;
      button.textContent = option.textContent || '';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (select.value !== option.value) {
          select.value = option.value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        syncCustomSelect(select);
        closeMenus();
      });
      menu.appendChild(button);
    });
  }

  function syncCustomSelect(select) {
    if (!select) return;
    const host = select.closest('.fixa-rounded-select-host');
    const trigger = host?.querySelector('.fixa-rounded-select-trigger');
    const menu = host?.querySelector('.fixa-rounded-select-menu');
    if (!host || !trigger || !menu) return;

    const label = selectedText(select);
    const text = trigger.querySelector('span');
    if (text && text.textContent !== label) text.textContent = label;
    rebuildMenu(select, host, menu);
  }

  function mountSelect(select) {
    if (!select) return;
    const host = select.parentElement;
    if (!host) return;

    host.classList.add('fixa-rounded-select-host');
    select.classList.add('fixa-native-select-hidden');
    select.tabIndex = -1;

    let trigger = host.querySelector(':scope > .fixa-rounded-select-trigger');
    let menu = host.querySelector(':scope > .fixa-rounded-select-menu');

    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'fixa-rounded-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = '<span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"></path></svg>';
      host.appendChild(trigger);
    }

    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'fixa-rounded-select-menu';
      menu.setAttribute('role', 'listbox');
      menu.hidden = true;
      host.appendChild(menu);
    }

    if (!trigger.dataset.fixaBound) {
      trigger.dataset.fixaBound = '1';
      trigger.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const opening = !host.classList.contains('is-open');
        closeMenus(host);
        host.classList.toggle('is-open', opening);
        trigger.setAttribute('aria-expanded', String(opening));
        menu.hidden = !opening;
        if (opening) {
          rebuildMenu(select, host, menu);
          requestAnimationFrame(() => menu.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true }));
        }
      });

      trigger.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeMenus();
          trigger.focus();
        }
      });
    }

    syncCustomSelect(select);
  }

  const monthMap = {
    janeiro:'01', fevereiro:'02', março:'03', marco:'03', abril:'04',
    maio:'05', junho:'06', julho:'07', agosto:'08', setembro:'09',
    outubro:'10', novembro:'11', dezembro:'12'
  };

  function compactDateText(text) {
    const match = String(text || '').trim().match(/^Semana de\s+(\d{1,2})\s+a\s+(\d{1,2})\s+de\s+([A-Za-zÀ-ÿ]+)\s+de\s+(\d{4})$/i);
    if (!match) return text;
    const month = monthMap[match[3].toLowerCase()];
    if (!month) return text;
    return 'Semana de ' + match[1] + ' a ' + match[2] + '/' + month + '/' + match[4];
  }

  function syncDate() {
    const date = document.querySelector('#home.home-view #homeDatePill');
    if (!date) return;

    const current = (date.textContent || '').trim();
    if (/^Semana de\s+\d{1,2}\s+a\s+\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}$/i.test(current)) {
      date.dataset.fixaFullDate = current;
    }

    const full = date.dataset.fixaFullDate || current;
    const wanted = window.innerWidth <= SMALL_DESKTOP ? compactDateText(full) : full;
    if (wanted && current !== wanted) date.textContent = wanted;
  }

  function sync() {
    frame = 0;
    if (syncing) return;
    syncing = true;
    try {
      ensureStyle();
      mountSelect(document.querySelector('#fixaWeekFolderFilter'));
      mountSelect(document.querySelector('#fixaReferenceCollectionFilter'));
      syncDate();
    } finally {
      syncing = false;
    }
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('.fixa-rounded-select-host')) closeMenus();
    schedule();
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches?.('#fixaWeekFolderFilter, #fixaReferenceCollectionFilter')) {
      requestAnimationFrame(() => {
        syncCustomSelect(event.target);
        schedule();
      });
    }
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenus();
  });

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('fixa-cloud-data-loaded', schedule);
  window.addEventListener('load', schedule, { once: true });

  const root = document.querySelector('#home') || document.body;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true });

  schedule();
})();