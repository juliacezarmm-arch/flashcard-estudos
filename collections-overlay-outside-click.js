/* Fecha Minhas coleções ao clicar fora do painel */
(() => {
  "use strict";

  const app = document.querySelector("#appShell");
  const sidebar = document.querySelector("#collectionsSidebar");
  const menuToggle = document.querySelector("#mobileMenuToggle");

  if (!app || !sidebar || !menuToggle) return;

  function isOpen() {
    return app.classList.contains("collections-overlay-open");
  }

  function closeDrawer() {
    if (!isOpen()) return;

    if (window.FixaCollectionsOverlay?.close) {
      window.FixaCollectionsOverlay.close();
      return;
    }

    app.classList.remove("collections-overlay-open", "mobile-nav-open");
    document.body.classList.remove("collections-overlay-open", "mobile-nav-open");
    document.querySelector("#mobileNavBackdrop")?.setAttribute("hidden", "");
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("pointerdown", event => {
    if (!isOpen()) return;

    const target = event.target;
    if (!(target instanceof Node)) return;
    if (sidebar.contains(target) || menuToggle.contains(target)) return;

    closeDrawer();
  }, true);
})();
