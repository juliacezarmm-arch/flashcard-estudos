(() => {
  if (document.querySelector('#addSpacingFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'addSpacingFixStyle';
  style.textContent = `
    /* Impede que os blocos internos da área Adicionar se espalhem pela altura do cartão. */
    #add .add-section.active {
      align-content: start !important;
      justify-content: stretch !important;
      grid-auto-rows: max-content !important;
    }

    #add #importQuestionSection.active {
      grid-template-rows: max-content max-content !important;
    }

    #add #importQuestionSection .import-box,
    #add #addQuestionSection .form,
    #add #createCollectionSection .collection-flow,
    #add #reviewQuestionsSection {
      align-content: start !important;
    }

    @media (min-width: 861px) {
      #add.view.active .unified-add-panel {
        justify-content: flex-start !important;
      }

      #add.view.active .add-section.active {
        flex: 1 1 auto;
        align-self: stretch;
      }
    }
  `;

  document.head.appendChild(style);
})();

/* Atualiza a Home uma única vez quando os dados reais terminarem de carregar.
   Evita o estado falso com 0 coleções/questões sem reintroduzir a oscilação antiga. */
(() => {
  'use strict';
  if (window.FixaHomeDataReadyRefreshV1) return;
  window.FixaHomeDataReadyRefreshV1 = true;

  let completed = false;
  let attempts = 0;

  function dataIsReady() {
    try {
      if (typeof data === 'undefined' || !data) return false;
      const subjects = Array.isArray(data.subjects) ? data.subjects : [];
      const tests = Array.isArray(data.testHistory) ? data.testHistory : [];
      const cards = subjects.reduce((sum, subject) => {
        return sum + (Array.isArray(subject?.cards) ? subject.cards.length : 0);
      }, 0);
      return subjects.length > 0 || cards > 0 || tests.length > 0;
    } catch (_) {
      return false;
    }
  }

  function refreshHomeWhenReady() {
    if (completed || !dataIsReady()) return false;

    const weeklyRefresh = window.FixaHomeWeeklyDashboardV2?.refresh;
    if (typeof weeklyRefresh !== 'function') return false;

    weeklyRefresh();
    window.FixaHomeUnifiedDashboardV2?.refresh?.();
    completed = true;
    return true;
  }

  const timer = window.setInterval(() => {
    attempts += 1;
    if (refreshHomeWhenReady() || attempts >= 120) {
      window.clearInterval(timer);
    }
  }, 250);

  window.addEventListener('fixa-cloud-data-loaded', () => {
    completed = false;
    refreshHomeWhenReady();
  });

  window.addEventListener('load', () => {
    window.setTimeout(refreshHomeWhenReady, 0);
  }, { once: true });
})();

/* Regras da Competição em modal: remove a caixa fixa e adiciona um acesso secundário. */
(() => {
  'use strict';
  if (window.FixaCompetitionRulesModalV1) return;
  window.FixaCompetitionRulesModalV1 = true;

  const RULES_BUTTON = 'data-competition-rules';

  function ensureStyle() {
    if (document.querySelector('#fixaCompetitionRulesModalV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaCompetitionRulesModalV1Style';
    style.textContent = `
      .fixa-competition-rules-body{padding:20px 22px 22px;display:grid;gap:18px}
      .fixa-competition-rules-section{display:grid;gap:9px}
      .fixa-competition-rules-section h4{margin:0;color:#172033;font-size:14px}
      .fixa-competition-rules-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .fixa-competition-rule{min-height:96px;border:1px solid #e1e8f2;border-radius:12px;padding:13px 12px;display:grid;align-content:center;gap:5px;background:#fff}
      .fixa-competition-rule strong{color:#2563eb;font-size:18px;line-height:1.1}
      .fixa-competition-rule span{color:#59677f;font-size:11px;line-height:1.45}
      .fixa-competition-rules-note{margin:0;padding:12px 14px;border:1px solid #dbe7fb;border-radius:10px;background:#f8fbff;color:#53617a;font-size:11px;line-height:1.55}
      @media(max-width:700px){.fixa-competition-rules-grid{grid-template-columns:1fr}.fixa-competition-rule{min-height:78px}.fixa-competition-rules-body{padding:16px}}
    `;
    document.head.appendChild(style);
  }

  function rulesIcon() {
    return '<svg class="cv3-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path></svg>';
  }

  function rulesContent() {
    return `
      <div class="fixa-competition-rules-body">
        <section class="fixa-competition-rules-section">
          <h4>XP da atividade</h4>
          <div class="fixa-competition-rules-grid">
            <div class="fixa-competition-rule"><strong>+1 XP</strong><span>por questão respondida em teste concluído</span></div>
            <div class="fixa-competition-rule"><strong>+4 XP</strong><span>extras quando a questão é dominada pela primeira vez</span></div>
            <div class="fixa-competition-rule"><strong>+5 XP</strong><span>por manter a sequência de estudos</span></div>
          </div>
        </section>
        <section class="fixa-competition-rules-section">
          <h4>Bônus dos objetivos</h4>
          <div class="fixa-competition-rules-grid">
            <div class="fixa-competition-rule"><strong>+20 XP</strong><span>ao cumprir o objetivo de questões</span></div>
            <div class="fixa-competition-rule"><strong>+25 XP</strong><span>ao cumprir o objetivo de testes</span></div>
            <div class="fixa-competition-rule"><strong>+40 XP</strong><span>ao cumprir o objetivo de domínio</span></div>
          </div>
        </section>
        <p class="fixa-competition-rules-note">Teste coleção e Teste pasta pontuam da mesma forma. Só testes concluídos geram XP. Questões puladas não pontuam. A mesma atividade não pontua duas vezes e o limite diário definido na competição continua valendo.</p>
      </div>
    `;
  }

  function closeModal() {
    document.querySelector('.fixa-competition-rules-modal')?.remove();
    document.querySelector(`[${RULES_BUTTON}]`)?.classList.remove('active');
  }

  function openModal() {
    closeModal();
    ensureStyle();

    const bg = document.createElement('div');
    bg.className = 'cv3-modal-bg fixa-competition-rules-modal';
    bg.innerHTML = `
      <div class="cv3-modal wide" role="dialog" aria-modal="true" aria-labelledby="fixaCompetitionRulesTitle">
        <div class="cv3-modal-head">
          <div class="cv3-modal-title">
            <span class="cv3-modal-title-icon">${rulesIcon()}</span>
            <div><h3 id="fixaCompetitionRulesTitle">Regras de pontuação</h3><p>Como o XP da competição é calculado.</p></div>
          </div>
          <button class="cv3-close" type="button" data-competition-rules-close aria-label="Fechar">×</button>
        </div>
        ${rulesContent()}
      </div>
    `;
    document.body.appendChild(bg);
    document.querySelector(`[${RULES_BUTTON}]`)?.classList.add('active');

    bg.querySelector('[data-competition-rules-close]')?.addEventListener('click', closeModal);
    bg.addEventListener('click', event => { if (event.target === bg) closeModal(); });
  }

  function ensureRulesButton() {
    const nav = document.querySelector('.competition-v3 > .cv3-secondary-nav');
    if (!nav) return null;

    let button = nav.querySelector(`[${RULES_BUTTON}]`);
    if (!button) {
      button = document.createElement('button');
      button.className = 'home-subtab';
      button.type = 'button';
      button.setAttribute(RULES_BUTTON, '1');
      button.setAttribute('aria-label', 'Regras de pontuação');
      button.innerHTML = `${rulesIcon()}<span>Regras</span>`;
      const invites = nav.querySelector('[data-cv9-invitations]');
      if (invites) invites.insertAdjacentElement('afterend', button);
      else nav.appendChild(button);
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openModal();
      });
    }
    return button;
  }

  function removeFixedRules() {
    document.querySelectorAll('.competition-v3 .cv3-area-rules').forEach(card => card.remove());
  }

  function apply() {
    ensureStyle();
    removeFixedRules();
    ensureRulesButton();
  }

  window.addEventListener('fixa-competition-detail-rendered', () => {
    apply();
    window.setTimeout(apply, 80);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view], .competition-v3 .cv3-secondary-nav')) {
      window.setTimeout(apply, 100);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  window.addEventListener('load', () => window.setTimeout(apply, 500), { once: true });
  window.setTimeout(apply, 700);
})();

/* Carrega a proteção de leitura e sinalização da pasta compartilhada. */
(() => {
  'use strict';
  if (window.FixaSharedParticipantGuardLoaderV1) return;
  window.FixaSharedParticipantGuardLoaderV1 = true;
  const script = document.createElement('script');
  script.src = `src/competition/competition-shared-participant-guard-v1.js?v=${Date.now()}`;
  script.async = false;
  document.head.appendChild(script);
})();

/* Alinha saudação e data ao canto superior direito da Home. */
(() => {
  'use strict';
  if (window.FixaHomeGreetingRightLoaderV1) return;
  window.FixaHomeGreetingRightLoaderV1 = true;
  const script = document.createElement('script');
  script.src = `src/fixes/home-greeting-right-v1.js?v=${Date.now()}`;
  script.async = false;
  document.head.appendChild(script);
})();
