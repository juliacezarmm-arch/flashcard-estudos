(() => {
  'use strict';
  if (window.FixaCompetitionFlagReviewV2) return;
  window.FixaCompetitionFlagReviewV2 = true;

  const state = { competitions: new Map(), items: new Map(), folders: new Map(), syncing: false, lastSync: 0 };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const sb = () => {
    try { return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null); }
    catch (_) { return null; }
  };
  const appData = () => {
    try { return typeof data !== 'undefined' ? data : window.data; }
    catch (_) { return window.data || null; }
  };
  const subjects = () => Array.isArray(appData()?.subjects) ? appData().subjects : [];
  const uid = () => {
    try { return String(window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : '') || ''); }
    catch (_) { return ''; }
  };
  const selectedCompetitionId = () => String(document.querySelector('.competition-v3.active #cv3select')?.value || localStorage.getItem('fixa-selected-competition') || '');
  const selectedCompetition = () => state.competitions.get(selectedCompetitionId()) || null;
  const folderCard = () => document.querySelector('.competition-v3.active .cv3-area-folder');
  const itemsFor = id => state.items.get(String(id || '')) || [];
  const questionKey = card => String(card?.questionCode || card?.id || `${card?.q || ''}|${card?.correctAnswerText || card?.a || ''}`);

  function ensureStyle() {
    if (document.getElementById('fixaCompetitionFlagReviewV2Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaCompetitionFlagReviewV2Style';
    style.textContent = `
      .fixa-participant-flags-summary{display:none!important}
      .fixa-all-flags-summary{width:100%;margin-top:9px;border:1px solid #bfdbfe!important;border-radius:9px!important;padding:8px 10px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;background:#eff6ff!important;color:#1d4ed8!important;font-size:11px!important;font-weight:850!important;box-shadow:none!important}
      .fixa-all-flags-summary:hover{background:#dbeafe!important}.fixa-all-flags-summary span{display:inline-flex;align-items:center;gap:7px}.fixa-all-flags-summary b{font-size:10px;text-transform:uppercase;letter-spacing:.02em}
      .fixa-flag-v2-modal{position:fixed;inset:0;z-index:1340;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.42);backdrop-filter:blur(2px)}
      .fixa-flag-v2-dialog{width:min(900px,calc(100vw - 28px));max-height:min(90vh,860px);overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.25);display:grid;grid-template-rows:auto minmax(0,1fr)}
      .fixa-flag-v2-head{padding:16px 18px;border-bottom:1px solid #e5eaf2;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.fixa-flag-v2-head h3{margin:0;color:#172033;font-size:18px}.fixa-flag-v2-head p{margin:5px 0 0;color:#64748b;font-size:12px;line-height:1.45}
      .fixa-flag-v2-close{width:34px;height:34px;padding:0!important;border:0!important;border-radius:9px!important;display:grid;place-items:center;background:#f1f5f9!important;color:#475569!important;font-size:22px!important;line-height:1!important;flex:0 0 34px}
      .fixa-flag-v2-body{overflow:auto;padding:16px 18px 18px;display:grid;gap:10px;align-content:start}
      .fixa-flag-v2-row{border:1px solid #e1e8f2;border-radius:11px;padding:12px 13px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;background:#fff}.fixa-flag-v2-row strong{color:#172033;font-size:13px}.fixa-flag-v2-row small{color:#1d4ed8;font-size:10px;font-weight:800}.fixa-flag-v2-row p{grid-column:1/-1;margin:0;color:#64748b;font-size:11px;line-height:1.45}
      .fixa-flag-v2-view{min-height:32px!important;padding:6px 11px!important;font-size:11px!important;font-weight:850!important;display:inline-flex!important;align-items:center!important;gap:6px!important}.fixa-flag-v2-view svg,.fixa-all-flags-summary svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .fixa-flag-v2-question{display:grid;gap:14px}.fixa-flag-v2-meta{display:flex;flex-wrap:wrap;gap:7px}.fixa-flag-v2-chip{padding:4px 7px;border:1px solid #dbe6f5;border-radius:999px;background:#f8fafc;color:#475569;font-size:10px;font-weight:800}
      .fixa-flag-v2-text{border:1px solid #e1e8f2;border-radius:12px;padding:15px 16px;background:#fff;color:#172033;font-size:14px;line-height:1.55;white-space:pre-wrap}.fixa-flag-v2-image{max-width:min(100%,640px);max-height:360px;margin:0 auto;display:block;object-fit:contain;border-radius:10px}
      .fixa-flag-v2-options{display:grid;gap:7px}.fixa-flag-v2-option{border:1px solid #e1e8f2;border-radius:9px;padding:10px 12px;background:#f8fafc;color:#334155;font-size:12px;line-height:1.45}
      .fixa-flag-v2-answer{border:1px solid #bbf7d0;border-radius:10px;padding:11px 12px;background:#f0fdf4;color:#166534;font-size:12px;line-height:1.45}.fixa-flag-v2-box{border:1px solid #dbe6f5;border-radius:10px;padding:11px 12px;background:#f8fafc;color:#475569;font-size:12px;line-height:1.5;white-space:pre-wrap}
      .fixa-flag-v2-notes{border-color:#fed7aa;background:#fff7ed;color:#92400e}.fixa-flag-v2-notes h4{margin:0 0 8px;color:#9a3412;font-size:12px}.fixa-flag-v2-note{padding:7px 0;border-top:1px solid #fed7aa}.fixa-flag-v2-note:first-of-type{border-top:0}.fixa-flag-v2-note b{display:block;margin-bottom:2px;color:#7c2d12}
      .fixa-flag-v2-editor{display:grid;gap:10px}.fixa-flag-v2-editor label{display:grid;gap:5px;color:#334155;font-size:11px;font-weight:850}.fixa-flag-v2-editor textarea,.fixa-flag-v2-editor input{width:100%;border:1px solid #d7e2f2;border-radius:9px;background:#fff;color:#172033;font-size:12px;line-height:1.45;padding:9px 10px;box-sizing:border-box}.fixa-flag-v2-editor textarea{min-height:74px;resize:vertical}.fixa-flag-v2-editor textarea.question{min-height:108px}
      .fixa-flag-v2-actions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;padding-top:2px}.fixa-flag-v2-actions button{min-height:36px;padding:7px 12px;font-size:11px;font-weight:850}.fixa-flag-v2-back{margin-right:auto;background:transparent!important;color:#475569!important;border:1px solid #dbe3ef!important}.fixa-flag-v2-save{background:#16a34a!important;color:#fff!important}.fixa-flag-v2-keep{background:#e9edf7!important;color:#334155!important}.fixa-flag-v2-release{background:#2563eb!important;color:#fff!important}.fixa-flag-v2-empty{padding:28px 12px;text-align:center;color:#64748b;font-size:12px}
      @media(max-width:640px){.fixa-flag-v2-modal{padding:10px}.fixa-flag-v2-dialog{width:calc(100vw - 20px);max-height:92vh}.fixa-flag-v2-row{grid-template-columns:1fr}.fixa-flag-v2-actions{justify-content:stretch}.fixa-flag-v2-actions button{flex:1 1 auto}}
    `;
    document.head.appendChild(style);
  }

  function eyeIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  }

  async function loadFolder(competitionId, force = false) {
    const key = String(competitionId || '');
    if (!force && state.folders.has(key)) return state.folders.get(key);
    const client = sb();
    if (!client?.rpc) return null;
    const { data: folder, error } = await client.rpc('get_competition_folder', { p_competition_id: competitionId });
    if (error || !folder) return null;
    state.folders.set(key, folder);
    return folder;
  }

  function findRemoteQuestion(folder, item) {
    const list = Array.isArray(folder?.content?.subjects) ? folder.content.subjects : [];
    const subject = list.find(entry => String(entry?.id || '') === String(item?.subject_source_id || '')) || null;
    const card = (subject?.cards || []).find(candidate => questionKey(candidate) === String(item?.question_key || '')) || null;
    return { subject, card };
  }

  function findOwnerLocalQuestion(competition, item) {
    const subject = subjects().find(entry =>
      String(entry?.id || '') === String(item?.subject_source_id || '') &&
      String(entry?.folder || '') === String(competition?.folder_id || '') &&
      !entry?.sharedCompetitionId
    ) || null;
    const card = (subject?.cards || []).find(candidate => questionKey(candidate) === String(item?.question_key || '')) || null;
    return { subject, card };
  }

  function notes(item) {
    return (Array.isArray(item?.notes) ? item.notes : [])
      .map(note => ({ name: String(note?.name || 'Participante').trim() || 'Participante', note: String(note?.note || '').trim() }))
      .filter(note => note.note);
  }

  function reportersLabel(item, competition) {
    if (!competition?.is_owner) return 'Sinalizada na competição';
    const names = (Array.isArray(item?.reporters) ? item.reporters : [])
      .map(person => String(person?.user_id || '') === uid() ? 'Você' : String(person?.name || '').trim())
      .filter(Boolean);
    if (names.length) return `Sinalizada por ${names.join(', ')}`;
    const count = Math.max(1, Number(item?.reporter_count || 1));
    return count === 1 ? 'Sinalizada por 1 participante' : `Sinalizada por ${count} participantes`;
  }

  function renderSummary() {
    const card = folderCard();
    const competition = selectedCompetition();
    let button = card?.querySelector('.fixa-all-flags-summary') || null;
    if (!card || !competition) {
      button?.remove();
      return;
    }
    const count = itemsFor(competition.id).length;
    if (!count) {
      button?.remove();
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'fixa-all-flags-summary';
      button.addEventListener('click', () => openList(competition.id));
      const action = card.querySelector('.cv3-folder-action');
      if (action) card.insertBefore(button, action);
      else card.appendChild(button);
    }
    button.innerHTML = `<span>${eyeIcon()} Todas as questões sinalizadas <small>${count}</small></span><b>Ver</b>`;
  }

  function closeModal() {
    document.querySelector('.fixa-flag-v2-modal')?.remove();
  }

  function modal(title, subtitle, body) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'fixa-flag-v2-modal';
    bg.innerHTML = `<section class="fixa-flag-v2-dialog" role="dialog" aria-modal="true"><header class="fixa-flag-v2-head"><div><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div><button type="button" class="fixa-flag-v2-close" aria-label="Fechar">×</button></header><div class="fixa-flag-v2-body">${body}</div></section>`;
    document.body.appendChild(bg);
    bg.querySelector('.fixa-flag-v2-close')?.addEventListener('click', closeModal);
    bg.addEventListener('click', event => { if (event.target === bg) closeModal(); });
    return bg;
  }

  function optionText(option, index) {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object') return option.text || option.label || option.value || `Alternativa ${index + 1}`;
    return String(option ?? '');
  }

  function questionImages(card) {
    return [...new Set([card?.image, ...(Array.isArray(card?.images) ? card.images : [])].filter(Boolean).map(String))];
  }

  function notesHtml(item) {
    const rows = notes(item);
    if (!rows.length) return '';
    return `<div class="fixa-flag-v2-box fixa-flag-v2-notes"><h4>Comentários da sinalização</h4>${rows.map(row => `<div class="fixa-flag-v2-note"><b>${esc(row.name)}</b>${esc(row.note)}</div>`).join('')}</div>`;
  }

  async function openList(competitionId) {
    const competition = state.competitions.get(String(competitionId));
    if (!competition) return;
    await refresh(true);
    const folder = await loadFolder(competitionId, true);
    const rows = itemsFor(competitionId);
    const html = rows.length ? rows.map((item, index) => {
      const { subject, card } = findRemoteQuestion(folder, item);
      const note = notes(item)[0]?.note || '';
      const preview = String(note || card?.q || 'Questão sinalizada para revisão.').replace(/\s+/g, ' ').slice(0, 220);
      const code = item?.question_code || card?.questionCode || `Questão ${index + 1}`;
      return `<article class="fixa-flag-v2-row"><div><strong>${esc(code)} · ${esc(subject?.name || 'Coleção')}</strong><br><small>${esc(reportersLabel(item, competition))}</small></div><button type="button" class="fixa-flag-v2-view" data-flag-index="${index}">${eyeIcon()} Ver</button><p>${esc(preview)}</p></article>`;
    }).join('') : '<div class="fixa-flag-v2-empty">Não há questões sinalizadas nesta competição.</div>';
    const subtitle = competition.is_owner
      ? 'Veja comentários, edite a questão se precisar e libere quando estiver resolvida.'
      : 'Você pode consultar as questões congeladas, mas só o administrador pode editar ou liberar.';
    const bg = modal('Questões sinalizadas', subtitle, html);
    bg.querySelectorAll('[data-flag-index]').forEach(button => button.addEventListener('click', () => openQuestion(competitionId, Number(button.dataset.flagIndex))));
  }

  async function openQuestion(competitionId, index) {
    const competition = state.competitions.get(String(competitionId));
    const folder = await loadFolder(competitionId);
    const item = itemsFor(competitionId)[index];
    if (!competition || !item) return openList(competitionId);
    const { subject, card } = findRemoteQuestion(folder, item);
    if (!card) return modal('Questão sinalizada', 'Não foi possível localizar o conteúdo completo.', '<div class="fixa-flag-v2-empty">A questão não foi encontrada na versão atual da pasta compartilhada.</div>');
    renderQuestion({ competitionId, competition, item, subject, card });
  }

  function renderQuestion({ competitionId, competition, item, subject, card }) {
    const options = Array.isArray(card.options) ? card.options : (Array.isArray(card.testOptions) ? card.testOptions : []);
    const optionHtml = options.length ? `<div class="fixa-flag-v2-options">${options.map((option, i) => `<div class="fixa-flag-v2-option"><strong>${String.fromCharCode(65 + i)}.</strong> ${esc(optionText(option, i))}</div>`).join('')}</div>` : '';
    const images = questionImages(card).map(src => `<img class="fixa-flag-v2-image" src="${esc(src)}" alt="Imagem da questão">`).join('');
    const answer = card.correctAnswerText || card.a || card.answer || card.correct || '';
    const explanation = card.explanation || card.explain || '';
    const code = item?.question_code || card.questionCode || 'Questão';
    const ownerActions = competition.is_owner
      ? '<button type="button" class="fixa-flag-v2-save" data-edit>Editar</button><button type="button" class="fixa-flag-v2-release" data-release>Descongelar / liberar</button>'
      : '';
    const html = `<div class="fixa-flag-v2-question"><div class="fixa-flag-v2-meta"><span class="fixa-flag-v2-chip">${esc(code)}</span><span class="fixa-flag-v2-chip">${esc(subject?.name || 'Coleção')}</span><span class="fixa-flag-v2-chip">${esc(reportersLabel(item, competition))}</span><span class="fixa-flag-v2-chip">Congelada</span></div>${notesHtml(item)}<div class="fixa-flag-v2-text">${esc(card.q || '')}</div>${images}${optionHtml}${answer ? `<div class="fixa-flag-v2-answer"><strong>Resposta cadastrada:</strong> ${esc(answer)}</div>` : ''}${explanation ? `<div class="fixa-flag-v2-box"><strong>Explicação cadastrada:</strong>\n${esc(explanation)}</div>` : ''}<div class="fixa-flag-v2-actions"><button type="button" class="fixa-flag-v2-back" data-back>Voltar</button>${ownerActions}</div></div>`;
    const bg = modal('Revisar questão', competition.is_owner ? 'Confira a questão sinalizada antes de liberar.' : 'Visualização da questão congelada.', html);
    bg.querySelector('[data-back]')?.addEventListener('click', () => openList(competitionId));
    bg.querySelector('[data-edit]')?.addEventListener('click', () => renderEditor({ competitionId, competition, item, subject, card }));
    bg.querySelector('[data-release]')?.addEventListener('click', event => releaseFlag(event.currentTarget, competitionId, item));
  }

  function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  function buildAnswer(card, options, explanation) {
    if (typeof buildAnswerText === 'function') return buildAnswerText(card.correctAnswerText, options, explanation, card.type || 'multiple');
    const base = card.correctAnswerText ? `Resposta correta: ${card.correctAnswerText}.` : '';
    return explanation ? `${base} Explicação: ${explanation}` : base;
  }

  function renderEditor({ competitionId, competition, item, subject, card }) {
    const local = findOwnerLocalQuestion(competition, item);
    const editable = local.card || card;
    const options = Array.isArray(editable.options) ? editable.options.map(optionText).join('\n') : '';
    const html = `<form class="fixa-flag-v2-editor"><label>Pergunta<textarea class="question" name="question">${esc(editable.q || '')}</textarea></label><label>Alternativas<textarea name="options" placeholder="Uma alternativa por linha">${esc(options)}</textarea></label><label>Resposta correta<input name="correct" value="${esc(editable.correctAnswerText || '')}"></label><label>Explicação<textarea name="explanation">${esc(editable.explanation || '')}</textarea></label><div class="fixa-flag-v2-actions"><button type="button" class="fixa-flag-v2-back" data-back>Voltar</button><button type="submit" class="fixa-flag-v2-keep" data-mode="keep">Salvar e manter congelada</button><button type="submit" class="fixa-flag-v2-release" data-mode="release">Salvar e descongelar</button></div></form>`;
    const bg = modal('Editar questão sinalizada', 'A alteração é salva na pasta original e republicada para a competição.', html);
    bg.querySelector('[data-back]')?.addEventListener('click', () => renderQuestion({ competitionId, competition, item, subject, card }));
    bg.querySelector('form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const button = event.submitter;
      const release = button?.dataset?.mode === 'release';
      button.disabled = true;
      button.textContent = release ? 'Salvando e liberando...' : 'Salvando...';
      try {
        await saveEditedQuestion(event.currentTarget, competition, item);
        if (release) await releaseFlag(null, competitionId, item, true);
        state.folders.delete(String(competitionId));
        await refresh(true);
        await openList(competitionId);
      } catch (err) {
        alert(err?.message || String(err));
        button.disabled = false;
        button.textContent = release ? 'Salvar e descongelar' : 'Salvar e manter congelada';
      }
    });
  }

  async function saveEditedQuestion(form, competition, item) {
    const local = findOwnerLocalQuestion(competition, item);
    if (!local.card) throw new Error('Não localizei esta questão na pasta original da administradora.');
    const options = String(form.elements.options.value || '').split(/\n+/).map(value => value.trim()).filter(Boolean);
    const correct = String(form.elements.correct.value || '').trim();
    const explanation = String(form.elements.explanation.value || '').trim();
    const correctIndex = options.findIndex(option => normalizeText(option) === normalizeText(correct));
    local.card.q = String(form.elements.question.value || '').trim();
    local.card.options = options;
    local.card.correctAnswerText = correct;
    local.card.correctAnswer = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : (local.card.correctAnswer || '');
    local.card.explanation = explanation;
    local.card.a = buildAnswer(local.card, options, explanation);
    local.card.updatedAt = new Date().toISOString();
    try { if (typeof save === 'function') save(); } catch (_) {}
    try { if (typeof renderQuestions === 'function') renderQuestions(local.subject); } catch (_) {}
    try { if (typeof render === 'function') render(); } catch (_) {}
    if (typeof window.FixaCompetitionV3?.syncOwner === 'function') {
      const result = await window.FixaCompetitionV3.syncOwner(competition);
      if (result?.error) throw result.error;
      if (typeof window.FixaCompetitionV3?.refreshFolderMeta === 'function') await window.FixaCompetitionV3.refreshFolderMeta();
    } else {
      document.querySelector('.competition-v3 [data-folder-sync]')?.click();
    }
  }

  async function releaseFlag(button, competitionId, item, silent = false) {
    if (button) {
      button.disabled = true;
      button.textContent = 'Liberando...';
    }
    const client = sb();
    if (!client?.rpc) return;
    const { error } = await client.rpc('resolve_competition_question_flag', {
      p_competition_id: competitionId,
      p_subject_source_id: item.subject_source_id,
      p_question_key: item.question_key
    });
    if (error) {
      if (button) {
        button.disabled = false;
        button.textContent = 'Descongelar / liberar';
      }
      if (silent) throw error;
      alert(error.message || 'Não foi possível liberar a questão.');
      return;
    }
    state.lastSync = 0;
    window.dispatchEvent(new CustomEvent('fixa-competition-flags-updated', { detail: { competitionId } }));
    if (!silent) {
      await refresh(true);
      await openList(competitionId);
    }
  }

  async function refresh(force = false) {
    const client = sb();
    if (!client?.rpc || state.syncing) return;
    if (!force && Date.now() - state.lastSync < 12000) {
      renderSummary();
      return;
    }
    state.syncing = true;
    try {
      const { data: list, error } = await client.rpc('list_my_competitions', {});
      if (error || !Array.isArray(list)) return;
      state.competitions = new Map(list.map(item => [String(item.id), item]));
      const next = new Map();
      for (const competition of list) {
        const { data: rows, error: flagError } = await client.rpc('list_competition_question_flags', { p_competition_id: competition.id });
        if (flagError) continue;
        next.set(String(competition.id), Array.isArray(rows) ? rows : []);
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
  window.addEventListener('fixa-competition-flags-updated', () => refresh(true));
  window.addEventListener('focus', () => refresh(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
  window.addEventListener('load', () => setTimeout(() => refresh(true), 700), { once: true });
  setInterval(() => { if (!document.hidden) refresh(false); }, 15000);
  setTimeout(() => refresh(true), 900);
})();
