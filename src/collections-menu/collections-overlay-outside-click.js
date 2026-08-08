/* Fecha Minhas coleções ao clicar fora do painel e evita abrir o teclado automaticamente */
(() => {
  "use strict";

  const app = document.querySelector("#appShell");
  const sidebar = document.querySelector("#collectionsSidebar");
  const menuToggle = document.querySelector("#mobileMenuToggle");

  if (!app || !sidebar || !menuToggle) return;

  let openedAt = 0;

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

  new MutationObserver(() => {
    if (isOpen()) openedAt = performance.now();
  }).observe(app, {
    attributes: true,
    attributeFilter: ["class"]
  });

  document.addEventListener("focusin", event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.id !== "collectionsDrawerSearch") return;
    if (!isOpen()) return;

    const automaticFocus = performance.now() - openedAt < 350;
    if (automaticFocus) target.blur();
  }, true);

  document.addEventListener("pointerdown", event => {
    if (!isOpen()) return;

    const target = event.target;
    if (!(target instanceof Node)) return;
    if (sidebar.contains(target) || menuToggle.contains(target)) return;

    closeDrawer();
  }, true);
})();
