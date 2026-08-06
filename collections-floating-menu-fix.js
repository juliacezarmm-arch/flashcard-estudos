/* Restaura o menu flutuante dos três pontinhos acima do painel de coleções */
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
