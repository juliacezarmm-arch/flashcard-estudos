(() => {
  'use strict';
  if (window.FixaCompetitionActiveFlowV1) return;
  window.FixaCompetitionActiveFlowV1 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  function trophySvg() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></svg>`;
  }

  function managerOwnsHome(view) {
    return !!view && (
      view.classList.contains('cv7-home-open') ||
      !!view.querySelector('.cv7-manager, .cv7-loading')
    );
  }

  function renderNoActiveCompetition() {
    const view = document.querySelector('.competition-v3.active');
    if (managerOwnsHome(view)) return;
    const root = view?.querySelector('#cv3');
    if (!root) return;

    const hero = root.querySelector('.cv3-hero');
    const nav = view?.querySelector('.cv3-secondary-nav');
    if (!hero) return;

    root.querySelectorAll('.cv3-dashboard, .cv3-empty').forEach(el => el.remove());
    hero.querySelector('select')?.style.setProperty('display', 'none');

    const empty = document.createElement('div');
    empty.className = 'cv3-card cv3-empty cv3-empty-state';
    empty.innerHTML = `
      <div class="cv3-empty-state-visual">${trophySvg()}</div>
      <h3>Crie sua primeira competição</h3>
      <p class="cv3-muted">Escolha uma pasta, defina o período ou use tempo indeterminado e convide seus amigos.</p>
      <button class="cv3-empty-create" type="button">Criar competição</button>
    `;
    empty.querySelector('.cv3-empty-create').onclick = () => nav?.querySelector('[data-create]')?.click();
    root.appendChild(empty);
  }

  function openCompetitionFromManager(button) {
    const id = button?.dataset?.cv7Open;
    if (!id) return false;

    const view = button.closest('.competition-v3') || document.querySelector('.competition-v3.active');
    const root = view?.querySelector('#cv3');
    if (!view || !root) return false;

    (window.FixaCompetitionSelection?.set ? window.FixaCompetitionSelection.set(id) : localStorage.setItem('fixa-selected-competition', id));
    sessionStorage.removeItem('fixa-open-competition-on-load');
    sessionStorage.removeItem('fixa-open-competition-detail');
    if (button.dataset.cv7Status === 'completed') sessionStorage.setItem('fixa-open-completed-result', '1');
    else sessionStorage.removeItem('fixa-open-completed-result');

    /* A lista não pode continuar sendo dona da área enquanto o dashboard abre. */
    view.classList.remove('cv7-home-open');
    root.querySelectorAll('.cv7-manager, .cv7-loading').forEach(element => element.remove());

    const select = root.querySelector('#cv3select');
    if (select) {
      select.style.removeProperty('display');
      select.value = id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    /* Fallback raro: recria a estrutura e tenta novamente quando o select voltar. */
    window.FixaCompetitionV3?.load?.();
    window.setTimeout(() => {
      const freshSelect = document.querySelector('.competition-v3.active #cv3select');
      if (!freshSelect) return;
      freshSelect.value = id;
      freshSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }, 80);
    return true;
  }

  async function syncActiveSelection() {
    const view = document.querySelector('.competition-v3.active');
    const client = sb();
    if (!view || managerOwnsHome(view) || !client || view.querySelector('.cv3-modal-bg, .cv3-confirm-bg')) return;

    const { data: list, error } = await client.rpc('list_my_competitions');
    if (error || !Array.isArray(list) || managerOwnsHome(view)) return;

    const active = list.find(c => c.effective_status === 'active') || list.find(c => c.effective_status === 'upcoming');
    const select = view.querySelector('#cv3select');
    const selected = list.find(c => c.id === select?.value);

    if (active) {
      if (!selected || selected.effective_status === 'completed') {
        (window.FixaCompetitionSelection?.set ? window.FixaCompetitionSelection.set(active.id) : localStorage.setItem('fixa-selected-competition', active.id));
        if (window.FixaCompetitionV3?.load && !managerOwnsHome(view)) {
          await window.FixaCompetitionV3.load();
        }
      }
      return;
    }

    if (!selected || selected.effective_status === 'completed') {
      (window.FixaCompetitionSelection?.remove ? window.FixaCompetitionSelection.remove() : localStorage.removeItem('fixa-selected-competition'));
      renderNoActiveCompetition();
    }
  }

  let timer = null;
  function queue(delay = 140) {
    clearTimeout(timer);
    timer = setTimeout(() => syncActiveSelection().catch(() => {}), delay);
  }

  /*
    Não observa mais o DOM inteiro. O fluxo só é conferido quando existe
    uma navegação/ação real relacionada à Competição.
  */
  document.addEventListener('click', event => {
    const openButton = event.target.closest('.competition-v3 [data-cv7-open]');
    if (openButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCompetitionFromManager(openButton);
      return;
    }

    if (event.target.closest('[data-competition-view], .cv3-confirm-danger, [data-history-open]')) {
      queue(180);
    }
  }, true);

  window.addEventListener('load', () => queue(180), { once:true });
})();