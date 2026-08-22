(() => {
  'use strict';
  if (window.FixaTestHistoryLayoutV1) return;
  window.FixaTestHistoryLayoutV1 = true;

  function appData() {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  }

  function historyItems() {
    return Array.isArray(appData()?.testHistory) ? appData().testHistory : [];
  }

  function compactDuration(ms) {
    const value = Number(ms || 0);
    if (!value || value < 0) return '';
    const totalSeconds = Math.max(0, Math.round(value / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}min ${seconds}s` : `${seconds}s`;
  }

  function ensureStyle() {
    if (document.getElementById('fixaTestHistoryLayoutV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaTestHistoryLayoutV1Style';
    style.textContent = `
      #testPanelHistory:not([hidden]) .test-history-card {
        height: var(--fixa-test-history-height, auto);
        min-height: 360px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #testPanelHistory .test-history-card > .section-heading {
        flex: 0 0 auto;
        margin-bottom: 10px;
      }

      #testPanelHistory .history-list {
        max-height: none !important;
        min-height: 0;
        flex: 1 1 auto;
        align-content: start;
        gap: 6px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding-right: 4px;
      }

      #testPanelHistory .history-item {
        gap: 2px !important;
        padding: 7px 9px !important;
        border-radius: 8px !important;
      }

      #testPanelHistory .history-item-header {
        align-items: center;
        gap: 10px;
      }

      #testPanelHistory .history-item strong {
        font-size: 13px !important;
        line-height: 1.25;
      }

      #testPanelHistory .history-date,
      #testPanelHistory .history-result,
      #testPanelHistory .fixa-history-secondary {
        font-size: 11px !important;
        line-height: 1.35;
      }

      #testPanelHistory .history-result {
        color: #64748b;
      }

      #testPanelHistory .fixa-history-secondary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        min-height: 15px;
        color: #7b879b;
      }

      #testPanelHistory .fixa-history-secondary .fixa-history-inline-xp {
        color: #2563eb;
        font-weight: 850;
      }

      #testPanelHistory .history-item > .fixa-history-xp {
        display: none !important;
      }

      @media (max-width: 700px) {
        #testPanelHistory:not([hidden]) .test-history-card {
          min-height: 320px;
        }
        #testPanelHistory .history-item-header {
          gap: 6px;
        }
        #testPanelHistory .history-date {
          font-size: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceRows() {
    const list = document.querySelector('#testPanelHistory #testHistory');
    if (!list) return;
    const items = historyItems();

    [...list.querySelectorAll('.history-item')].forEach((row, index) => {
      const item = items[index];
      if (!item) return;

      const score = Math.max(0, Number(item.score || 0));
      const total = Math.max(0, Number(item.total || 0));
      const errors = Math.max(0, total - score);
      const percent = total ? Math.round((score / total) * 100) : 0;
      const main = `${score} acertos · ${errors} erros · ${percent}% de aproveitamento`;

      const result = row.querySelector('.history-result');
      if (result && result.textContent !== main) result.textContent = main;

      let secondary = row.querySelector('.fixa-history-secondary');
      if (!secondary) {
        secondary = document.createElement('span');
        secondary.className = 'fixa-history-secondary';
        if (result) result.insertAdjacentElement('afterend', secondary);
        else row.appendChild(secondary);
      }

      const duration = compactDuration(item.durationMs);
      const hasXp = Object.prototype.hasOwnProperty.call(item, 'xp');
      const xp = hasXp ? Number(item.xp || 0) : null;
      const parts = [];
      if (duration) parts.push(`<span>${duration}</span>`);
      if (duration && hasXp) parts.push('<span aria-hidden="true">·</span>');
      if (hasXp) parts.push(`<span class="fixa-history-inline-xp">+${xp} XP</span>`);
      const html = parts.join('');
      if (secondary.innerHTML !== html) secondary.innerHTML = html;
    });
  }

  function fitHistoryCard() {
    const panel = document.querySelector('#testPanelHistory:not([hidden])');
    const testView = document.querySelector('#test.view.active, #test.active');
    const card = panel?.querySelector('.test-history-card');
    if (!panel || !testView || !card) return;

    const top = card.getBoundingClientRect().top;
    if (!Number.isFinite(top) || top <= 0) return;
    const bottomGap = 18;
    const available = Math.max(360, Math.floor(window.innerHeight - top - bottomGap));
    const next = `${available}px`;
    if (card.style.getPropertyValue('--fixa-test-history-height') !== next) {
      card.style.setProperty('--fixa-test-history-height', next);
    }
  }

  function refresh() {
    enhanceRows();
    fitHistoryCard();
  }

  ensureStyle();

  let queued = false;
  const queueRefresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      refresh();
    });
  };

  const observer = new MutationObserver(queueRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'class']
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-test-panel], .tab[data-view="test"]')) queueRefresh();
  });
  window.addEventListener('resize', queueRefresh);
  window.addEventListener('fixa-cloud-data-loaded', queueRefresh);
  window.addEventListener('load', queueRefresh, { once: true });

  queueRefresh();
})();
