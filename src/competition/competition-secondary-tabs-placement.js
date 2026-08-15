(() => {
  'use strict';
  if (window.FixaCompetitionSecondaryTabsPlacementV2) return;
  window.FixaCompetitionSecondaryTabsPlacementV2 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const appData = () => (typeof data !== 'undefined' ? data : window.data);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  document.querySelector('#competitionSecondaryTabsPlacementStyle')?.remove();
  document.querySelector('#competitionSecondaryTabsPlacementStyleV2')?.remove();

  /*
    IMPORTANTE:
    O visual das abas secundárias é global e fica em
    secondary-tabs-layout-fix.js.
    Este módulo cuida da posição/estrutura da navegação da Competição
    e das ações que pertencem diretamente a essa barra.

    Ordem fixa da Competição:
    1. Minhas competições
    2. Histórico
    3. Criar
    4. Entrar por código
    5. Convidar amigos
    6. Convites
  */
  const style = document.createElement('style');
  style.id = 'competitionSecondaryTabsPlacementStyleV3';
  style.textContent = `
    .competition-v3 .cv3-secondary-nav.home-subtabs {
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
    }

    .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar {
      display: none;
    }

    .competition-v3 .cv3-hero-tools {
      justify-items: stretch;
    }

    .competition-v3 .cv3-hero-tools > .cv3-actions {
      display: none !important;
    }

    .cv3-history-tabs {
      display:inline-flex;
      gap:4px;
      padding:4px;
      border-radius:10px;
      background:#f1f5f9;
      width:fit-content;
    }

    .cv3-history-tab {
      min-height:31px;
      padding:0 13px;
      border:0;
      border-radius:8px;
      background:transparent;
      color:#64748b;
      font-size:12px;
      font-weight:800;
      box-shadow:none;
    }

    .cv3-history-tab.active {
      background:#fff;
      color:#2563eb;
      box-shadow:0 1px 4px rgba(15,23,42,.08);
    }

    .cv3-history-status {
      display:inline-flex;
      align-items:center;
      min-height:22px;
      padding:0 8px;
      border-radius:999px;
      font-size:10px;
      font-weight:800;
    }

    .cv3-history-status.upcoming { background:#eef4ff;color:#2563eb; }
    .cv3-history-status.completed { background:#f1f5f9;color:#64748b; }
  `;
  document.head.appendChild(style);

  const historyIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5M12 7v5l3 2"></path></svg>';
  const usersIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  const mailIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>';
  const trophyIcon = '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"></path><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"></path></svg>';

  function normalizeButton(button) {
    button.classList.remove('tab', 'cv3-primary');
    button.classList.add('home-subtab');

    if (button.matches('[data-create]')) button.setAttribute('aria-label', 'Criar competição');
    if (button.matches('[data-list]')) button.setAttribute('aria-label', 'Minhas competições');
    if (button.matches('[data-competition-history-placeholder]')) button.setAttribute('aria-label', 'Histórico');
    if (button.matches('[data-join]')) button.setAttribute('aria-label', 'Entrar por código');
    if (button.matches('[data-invite]')) button.setAttribute('aria-label', 'Convidar amigos');
    if (button.matches('[data-cv9-invitations]')) button.setAttribute('aria-label', 'Convites');
  }

  function createHistoryButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-competition-history-placeholder', '1');
    button.setAttribute('aria-label', 'Histórico');
    button.title = 'Histórico';
    button.innerHTML = `${historyIcon}<span>Histórico</span>`;
    return button;
  }

  function createInviteButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-invite', '');
    button.setAttribute('aria-label', 'Convidar amigos');
    button.innerHTML = `${usersIcon}<span>Convidar amigos</span>`;
    return button;
  }

  function createInvitationsButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-subtab';
    button.setAttribute('data-cv9-invitations', '1');
    button.setAttribute('aria-label', 'Convites');
    button.innerHTML = `${mailIcon}<span data-cv9-label>Convites</span><span class="cv9-badge" data-cv9-badge hidden>0</span>`;
    return button;
  }

  function ensureSixButtons(nav) {
    let history = nav.querySelector('[data-competition-history-placeholder]');
    if (!history) {
      history = createHistoryButton();
      nav.appendChild(history);
    }

    let invite = nav.querySelector('[data-invite]');
    if (!invite) {
      invite = createInviteButton();
      nav.appendChild(invite);
    }

    let invitations = nav.querySelector('[data-cv9-invitations]');
    if (!invitations) {
      invitations = createInvitationsButton();
      nav.appendChild(invitations);
    }

    const order = [
      nav.querySelector('[data-list]'),
      history,
      nav.querySelector('[data-create]'),
      nav.querySelector('[data-join]'),
      invite,
      invitations
    ].filter(Boolean);

    order.forEach(button => {
      normalizeButton(button);
      nav.appendChild(button);
    });
  }

  function syncActiveState(nav, root) {
    if (!nav || !root) return;

    nav.querySelectorAll('.home-subtab').forEach(button => {
      button.classList.remove('active');
      button.removeAttribute('aria-current');
      button.setAttribute('aria-pressed', 'false');
    });

    if (root.querySelector('.cv7-manager')) {
      const listButton = nav.querySelector('[data-list]');
      if (listButton) {
        listButton.classList.add('active');
        listButton.setAttribute('aria-current', 'page');
        listButton.setAttribute('aria-pressed', 'true');
      }
    }
  }

  function reposition() {
    const view = document.querySelector('.competition-v3');
    const root = view?.querySelector('#cv3');
    const hero = root?.querySelector('.cv3-hero');
    const actions = hero?.querySelector('.cv3-actions');
    if (!view || !root || !hero || !actions) return;

    let nav = root.querySelector(':scope > .cv3-secondary-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'home-subtabs cv3-secondary-nav';
      nav.setAttribute('aria-label', 'Ações da competição');
      root.insertBefore(nav, hero);
    } else {
      nav.classList.add('home-subtabs');
    }

    [...actions.children].forEach(button => {
      normalizeButton(button);
      nav.appendChild(button);
    });

    ensureSixButtons(nav);
    syncActiveState(nav, root);
  }

  function modal(title, html, wide = false, subtitle = '') {
    document.querySelector('.cv3-secondary-action-modal')?.remove();
    const bg = document.createElement('div');
    bg.className = 'cv3-modal-bg cv3-secondary-action-modal';
    bg.innerHTML = `<div class="cv3-modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true"><div class="cv3-modal-head"><div class="cv3-modal-title"><span class="cv3-modal-title-icon">${trophyIcon}</span><div><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div></div><button class="cv3-close" type="button" data-secondary-close aria-label="Fechar">×</button></div>${html}</div>`;
    document.body.appendChild(bg);
    const close = () => bg.remove();
    bg.querySelector('[data-secondary-close]').onclick = close;
    bg.onclick = event => { if (event.target === bg) close(); };
    return { bg, close };
  }

  function folders() {
    return Array.isArray(appData()?.folders) ? appData().folders : [];
  }

  function subjects() {
    return Array.isArray(appData()?.subjects) ? appData().subjects : [];
  }

  function cleanCard(card, subjectId) {
    const copy = structuredClone(card || {});
    ['status','reviews','masteryCount','lastMasteryTestId','testPriority','totalCorrect','totalWrong','ratingCounts','lastRating','lostMasteryCount','attemptHistory','lastReviewedAt'].forEach(key => delete copy[key]);
    copy.sharedSourceSubjectId = subjectId;
    return copy;
  }

  function contentHash(value) {
    const text = JSON.stringify(value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  async function syncNewCompetitionFolder(competitionId, folder) {
    const client = sb();
    if (!client || !competitionId || !folder) return;
    const snapshot = {
      folder: { id:String(folder.id), name:folder.name },
      subjects: subjects()
        .filter(subject => String(subject.folder) === String(folder.id) && !subject.sharedCompetitionId)
        .map(subject => ({
          id:String(subject.id),
          name:subject.name,
          cards:(subject.cards || []).map(card => cleanCard(card, subject.id))
        }))
    };
    await client.rpc('sync_competition_folder', {
      p_competition_id:competitionId,
      p_folder_id:String(folder.id),
      p_folder_name:folder.name,
      p_content:snapshot,
      p_content_hash:contentHash(snapshot)
    });
  }

  async function refreshCompetitionHome() {
    try { await window.FixaCompetitionV3?.load?.(); } catch {}
    try { await window.FixaCompetitionManagerV7?.loadManager?.('active'); } catch {}
    queue();
  }

  function openCreateModal() {
    const options = folders()
      .filter(folder => !String(folder.id).startsWith('competition-'))
      .map(folder => `<option value="${esc(folder.id)}">${esc(folder.name)}</option>`)
      .join('');
    const today = new Date().toISOString().slice(0,10);
    const end = new Date(Date.now() + 30 * 864e5).toISOString().slice(0,10);
    const { bg, close } = modal('Criar nova competição', `<form class="cv3-form"><label>Nome da competição<input name="name" maxlength="60" required minlength="3" placeholder="Ex.: Desafio de Agosto"></label><label>Pasta escolhida<select name="folder" required><option value="">Selecione uma pasta...</option>${options}</select></label><div class="cv3-form-grid"><label>Início<input name="start" type="date" value="${today}" required></label><label data-secondary-end-label>Término<input name="end" type="date" value="${end}" required></label></div><div class="cv3-check-row"><div class="cv3-check-left"><input id="secondaryCompetitionIndefinite" name="indefinite" type="checkbox"><label for="secondaryCompetitionIndefinite">Tempo indeterminado<span class="cv3-helper">A competição não terá data de término.</span></label></div></div><label>Limite diário de XP<input name="limit" type="number" min="50" max="2000" step="50" value="300" required></label><div class="cv3-toggle-row"><div><b>Ranking semanal</b><span class="cv3-helper">Mostra também o ranking da semana atual.</span></div><label class="cv3-toggle"><input name="weekly" type="checkbox" checked><span></span></label></div><div class="cv3-toggle-row"><div><b>Competição privada</b><span class="cv3-helper">Apenas convidados ou quem tiver o código poderá entrar.</span></div><label class="cv3-toggle"><input name="private" type="checkbox" checked><span></span></label></div><div class="cv3-msg"></div><div class="cv3-row-actions" style="justify-content:space-between"><button class="tab" type="button" data-secondary-cancel>Cancelar</button><button class="cv3-primary" type="submit">Criar competição</button></div></form>`, false, 'Configure os detalhes da sua competição.');
    const form = bg.querySelector('form');
    const indefinite = form.elements.indefinite;
    const endInput = form.elements.end;
    const endLabel = bg.querySelector('[data-secondary-end-label]');
    bg.querySelector('[data-secondary-cancel]').onclick = close;
    indefinite.onchange = () => {
      endInput.disabled = indefinite.checked;
      endInput.required = !indefinite.checked;
      endLabel.style.opacity = indefinite.checked ? '.45' : '1';
    };
    form.onsubmit = async event => {
      event.preventDefault();
      const client = sb();
      const msg = form.querySelector('.cv3-msg');
      const folder = folders().find(item => String(item.id) === String(form.elements.folder.value));
      if (!client) {
        msg.textContent = 'Não foi possível conectar ao servidor.';
        msg.className = 'cv3-msg show err';
        return;
      }
      if (!folder) {
        msg.textContent = 'Escolha uma pasta.';
        msg.className = 'cv3-msg show err';
        return;
      }
      const endValue = indefinite.checked ? null : form.elements.end.value;
      if (endValue && endValue < form.elements.start.value) {
        msg.textContent = 'A data final deve ser posterior à inicial.';
        msg.className = 'cv3-msg show err';
        return;
      }
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'Criando...';
      const { data:competitionId, error } = await client.rpc('create_competition_v4', {
        p_name:form.elements.name.value,
        p_folder_id:String(folder.id),
        p_folder_name:folder.name,
        p_starts_at:form.elements.start.value,
        p_ends_at:endValue,
        p_daily_xp_limit:Number(form.elements.limit.value),
        p_weekly_ranking_enabled:form.elements.weekly.checked,
        p_visibility:form.elements.private.checked ? 'private' : 'public'
      });
      if (error) {
        submit.disabled = false;
        submit.textContent = 'Criar competição';
        msg.textContent = error.message;
        msg.className = 'cv3-msg show err';
        return;
      }
      localStorage.setItem('fixa-selected-competition', competitionId);
      await syncNewCompetitionFolder(competitionId, folder);
      close();
      await refreshCompetitionHome();
    };
  }

  function openJoinModal() {
    const { bg, close } = modal('Entrar por código', `<form class="cv3-form"><label>Código da competição<input name="code" required maxlength="20" style="text-transform:uppercase" placeholder="Digite o código"></label><div class="cv3-msg"></div><div class="cv3-row-actions" style="justify-content:space-between"><button class="tab" type="button" data-secondary-cancel>Cancelar</button><button class="cv3-primary" type="submit">Entrar</button></div></form>`);
    const form = bg.querySelector('form');
    bg.querySelector('[data-secondary-cancel]').onclick = close;
    form.onsubmit = async event => {
      event.preventDefault();
      const client = sb();
      const msg = form.querySelector('.cv3-msg');
      if (!client) return;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'Entrando...';
      const { data:competitionId, error } = await client.rpc('join_competition_by_code', { p_code:form.elements.code.value.trim() });
      if (error) {
        submit.disabled = false;
        submit.textContent = 'Entrar';
        msg.textContent = error.message;
        msg.className = 'cv3-msg show err';
        return;
      }
      localStorage.setItem('fixa-selected-competition', competitionId);
      close();
      await refreshCompetitionHome();
    };
  }

  function currentCompetitionId() {
    return document.querySelector('.competition-v3 #cv3select')?.value || localStorage.getItem('fixa-selected-competition') || '';
  }

  function openInviteModal() {
    const competitionId = currentCompetitionId();
    if (!competitionId) {
      modal('Convidar amigos', '<div class="cv3-list"><div class="cv3-info">Abra uma competição antes de enviar convites.</div></div>');
      return;
    }
    const selected = document.querySelector('.competition-v3 #cv3select option:checked')?.textContent?.trim() || 'competição';
    const { bg } = modal('Convidar amigos', `<form class="cv3-form"><div class="cv3-info">Convite para <b>${esc(selected)}</b>.</div><label>E-mail da pessoa<input name="email" type="email" required placeholder="email@exemplo.com"></label><p class="cv3-note">Digite o e-mail completo. O Fixa não exibe uma lista pública de usuários.</p><div class="cv3-msg"></div><button class="cv3-primary" type="submit">Enviar convite</button></form>`, false, 'Convide uma pessoa para participar desta competição.');
    const form = bg.querySelector('form');
    form.onsubmit = async event => {
      event.preventDefault();
      const client = sb();
      const msg = form.querySelector('.cv3-msg');
      if (!client) return;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'Enviando...';
      const { data:result, error } = await client.rpc('invite_competition_by_email', {
        p_competition_id:competitionId,
        p_email:form.elements.email.value.trim()
      });
      msg.textContent = error ? error.message : (result?.message || 'Convite enviado.');
      msg.className = `cv3-msg show${error ? ' err' : ''}`;
      if (error) {
        submit.disabled = false;
        submit.textContent = 'Enviar convite';
      } else {
        submit.textContent = 'Convite enviado ✓';
        form.elements.email.value = '';
      }
    };
  }

  function formatDate(value) {
    if (!value) return 'Sem término';
    return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
  }

  async function openHistoryModal() {
    const { bg } = modal('Histórico', '<div class="cv3-list"><div class="cv3-empty">Carregando histórico...</div></div>', true, 'Consulte competições próximas e encerradas.');
    const body = bg.querySelector('.cv3-list');
    const client = sb();
    if (!client) {
      body.innerHTML = '<div class="cv3-empty">Não foi possível conectar ao servidor.</div>';
      return;
    }
    const { data:list, error } = await client.rpc('list_my_competitions');
    if (error) {
      body.innerHTML = `<div class="cv3-msg show err">${esc(error.message)}</div>`;
      return;
    }
    const items = Array.isArray(list) ? list.filter(item => item.effective_status !== 'active') : [];
    let filter = items.some(item => item.effective_status === 'completed') ? 'completed' : 'upcoming';

    const draw = () => {
      const filtered = items.filter(item => item.effective_status === filter);
      body.innerHTML = `<div class="cv3-history-tabs"><button class="cv3-history-tab ${filter === 'upcoming' ? 'active' : ''}" data-history-filter="upcoming">Próximas</button><button class="cv3-history-tab ${filter === 'completed' ? 'active' : ''}" data-history-filter="completed">Encerradas</button></div>${filtered.length ? filtered.map(item => `<div class="cv3-item"><div><h4>${esc(item.name)}</h4><div class="cv3-muted">${formatDate(item.starts_at)}${item.ends_at ? ` a ${formatDate(item.ends_at)}` : ' · tempo indeterminado'} · ${Number(item.my_xp || 0)} XP</div></div><span class="cv3-history-status ${item.effective_status}">${item.effective_status === 'completed' ? 'Encerrada' : 'Próxima'}</span></div>`).join('') : `<div class="cv3-empty"><h3>${filter === 'completed' ? 'Nenhuma competição encerrada' : 'Nenhuma competição próxima'}</h3><p class="cv3-muted">Não há itens nesta categoria.</p></div>`}`;
      body.querySelectorAll('[data-history-filter]').forEach(button => {
        button.onclick = () => {
          filter = button.dataset.historyFilter;
          draw();
        };
      });
    };
    draw();
  }

  let queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      reposition();
    });
  }

  const view = document.querySelector('.competition-v3');
  if (view) {
    new MutationObserver(queue).observe(view, { childList: true, subtree: true });
  }

  /*
    As quatro ações abaixo são tratadas aqui, no próprio módulo que possui
    a barra secundária. Assim elas não dependem do onclick do botão ter sido
    criado antes ou depois de o botão ser movido para esta navegação.
  */
  document.addEventListener('click', event => {
    const action = event.target.closest('.competition-v3 .cv3-secondary-nav [data-create], .competition-v3 .cv3-secondary-nav [data-join], .competition-v3 .cv3-secondary-nav [data-invite], .competition-v3 .cv3-secondary-nav [data-competition-history-placeholder]');
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action.matches('[data-create]')) openCreateModal();
      else if (action.matches('[data-join]')) openJoinModal();
      else if (action.matches('[data-invite]')) openInviteModal();
      else openHistoryModal();
      return;
    }

    if (event.target.closest('[data-competition-view]')) {
      queue();
      setTimeout(queue, 50);
      setTimeout(queue, 250);
    }
  }, true);

  window.addEventListener('load', queue, { once: true });
  queue();
})();