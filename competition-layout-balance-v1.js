(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      .competition-v3 .cv3-dashboard {
        align-items: stretch !important;
      }

      .competition-v3 .cv3-area-position,
      .competition-v3 .cv3-area-ranking,
      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        height: 100%;
        box-sizing: border-box;
      }

      /* Ranking acompanha exatamente a altura de Minha posição. */
      .competition-v3 .cv3-area-ranking {
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
      }

      .competition-v3 .cv3-area-ranking .cv3-section-head {
        flex: 0 0 auto;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 212px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 3px;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar {
        width: 6px;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 999px;
      }

      /* Segunda linha: desempenho e convite terminam na mesma altura. */
      .competition-v3 .cv3-area-performance,
      .competition-v3 .cv3-area-invite {
        min-height: 158px !important;
      }

      .competition-v3 .cv3-area-performance {
        display: flex !important;
        flex-direction: column !important;
      }

      .competition-v3 .cv3-area-performance .cv3-stats {
        flex: 1 1 auto;
        align-items: stretch;
      }

      .competition-v3 .cv3-area-performance .cv3-stat {
        height: 100%;
        min-height: 82px !important;
      }

      .competition-v3 .cv3-area-invite {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) auto;
        grid-template-rows: auto auto 1fr;
        column-gap: 10px;
        align-items: start;
      }

      .competition-v3 .cv3-area-invite > h3 {
        grid-column: 1;
        grid-row: 1;
        align-self: center;
      }

      .competition-v3 .cv3-area-invite > .cv3-muted {
        grid-column: 1 / -1;
        grid-row: 2;
        margin: 3px 0 8px !important;
      }

      .competition-v3 .cv3-area-invite .cv3-code {
        grid-column: 1 / -1;
        grid-row: 3;
        align-self: start;
        margin: 0 !important;
        padding: 6px !important;
        min-height: 46px;
      }

      .competition-v3 .cv3-area-invite .cv3-code strong {
        min-height: 34px !important;
        padding: 0 10px !important;
        font-size: 14px !important;
      }

      /* Botões compactos no cabeçalho do convite. */
      .competition-v3 .cv3-area-invite .cv3-invite-actions {
        grid-column: 2;
        grid-row: 1;
        display: flex !important;
        gap: 6px !important;
        margin: 0 !important;
        justify-self: end;
      }

      .competition-v3 .cv3-area-invite .cv3-invite-actions .tab,
      .competition-v3 .cv3-area-invite .cv3-header-copy-btn {
        min-height: 30px !important;
        height: 30px !important;
        padding: 0 9px !important;
        border-radius: 8px !important;
        font-size: 10.5px !important;
        font-weight: 700 !important;
      }

      .competition-v3 .cv3-area-invite .cv3-invite-actions .cv3-icon,
      .competition-v3 .cv3-area-invite .cv3-header-copy-btn .cv3-icon {
        width: 13px !important;
        height: 13px !important;
      }

      /* Regras sobe porque o convite fica menor. */
      .competition-v3 .cv3-area-rules {
        margin-top: 0 !important;
      }
    }

    @media (max-width: 760px) {
      .competition-v3 .cv3-area-ranking .cv3-rank-list {
        max-height: 240px;
        overflow-y: auto;
      }
    }
  `;
  document.head.appendChild(style);

  const copyIcon = `<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

  function compactInvite() {
    const invite = document.querySelector('.competition-v3 .cv3-area-invite');
    if (!invite) return;

    let actions = invite.querySelector('.cv3-invite-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'cv3-invite-actions';
      invite.appendChild(actions);
    }

    const share = invite.querySelector('[data-share]');
    if (share && share.parentElement !== actions) actions.appendChild(share);

    let headerCopy = actions.querySelector('.cv3-header-copy-btn');
    if (!headerCopy) {
      headerCopy = document.createElement('button');
      headerCopy.type = 'button';
      headerCopy.className = 'tab cv3-header-copy-btn';
      headerCopy.innerHTML = `${copyIcon}<span>Copiar</span>`;
      headerCopy.addEventListener('click', () => {
        const original = invite.querySelector('[data-copy]');
        if (original) original.click();
      });
      actions.prepend(headerCopy);
    }

    const originalCopy = invite.querySelector('.cv3-code [data-copy]');
    if (originalCopy) originalCopy.style.display = 'none';

    if (share) {
      const span = share.querySelector('span');
      if (span) span.textContent = 'Compartilhar';
      else share.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.textContent = ' Compartilhar';
      });
    }
  }

  let queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      compactInvite();
    });
  }

  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  queue();
})();