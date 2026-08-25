(() => {
  'use strict';
  if (window.FixaCompetitionFlagReviewV1) return;
  window.FixaCompetitionFlagReviewV1 = true;

  const state = {
    competitions: new Map(),
    items: new Map(),
    folders: new Map(),
    syncing: false,
    lastSync: 0
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function client() {
    try { return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); }
    catch (_) { return null; }
  }

  function currentUserId() {
    try { return String(window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : '') || ''); }
    catch (_) { return ''; }
  }

  function selectedCompetitionId() {
    return String(
      document.querySelector('.competition-v3.active #cv3select')?.value ||
      window.FixaCompetitionSelection?.get?.() ||
      ''
    );
  }

  function selectedCompetition() {
    return state.competitions.get(selectedCompetitionId()) || null;
  }

  function sharedFolderCard() {
    return document.querySelector('.competition-v3.active .cv3-area-folder');
  }

  function participantFlaggedItems(competitionId) {
    const uid = currentUserId();
    const rows = state.items.get(String(competitionId || '')) || [];
    return rows.filter(item => {
      const reporters = Array.isArray(item?.reporters) ? item.reporters : [];
      if (reporters.length) return reporters.some(person => String(person?.user_id || '') !== uid);
      return !item?.reported_by_me || Number(item?.reporter_count || 0) > 1;
    });
  }

  function questionKey(card) {
    return String(card?.questionCode || card?.id || `${card?.q || ''}|${card?.correctAnswerText || card?.a || ''}`);
  }

  function ensureStyle() {
    if (document.getElementById('fixaCompetitionFlagReviewV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaCompetitionFlagReviewV1Style';
    style.textContent = `
      .fixa-participant-flags-summary{width:100%;margin-top:9px;border:1px solid #fed7aa!important;border-radius:9px!important;padding:8px 10px!important;display:flex!important;align-items:center!important;gap:7px!important;justify-content:flex-start!important;background:#fff7ed!important;color:#c2410c!important;font-size:11px!important;font-weight:850!important;box-shadow:none!important}
      .fixa-participant-flags-summary:hover{background:#ffedd5!important}
      .fixa-flag-review-modal{position:fixed;inset:0;z-index:1300;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.42);backdrop-filter:blur(2px)}
      .fixa-flag-review-dialog{width:min(760px,calc(100vw - 28px));max-height:min(88vh,820px);overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.25);display:grid;grid-template-rows:auto minmax(0,1fr)}
      .fixa-flag-review-head{padding:16px 18px;border-bottom:1px solid #e5eaf2;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .fixa-flag-review-head h3{margin:0;color:#172033;font-size:18px}.fixa-flag-review-head p{margin:5px 0 0;color:#64748b;font-size:12px;line-height:1.45}
      .fixa-flag-review-close{width:34px;height:34px;padding:0!important;border:0!important;border-radius:9px!important;display:grid;place-items:center;background:#f1f5f9!important;color:#475569!important;font-size:22px!important;line-height:1!important;flex:0 0 34px}
      .fixa-flag-review-body{overflow:auto;padding:16px 18px 18px;display:grid;gap:10px;align-content:start}
      .fixa-flag-review-row{border:1px solid #e1e8f2;border-radius:11px;padding:12px 13px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;background:#fff}
      .fixa-flag-review-row strong{color:#172033;font-size:13px}.fixa-flag-review-row p{grid-column:1/-1;margin:0;color:#64748b;font-size:11px;line-height:1.45}.fixa-flag-review-row small{color:#b45309;font-size:10px;font-weight:800}
      .fixa-flag-review-view{min-height:32px!important;padding:6px 11px!important;font-size:11px!important;font-weight:850!important}
      .fixa-flag-question{display:grid;gap:14px}.fixa-flag-question-meta{display:flex;flex-wrap:wrap;gap:7px}.fixa-flag-chip{padding:4px 7px;border:1px solid #dbe6f5;border-radius:999px;background:#f8fafc;color:#475569;font-size:10px;font-weight:800}
      .fixa-flag-question-text{border:1px solid #e1e8f2;border-radius:12px;padding:15px 16px;background:#fff;color:#172033;font-size:14px;line-height:1.55;white-space:pre-wrap}
      .fixa-flag-question-image{max-width:min(100%,640px);max-height:360px;margin:0 auto;display:block;object-fit:contain;border-radius:10px}
      .fixa-flag-options{display:grid;gap:7px}.fixa-flag-option{border:1px solid #e1e8f2;border-radius:9px;padding:10px 12px;background:#f8fafc;color:#334155;font-size:12px;line-height:1.45}
      .fixa-flag-answer{border:1px solid #bbf7d0;border-radius:10px;padding:11px 12px;background:#f0fdf4;color:#166534;font-size:12px;line-height:1.45}.fixa-flag-explanation{border:1px solid #dbe6f5;border-radius:10px;padding:11px 12px;background:#f8fafc;color:#475569;font-size:12px;line-height:1.5;white-space:pre-wrap}
      .fixa-flag-review-actions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;padding-top:2px}.fixa-flag-review-actions button{min-height:36px;padding:7px 12px;font-size:11px;font-weight:850}.fixa-flag-keep{background:#e9edf7!important;color:#334155!important}.fixa-flag-release{background:#2563eb!important;color:#fff!important}
      .fixa-flag-back{margin-right:auto;background:transparent!important;color:#475569!important;border:1px solid #dbe3ef!important}
      .fixa-flag-empty{padding:28px 12px;text-align:center;color:#64748b;font-size:12px}
      @media(max-width:640px){.fixa-flag-review-modal{padding:10px}.fixa-flag-review-dialog{width:calc(100vw - 20px);max-height:92vh}.fixa-flag-review-row{grid-template-columns:1fr}.fixa-flag-review-view{justify-self:start}.fixa-flag-review-actions{justify-content:stretch}.fixa-flag-review-actions button{flex:1 1 auto}}
    `;
    document.head.appendChild(style);
  }

  async function loadFolder(competitionId, force = false) {
    const key = String(competitionId || '');
    if (!force && state.folders.has(key)) return state.folders.get(key);
    const sb = client();
    if (!sb?.rpc) return null;
    const { data: folder, error } = await sb.rpc('get_competition_folder', { p_competition_id: competitionId });
    if (error || !folder) return null;
    state.folders.set(key, folder);
    return folder;
  }

  function findQuestion(folder, item) {
    const subjects = Array.isArray(folder?.content?.subjects) ? folder.content.subjects : [];
    const subject = subjects.find(entry => String(entry?.id || '') === String(item?.subject_source_id || '')) || null;
    const card = (subject?.cards || []).find(candidate => questionKey(candidate) === String(item?.question_key || '')) || null;
    return { subject, card };
  }

  function reportersLabel(item) {
    const names = (Array.isArray(item?.reporters) ? item.reporters : [])
      .filter(person => String(person?.user_id || '') !== currentUserId())
      .map(person => String(person?.name || '').trim())
      .filter(Boolean);
    if (names.length) return names.join(', ');
    const count = Math.max(1, Number(item?.reporter_count || 1) - (item?.reported_by_me ? 1 : 0));
    return count === 1 ? '1 participante' : `${count} participantes`;
  }

  function renderSummary() {
    const card = sharedFolderCard();
    const competition = selectedCompetition();
    let button = card?.querySelector('.fixa-participant-flags-summary') || null;

    if (!card || !competition?.is_owner) {
      button?.remove();
      return;
    }

    const items = participantFlaggedItems(competition.id);
    if (!items.length) {
      button?.remove();
      return;
    }

    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'fixa-participant-flags-summary';
      button.addEventListener('click', () => openList(competition.id));
      const action = card.querySelector('.cv3-folder-action');
      if (action) card.insertBefore(button, action);
      else card.appendChild(button);
    }

    button.textContent = `⚠ ${items.length} ${items.length === 1 ? 'questão sinalizada por participante' : 'questões sinalizadas por participantes'}`;
  }

  function closeModal() {
    document.querySelector('.fixa-flag-review-modal')?.remove();
  }

  function mountModal(title, subtitle, bodyHtml) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'fixa-flag-review-modal';
    bg.innerHTML = `<section class="fixa-flag-review-dialog" role="dialog" aria-modal="true"><header class="fixa-flag-review-head"><div><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div><button type="button" class="fixa-flag-review-close" aria-label="Fechar">×</button></header><div class="fixa-flag-review-body">${bodyHtml}</div></section>`;
    document.body.appendChild(bg);
    bg.querySelector('.fixa-flag-review-close')?.addEventListener('click', closeModal);
    bg.addEventListener('click', event => { if (event.target === bg) closeModal(); });
    return bg;
  }

  async function openList(competitionId) {
    const competition = state.competitions.get(String(competitionId));
    if (!competition?.is_owner) return;
    await refresh(true);
    const folder = await loadFolder(competitionId, true);
    const items = participantFlaggedItems(competitionId);

    const rows = items.length ? items.map((item, index) => {
      const { subject, card } = findQuestion(folder, item);
      const preview = String(card?.q || 'Questão sinalizada para revisão.').replace(/\s+/g, ' ').slice(0, 220);
      const code = item?.question_code || card?.questionCode || `Questão ${index + 1}`;
      return `<article class="fixa-flag-review-row"><div><strong>${esc(code)} · ${esc(subject?.name || 'Coleção')}</strong><br><small>Sinalizada por ${esc(reportersLabel(item))}</small></div><button type="button" class="fixa-flag-review-view" data-fixa-flag-view="${index}">Ver</button><p>${esc(preview)}</p></article>`;
    }).join('') : '<div class="fixa-flag-empty">Não há questões sinalizadas por participantes.</div>';

    const modal = mountModal('Questões sinalizadas', 'Revise as questões sinalizadas pelos participantes antes de liberá-las.', rows);
    modal.querySelectorAll('[data-fixa-flag-view]').forEach(button => {
      button.addEventListener('click', () => openQuestion(competitionId, Number(button.dataset.fixaFlagView)));
    });
  }

  function optionText(option, index) {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object') return option.text || option.label || option.value || `Alternativa ${index + 1}`;
    return String(option ?? '');
  }

  function questionImages(card) {
    const values = [card?.image, ...(Array.isArray(card?.images) ? card.images : [])].filter(Boolean);
    return [...new Set(values.map(String))];
  }

  async function openQuestion(competitionId, index) {
    const competition = state.competitions.get(String(competitionId));
    if (!competition?.is_owner) return;
    const folder = await loadFolder(competitionId);
    const items = participantFlaggedItems(competitionId);
    const item = items[index];
    if (!item) return openList(competitionId);

    const { subject, card } = findQuestion(folder, item);
    if (!card) {
      return mountModal('Questão sinalizada', 'Não foi possível localizar o conteúdo completo desta questão.', '<div class="fixa-flag-empty">A questão não foi encontrada na versão atual da pasta compartilhada.</div>');
    }

    const options = Array.isArray(card.options) ? card.options : (Array.isArray(card.testOptions) ? card.testOptions : []);
    const optionHtml = options.length ? `<div class="fixa-flag-options">${options.map((option, optionIndex) => `<div class="fixa-flag-option"><strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${esc(optionText(option, optionIndex))}</div>`).join('')}</div>` : '';
    const imagesHtml = questionImages(card).map(src => `<img class="fixa-flag-question-image" src="${esc(src)}" alt="Imagem da questão">`).join('');
    const answer = card.correctAnswerText || card.a || card.answer || card.correct || '';
    const explanation = card.explanation || card.explain || '';
    const code = item?.question_code || card.questionCode || 'Questão';

    const body = `<div class="fixa-flag-question"><div class="fixa-flag-question-meta"><span class="fixa-flag-chip">${esc(code)}</span><span class="fixa-flag-chip">${esc(subject?.name || 'Coleção')}</span><span class="fixa-flag-chip">Sinalizada por ${esc(reportersLabel(item))}</span><span class="fixa-flag-chip">🔒 Congelada</span></div><div class="fixa-flag-question-text">${esc(card.q || '')}</div>${imagesHtml}${optionHtml}${answer ? `<div class="fixa-flag-answer"><strong>Resposta cadastrada:</strong> ${esc(answer)}</div>` : ''}${explanation ? `<div class="fixa-flag-explanation"><strong>Explicação cadastrada:</strong>\n${esc(explanation)}</div>` : ''}<div class="fixa-flag-review-actions"><button type="button" class="fixa-flag-back" data-fixa-flag-back>← Voltar</button><button type="button" class="fixa-flag-keep" data-fixa-flag-keep>Manter congelada</button><button type="button" class="fixa-flag-release" data-fixa-flag-release>Descongelar / liberar</button></div></div>`;

    const modal = mountModal('Revisar questão', 'Visualização somente para conferência. Nenhuma edição é feita nesta janela.', body);
    modal.querySelector('[data-fixa-flag-back]')?.addEventListener('click', () => openList(competitionId));
    modal.querySelector('[data-fixa-flag-keep]')?.addEventListener('click', () => openList(competitionId));
    modal.querySelector('[data-fixa-flag-release]')?.addEventListener('click', async button => {
      button.disabled = true;
      button.textContent = 'Liberando...';
      const sb = client();
      if (!sb?.rpc) return;
      const { error } = await sb.rpc('resolve_competition_question_flag', {
        p_competition_id: competitionId,
        p_subject_source_id: item.subject_source_id,
        p_question_key: item.question_key
      });
      if (error) {
        button.disabled = false;
        button.textContent = 'Descongelar / liberar';
        alert(error.message || 'Não foi possível liberar a questão.');
        return;
      }
      state.lastSync = 0;
      await refresh(true);
      window.dispatchEvent(new CustomEvent('fixa-competition-detail-rendered'));
      await openList(competitionId);
    });
  }

  async function refresh(force = false) {
    const sb = client();
    if (!sb?.rpc || state.syncing) return;
    if (!force && Date.now() - state.lastSync < 12000) {
      renderSummary();
      return;
    }

    state.syncing = true;
    try {
      const { data: list, error } = await sb.rpc('list_my_competitions', {});
      if (error || !Array.isArray(list)) return;
      state.competitions = new Map(list.map(item => [String(item.id), item]));

      const next = new Map();
      for (const competition of list.filter(item => item?.is_owner)) {
        const { data: items, error: flagError } = await sb.rpc('list_competition_question_flags', { p_competition_id: competition.id });
        if (flagError) continue;
        next.set(String(competition.id), Array.isArray(items) ? items : []);
      }
      state.items = next;
      state.lastSync = Date.now();
      renderSummary();
    } finally {
      state.syncing = false;
    }
  }

  ensureStyle();
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderSummary();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('fixa-cloud-data-loaded', () => refresh(true));
  window.addEventListener('fixa-competition-detail-rendered', () => refresh(true));
  window.addEventListener('focus', () => refresh(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
  window.addEventListener('load', () => setTimeout(() => refresh(true), 700), { once: true });
  setInterval(() => { if (!document.hidden) refresh(false); }, 15000);
  setTimeout(() => refresh(true), 900);
})();
