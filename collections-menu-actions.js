/* Ações adicionais e visibilidade dos menus de pastas e coleções */
(() => {
  "use strict";

  if (window.FixaCollectionsMenuActions) return;

  const style = document.createElement("style");
  style.id = "fixaCollectionsMenuActionsStyle";
  style.textContent = `
    #collectionsSidebar .folder-options {
      opacity: 1 !important;
      color: #4f5e77 !important;
    }

    #collectionsSidebar .subject:not(.active) .subject-options {
      opacity: 1 !important;
      color: #738098 !important;
      border-color: transparent !important;
      background: transparent !important;
    }

    #collectionsSidebar .subject.active .subject-options {
      opacity: 1 !important;
      color: #ffffff !important;
    }

    #collectionsSidebar .folder-options,
    #collectionsSidebar .subject-options {
      min-width: 28px !important;
      min-height: 28px !important;
    }

    .sidebar-menu [data-folder-action="sort-az"],
    .sidebar-menu [data-folder-action="sort-za"] {
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  const originalSidebarMenuHtmlForOrdering = sidebarMenuHtml;
  sidebarMenuHtml = function sidebarMenuHtmlWithFolderOrdering(type) {
    const html = originalSidebarMenuHtmlForOrdering(type);
    if (type !== "folder" || html.includes('data-folder-action="sort-az"')) return html;

    return html.replace(
      '<button type="button" data-folder-action="rename">✎ Renomear pasta</button>',
      `<button type="button" data-folder-action="rename">✎ Renomear pasta</button>
       <button type="button" data-folder-action="sort-az">A→Z Ordenar coleções de A a Z</button>
       <button type="button" data-folder-action="sort-za">Z→A Ordenar coleções de Z a A</button>`
    );
  };

  function compareCollectionNames(a, b, direction) {
    const result = String(a?.name || "").localeCompare(String(b?.name || ""), "pt-BR", {
      sensitivity: "base",
      numeric: true,
      ignorePunctuation: false
    });
    return direction === "za" ? -result : result;
  }

  function sortFolderCollections(folderId, direction) {
    const targetFolderId = String(folderId || "");
    if (!targetFolderId || !Array.isArray(data?.subjects)) return;

    const positions = [];
    data.subjects.forEach((subject, index) => {
      if (String(subject?.folder || "") === targetFolderId) positions.push(index);
    });

    if (positions.length < 2) return;

    const ordered = positions
      .map(index => data.subjects[index])
      .sort((a, b) => compareCollectionNames(a, b, direction));

    positions.forEach((position, index) => {
      data.subjects[position] = ordered[index];
    });

    if (typeof save === "function") save();
    if (typeof renderSubjects === "function") renderSubjects();

    requestAnimationFrame(() => {
      window.FixaCollectionsOverlay?.refresh?.();
    });
  }

  document.addEventListener("click", event => {
    const actionButton = event.target.closest?.(
      '[data-folder-action="sort-az"], [data-folder-action="sort-za"]'
    );
    if (!actionButton) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const menu = actionButton.closest(".sidebar-menu");
    const folderId = menu?.dataset.menuId || "";
    const direction = actionButton.dataset.folderAction === "sort-za" ? "za" : "az";

    if (typeof closeSidebarMenu === "function") closeSidebarMenu();
    sortFolderCollections(folderId, direction);
  }, true);

  window.FixaCollectionsMenuActions = {
    sortFolderCollections
  };
})();
