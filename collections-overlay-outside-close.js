/* Fecha o menu Minhas coleções ao clicar fora dele */
(() => {
  "use strict";

  const app = document.querySelector("#appShell");
  const sidebar = document.querySelector("#collectionsSidebar");
  const menuToggle = document.querySelector("#mobileMenuToggle");
  const OPEN_CLASS = "collections-overlay-open";

  if (!app || !sidebar || !menuToggle) return;

  document.addEventListener("pointerdown", event => {
    if (!app.classList.contains(OPEN_CLASS)) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (sidebar.contains(target) || menuToggle.contains(target)) return;
    window.FixaCollectionsOverlay?.close?.();
  }, true);
})();
