/* Menu de coleções em sobreposição — desktop e celular */
(() => {
  "use strict";

  const STORAGE_KEY = "fixa-favorite-collections-v1";
  const OPEN_CLASS = "collections-overlay-open";
  const FILTERS = new Set(["all", "folders", "favorites"]);

  const app = document.querySelector("#appShell");
  const sidebar = document.querySelector("#collectionsSidebar");
  const backdrop = document.querySelector("#mobileNavBackdrop");
  const menuToggle = document.querySelector("#mobileMenuToggle");
  const subjects = document.querySelector("#subjects");

  if (!app || !sidebar || !backdrop || !menuToggle || !subjects) return;

  let activeFilter = "all";
  let searchTerm = "";
  let decorating = false;
  let decorateQueued = false;

  function queueDecorateSubjects() {
    if (decorateQueued) return;
    decorateQueued = true;
    requestAnimationFrame(() => {
      decorateQueued = false;
      decorateSubjects();
    });
  }

  function readFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set();
    }
  }

  let favorites = readFavorites();

  function canAutoFocusSearch() {
    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches === true;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
    const hoverNone = window.matchMedia?.("(hover: none)")?.matches === true;
    const touchPoints = Number(navigator.maxTouchPoints || 0);
    return finePointer && !coarsePointer && !hoverNone && touchPoints === 0 && window.innerWidth >= 1024;
  }

  function saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.warn("[Fixa] Não foi possível salvar os favoritos:", error);
    }
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function openDrawer() {
    app.classList.add(OPEN_CLASS);
    app.classList.add("mobile-nav-open");
    document.body.classList.add(OPEN_CLASS);
    document.body.classList.add("mobile-nav-open");
    backdrop.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    if (canAutoFocusSearch()) {
      requestAnimationFrame(() => document.querySelector("#collectionsDrawerSearch")?.focus({ preventScroll: true }));
    }
  }

  function closeDrawer() {
    app.classList.remove(OPEN_CLASS);
    app.classList.remove("mobile-nav-open");
    document.body.classList.remove(OPEN_CLASS);
    document.body.classList.remove("mobile-nav-open");
    backdrop.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
  }

  function toggleDrawer() {
    if (app.classList.contains(OPEN_CLASS)) closeDrawer();
    else openDrawer();
  }

  function setFilter(nextFilter) {
    activeFilter = FILTERS.has(nextFilter) ? nextFilter : "all";
    document.querySelectorAll(".collections-filter-tab").forEach(button => {
      const active = button.dataset.collectionsFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    applyFilter();
  }

  function addDrawerChrome() {
    sidebar.setAttribute("role", "dialog");
    sidebar.setAttribute("aria-modal", "true");
    sidebar.setAttribute("aria-label", "Minhas coleções");
    sidebar.setAttribute("aria-hidden", "true");

    const sideHead = sidebar.querySelector(".side-head");
    if (sideHead) {
      sideHead.className = "collections-drawer-head";
      sideHead.innerHTML = `
        <button class="collections-drawer-icon-button" id="collectionsDrawerClose" type="button" aria-label="Fechar coleções" title="Fechar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
        </button>
        <div class="collections-drawer-title">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"></path></svg>
          <span>Minhas coleções</span>
        </div>
        <button class="collections-drawer-icon-button" id="collectionsDrawerAdd" type="button" aria-label="Criar coleção" title="Criar coleção">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
        </button>
      `;
    }

    if (!sidebar.querySelector(".collections-drawer-search-wrap")) {
      const searchWrap = document.createElement("div");
      searchWrap.className = "collections-drawer-search-wrap";
      searchWrap.innerHTML = `
        <input class="collections-drawer-search" id="collectionsDrawerSearch" type="search" placeholder="Buscar coleções..." aria-label="Buscar coleções">
        <button class="collections-drawer-icon-button" id="collectionsClearSearch" type="button" aria-label="Limpar busca" title="Limpar busca">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"></path></svg>
        </button>
      `;
      subjects.insertAdjacentElement("beforebegin", searchWrap);
    }

    if (!sidebar.querySelector(".collections-filter-tabs")) {
      const tabs = document.createElement("div");
      tabs.className = "collections-filter-tabs";
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Filtrar coleções");
      tabs.innerHTML = `
        <button class="collections-filter-tab active" type="button" role="tab" data-collections-filter="all" aria-selected="true">Todos</button>
        <button class="collections-filter-tab" type="button" role="tab" data-collections-filter="folders" aria-selected="false">Pastas</button>
        <button class="collections-filter-tab" type="button" role="tab" data-collections-filter="favorites" aria-selected="false">Favoritas</button>
      `;
      subjects.insertAdjacentElement("beforebegin", tabs);
    }

    if (!sidebar.querySelector(".collections-manage-button")) {
      const manage = document.createElement("button");
      manage.className = "collections-manage-button";
      manage.id = "collectionsManageFolders";
      manage.type = "button";
      manage.innerHTML = '<span aria-hidden="true">⊞</span><span>Gerenciar pastas</span>';
      const footer = sidebar.querySelector(".side-footer");
      if (footer) footer.insertAdjacentElement("beforebegin", manage);
      else sidebar.appendChild(manage);
    }
  }

  function openAddCollection() {
    closeDrawer();
    document.querySelector('[data-view="add"]')?.click();
    requestAnimationFrame(() => document.querySelector("#showCreateCollection")?.click());
  }

  function colorForIndex(index) {
    const colors = ["#4f7df3", "#35b7a4", "#f16464", "#8d68e8", "#f59e42", "#ec5ca8", "#e2b43c"];
    return colors[index % colors.length];
  }

  function decorateSubjects() {
    if (decorating) return;
    decorating = true;
    try {
      const folderBlocks = [...subjects.querySelectorAll(".folder-block")];
      let globalIndex = 0;

      folderBlocks.forEach(block => {
        const rows = [...block.querySelectorAll(":scope > .subject")];
        const title = block.querySelector(":scope > .folder-title");
        if (title && !title.querySelector(".drawer-folder-count")) {
          const count = document.createElement("small");
          count.className = "drawer-folder-count";
          count.textContent = `${rows.length} ${rows.length === 1 ? "coleção" : "coleções"}`;
          const options = title.querySelector(".folder-options");
          title.insertBefore(count, options || title.lastElementChild);
        } else if (title?.querySelector(".drawer-folder-count")) {
          const count = title.querySelector(".drawer-folder-count");
          const nextText = `${rows.length} ${rows.length === 1 ? "coleção" : "coleções"}`;
          if (count.textContent !== nextText) count.textContent = nextText;
        }

        rows.forEach(row => {
          const id = String(row.dataset.id || "");
          if (!row.querySelector(".collection-book-icon")) {
            const book = document.createElement("span");
            book.className = "collection-book-icon";
            book.setAttribute("aria-hidden", "true");
            book.style.setProperty("--book-color", colorForIndex(globalIndex));
            row.insertBefore(book, row.firstElementChild);
          }

          let favoriteButton = row.querySelector(".collection-favorite");
          if (!favoriteButton) {
            favoriteButton = document.createElement("button");
            favoriteButton.className = "collection-favorite";
            favoriteButton.type = "button";
            favoriteButton.dataset.favoriteCollection = id;
            const options = row.querySelector(".subject-options");
            row.insertBefore(favoriteButton, options || null);
          }
          const isFavorite = favorites.has(id);
          favoriteButton.classList.toggle("is-favorite", isFavorite);
          const favoriteSymbol = isFavorite ? "★" : "☆";
          const favoriteLabel = isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
          if (favoriteButton.textContent !== favoriteSymbol) favoriteButton.textContent = favoriteSymbol;
          if (favoriteButton.getAttribute("aria-label") !== favoriteLabel) favoriteButton.setAttribute("aria-label", favoriteLabel);
          if (favoriteButton.title !== favoriteLabel) favoriteButton.title = favoriteLabel;
          globalIndex += 1;
        });
      });
    } finally {
      decorating = false;
    }
    applyFilter();
  }

  function ensureEmptyMessage(show, text) {
    let empty = sidebar.querySelector(".collections-empty-filter");
    if (!show) {
      empty?.remove();
      return;
    }
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "collections-empty-filter";
      subjects.insertAdjacentElement("afterend", empty);
    }
    empty.textContent = text;
  }

  function applyFilter() {
    const query = normalize(searchTerm);
    const blocks = [...subjects.querySelectorAll(".folder-block")];
    let visibleCollections = 0;
    let visibleFolders = 0;

    blocks.forEach(block => {
      const folderName = normalize(block.querySelector(":scope > .folder-title .folder-name")?.textContent);
      const rows = [...block.querySelectorAll(":scope > .subject")];
      let visibleInFolder = 0;

      rows.forEach(row => {
        const id = String(row.dataset.id || "");
        const collectionName = normalize(row.querySelector(":scope > span:not(.collection-book-icon)")?.textContent);
        const matchesQuery = !query || collectionName.includes(query) || folderName.includes(query);
        const matchesFavorite = activeFilter !== "favorites" || favorites.has(id);
        const showRow = activeFilter !== "folders" && matchesQuery && matchesFavorite;
        row.hidden = !showRow;
        if (showRow) {
          visibleCollections += 1;
          visibleInFolder += 1;
        }
      });

      const folderMatches = !query || folderName.includes(query) || rows.some(row => {
        const name = normalize(row.querySelector(":scope > span:not(.collection-book-icon)")?.textContent);
        return name.includes(query);
      });

      let showBlock;
      if (activeFilter === "folders") {
        showBlock = folderMatches;
      } else {
        showBlock = visibleInFolder > 0;
      }
      block.hidden = !showBlock;
      if (showBlock) visibleFolders += 1;
    });

    if (!blocks.length) {
      ensureEmptyMessage(false, "");
      return;
    }

    if (activeFilter === "favorites" && visibleCollections === 0) {
      ensureEmptyMessage(true, query ? "Nenhuma coleção favorita encontrada nesta busca." : "Você ainda não marcou nenhuma coleção como favorita.");
    } else if (activeFilter === "folders" && visibleFolders === 0) {
      ensureEmptyMessage(true, "Nenhuma pasta encontrada nesta busca.");
    } else if (activeFilter === "all" && visibleCollections === 0) {
      ensureEmptyMessage(true, "Nenhuma coleção encontrada nesta busca.");
    } else {
      ensureEmptyMessage(false, "");
    }
  }

  function bindEvents() {
    menuToggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleDrawer();
    }, true);

    backdrop.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDrawer();
    }, true);

    sidebar.addEventListener("click", event => {
      const closeButton = event.target.closest("#collectionsDrawerClose");
      if (closeButton) {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.target.closest("#collectionsDrawerAdd, #collectionsManageFolders")) {
        event.preventDefault();
        openAddCollection();
        return;
      }

      const clearSearch = event.target.closest("#collectionsClearSearch");
      if (clearSearch) {
        const input = document.querySelector("#collectionsDrawerSearch");
        if (input) input.value = "";
        searchTerm = "";
        applyFilter();
        input?.focus({ preventScroll: true });
        return;
      }

      const filterButton = event.target.closest("[data-collections-filter]");
      if (filterButton) {
        event.preventDefault();
        setFilter(filterButton.dataset.collectionsFilter);
        return;
      }

      const favoriteButton = event.target.closest("[data-favorite-collection]");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        const id = String(favoriteButton.dataset.favoriteCollection || "");
        if (!id) return;
        if (favorites.has(id)) favorites.delete(id);
        else favorites.add(id);
        saveFavorites();
        decorateSubjects();
        return;
      }

      const folderTitle = event.target.closest(".folder-title");
      if (folderTitle && activeFilter === "folders") {
        setFilter("all");
        return;
      }

      if (event.target.closest(".subject")) {
        requestAnimationFrame(closeDrawer);
      }
    });

    sidebar.addEventListener("input", event => {
      if (!event.target.matches("#collectionsDrawerSearch")) return;
      searchTerm = event.target.value || "";
      applyFilter();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && app.classList.contains(OPEN_CLASS)) closeDrawer();
    });

    window.addEventListener("resize", () => {
      if (app.classList.contains(OPEN_CLASS)) {
        backdrop.hidden = false;
        app.classList.add("mobile-nav-open");
        document.body.classList.add("mobile-nav-open");
      } else {
        backdrop.hidden = true;
      }
    });
  }

  addDrawerChrome();
  bindEvents();
  decorateSubjects();
  closeDrawer();

  const observer = new MutationObserver(() => {
    if (decorating) return;
    queueDecorateSubjects();
  });
  observer.observe(subjects, { childList: true, subtree: true });

  window.FixaCollectionsOverlay = {
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
    refresh: queueDecorateSubjects
  };
})();
