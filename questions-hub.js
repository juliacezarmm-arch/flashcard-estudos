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

    /* Mesmo componente visual usado nas abas Hoje, Progresso, Atividade e Análise. */
    #questionsHubNav {
      width: fit-content;
      max-width: min(100%, 1180px);
      min-height: 38px;
      margin: 0 auto;
      padding: 4px;
      display: inline-flex;
      align-items: center;
      justify-self: start;
      gap: 4px;
      border: 0;
      border-radius: 10px;
      background: #f1f5f9;
      box-shadow: none;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    #questionsHubNav::-webkit-scrollbar {
      display: none;
    }

    .questions-hub-button {
      width: auto;
      min-width: max-content;
      min-height: 30px;
      flex: 0 0 auto;
      border: 0;
      border-radius: 8px;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #64748b;
      background: transparent;
      box-shadow: none;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    .questions-hub-button:hover:not(.active),
    .questions-hub-button:focus-visible:not(.active) {
      color: #2563eb !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .questions-hub-button.active,
    .questions-hub-button.active:hover,
    .questions-hub-button.active:focus-visible {
      color: #2563eb !important;
      background: #ffffff !important;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08) !important;
    }

    .questions-hub-button svg {
      width: 17px;
      height: 17px;
      flex: 0 0 17px;
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
        grid-template-rows: 52px auto minmax(0, 1fr) !important;
      }

      body.questions-hub-active #questionsHubNav {
        margin-left: max(0px, calc((100% - 1180px) / 2));
        margin-right: auto;
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

      .questions-hub-button {
        min-height: 30px;
        padding: 0 12px;
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(style);

  addTopButton.hidden = true;
  addTopButton.setAttribute("aria-hidden", "true");
  addTopButton.tabIndex = -1;

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
    questionsTopButton.classList.toggle("active", isActive);
    if (isActive) {
      questionsTopButton.setAttribute("aria-current", "page");
    } else {
      questionsTopButton.removeAttribute("aria-current");
    }
    addTopButton.classList.remove("active");
    addTopButton.removeAttribute("aria-current");
  }

  function sync() {
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
      sync();
    });
  };

  const observer = new MutationObserver(scheduleSync);
  observed.forEach(element => observer.observe(element, {
    attributes: true,
    attributeFilter: ["class", "hidden"]
  }));

  window.addEventListener("popstate", scheduleSync);
  document.addEventListener("visibilitychange", scheduleSync);
  sync();
})();
