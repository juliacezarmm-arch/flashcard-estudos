(() => {
  'use strict';
  if (window.FixaCompetitionPolishV6) return;
  window.FixaCompetitionPolishV6 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  const style = document.createElement('style');
  style.id = 'competitionPolishV6Style';
  style.textContent = `
    @media (min-width: 761px) {
      .competition-v3.active { gap: 12px !important; margin-bottom: 12px !important; }
      .competition-v3 .cv3-card { border-color:#e3e9f2 !important; border-radius:15px !important; box-shadow:0 4px 16px rgba(15,23,42,.035) !important; }
      .competition-v3 .cv3-hero { min-height:104px !important; padding:16px 20px !important; gap:18px !important; }
      .competition-v3 .cv3-hero-icon { width:64px !important; height:64px !important; border-radius:18px !important; }
      .competition-v3 .cv3-hero-icon .cv3-icon { width:32px !important; height:32px !important; }
      .competition-v3 .cv3-hero-copy h2 { font-size:26px !important; line-height:30px !important; margin-bottom:4px !important; }
      .competition-v3 .cv3-hero-copy p { font-size:11px !important; line-height:16px !important; }
      .competition-v3 .cv3-hero-tools select { min-height:40px !important; width:min(300px,100%) !important; font-size:13px !important; }
      .competition-v3 .cv3-dashboard { gap:12px !important; }
      .competition-v3 .cv3-dashboard > .cv3-card { padding:16px !important; }
      .competition-v3 .cv3-section-head { margin-bottom:10px !important; }
      .competition-v3 .cv3-card h3 { font-size:17px !important; }
      .competition-v3 .cv3-position { margin:10px 0 12px !important; gap:14px !important; }
      .competition-v3 .cv3-medal { width:72px !important; height:72px !important; }
      .competition-v3 .cv3-medal .cv3-icon { width:36px !important; height:36px !important; }
      .competition-v3 .cv3-position-copy b { font-size:32px !important; }
      .competition-v3 .cv3-xp { font-size:17px !important; margin-top:6px !important; }
      .competition-v3 .cv3-meta { font-size:10.5px !important; }
      .competition-v3 .cv3-note { margin:8px 0 0 !important; }
      .competition-v3 .cv3-row-actions { margin-top:12px !important; gap:8px !important; }
      .competition-v3 .cv3-danger-soft,
      .competition-v3 .cv3-row-actions > .tab { min-height:38px !important; padding:8px 12px !important; font-size:12px !important; }
      .competition-v3 .cv3-rank-list { margin-top:8px !important; }
      .competition-v3 .cv3-rank { min-height:46px !important; padding:6px 9px !important; }
      .competition-v3 .cv3-avatar { width:32px !important; height:32px !important; }
      .competition-v3 .cv3-rank-tabs { gap:4px !important; justify-content:center !important; align-items:center !important; }
      .competition-v3 .cv3-rank-tab { min-width:62px !important; font-size:11px !important; padding:0 9px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; }
      .competition-v3 .cv3-stats,
      .competition-v3 .cv3-rule-row { gap:8px !important; }
      .competition-v3 .cv3-stat { min-height:78px !important; padding:8px 6px !important; }
      .competition-v3 .cv3-rule-icon { width:29px !important; height:29px !important; margin-bottom:4px !important; }
      .competition-v3 .cv3-rule-icon .cv3-icon { width:15px !important; height:15px !important; }
      .competition-v3 .cv3-stat b { font-size:17px !important; }
      .competition-v3 .cv3-stat small { font-size:9.5px !important; margin-top:2px !important; }
      .competition-v3 .cv3-area-rules { grid-column:1 / 13 !important; }
      .competition-v3 .cv3-area-rules .cv3-stat { min-height:66px !important; grid-template-columns:auto auto 1fr; column-gap:8px; text-align:left !important; justify-items:start !important; align-items:center !important; align-content:center !important; }
      .competition-v3 .cv3-area-rules .cv3-rule-icon { grid-row:1 / 3; margin:0 !important; }
      .competition-v3 .cv3-area-rules .cv3-stat b { align-self:end; }
      .competition-v3 .cv3-area-rules .cv3-stat small { align-self:start; }
      .competition-v3 .cv3-area-invite .cv3-code { padding:8px !important; gap:8px !important; }
      .competition-v3 .cv3-area-invite .cv3-code strong { min-height:40px !important; font-size:15px !important; }
      .competition-v3 .cv3-area-invite .cv3-invite-actions { margin-top:10px !important; }
      .competition-v3 .cv3-area-invite .tab { min-height:38px !important; font-size:12px !important; }
    }

    .competition-v3 .cv3-empty.cv3-empty-state {
      min-height:330px;
      display:grid;
      place-items:center;
      align-content:center;
      gap:10px;
      padding:34px 24px !important;
    }
    .competition-v3 .cv3-empty-state-visual {
      width:112px;
      height:112px;
      border-radius:50%;
      display:grid;
      place-items:center;
      color:#2563eb;
      background:radial-gradient(circle at 50% 45%,#fff 0 20%,#eef4ff 21% 100%);
      box-shadow:0 12px 28px rgba(37,99,235,.08);
    }
    .competition-v3 .cv3-empty-state-visual svg { width:56px;height:56px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round; }
    .competition-v3 .cv3-empty-state h3 { font-size:22px !important; margin:4px 0 0 !important; }
    .competition-v3 .cv3-empty-state p { max-width:520px; margin:0 auto 4px !important; font-size:12px !important; }
    .competition-v3 .cv3-empty-state .cv3-empty-create { min-height:42px; padding:9px 18px; border:0; border-radius:10px; background:#2563eb; color:#fff; font-size:13px; font-weight:800; box-shadow:0 8px 18px rgba(37,99,235,.16); }

    .cv3-confirm-bg { position:fixed; inset:0; z-index:900; display:grid; place-items:center; padding:18px; background:rgba(15,23,42,.40); backdrop-filter:blur(3px); }
    .cv3-confirm { width:min(440px,100%); background:#fff; border:1px solid #e5eaf1; border-radius:18px; box-shadow:0 26px 70px rgba(15,23,42,.24); overflow:hidden; }
    .cv3-confirm-head { display:flex; gap:12px; align-items:flex-start; padding:20px 20px 12px; }
    .cv3-confirm-icon { width:42px;height:42px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto; }
    .cv3-confirm-icon.danger { color:#dc2626;background:#fef2f2; }
    .cv3-confirm-icon svg { width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round; }
    .cv3-confirm-copy h3 { margin:0 0 5px;font-size:18px;color:#172033; }
    .cv3-confirm-copy p { margin:0;color:#64748b;font-size:12px;line-height:18px; }
    .cv3-confirm-actions { display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 20px 20px; }
    .cv3-confirm-actions button { min-height:42px;border-radius:10px;font-size:13px;font-weight:800; }
    .cv3-confirm-cancel { border:1px solid #d7e2f2;background:#fff;color:#172033; }
    .cv3-confirm-danger { border:1px solid #ef4444;background:#ef4444;color:#fff;box-shadow:0 7px 16px rgba(239,68,68,.16); }
    .cv3-confirm-danger:hover { background:#dc2626; }
    .cv3-confirm-error { margin:0 20px 14px;padding:10px 12px;border-radius:9px;background:#fef2f2;color:#b91c1c;font-size:11px;display:none; }
    .cv3-confirm-error.show { display:block; }
  `;
  document.head.appendChild(style);

  function iconTrophy() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></svg>`;
  }

  function iconWarn() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>`;
  }

  function confirmDialog({ title, text, confirmText, onConfirm }) {
    const bg = document.createElement('div');
    bg.className = 'cv3-confirm-bg';
    bg.innerHTML = `<div class="cv3-confirm" role="dialog" aria-modal="true"><div class="cv3-confirm-head"><div class="cv3-confirm-icon danger">${iconWarn()}</div><div class="cv3-confirm-copy"><h3>${title}</h3><p>${text}</p></div></div><div class="cv3-confirm-error"></div><div class="cv3-confirm-actions"><button class="cv3-confirm-cancel" type="button">Cancelar</button><button class="cv3-confirm-danger" type="button">${confirmText}</button></div></div>`;
    document.body.appendChild(bg);
    const cancel = bg.querySelector('.cv3-confirm-cancel');
    const danger = bg.querySelector('.cv3-confirm-danger');
    const error = bg.querySelector('.cv3-confirm-error');
    const close = () => bg.remove();
    cancel.onclick = close;
    danger.onclick = async () => {
      danger.disabled = true;
      danger.textContent = 'Aguarde...';
      try {
        const result = await onConfirm();
        if (result?.error) throw result.error;
        close();
      } catch (err) {
        error.textContent = err?.message || String(err);
        error.classList.add('show');
        danger.disabled = false;
        danger.textContent = confirmText;
      }
    };
    return { bg, close };
  }

  function decorateEmptyState() {
    const view = document.querySelector('.competition-v3.active');
    const empty = view?.querySelector('.cv3-empty');
    if (!empty) return;
    const title = empty.querySelector('h3');
    if (!title || !/primeira competição/i.test(title.textContent || '')) return;
    if (empty.classList.contains('cv3-empty-state')) return;
    empty.classList.add('cv3-empty-state');
    empty.insertAdjacentHTML('afterbegin', `<div class="cv3-empty-state-visual">${iconTrophy()}</div>`);
    const button = document.createElement('button');
    button.className = 'cv3-empty-create';
    button.type = 'button';
    button.textContent = 'Criar competição';
    button.onclick = () => document.querySelector('.competition-v3 [data-create]')?.click();
    empty.appendChild(button);
    view.querySelector('.cv3-hero-tools select')?.style.setProperty('display', 'none');
  }

  function protectCreateModal() {
    document.querySelectorAll('.cv3-modal-bg').forEach(bg => {
      if (bg.dataset.fixaProtected === '1') return;
      bg.dataset.fixaProtected = '1';
      bg.addEventListener('click', event => {
        if (event.target === bg) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    });
  }

  function translateCreateError() {
    document.querySelectorAll('.cv3-msg.err').forEach(el => {
      const text = el.textContent || '';
      if (/competitions_period_type_check/i.test(text)) {
        el.textContent = 'Não foi possível criar a competição. Atualize a página e tente novamente.';
      } else if (/violates check constraint/i.test(text)) {
        el.textContent = 'Não foi possível salvar essa configuração. Revise os campos e tente novamente.';
      }
    });
  }

  async function refreshAfterChange() {
    localStorage.removeItem('fixa-selected-competition');
    if (window.FixaCompetitionV3?.load) await window.FixaCompetitionV3.load();
    setTimeout(() => {
      decorateEmptyState();
      const select = document.querySelector('.competition-v3 #cv3select');
      if (select && !select.value) select.style.display = 'none';
    }, 80);
  }

  function installActionOverrides() {
    document.querySelectorAll('.competition-v3 [data-end]').forEach(button => {
      if (button.dataset.fixaOverride === '1') return;
      button.dataset.fixaOverride = '1';
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const id = document.querySelector('.competition-v3 #cv3select')?.value;
        if (!id) return;
        confirmDialog({
          title: 'Encerrar competição?',
          text: 'Tem certeza de que deseja encerrar esta competição? Ela continuará disponível no Histórico e não poderá voltar a ficar ativa.',
          confirmText: 'Encerrar',
          onConfirm: async () => {
            const client = sb();
            if (!client) return { error: new Error('Não foi possível conectar ao servidor.') };
            const result = await client.rpc('end_competition', { p_competition_id: id });
            if (!result.error) await refreshAfterChange();
            return result;
          }
        });
      };
    });

    document.querySelectorAll('.cv3-modal [data-delete]').forEach(button => {
      if (button.dataset.fixaOverride === '1') return;
      button.dataset.fixaOverride = '1';
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const id = button.dataset.delete;
        if (!id) return;
        confirmDialog({
          title: 'Excluir competição?',
          text: 'Essa ação remove a competição definitivamente. Se você só quer parar a competição e manter o histórico, use “Encerrar competição”.',
          confirmText: 'Excluir',
          onConfirm: async () => {
            const client = sb();
            if (!client) return { error: new Error('Não foi possível conectar ao servidor.') };
            const ownerCheck = await client.rpc('competition_is_owner', { p_competition_id: id });
            if (ownerCheck.error) return ownerCheck;
            if (ownerCheck.data !== true) return { error: new Error('Esta competição não pertence à conta conectada. Atualize a página e confirme se você está na conta que criou a competição.') };
            const result = await client.rpc('delete_competition', { p_competition_id: id });
            if (!result.error) {
              document.querySelector('.cv3-modal-bg')?.remove();
              await refreshAfterChange();
            }
            return result;
          }
        });
      };
    });
  }

  let queued = false;
  function apply() {
    queued = false;
    decorateEmptyState();
    protectCreateModal();
    translateCreateError();
    installActionOverrides();
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  const observer = new MutationObserver(queue);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('click', queue, true);
  window.addEventListener('load', queue);
  queue();
})();