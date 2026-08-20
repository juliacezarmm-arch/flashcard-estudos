(() => {
  'use strict';
  if (window.FixaCompetitionPositionCardV1) return;
  window.FixaCompetitionPositionCardV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionPositionCardV1Style';
  style.textContent = `
    .competition-v3 .cv3-area-position {
      padding: 20px 22px !important;
    }

    .competition-v3 .cv3-area-position .cv3-section-head {
      margin-bottom: 14px !important;
    }

    .competition-v3 .cv3-area-position .cv3-status {
      min-height: 28px;
      padding: 0 11px;
      border-radius: 999px;
      background: #ecfdf3;
      color: #15803d;
      font-size: 12px;
      font-weight: 800;
    }

    .competition-v3 .cv3-area-position .cv3-position {
      gap: 18px !important;
      margin: 12px 0 18px !important;
    }

    .competition-v3 .cv3-area-position .cv3-medal {
      width: 88px !important;
      height: 88px !important;
      border-radius: 50% !important;
      display: grid;
      place-items: center;
      background: #fff4dd !important;
      color: #f59e0b !important;
      box-shadow: none !important;
    }

    .competition-v3 .cv3-area-position .cv3-position-medal-svg {
      width: 54px;
      height: 54px;
      overflow: visible;
    }

    .competition-v3 .cv3-area-position .cv3-position-copy b {
      font-size: 39px !important;
      line-height: 1 !important;
      letter-spacing: -.02em;
      color: #172033 !important;
    }

    .competition-v3 .cv3-area-position .cv3-xp {
      margin-top: 8px !important;
      color: #1457ff !important;
      font-size: 18px !important;
      font-weight: 850 !important;
    }

    .competition-v3 .cv3-area-position .cv3-meta {
      margin-top: 2px;
      color: #66758d !important;
      font-size: 11.5px !important;
      line-height: 1.4;
    }

    .competition-v3 .cv3-area-position .cv3-note {
      margin: 14px 0 0 !important;
      color: #66758d !important;
      font-size: 11.5px !important;
      line-height: 1.45;
    }

    .competition-v3 .cv3-area-position .cv3-row-actions {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      gap: 12px !important;
      margin-top: 20px !important;
    }

    .competition-v3 .cv3-area-position .cv3-row-actions > button {
      width: 100% !important;
      min-height: 46px !important;
      justify-content: center !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      font-weight: 800 !important;
    }

    .competition-v3 .cv3-area-position .cv3-danger-soft {
      grid-column: 1 / -1 !important;
      justify-self: center !important;
      width: min(210px, 100%) !important;
      margin-inline: auto !important;
      border: 1px solid #ffb7b7 !important;
      background: #fffafa !important;
      color: #ed1c24 !important;
      box-shadow: none !important;
    }

    .competition-v3 .cv3-area-position .cv3-danger-soft:hover {
      background: #fff1f1 !important;
    }

    .competition-v3 .cv3-area-position [data-history] {
      border: 1px solid #d7e2f2 !important;
      background: #fff !important;
      color: #172033 !important;
      box-shadow: none !important;
    }

    .competition-v3 .cv3-area-position [data-history]:hover {
      background: #f8fafc !important;
    }

    .competition-v3 .cv3-area-ranking .cv3-rank-more {
      position: static !important;
      align-self: center !important;
      margin-top: 16px !important;
      margin-bottom: 2px !important;
      flex: 0 0 auto !important;
    }

    .competition-v3 .cv3-area-ranking .cv3-rank-list {
      padding-bottom: 4px !important;
    }

    @media (max-width: 700px) {
      .competition-v3 .cv3-area-position .cv3-row-actions {
        grid-template-columns: 1fr;
      }
      .competition-v3 .cv3-area-position .cv3-position-copy b {
        font-size: 34px !important;
      }
      .competition-v3 .cv3-area-position .cv3-medal {
        width: 80px !important;
        height: 80px !important;
      }
    }
  `;
  document.head.appendChild(style);

  const medalSvg = `
    <svg class="cv3-position-medal-svg" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M22 35 18 58l10-6 4 7 4-7 10 6-4-23" fill="#f0441f"/>
      <circle cx="32" cy="27" r="18" fill="#ffb21a"/>
      <circle cx="32" cy="27" r="13" fill="#fff0bb"/>
      <path d="m32 16 3.3 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.6-3.5-6.6 3.5 1.3-7.3-5.3-5.2 7.3-1.1Z" fill="#ff8a00"/>
      <circle cx="32" cy="27" r="18" fill="none" stroke="#ff8a00" stroke-width="2"/>
    </svg>`;

  function apply() {
    document.querySelectorAll('.competition-v3 .cv3-area-position .cv3-medal').forEach(el => {
      if (el.dataset.positionMedalV1 === '1') return;
      el.dataset.positionMedalV1 = '1';
      el.innerHTML = medalSvg;
    });
  }

  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  };

  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  queue();
})();