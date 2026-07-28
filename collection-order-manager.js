(() => {
  "use strict";

  const state = {
    folderId: "",
    originalOrder: [],
    workingOrder: [],
    draggedId: ""
  };

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(String(value || ""));
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function addStyles() {
    if (document.querySelector("#fixaCollectionOrderStyles")) return;
    const style = document.createElement("style");
    style.id = "fixaCollectionOrderStyles";
    style.textContent = `
      .collection-order-overlay{position:fixed;inset:0;z-index:130;display:grid;place-items:center;padding:24px;background:rgba(35,48,75,.42);backdrop-filter:blur(4px)}
      .collection-order-overlay[hidden]{display:none!important}
      .collection-order-card{width:min(100%,760px);max-height:min(92vh,860px);border:1px solid #dce4f1;border-radius:17px;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;overflow:hidden;background:#fff;box-shadow:0 28px 90px rgba(15,23,42,.22)}
      .collection-order-header{position:relative;padding:26px 76px 10px 28px}
      .collection-order-header h2{margin:0;color:#111a31;font-size:25px;line-height:1.18;letter-spacing:-.02em}
      .collection-order-header p{margin:7px 0 0;color:#66718a;line-height:1.45}
      .collection-order-close{width:46px;height:46px;position:absolute;top:18px;right:20px;border:0;border-radius:999px;padding:0;color:#25304a;background:#f2f5fa;font-size:30px;font-weight:300;line-height:1;box-shadow:none}
      .collection-order-close:hover{color:#111a31;background:#e8edf5}
      .collection-order-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 28px 14px}
      .collection-order-stat{min-height:72px;border:1px solid #c9d9fb;border-radius:11px;padding:12px 14px;display:grid;grid-template-columns:43px minmax(0,1fr);align-items:center;gap:12px;background:#f5f8ff}
      .collection-order-stat-icon{width:43px;height:43px;border-radius:999px;display:grid;place-items:center;color:#2563eb;background:#dfe9ff;font-size:20px;font-weight:800}
      .collection-order-stat-copy{display:grid;gap:2px}.collection-order-stat-copy strong{color:#111a31;font-size:24px;line-height:1}.collection-order-stat-copy span{color:#53617d;font-size:13px}
      .collection-order-tools{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:0 28px 14px}
      .collection-order-tools p{margin:0;color:#66718a;font-size:13px}
      .collection-order-tools .row{display:flex;gap:8px;flex-wrap:wrap}
      .collection-order-tools button{min-height:38px;padding:8px 12px;font-size:13px}
      .collection-order-list-wrap{min-height:210px;overflow:auto;border-top:1px solid #edf1f7;border-bottom:1px solid #edf1f7;padding:8px 28px;scrollbar-color:#b8c1d1 transparent;scrollbar-width:thin}
      .collection-order-list{display:grid;gap:8px}
      .collection-order-row{min-height:62px;border:1px solid #dce4f1;border-radius:11px;padding:9px 11px;display:grid;grid-template-columns:24px 38px minmax(0,1fr) auto auto;gap:10px;align-items:center;background:#fff;transition:.15s ease}
      .collection-order-row:hover{border-color:#bfd0ee;background:#fbfdff}
      .collection-order-row.dragging{opacity:.45}
      .collection-order-handle{width:24px;height:34px;border:0;padding:0;color:#9aa6bb;background:transparent;cursor:grab;box-shadow:none}
      .collection-order-handle:active{cursor:grabbing}
      .collection-order-handle:hover{color:#52607a;background:transparent}
      .collection-order-icon{width:36px;height:36px;border-radius:999px;display:grid;place-items:center;color:#4f7cf3;background:#eef3ff;font-size:18px}
      .collection-order-name{min-width:0;overflow:hidden;color:#121c34;font-size:15px;font-weight:720;text-overflow:ellipsis;white-space:nowrap}
      .collection-order-count{min-width:92px;border-radius:8px;padding:7px 11px;color:#2563eb;background:#f0f5ff;font-size:13px;font-weight:650;text-align:center;white-space:nowrap}
      .collection-order-actions{display:flex;gap:6px}
      .collection-order-actions button{width:36px;height:36px;min-width:36px;min-height:36px;border:1px solid #dce4ef;border-radius:10px;padding:0;color:#172033;background:#fff;box-shadow:none}
      .collection-order-actions button:hover:not(:disabled){border-color:#9fb6db;background:#f2f6fd}
      .collection-order-actions button:disabled{opacity:.35}
      .collection-order-empty{margin:0;padding:34px 18px;border:1px dashed #c4cee0;border-radius:11px;color:#68758d;background:#fafcff;text-align:center}
      .collection-order-footer{min-height:70px;padding:14px 28px;display:flex;align-items:center;justify-content:flex-end;gap:10px;background:#fff}
      .collection-order-footer button{min-height:44px;padding-inline:18px}
      @media(max-width:700px){.collection-order-overlay{padding:10px}.collection-order-card{max-height:96vh;border-radius:14px}.collection-order-header{padding:22px 65px 8px 18px}.collection-order-header h2{font-size:21px}.collection-order-close{top:12px;right:13px;width:42px;height:42px}.collection-order-summary,.collection-order-tools{padding-left:18px;padding-right:18px}.collection-order-list-wrap{padding:8px 18px}.collection-order-row{grid-template-columns:20px 34px minmax(0,1fr) auto;gap:7px}.collection-order-count{grid-column:3;justify-self:start;min-width:0}.collection-order-actions{grid-column:4;grid-row:1/span 2}.collection-order-footer{padding:12px 18px}.collection-order-footer button{flex:1}}
      @media(max-width:480px){.collection-order-summary{grid-template-columns:1fr}.collection-order-tools{align-items:stretch;flex-direction:column}.collection-order-tools .row,.collection-order-tools button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function folderById(folderId) {
    return data.folders.find(folder => folder.id === folderId) || null;
  }

  function subjectsInFolder(folderId) {
    return data.subjects.filter(subject => subject.folder === folderId);
  }

  function ensureModal() {
    let modal = document.querySelector("#collectionOrderModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "collectionOrderModal";
    modal.className = "collection-order-overlay";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="collection-order-card" role="dialog" aria-modal="true" aria-labelledby="collectionOrderTitle">
        <header class="collection-order-header">
          <h2 id="collectionOrderTitle">Ordenar coleções</h2>
          <p id="collectionOrderDescription">Arraste as coleções ou use as setas para definir a ordem.</p>
          <button class="collection-order-close" type="button" data-order-close aria-label="Fechar">×</button>
        </header>
        <div class="collection-order-summary">
          <div class="collection-order-stat"><span class="collection-order-stat-icon">▤</span><span class="collection-order-stat-copy"><strong data-order-collections>0</strong><span>Coleções</span></span></div>
          <div class="collection-order-stat"><span class="collection-order-stat-icon">□</span><span class="collection-order-stat-copy"><strong data-order-questions>0</strong><span>Questões no total</span></span></div>
        </div>
        <div class="collection-order-tools">
          <p>As alterações só serão aplicadas ao clicar em <strong>Salvar ordem</strong>.</p>
          <div class="row"><button class="secondary" type="button" data-order-alpha>Ordem alfabética</button><button class="secondary" type="button" data-order-reset>Restaurar</button></div>
        </div>
        <div class="collection-order-list-wrap"><div class="collection-order-list" data-order-list></div></div>
        <footer class="collection-order-footer"><button class="secondary" type="button" data-order-close>Cancelar</button><button type="button" data-order-save>Salvar ordem</button></footer>
      </section>`;
    document.body.appendChild(modal);
    return modal;
  }

  function renderRows() {
    const modal = ensureModal();
    const list = modal.querySelector("[data-order-list]");
    const subjects = state.workingOrder
      .map(id => data.subjects.find(subject => subject.id === id))
      .filter(Boolean);
    modal.querySelector("[data-order-collections]").textContent = subjects.length;
    modal.querySelector("[data-order-questions]").textContent = subjects.reduce((sum, subject) => sum + (subject.cards?.length || 0), 0);
    if (!subjects.length) {
      list.innerHTML = '<p class="collection-order-empty">Esta pasta não possui coleções para ordenar.</p>';
      modal.querySelector("[data-order-save]").disabled = true;
      return;
    }
    modal.querySelector("[data-order-save]").disabled = false;
    list.innerHTML = subjects.map((subject, index) => `
      <div class="collection-order-row" draggable="true" data-order-row="${esc(subject.id)}">
        <button class="collection-order-handle" type="button" title="Arraste para reorganizar" aria-label="Arraste para reorganizar">⠿</button>
        <span class="collection-order-icon" aria-hidden="true">▱</span>
        <span class="collection-order-name" title="${esc(subject.name)}">${esc(subject.name)}</span>
        <span class="collection-order-count">${subject.cards?.length || 0} questão${subject.cards?.length === 1 ? "" : "ões"}</span>
        <span class="collection-order-actions"><button type="button" data-order-up="${esc(subject.id)}" ${index === 0 ? "disabled" : ""} aria-label="Subir coleção">↑</button><button type="button" data-order-down="${esc(subject.id)}" ${index === subjects.length - 1 ? "disabled" : ""} aria-label="Descer coleção">↓</button></span>
      </div>`).join("");
  }

  function openOrderManager(folderId) {
    const folder = folderById(folderId);
    if (!folder) return;
    const ids = subjectsInFolder(folderId).map(subject => subject.id);
    state.folderId = folderId;
    state.originalOrder = [...ids];
    state.workingOrder = [...ids];
    state.draggedId = "";
    const modal = ensureModal();
    modal.querySelector("#collectionOrderTitle").textContent = `Ordenar coleções — ${folder.name}`;
    renderRows();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => modal.querySelector("[data-order-close]")?.focus());
  }

  function closeOrderManager() {
    const modal = document.querySelector("#collectionOrderModal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    state.folderId = "";
    state.originalOrder = [];
    state.workingOrder = [];
    state.draggedId = "";
  }

  function moveItem(id, offset) {
    const index = state.workingOrder.indexOf(id);
    if (index < 0) return;
    const target = index + offset;
    if (target < 0 || target >= state.workingOrder.length) return;
    const next = [...state.workingOrder];
    [next[index], next[target]] = [next[target], next[index]];
    state.workingOrder = next;
    renderRows();
    requestAnimationFrame(() => document.querySelector(`[data-order-row="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest" }));
  }

  function saveOrder() {
    if (!state.folderId || !state.workingOrder.length) {
      closeOrderManager();
      return;
    }
    const orderedSubjects = state.workingOrder
      .map(id => data.subjects.find(subject => subject.id === id))
      .filter(Boolean);
    let cursor = 0;
    data.subjects = data.subjects.map(subject => {
      if (subject.folder !== state.folderId) return subject;
      return orderedSubjects[cursor++] || subject;
    });
    closeOrderManager();
    if (typeof render === "function") render();
    else if (typeof save === "function") save();
  }

  function augmentFolderMenu(menu) {
    if (!menu || menu.dataset.menuType !== "folder" || menu.querySelector("[data-folder-order]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.folderOrder = "";
    button.textContent = "⇅ Ordenar coleções";
    const deleteButton = menu.querySelector('[data-folder-action="delete"]');
    menu.insertBefore(button, deleteButton || null);
  }

  function syncWorkingOrderFromDom() {
    const ids = [...document.querySelectorAll("#collectionOrderModal [data-order-row]")].map(row => row.dataset.orderRow);
    if (ids.length === state.workingOrder.length) state.workingOrder = ids;
  }

  function handleDocumentClick(event) {
    const orderButton = event.target.closest?.("[data-folder-order]");
    if (orderButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const menu = orderButton.closest(".sidebar-menu");
      const folderId = menu?.dataset.menuId || "";
      if (typeof closeSidebarMenu === "function") closeSidebarMenu();
      openOrderManager(folderId);
      return;
    }

    const modal = event.target.closest?.("#collectionOrderModal");
    if (!modal || modal.hidden) return;
    if (event.target === modal || event.target.closest("[data-order-close]")) {
      event.preventDefault();
      closeOrderManager();
      return;
    }
    const up = event.target.closest("[data-order-up]");
    if (up) {
      event.preventDefault();
      moveItem(up.dataset.orderUp, -1);
      return;
    }
    const down = event.target.closest("[data-order-down]");
    if (down) {
      event.preventDefault();
      moveItem(down.dataset.orderDown, 1);
      return;
    }
    if (event.target.closest("[data-order-alpha]")) {
      event.preventDefault();
      state.workingOrder.sort((firstId, secondId) => {
        const first = data.subjects.find(subject => subject.id === firstId)?.name || "";
        const second = data.subjects.find(subject => subject.id === secondId)?.name || "";
        return first.localeCompare(second, "pt-BR", { sensitivity: "base" });
      });
      renderRows();
      return;
    }
    if (event.target.closest("[data-order-reset]")) {
      event.preventDefault();
      state.workingOrder = [...state.originalOrder];
      renderRows();
      return;
    }
    if (event.target.closest("[data-order-save]")) {
      event.preventDefault();
      saveOrder();
    }
  }

  function handleDragStart(event) {
    const row = event.target.closest?.("[data-order-row]");
    if (!row || !row.closest("#collectionOrderModal")) return;
    state.draggedId = row.dataset.orderRow;
    row.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", state.draggedId);
  }

  function handleDragOver(event) {
    const row = event.target.closest?.("[data-order-row]");
    const list = event.target.closest?.("[data-order-list]");
    if (!row || !list || !state.draggedId) return;
    event.preventDefault();
    const dragging = list.querySelector(`[data-order-row="${CSS.escape(state.draggedId)}"]`);
    if (!dragging || dragging === row) return;
    const rect = row.getBoundingClientRect();
    list.insertBefore(dragging, event.clientY > rect.top + rect.height / 2 ? row.nextSibling : row);
  }

  function handleDragEnd(event) {
    const row = event.target.closest?.("[data-order-row]");
    if (!row || !row.closest("#collectionOrderModal")) return;
    row.classList.remove("dragging");
    syncWorkingOrderFromDom();
    state.draggedId = "";
    renderRows();
  }

  function init() {
    addStyles();
    ensureModal();
    document.querySelectorAll(".sidebar-menu").forEach(augmentFolderMenu);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(".sidebar-menu")) augmentFolderMenu(node);
        node.querySelectorAll?.(".sidebar-menu").forEach(augmentFolderMenu);
      }));
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("keydown", event => {
      const modal = document.querySelector("#collectionOrderModal");
      if (event.key === "Escape" && modal && !modal.hidden) closeOrderManager();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
