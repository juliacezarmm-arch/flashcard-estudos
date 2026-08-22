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
      #testPanelHistory .test-history-card {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      #testPanelHistory .test-history-card > .section-heading {
        margin-bottom: 9px;
      }

      #testPanelHistory .history-list {
        max-height: none !important;
        min-height: 0;
        gap: 5px !important;
        overflow: visible !important;
        padding-right: 0 !important;
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
      #testPanelHistory .history-result {
        font-size: 11px !important;
        line-height: 1.35;
      }

      #testPanelHistory .history-result {
        color: #64748b;
      }

      #testPanelHistory .fixa-history-inline-xp {
        color: #2563eb;
        font-weight: 850;
      }

      @media (max-width: 700px) {
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

      row.querySelector('.fixa-history-secondary')?.remove();
      row.querySelector(':scope > .fixa-history-xp')?.remove();

      const score = Math.max(0, Number(item.score || 0));
      const total = Math.max(0, Number(item.total || 0));
      const errors = Math.max(0, total - score);
      const percent = total ? Math.round((score / total) * 100) : 0;
      const duration = compactDuration(item.durationMs);
      const hasXp = Object.prototype.hasOwnProperty.call(item, 'xp');
      const xp = Math.max(0, Number(item.xp || 0));

      const parts = [
        `${score} acertos`,
        `${errors} erros`,
        `${percent}% de aproveitamento`
      ];
      if (duration) parts.push(duration);

      const result = row.querySelector('.history-result');
      if (!result) return;

      const prefix = parts.join(' · ');
      const html = hasXp
        ? `${prefix} · <span class="fixa-history-inline-xp">+${xp} XP</span>`
        : prefix;
      if (result.innerHTML !== html) result.innerHTML = html;
    });
  }

  function refresh() {
    enhanceRows();
  }

  ensureStyle();

  let queued = false;
  function queueRefresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      refresh();
    });
  }

  const list = document.querySelector('#testHistory');
  if (list) {
    new MutationObserver(queueRefresh).observe(list, { childList: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-test-panel="history"], .tab[data-view="test"]')) queueRefresh();
  });
  window.addEventListener('fixa-cloud-data-loaded', queueRefresh);
  window.addEventListener('load', queueRefresh, { once: true });

  queueRefresh();
})();
