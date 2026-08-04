(() => {
  "use strict";

  if (window.__fixaCollectionOpenQuestionsLoaded) return;
  window.__fixaCollectionOpenQuestionsLoaded = true;

  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-subject-menu]")) return;

    const collection = event.target.closest?.("#subjects .subject[data-id]");
    if (!collection) return;

    setTimeout(() => {
      if (typeof showView === "function") showView("manage");
    }, 0);
  }, true);
})();
