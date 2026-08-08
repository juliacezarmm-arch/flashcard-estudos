(() => {
  'use strict';
  if (window.FixaCompetitionLayoutBalanceV1) return;
  window.FixaCompetitionLayoutBalanceV1 = true;

  const style = document.createElement('style');
  style.id = 'competitionLayoutBalanceV1Style';
  style.textContent = `
    @media (min-width: 761px) {
      .competition-v3 .cv3-hero { padding:16px 18px!important; gap:18px!important; }
      .competition-v3 .cv3-hero-icon { width:64px!important; height:64px!important; border-radius:18px!important; }
      .competition-v3 .cv3-hero-icon .cv3-icon { width:32px!important; height:32px!important; }
      .competition-v3 .cv3-hero-copy h2 { margin-bottom:5px!important; font-size:25px!important; }
      .competition-v3 .cv3-hero-copy p { font-size:11px!important; line-height:1.4!important; }
      .competition-v3 .cv3-hero-tools select { min-height:40px!important; }
      .competition-v3 .cv3-dashboard { align-items:stretch!important; }
      .competition-v3 .cv3-area-position,.competition-v3 .cv3-area-ranking,.competition-v3 .cv3-area-performance,.competition-v3 .cv3-area-invite { height:100%; box-sizing:border-box; }
      .competition-v3 .cv3-area-ranking { display:flex!important; flex-direction:column!important; min-height:0!important; }
      .competition-v3 .cv3-area-ranking .cv3-section-head { flex:0 0 auto; }
      .competition-v3 .cv3-area-ranking .cv3-rank-list { flex:1 1 auto; min-height:0; max-height:212px; overflow-y:auto; overflow-x:hidden; padding-right:3px; display:grid!important; align-content:start!important; grid-auto-rows:max-content!important; scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent; }
      .competition-v3 .cv3-area-ranking .cv3-rank { min-height:52px!important; height:auto!important; align-self:start!important; }
      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar { width:6px; }
      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar-track { background:transparent; }
      .competition-v3 .cv3-area-ranking .cv3-rank-list::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
      .competition-v3 .cv3-area-performance,.competition-v3 .cv3-area-invite { min-height:158px!important; }
      .competition-v3 .cv3-area-performance { display:flex!important; flex-direction:column!important; }
      .competition-v3 .cv3-area-performance .cv3-stats { flex:1 1 auto; align-items:stretch; }
      .competition-v3 .cv3-area-performance .cv3-stat { height:100%; min-height:82px!important; }
      .competition-v3 .cv3-area-invite { display:grid!important; grid-template-columns:minmax(0,1fr) auto; grid-template-rows:auto auto 1fr; column-gap:10px; align-items:start; }
      .competition-v3 .cv3-area-invite > h3 { grid-column:1; grid-row:1; align-self:center; }
      .competition-v3 .cv3-area-invite > .cv3-muted { grid-column:1/-1; grid-row:2; margin:3px 0 8px!important; }
      .competition-v3 .cv3-area-invite .cv3-code { grid-column:1/-1; grid-row:3; align-self:start; margin:0!important; padding:6px!important; min-height:46px; }
      .competition-v3 .cv3-area-invite .cv3-code strong { min-height:34px!important; padding:0 10px!important; font-size:14px!important; }
      .competition-v3 .cv3-area-invite .cv3-invite-actions { grid-column:2; grid-row:1; display:flex!important; gap:6px!important; margin:0!important; justify-self:end; }
      .competition-v3 .cv3-area-invite .cv3-invite-actions .tab,.competition-v3 .cv3-area-invite .cv3-header-copy-btn { min-height:30px!important; height:30px!important; padding:0 9px!important; border-radius:8px!important; font-size:10.5px!important; font-weight:700!important; }
      .competition-v3 .cv3-area-invite .cv3-invite-actions .cv3-icon,.competition-v3 .cv3-area-invite .cv3-header-copy-btn .cv3-icon { width:13px!important; height:13px!important; }
      .competition-v3 .cv3-area-rules { margin-top:0!important; }
    }

    @media (max-width:760px) {
      .competition-v3 .cv3-area-ranking .cv3-rank-list { max-height:240px; overflow-y:auto; align-content:start!important; grid-auto-rows:max-content!important; }
    }

    .competition-v3 .cv7-empty-mark {
      width:76px!important;
      height:76px!important;
      border-radius:50%!important;
      display:grid!important;
      place-items:center!important;
      background:#eef4ff!important;
      color:#2563eb!important;
      font-size:0!important;
    }
    .competition-v3 .cv7-empty-mark svg { width:38px; height:38px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }

    body.fixa-desktop-compact .competition-v3 .cv7-manager { gap:8px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-manager-head { padding:10px 13px!important; border-radius:12px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-manager-head h2 { margin-bottom:2px!important; font-size:17px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-manager-head p { font-size:9px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-empty { min-height:165px!important; padding:16px!important; gap:5px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-empty-mark { width:54px!important; height:54px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-empty-mark svg { width:27px!important; height:27px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-empty h3 { font-size:14px!important; }
    body.fixa-desktop-compact .competition-v3 .cv7-empty p { font-size:9px!important; line-height:1.35!important; }
  `;
  document.head.appendChild(style);

  const copyIcon = `<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const trophyIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4M9 20h6M10 16h4v4h-4z"/></svg>`;

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
  }

  function standardizeEmptyState() {
    document.querySelectorAll('.competition-v3 .cv7-empty-mark').forEach(mark => {
      if (mark.dataset.fixaStandardTrophy === '1') return;
      mark.dataset.fixaStandardTrophy = '1';
      mark.innerHTML = trophyIcon;
    });
  }

  function apply() {
    compactInvite();
    standardizeEmptyState();
  }

  function burst() {
    [0,80,250,650].forEach(delay => window.setTimeout(() => requestAnimationFrame(apply), delay));
  }

  window.addEventListener('load', burst, { once:true });
  document.addEventListener('click', event => {
    if (event.target.closest('.competition-v3, [data-competition-view="v3"]')) burst();
  }, true);
  burst();
})();

