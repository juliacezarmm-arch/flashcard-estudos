/* Visibilidade dos menus e opções alfabéticas dentro de Ordenar coleções */
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

    #collectionOrderModal .collection-order-tools .row {
      flex-wrap: wrap;
    }

    #collectionOrderModal [data-order-alpha],
    #collectionOrderModal [data-order-alpha-desc] {
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  function removeOldTopLevelSortActions(root = document) {
    root.querySelectorAll?.(
      '.sidebar-menu [data-folder-action="sort-az"], .sidebar-menu [data-folder-action="sort-za"]'
    ).forEach(button => button.remove());
  }

  function enhanceOrderManager() {
    const modal = document.querySelector("#collectionOrderModal");
    if (!modal) return;

    const ascending = modal.querySelector("[data-order-alpha]");
    if (ascending) ascending.textContent = "A→Z Ordenar de A a Z";

    const toolsRow = ascending?.closest(".row");
    if (!toolsRow || toolsRow.querySelector("[data-order-alpha-desc]")) return;

    const descending = document.createElement("button");
    descending.className = "secondary";
    descending.type = "button";
    descending.dataset.orderAlphaDesc = "";
    descending.textContent = "Z→A Ordenar de Z a A";

    const reset = toolsRow.querySelector("[data-order-reset]");
    toolsRow.insertBefore(descending, reset || null);
  }

  function sortVisibleOrderDescending() {
    const modal = document.querySelector("#collectionOrderModal");
    const list = modal?.querySelector("[data-order-list]");
    if (!modal || modal.hidden || !list) return;

    const rows = [...list.querySelectorAll("[data-order-row]")];
    if (rows.length < 2) return;

    rows.sort((first, second) => {
      const firstName = first.querySelector(".collection-order-name")?.textContent || "";
      const secondName = second.querySelector(".collection-order-name")?.textContent || "";
      return secondName.localeCompare(firstName, "pt-BR", {
        sensitivity: "base",
        numeric: true
      });
    });

    rows.forEach(row => list.appendChild(row));

    /* O módulo original sincroniza a ordem de trabalho ao receber dragend. */
    rows[0]?.dispatchEvent(new Event("dragend", { bubbles: true }));
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-folder-order]")) {
      requestAnimationFrame(enhanceOrderManager);
      return;
    }

    const descending = event.target.closest?.("[data-order-alpha-desc]");
    if (!descending) return;

    event.preventDefault();
    sortVisibleOrderDescending();
  });

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        removeOldTopLevelSortActions(node);
        if (node.id === "collectionOrderModal" || node.querySelector?.("#collectionOrderModal")) {
          enhanceOrderManager();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  removeOldTopLevelSortActions();
  enhanceOrderManager();

  window.FixaCollectionsMenuActions = {
    enhanceOrderManager,
    sortVisibleOrderDescending
  };
})();
