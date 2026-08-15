/* Ajustes visuais do menu de coleções: menus flutuantes e cabeçalho das pastas */
(() => {
  "use strict";

  if (window.FixaCollectionsFloatingMenuFix) return;

  const style = document.createElement("style");
  style.id = "fixaCollectionsFloatingMenuFixStyle";
  style.textContent = `
    .sidebar-menu {
      z-index: 430 !important;
      min-width: 230px !important;
      max-width: min(290px, calc(100vw - 20px)) !important;
      border: 1px solid #dbe5f4 !important;
      border-radius: 13px !important;
      padding: 7px !important;
      gap: 3px !important;
      background: #ffffff !important;
      box-shadow: 0 20px 55px rgba(15, 23, 42, 0.22) !important;
      pointer-events: auto !important;
    }

    .sidebar-menu button {
      width: 100% !important;
      min-height: 40px !important;
      border-radius: 9px !important;
      padding: 9px 11px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      color: #26324b !important;
      background: transparent !important;
      font-size: 13px !important;
      font-weight: 750 !important;
      text-align: left !important;
      white-space: nowrap !important;
    }

    .sidebar-menu button:hover,
    .sidebar-menu button:focus-visible {
      color: #1d4ed8 !important;
      background: #eef4ff !important;
    }

    .sidebar-menu button.danger-option {
      color: #dc2626 !important;
    }

    .sidebar-menu button.danger-option:hover,
    .sidebar-menu button.danger-option:focus-visible {
      color: #b91c1c !important;
      background: #fff1f2 !important;
    }

    /* A faixa inteira da pasta já expande/recolhe. O botão + / − apenas
       consumia largura e fazia o nome compartilhado quebrar em duas linhas. */
    #collectionsSidebar .folder-toggle-mark {
      display: none !important;
    }

    #collectionsSidebar .folder-title {
      grid-template-columns: auto minmax(0, 1fr) auto auto !important;
    }

    #collectionsSidebar .folder-title .folder-name {
      min-width: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }

    #collectionsSidebar .drawer-folder-name-text {
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    #collectionsSidebar .folder-title:has(.drawer-shared-folder-mark) .drawer-folder-name-text {
      font-size: 12px !important;
    }

    #collectionsSidebar .drawer-shared-folder-mark {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      flex: 0 0 18px !important;
      margin-left: 0 !important;
      vertical-align: middle !important;
    }
  `;
  document.head.appendChild(style);

  const subjects = document.querySelector("#subjects");

  /*
   * O código original abre o menu no clique dos três pontinhos. O novo painel
   * sobreposto também escuta o clique na coleção e tentava fechar o painel logo
   * depois. Esta interrupção ocorre somente depois de o código original abrir o
   * menu, preservando todas as ações existentes.
   */
  subjects?.addEventListener("click", event => {
    if (!event.target.closest?.("[data-folder-menu], [data-subject-menu]")) return;
    event.stopPropagation();
  });

  window.FixaCollectionsFloatingMenuFix = true;
})();