/* Ajuste automático da Competição à altura útil da tela desktop. */
(() => {
  'use strict';
  if (window.FixaCompetitionViewportFitV1) return;
  window.FixaCompetitionViewportFitV1 = true;

  let queued = false;
  let lastZoom = 1;

  function activeCompetition() {
    return document.querySelector('.competition-v3.active');
  }

  function clearFit(view) {
    if (!view) return;
    view.style.removeProperty('zoom');
    view.dataset.fixaViewportZoom = '1';
    lastZoom = 1;
  }

  function fitCompetition() {
    const view = activeCompetition();
    if (!view) return;

    /* Celular será tratado em etapa própria. */
    if (window.innerWidth < 861) {
      clearFit(view);
      return;
    }

    view.style.zoom = '1';
    const rect = view.getBoundingClientRect();
    const availableHeight = Math.max(420, window.innerHeight - rect.top - 8);
    const contentHeight = Math.max(view.scrollHeight, view.getBoundingClientRect().height);

    if (!contentHeight || contentHeight <= availableHeight + 3) {
      clearFit(view);
      return;
    }

    const raw = availableHeight / contentHeight;
    const zoom = Math.max(0.72, Math.min(1, Math.floor(raw * 100) / 100));

    if (Math.abs(zoom - lastZoom) > 0.005) {
      view.style.zoom = String(zoom);
      view.dataset.fixaViewportZoom = String(zoom);
      lastZoom = zoom;
    } else {
      view.style.zoom = String(lastZoom);
    }
  }

  function queueFit() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fitCompetition();
    });
  }

  function fitBurst() {
    [0,80,220,500,1000,1600].forEach(delay => window.setTimeout(queueFit, delay));
  }

  window.addEventListener('resize', queueFit, { passive:true });
  window.addEventListener('orientationchange', fitBurst, { passive:true });
  window.addEventListener('pageshow', fitBurst, { passive:true });
  window.addEventListener('load', fitBurst, { once:true });

  document.addEventListener('click', event => {
    if (event.target.closest('.competition-v3, [data-competition-view="v3"]')) fitBurst();
  }, true);

  fitBurst();
})();