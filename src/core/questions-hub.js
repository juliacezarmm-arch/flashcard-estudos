/* Unifica Questões e Adicionar em uma única área de navegação */
(() => {
  "use strict";

  if (document.querySelector("#questionsHubNav")) return;

  const appShell = document.querySelector("#appShell");
  const main = appShell?.querySelector(":scope > main");
  const topbar = main?.querySelector(":scope > .topbar");
  const tabs = topbar?.querySelector(".tabs");
  const manageView = main?.querySelector("#manage");
  const addView = main?.querySelector("#add");
  const questionsTopButton = tabs?.querySelector('.tab[data-view="manage"]');
  const addTopButton = tabs?.querySelector('.tab[data-view="add"]');

  if (!main || !topbar || !tabs || !manageView || !addView || !questionsTopButton || !addTopButton) return;

  const style = document.createElement("style");
  style.id = "questionsHubStyle";
  style.textContent = `
    #questionsHubNav[hidden] {
      display: none !important;
    }

    /* Adicionar NÃO pertence à navegação principal.
       O acesso ao fluxo de adicionar existe somente dentro de Questões. */
    #appShell .topbar .tabs > .tab[data-view="add"] {
      display: none !important;
    }

    /* O visual e o alinhamento global desta barra ficam em
       secondary-tabs-layout-fix.js. Aqui permanecem apenas
       as regras funcionais/estruturais necessárias do módulo. */
    #questionsHubNav {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    #questionsHubNav::-webkit-scrollbar {
      display: none;
    }

    .questions-hub-button svg {
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    #add .add-mode {
      display: none !important;
    }

    @media (min-width: 861px) {
      body.questions-hub-active #appShell.app:not(.locked) > main {
        grid-template-rows: 56px auto minmax(0, 1fr) !important;
      }

      body.questions-hub-active #manage.view.active,
      body.questions-hub-active #add.view.active {
        grid-row: 3;
      }
    }

    @media (max-width: 860px) {
      #questionsHubNav {
        width: 100%;
        max-width: 100%;
        margin: 0;
      }
    }
  `;
  document.head.appendChild(style);

  function keepAddTopButtonHidden() {
    addTopButton.hidden = true;
    addTopButton.setAttribute("aria-hidden", "true");
    addTopButton.tabIndex = -1;
    addTopButton.classList.remove("active", "fixa-nav-pending");
    addTopButton.removeAttribute("aria-current");
  }

  keepAddTopButtonHidden();

  const nav = document.createElement("nav");
  nav.id = "questionsHubNav";
  nav.setAttribute("aria-label", "Ferramentas de questões");
  nav.innerHTML = `
    <button class="questions-hub-button" type="button" data-questions-hub="all">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="7" y="4" width="11" height="14" rx="2"></rect>
        <path d="M5 7v11a2 2 0 0 0 2 2h8"></path>
      </svg>
      Todas as questões
    </button>
    <button class="questions-hub-button" type="button" data-questions-hub="collection">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"></path>
        <path d="M12 11v5M9.5 13.5h5"></path>
      </svg>
      Criar coleção
    </button>
    <button class="questions-hub-button" type="button" data-questions-hub="question">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z"></path>
        <path d="M13.5 7.5l3 3"></path>
      </svg>
      Adicionar questão
    </button>
    <button class="questions-hub-button" type="button" data-questions-hub="import">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V4"></path>
        <path d="M8 8l4-4 4 4"></path>
        <path d="M20 16.5A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5c0-1.7 1.2-3.1 2.8-3.4A5.2 5.2 0 0 1 17 11.7a4 4 0 0 1 3 4.8z"></path>
      </svg>
      Importar questões
    </button>
    <button class="questions-hub-button" type="button" data-questions-hub="review">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2"></rect>
        <path d="M9 9h6M9 13h3"></path>
        <path d="m14.5 15.5 1.5 1.5 3-3"></path>
      </svg>
      Revisão de questões
    </button>
  `;
  topbar.insertAdjacentElement("afterend", nav);

  const hubButtons = [...nav.querySelectorAll("[data-questions-hub]")];
  const internalButtons = {
    collection: document.querySelector("#showCreateCollection"),
    question: document.querySelector("#showAddQuestion"),
    import: document.querySelector("#showImportQuestion"),
    review: document.querySelector("#showReviewQuestions")
  };

  function activeViewId() {
    return main.querySelector(":scope > .view.active")?.id || "";
  }

  function activeHubMode() {
    const viewId = activeViewId();
    if (viewId === "manage") return "all";
    if (viewId !== "add") return "";
    if (document.querySelector("#reviewQuestionsSection.active")) return "review";
    if (document.querySelector("#addQuestionSection.active")) return "question";
    if (document.querySelector("#importQuestionSection.active")) return "import";
    return "collection";
  }

  function setMainQuestionsState(isActive) {
    keepAddTopButtonHidden();
    questionsTopButton.classList.toggle("active", isActive);
    if (isActive) {
      questionsTopButton.setAttribute("aria-current", "page");
    } else {
      questionsTopButton.removeAttribute("aria-current");
    }
  }

  function sync() {
    keepAddTopButtonHidden();
    const mode = activeHubMode();
    const isHubActive = Boolean(mode);
    nav.hidden = !isHubActive;
    document.body.classList.toggle("questions-hub-active", isHubActive);
    setMainQuestionsState(isHubActive);

    hubButtons.forEach(button => {
      const active = button.dataset.questionsHub === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function openAllQuestions() {
    questionsTopButton.click();
    requestAnimationFrame(sync);
  }

  function openAddMode(mode) {
    addTopButton.click();
    keepAddTopButtonHidden();
    const internalButton = internalButtons[mode];
    if (internalButton) internalButton.click();
    requestAnimationFrame(sync);
  }

  hubButtons.forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.dataset.questionsHub;
      if (mode === "all") {
        openAllQuestions();
      } else {
        openAddMode(mode);
      }
    });
  });

  tabs.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(sync));
  });

  Object.values(internalButtons).filter(Boolean).forEach(button => {
    button.addEventListener("click", () => requestAnimationFrame(sync));
  });

  const observed = [
    tabs,
    manageView,
    addView,
    document.querySelector("#createCollectionSection"),
    document.querySelector("#addQuestionSection"),
    document.querySelector("#importQuestionSection"),
    document.querySelector("#reviewQuestionsSection")
  ].filter(Boolean);

  let syncQueued = false;
  const scheduleSync = () => {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      keepAddTopButtonHidden();
      sync();
    });
  };

  const observer = new MutationObserver(scheduleSync);
  observed.forEach(element => observer.observe(element, {
    attributes: true,
    attributeFilter: ["class", "hidden", "style"]
  }));

  window.addEventListener("popstate", scheduleSync);
  document.addEventListener("visibilitychange", scheduleSync);
  sync();
})();
