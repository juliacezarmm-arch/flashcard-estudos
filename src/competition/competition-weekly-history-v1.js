(() => {
  'use strict';
  if (window.FixaCompetitionWeeklyHistoryV1) return;
  window.FixaCompetitionWeeklyHistoryV1 = true;

  let currentCompetitionId = '';

  function client() {
    try { return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); }
    catch (_) { return null; }
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function fmt(value) {
    if (!value) return '—';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR');
  }

  function competitionId() {
    return String(
      currentCompetitionId ||
      document.querySelector('.competition-v3.active #cv3select')?.value ||
      localStorage.getItem('fixa-selected-competition') ||
      ''
    );
  }

  function ensureStyle() {
    if (document.getElementById('fixaCompetitionWeeklyHistoryV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaCompetitionWeeklyHistoryV1Style';
    style.textContent = `
      .cv3-history-button{min-height:42px;border:1px solid #d7e2f2!important;border-radius:9px!important;padding:9px 14px!important;display:inline-flex!important;align-items:center!important;gap:7px!important;background:#fff!important;color:#334155!important;font-weight:800!important;box-shadow:none!important}
      .cv3-history-button:hover{border-color:#bfdbfe!important;background:#eff6ff!important;color:#1d4ed8!important}
      .fixa-week-history-bg{position:fixed;inset:0;z-index:1320;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.42);backdrop-filter:blur(2px)}
      .fixa-week-history-modal{width:min(650px,calc(100vw - 28px));max-height:min(86vh,780px);overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.25);display:grid;grid-template-rows:auto minmax(0,1fr)}
      .fixa-week-history-head{padding:17px 19px;border-bottom:1px solid #e5eaf2;display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
      .fixa-week-history-head h3{margin:0;color:#172033;font-size:18px}.fixa-week-history-head p{margin:5px 0 0;color:#64748b;font-size:11px;line-height:1.45}
      .fixa-week-history-close{width:34px;height:34px;padding:0!important;border:0!important;border-radius:9px!important;display:grid!important;place-items:center!important;background:#f1f5f9!important;color:#475569!important;font-size:22px!important;line-height:1!important}
      .fixa-week-history-body{overflow:auto;padding:15px 18px 18px;display:grid;gap:9px;align-content:start}
      .fixa-week-history-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:11px;align-items:center;padding:12px 13px;border:1px solid #e1e8f2;border-radius:11px;background:#fff}
      .fixa-week-history-medal{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff7db;font-size:17px}
      .fixa-week-history-copy strong{display:block;color:#172033;font-size:12px}.fixa-week-history-copy small{display:block;margin-top:3px;color:#64748b;font-size:10px}
      .fixa-week-history-winner{text-align:right;color:#334155;font-size:11px;font-weight:800}.fixa-week-history-winner b{display:block;color:#2563eb;font-size:12px}.fixa-week-history-empty{padding:30px 12px;text-align:center;color:#64748b;font-size:12px;line-height:1.5}
      @media(max-width:640px){.fixa-week-history-row{grid-template-columns:auto 1fr}.fixa-week-history-winner{grid-column:2;text-align:left}.cv3-history-button{width:100%;justify-content:center!important}}
    `;
    document.head.appendChild(style);
  }

  function closeModal() {
    document.querySelector('.fixa-week-history-bg')?.remove();
  }

  function mountModal(bodyHtml) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'fixa-week-history-bg';
    bg.innerHTML = `<section class="fixa-week-history-modal" role="dialog" aria-modal="true"><header class="fixa-week-history-head"><div><h3>Histórico da competição</h3><p>Vencedores das semanas já concluídas desta competição.</p></div><button type="button" class="fixa-week-history-close" aria-label="Fechar">×</button></header><div class="fixa-week-history-body">${bodyHtml}</div></section>`;
    document.body.appendChild(bg);
    bg.querySelector('.fixa-week-history-close')?.addEventListener('click', closeModal);
    bg.addEventListener('click', event => { if (event.target === bg) closeModal(); });
    return bg;
  }

  async function openHistory() {
    const id = competitionId();
    const sb = client();
    if (!id || !sb?.rpc) return;

    const modal = mountModal('<div class="fixa-week-history-empty">Carregando histórico...</div>');
    const { data, error } = await sb.rpc('get_competition_weekly_history', { p_competition_id: id });
    const body = modal.querySelector('.fixa-week-history-body');
    if (!body) return;

    if (error) {
      body.innerHTML = `<div class="fixa-week-history-empty">${esc(error.message || 'Não foi possível carregar o histórico.')}</div>`;
      return;
    }

    const items = Array.isArray(data) ? data : [];
    if (!items.length) {
      body.innerHTML = '<div class="fixa-week-history-empty">Ainda não há nenhuma semana concluída nesta competição.</div>';
      return;
    }

    body.innerHTML = items.map(item => {
      const winner = item.winner_name
        ? `<div class="fixa-week-history-winner"><b>🏆 ${esc(item.winner_name)}</b>${Number(item.winner_xp || 0)} XP</div>`
        : '<div class="fixa-week-history-winner">Sem vencedor<br><span>0 XP</span></div>';
      return `<article class="fixa-week-history-row"><div class="fixa-week-history-medal">🏆</div><div class="fixa-week-history-copy"><strong>Semana ${Number(item.week_number || 0)}</strong><small>${fmt(item.starts_at)} a ${fmt(item.ends_at)}</small></div>${winner}</article>`;
    }).join('');
  }

  function ensureButton() {
    const position = document.querySelector('.competition-v3.active .cv3-area-position');
    if (!position || !competitionId()) return;
    let row = position.querySelector('.cv3-row-actions');
    if (!row) {
      row = document.createElement('div');
      row.className = 'cv3-row-actions';
      row.style.marginTop = '18px';
      position.appendChild(row);
    }
    if (row.querySelector('[data-competition-week-history]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cv3-history-button';
    button.dataset.competitionWeekHistory = '1';
    button.textContent = 'Histórico da competição';
    button.addEventListener('click', openHistory);
    row.appendChild(button);
  }

  ensureStyle();
  window.addEventListener('fixa-competition-detail-rendered', event => {
    currentCompetitionId = String(event.detail?.competitionId || '');
    requestAnimationFrame(ensureButton);
  });

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      ensureButton();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', () => setTimeout(ensureButton, 700), { once: true });
})();