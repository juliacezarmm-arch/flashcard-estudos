(() => {
  "use strict";

  function reviewPanel() {
    const panel = document.querySelector("#fixaImportReview");
    return panel && !panel.hidden ? panel : null;
  }

  function exactUndecidedRows(panel = reviewPanel()) {
    if (!panel) return [];
    return [...panel.querySelectorAll("[data-review-index]")].filter(row =>
      row.querySelector(".fixa-import-tag.exact") &&
      !row.querySelector(".fixa-import-choice.decided")
    );
  }

  function ensureButton() {
    const panel = document.querySelector("#fixaImportReview");
    const toolbar = panel?.querySelector(".fixa-import-toolbar .row");
    if (!toolbar) return;

    let button = toolbar.querySelector("[data-batch-replace-exact]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.dataset.batchReplaceExact = "";
      button.textContent = "Substituir repetidas exatas";
      toolbar.prepend(button);
    }

    button.disabled = exactUndecidedRows(panel).length === 0;
  }

  function markAllExactForReplacement() {
    const panel = reviewPanel();
    if (!panel) return;

    let marked = 0;
    let guard = 0;

    while (guard < 1000) {
      guard += 1;
      const row = exactUndecidedRows(panel)[0];
      if (!row) break;

      row.click();
      const replaceButton = panel.querySelector('[data-decision="replace"]');
      if (!replaceButton) break;
      replaceButton.click();
      marked += 1;
    }

    const notice = panel.querySelector("[data-review-notice]");
    if (notice && marked > 0) {
      notice.textContent = `${marked} questão${marked === 1 ? " repetida exata foi marcada" : " questões repetidas exatas foram marcadas"} para substituir. As possivelmente repetidas continuam aguardando análise individual.`;
      notice.classList.add("success");
    }

    ensureButton();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-batch-replace-exact]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    markAllExactForReplacement();
  }, true);

  new MutationObserver(() => ensureButton()).observe(document.body, {
    childList: true,
    subtree: true
  });

  ensureButton();
})();
