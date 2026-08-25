(() => {
  "use strict";

  if (window.__fixaCollectionOpenQuestionsLoaded) return;
  window.__fixaCollectionOpenQuestionsLoaded = true;

  function leaveHomeMode() {
    document.body?.classList.remove("home-active", "home-activity-active");
    document.querySelector("#home.home-view")?.classList.remove("active");
    document.querySelectorAll("#homeTopTab, .topbar-right .tabs > .tab[data-view='home']").forEach(button => {
      button.classList.remove("active");
      button.removeAttribute("aria-current");
    });
  }

  function syncTopbar(viewId) {
    document.querySelectorAll(".topbar-right .tabs > .tab").forEach(button => {
      const active = button.dataset.view === viewId;
      if (button.dataset.view || button.dataset.competitionView) button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-subject-menu]")) return;

    const collection = event.target.closest?.("#subjects .subject[data-id]");
    if (!collection) return;

    setTimeout(() => {
      leaveHomeMode();
      if (typeof showView === "function") showView("manage");
      syncTopbar("manage");
      requestAnimationFrame(() => syncTopbar("manage"));
    }, 0);
  }, true);

  if (!window.FixaTestFolder && !document.querySelector('script[data-fixa-test-folder-loader]')) {
    const script = document.createElement("script");
    script.src = `src/test/test-folder.js?v=${Date.now()}`;
    script.dataset.fixaTestFolderLoader = "1";
    script.defer = true;
    document.head.appendChild(script);
  }
})();