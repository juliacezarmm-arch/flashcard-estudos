(() => {
  'use strict';
  if (window.FixaCompetitionSecondaryTabsPlacementV4) return;
  window.FixaCompetitionSecondaryTabsPlacementV4 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const appData = () => (typeof data !== 'undefined' ? data : window.data);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  document.querySelector('#competitionSecondaryTabsPlacementStyle')?.remove();
  document.querySelector('#competitionSecondaryTabsPlacementStyleV2')?.remove();
  document.querySelector('#competitionSecondaryTabsPlacementStyleV3')?.remove();

  const style = document.createElement('style');
  style.id = 'competitionSecondaryTabsPlacementStyleV4';
  style.textContent = `
    .competition-v3 .cv3-secondary-nav.home-subtabs {
      max-width:100%;
      overflow-x:auto;
      overflow-y:hidden;
      scrollbar-width:none;
    }
    .competition-v3 .cv3-secondary-nav.home-subtabs::-webkit-scrollbar { display:none; }

    /* As ações antigas do cabeçalho continuam existindo apenas como legado
       interno do renderizador principal. A navegação visível possui seus
       próprios botões estáveis e não move mais esses elementos pelo DOM. */
    .competition-v3 .cv3-hero-tools { justify-items:stretch; }
    .competition-v3 .cv3-hero-tools > .cv3-actions { display:none !important; }

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

  const icons = {
    list:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>',
    history:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5M12 7v5l3 2"></path></svg>',
    plus:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
    hash:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"></path></svg>',
    users:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    mail:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>',
    trophy:'<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"></path><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"></path></svg>'
  };

  function competitionView() {
    return document.querySelector('.competition-v3');
  }

  function competitionRoot() {
    return competitionView()?.querySelector('#cv3') || null;
  }

  function navMarkup() {
    return `
      <button class="home-subtab" type="button" data-list aria-label="Minhas competições">${icons.list}<span>Minhas competições</span></button>
      <button class="home-subtab" type="button" data-competition-history-placeholder="1" aria-label="Histórico">${icons.history}<span>Histórico</span></button>
      <button class="home-subtab" type="button" data-create aria-label="Criar competição">${icons.plus}<span>Criar</span></button>
      <button class="home-subtab" type="button" data-join aria-label="Entrar por código">${icons.hash}<span>Entrar por código</span></button>
      <button class="home-subtab" type="button" data-invite aria-label="Convidar amigos">${icons.users}<span>Convidar amigos</span></button>
      <button class="home-subtab" type="button" data-cv9-invitations="1" aria-label="Convites">${icons.mail}<span data-cv9-label>Convites</span><span class="cv9-badge" data-cv9-badge hidden>0</span></button>
    `;
  }

  function syncActiveState(nav) {
    if (!nav) return;
    const managerOpen = competitionView()?.classList.contains('cv7-home-open') || !!competitionRoot()?.querySelector('.cv7-manager');
    nav.querySelectorAll('.home-subtab').forEach(button => {
      const active = managerOpen && button.matches('[data-list]');
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function ensureNav() {
    const view = competitionView();
    const root = competitionRoot();
    if (!view || !root) return null;

    /* Remove somente a implementação antiga que ficava dentro de #cv3.
       A nova barra é filha direta da tela e, por isso, não é destruída
       quando o renderizador interno atualiza hero/dashboard. */
    root.querySelector(':scope > .cv3-secondary-nav')?.remove();

    let nav = view.querySelector(':scope > .cv3-secondary-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'home-subtabs cv3-secondary-nav';
      nav.setAttribute('aria-label', 'Ações da competição');
      nav.dataset.secondaryNavOwner = 'v4';
      nav.innerHTML = navMarkup();
      view.insertBefore(nav, root);
      bindNav(nav);
    } else if (nav.dataset.secondaryNavOwner !== 'v4') {
      nav.dataset.secondaryNavOwner = 'v4';
      nav.innerHTML = navMarkup();
      bindNav(nav);
    }

    syncActiveState(nav);
    return nav;
  }

  function modal(title, html, wide = false, subtitle = '') {
    document.querySelector('.cv3-secondary-action-modal')?.remove();
    const bg = document.createElement('div');
    bg.className = 'cv3-modal-bg cv3-secondary-action-modal';
    bg.innerHTML = `<div class="cv3-modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true"><div class="cv3-modal-head"><div class="cv3-modal-title"><span class="cv3-modal-title-icon">${icons.trophy}</span><div><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div></div><button class="cv3-close" type="button" data-secondary-close aria-label="Fechar">×</button></div>${html}</div>`;
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
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  async function syncNewCompetitionFolder(competitionId, folder) {
    const client = sb();
    if (!client || !competitionId || !folder) return;
    const snapshot = {
      folder:{ id:String(folder.id), name:folder.name },
      subjects:subjects()
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
    ensureNav();
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
      const message = form.querySelector('.cv3-msg');
      const folder = folders().find(item => String(item.id) === String(form.elements.folder.value));
      if (!client) {
        message.textContent = 'Não foi possível conectar ao servidor.';
        message.className = 'cv3-msg show err';
        return;
      }
      if (!folder) {
        message.textContent = 'Escolha uma pasta.';
        message.className = 'cv3-msg show err';
        return;
      }

      const endValue = indefinite.checked ? null : form.elements.end.value;
      if (endValue && endValue < form.elements.start.value) {
        message.textContent = 'A data final deve ser posterior à inicial.';
        message.className = 'cv3-msg show err';
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
        message.textContent = error.message;
        message.className = 'cv3-msg show err';
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
      const message = form.querySelector('.cv3-msg');
      if (!client) return;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'Entrando...';
      const { data:competitionId, error } = await client.rpc('join_competition_by_code', {
        p_code:form.elements.code.value.trim()
      });
      if (error) {
        submit.disabled = false;
        submit.textContent = 'Entrar';
        message.textContent = error.message;
        message.className = 'cv3-msg show err';
        return;
      }
      localStorage.setItem('fixa-selected-competition', competitionId);
      close();
      await refreshCompetitionHome();
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

  function openInvite() {
    const api = window.FixaCompetitionInvitationsV9;
    if (typeof api?.openInvite === 'function') {
      api.openInvite();
      return;
    }
    modal('Convidar amigos', '<div class="cv3-list"><div class="cv3-info">Os convites ainda estão carregando. Tente novamente em um instante.</div></div>');
  }

  function openInvitations() {
    const api = window.FixaCompetitionInvitationsV9;
    if (typeof api?.openInvitations === 'function') {
      api.openInvitations();
      return;
    }
    modal('Convites', '<div class="cv3-list"><div class="cv3-info">Os convites ainda estão carregando. Tente novamente em um instante.</div></div>', true);
  }

  function bindNav(nav) {
    if (nav.dataset.secondaryNavBound === '1') return;
    nav.dataset.secondaryNavBound = '1';
    nav.addEventListener('click', event => {
      const button = event.target.closest('.home-subtab');
      if (!button || !nav.contains(button)) return;

      /* Minhas competições é interceptado pelo Manager no modo capture.
         Se o Manager ainda não estiver disponível, usamos a API pública. */
      if (button.matches('[data-list]')) {
        if (window.FixaCompetitionManagerV7?.showManager) {
          event.preventDefault();
          window.FixaCompetitionManagerV7.showManager('active');
        }
        return;
      }

      event.preventDefault();
      if (button.matches('[data-competition-history-placeholder]')) return void openHistoryModal();
      if (button.matches('[data-create]')) return void openCreateModal();
      if (button.matches('[data-join]')) return void openJoinModal();
      if (button.matches('[data-invite]')) return void openInvite();
      if (button.matches('[data-cv9-invitations]')) return void openInvitations();
    });
  }

  const nav = ensureNav();
  setTimeout(() => window.FixaCompetitionInvitationsV9?.refreshBadge?.(true), 0);

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-competition-view]')) return;
    requestAnimationFrame(() => {
      const current = ensureNav();
      syncActiveState(current);
      window.FixaCompetitionInvitationsV9?.refreshBadge?.(false);
    });
  }, true);

  window.addEventListener('fixa-competition-detail-rendered', () => {
    syncActiveState(ensureNav());
  });

  window.addEventListener('load', () => {
    syncActiveState(ensureNav());
    window.FixaCompetitionInvitationsV9?.refreshBadge?.(true);
  }, { once:true });

  window.FixaCompetitionSecondaryNav = {
    ensure:ensureNav,
    openCreate:openCreateModal,
    openJoin:openJoinModal,
    openHistory:openHistoryModal,
    openInvite,
    openInvitations
  };
})();