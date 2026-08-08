(() => {
  'use strict';
  if (window.FixaCompetitionActiveFlowV1) return;
  window.FixaCompetitionActiveFlowV1 = true;

  const sb = () => window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  function trophySvg() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></svg>`;
  }

  function renderNoActiveCompetition() {
    const root = document.querySelector('.competition-v3.active #cv3');
    if (!root) return;

    const hero = root.querySelector('.cv3-hero');
    const nav = root.querySelector('.cv3-secondary-nav');
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

  async function syncActiveSelection() {
    const view = document.querySelector('.competition-v3.active');
    const client = sb();
    if (!view || !client || view.querySelector('.cv3-modal-bg, .cv3-confirm-bg')) return;

    const { data: list, error } = await client.rpc('list_my_competitions');
    if (error || !Array.isArray(list)) return;

    const active = list.find(c => c.effective_status === 'active') || list.find(c => c.effective_status === 'upcoming');
    const select = view.querySelector('#cv3select');
    const selected = list.find(c => c.id === select?.value);

    if (active) {
      if (!selected || selected.effective_status === 'completed') {
        localStorage.setItem('fixa-selected-competition', active.id);
        if (window.FixaCompetitionV3?.load) {
          await window.FixaCompetitionV3.load();
        }
      }
      return;
    }

    if (!selected || selected.effective_status === 'completed') {
      localStorage.removeItem('fixa-selected-competition');
      renderNoActiveCompetition();
    }
  }

  let timer = null;
  function queue() {
    clearTimeout(timer);
    timer = setTimeout(() => syncActiveSelection().catch(() => {}), 140);
  }

  const observer = new MutationObserver(queue);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view], .cv3-confirm-danger, [data-history-open]')) {
      setTimeout(queue, 180);
      setTimeout(queue, 600);
    }
  }, true);

  window.addEventListener('load', queue);
})();