/* Ações do menu de coleções: ordenação e configuração de grupos por pasta */
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

    .folder-groups-overlay {
      position: fixed;
      inset: 0;
      z-index: 520;
      display: grid;
      place-items: center;
      padding: 18px;
      background: rgba(15, 23, 42, 0.42);
    }

    .folder-groups-card {
      width: min(760px, 100%);
      max-height: min(790px, calc(100dvh - 36px));
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      overflow: hidden;
      border: 1px solid #dbe5f4;
      border-radius: 18px;
      background: #ffffff;
      box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
    }

    .folder-groups-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 22px 16px;
      border-bottom: 1px solid #e6ecf5;
    }

    .folder-groups-title-wrap {
      min-width: 0;
      display: flex;
      align-items: flex-start;
      gap: 11px;
    }

    .folder-groups-title-icon {
      width: 24px;
      height: 24px;
      flex: 0 0 24px;
      color: #2563eb;
    }

    .folder-groups-title-icon svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .folder-groups-head h3 {
      margin: 0 0 5px;
      color: #172033;
      font-size: 18px;
      line-height: 1.2;
    }

    .folder-groups-head p {
      margin: 0;
      max-width: 610px;
      color: #687086;
      font-size: 11px;
      line-height: 1.45;
    }

    .folder-groups-close {
      width: 34px;
      height: 34px;
      padding: 0;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      color: #53617a;
      background: transparent;
      font-size: 24px;
      line-height: 1;
    }

    .folder-groups-close:hover,
    .folder-groups-close:focus-visible {
      color: #172033;
      background: #f1f5f9;
    }

    .folder-groups-body {
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 18px 22px 22px;
      display: grid;
      gap: 20px;
      scrollbar-gutter: stable;
    }

    .folder-groups-section {
      display: grid;
      gap: 9px;
    }

    .folder-groups-section h4 {
      margin: 0;
      color: #172033;
      font-size: 13px;
    }

    .folder-groups-section > p {
      margin: 0;
      color: #687086;
      font-size: 10px;
      line-height: 1.4;
    }

    .folder-group-create {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 9px;
      align-items: center;
    }

    .folder-group-create textarea {
      width: 100%;
      min-height: 48px;
      padding: 8px 10px;
      border: 1px solid #cfdcf0;
      border-radius: 8px;
      resize: vertical;
      color: #172033;
      background: #fff;
      font-size: 12px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .folder-group-create button {
      min-height: 40px;
      padding-inline: 16px;
      font-size: 12px;
      font-weight: 850;
      white-space: nowrap;
    }

    .folder-groups-notice {
      min-height: 15px;
      margin: 0;
      color: #dc2626;
      font-size: 10px;
    }

    .folder-groups-created {
      display: grid;
      gap: 8px;
    }

    .folder-group-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 9px;
      align-items: start;
      padding: 9px;
      border: 1px solid #dbe5f4;
      border-radius: 10px;
      background: #ffffff;
    }

    .folder-group-row textarea {
      width: 100%;
      min-height: 48px;
      padding: 8px 10px;
      border: 1px solid #cfdcf0;
      border-radius: 8px;
      resize: vertical;
      color: #172033;
      background: #fff;
      font-size: 11px;
      font-weight: 750;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .folder-group-delete {
      min-height: 36px;
      border: 1px solid #fecaca;
      color: #dc2626;
      background: #fffafa;
      font-size: 11px;
      font-weight: 800;
    }

    .folder-group-delete:hover,
    .folder-group-delete:focus-visible {
      color: #b91c1c;
      background: #fee2e2;
    }

    .folder-groups-empty {
      margin: 0;
      padding: 12px;
      border: 1px dashed #d7e2f1;
      border-radius: 10px;
      color: #7b879b;
      background: #f9fbff;
      font-size: 11px;
    }

    .folder-group-assignments {
      display: grid;
      gap: 8px;
    }

    .folder-group-assignment {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(210px, 280px);
      gap: 12px;
      align-items: center;
      min-height: 52px;
      padding: 8px 10px;
      border: 1px solid #dbe5f4;
      border-radius: 10px;
      background: #ffffff;
    }

    .folder-group-assignment strong {
      min-width: 0;
      color: #172033;
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .folder-group-assignment select {
      min-height: 36px;
      padding: 6px 32px 6px 10px;
      border-color: #cfdcf0;
      font-size: 11px;
      font-weight: 700;
    }

    .folder-groups-actions {
      padding: 14px 22px;
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      border-top: 1px solid #e6ecf5;
      background: #ffffff;
    }

    .folder-groups-actions button {
      min-height: 40px;
      font-size: 12px;
      font-weight: 850;
    }

    .folder-groups-actions .secondary {
      border: 1px solid #d7e2f1;
      color: #26324b;
      background: #ffffff;
    }

    @media (max-width: 700px) {
      .folder-groups-overlay {
        padding: 10px;
      }

      .folder-groups-card {
        max-height: calc(100dvh - 20px);
      }

      .folder-groups-head,
      .folder-groups-body,
      .folder-groups-actions {
        padding-left: 15px;
        padding-right: 15px;
      }

      .folder-group-create,
      .folder-group-assignment {
        grid-template-columns: 1fr;
      }

      .folder-group-create button {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  const groupIcon = `
    <span aria-hidden="true" style="display:inline-flex;width:18px;height:18px;align-items:center;justify-content:center;margin-right:7px;color:currentColor">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </span>`;

  const GROUP_NAME_MAX_LENGTH = 180;

  const state = {
    folderId: "",
    workingGroups: []
  };

  function cleanName(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, GROUP_NAME_MAX_LENGTH);
  }

  function nameKey(value) {
    return cleanName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  }

  function folderById(folderId) {
    try {
      return data.folders.find(folder => folder.id === folderId) || null;
    } catch (_) {
      return null;
    }
  }

  function subjectsInFolder(folderId) {
    try {
      return data.subjects.filter(subject => subject.folder === folderId);
    } catch (_) {
      return [];
    }
  }

  function cloneGroups(groups) {
    return (groups || []).map(group => ({
      id: String(group.id || ""),
      name: cleanName(group.name) || "Grupo",
      subjectIds: Array.isArray(group.subjectIds) ? [...group.subjectIds] : []
    }));
  }

  function normalizeGroups(folderId, groups) {
    const validSubjects = new Set(subjectsInFolder(folderId).map(subject => String(subject.id)));
    const usedSubjects = new Set();
    const usedNames = new Set();
    const normalized = [];

    (Array.isArray(groups) ? groups : []).forEach(group => {
      const name = cleanName(group?.name);
      const key = nameKey(name);
      if (!name || !key || usedNames.has(key)) return;
      usedNames.add(key);
      normalized.push({
        id: String(group?.id || `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`),
        name,
        subjectIds: (Array.isArray(group?.subjectIds) ? group.subjectIds : []).map(String).filter(subjectId => {
          if (!validSubjects.has(subjectId) || usedSubjects.has(subjectId)) return false;
          usedSubjects.add(subjectId);
          return true;
        })
      });
    });

    return normalized;
  }

  function currentUserId() {
    try {
      return currentUser?.id || window.currentUser?.id || "local";
    } catch (_) {
      return window.currentUser?.id || "local";
    }
  }

  function migrateLegacyGroups(folder) {
    if (!folder) return false;

    const current = normalizeGroups(folder.id, Array.isArray(folder.collectionGroups) ? folder.collectionGroups : []);
    if (current.length) {
      folder.collectionGroups = current;
      return false;
    }

    let legacyGroups = [];
    try {
      const key = `fixa:test-folder-config:${currentUserId()}`;
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      legacyGroups = saved?.[folder.id]?.groups || [];
    } catch (_) {}

    const recovered = normalizeGroups(folder.id, legacyGroups);
    if (!recovered.length) {
      if (!Array.isArray(folder.collectionGroups)) folder.collectionGroups = [];
      return false;
    }

    folder.collectionGroups = recovered;
    try { if (typeof save === "function") save(); } catch (_) {}
    return true;
  }

  function groupsForFolder(folderId) {
    const folder = folderById(folderId);
    if (!folder) return [];
    migrateLegacyGroups(folder);
    const normalized = normalizeGroups(folderId, folder.collectionGroups || []);
    folder.collectionGroups = normalized;
    return cloneGroups(normalized);
  }

  function removeOldTopLevelSortActions(root = document) {
    root.querySelectorAll?.(
      '.sidebar-menu [data-folder-action="sort-az"], .sidebar-menu [data-folder-action="sort-za"]'
    ).forEach(button => button.remove());
  }

  function ensureFolderGroupAction(menu) {
    if (!menu || menu.dataset.menuType !== "folder") return;
    let button = menu.querySelector("[data-folder-groups]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.folderGroups = "";
      button.innerHTML = `${groupIcon}<span>Configurar grupos</span>`;
    }

    const orderButton = menu.querySelector("[data-folder-order]");
    const deleteButton = menu.querySelector('[data-folder-action="delete"]');
    if (orderButton) {
      if (orderButton.nextElementSibling !== button) orderButton.insertAdjacentElement("afterend", button);
    } else if (deleteButton) {
      if (button.nextElementSibling !== deleteButton) menu.insertBefore(button, deleteButton);
    } else if (!button.isConnected) {
      menu.appendChild(button);
    }
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
    rows[0]?.dispatchEvent(new Event("dragend", { bubbles: true }));
  }

  function renderGroupModalBody() {
    const body = document.querySelector("[data-folder-groups-body]");
    if (!body) return;
    const subjects = subjectsInFolder(state.folderId);
    const groups = state.workingGroups;

    body.innerHTML = `
      <section class="folder-groups-section">
        <h4>Criar grupo</h4>
        <p>Crie primeiro os grupos que serão usados para organizar as coleções desta pasta. Nomes grandes são aceitos.</p>
        <div class="folder-group-create">
          <textarea data-folder-group-new-name maxlength="${GROUP_NAME_MAX_LENGTH}" placeholder="Ex.: Conhecimentos Específicos" aria-label="Nome do novo grupo"></textarea>
          <button type="button" data-folder-group-create>+ Criar grupo</button>
        </div>
        <p class="folder-groups-notice" data-folder-groups-notice></p>
      </section>

      <section class="folder-groups-section">
        <h4>Grupos criados</h4>
        <div class="folder-groups-created">
          ${groups.length ? groups.map(group => `
            <div class="folder-group-row">
              <textarea maxlength="${GROUP_NAME_MAX_LENGTH}" data-folder-group-name="${escapeHtml(group.id)}" aria-label="Nome do grupo ${escapeHtml(group.name)}">${escapeHtml(group.name)}</textarea>
              <button type="button" class="folder-group-delete" data-folder-group-delete="${escapeHtml(group.id)}">Excluir</button>
            </div>`).join("") : '<p class="folder-groups-empty">Nenhum grupo criado. As coleções continuam individuais.</p>'}
        </div>
      </section>

      <section class="folder-groups-section">
        <h4>Coleções da pasta</h4>
        <p>Defina a qual grupo cada coleção pertence. Selecione “Sem grupo” para manter a coleção individual.</p>
        <div class="folder-group-assignments">
          ${subjects.length ? subjects.map(subject => {
            const selectedGroup = groups.find(group => group.subjectIds.includes(String(subject.id)))?.id || "";
            return `
              <label class="folder-group-assignment">
                <strong>${escapeHtml(subject.name)}</strong>
                <select data-folder-group-assignment="${escapeHtml(subject.id)}" aria-label="Grupo da coleção ${escapeHtml(subject.name)}">
                  <option value="">Sem grupo</option>
                  ${groups.map(group => `<option value="${escapeHtml(group.id)}" ${selectedGroup === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}
                </select>
              </label>`;
          }).join("") : '<p class="folder-groups-empty">Esta pasta ainda não possui coleções.</p>'}
        </div>
      </section>`;
  }

  function closeGroupManager() {
    document.querySelector(".folder-groups-overlay")?.remove();
    document.body.style.overflow = "";
    state.folderId = "";
    state.workingGroups = [];
  }

  function openGroupManager(folderId) {
    const folder = folderById(folderId);
    if (!folder) return;
    closeGroupManager();
    state.folderId = folderId;
    state.workingGroups = groupsForFolder(folderId);

    const overlay = document.createElement("div");
    overlay.className = "folder-groups-overlay";
    overlay.innerHTML = `
      <section class="folder-groups-card" role="dialog" aria-modal="true" aria-labelledby="folderGroupsTitle">
        <header class="folder-groups-head">
          <div class="folder-groups-title-wrap">
            <span class="folder-groups-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <div>
              <h3 id="folderGroupsTitle">Configurar grupos</h3>
              <p>Organize as coleções desta pasta em grupos. Coleções sem grupo continuam sendo tratadas individualmente.</p>
            </div>
          </div>
          <button type="button" class="folder-groups-close" data-folder-groups-close aria-label="Fechar">×</button>
        </header>
        <div class="folder-groups-body" data-folder-groups-body></div>
        <footer class="folder-groups-actions">
          <button type="button" class="secondary" data-folder-groups-close>Cancelar</button>
          <button type="button" data-folder-groups-save>Salvar grupos</button>
        </footer>
      </section>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    renderGroupModalBody();
    requestAnimationFrame(() => overlay.querySelector("[data-folder-group-new-name]")?.focus({ preventScroll: true }));
  }

  function showGroupNotice(message) {
    const notice = document.querySelector("[data-folder-groups-notice]");
    if (notice) notice.textContent = message || "";
  }

  function createWorkingGroup() {
    const input = document.querySelector("[data-folder-group-new-name]");
    const name = cleanName(input?.value);
    if (!name) {
      showGroupNotice("Digite um nome para o grupo.");
      input?.focus();
      return;
    }
    if (state.workingGroups.some(group => nameKey(group.name) === nameKey(name))) {
      showGroupNotice("Já existe um grupo com esse nome.");
      input?.focus();
      return;
    }

    state.workingGroups.push({
      id: `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      subjectIds: []
    });
    renderGroupModalBody();
  }

  function removeWorkingGroup(groupId) {
    state.workingGroups = state.workingGroups.filter(group => group.id !== groupId);
    renderGroupModalBody();
  }

  function assignWorkingSubject(subjectId, groupId) {
    const normalizedSubjectId = String(subjectId || "");
    state.workingGroups.forEach(group => {
      group.subjectIds = group.subjectIds.map(String).filter(id => id !== normalizedSubjectId);
    });
    const target = state.workingGroups.find(group => group.id === groupId);
    if (target && normalizedSubjectId) target.subjectIds.push(normalizedSubjectId);
  }

  function validateWorkingGroups() {
    const names = new Set();
    for (const group of state.workingGroups) {
      group.name = cleanName(group.name);
      const key = nameKey(group.name);
      if (!group.name) return "Todos os grupos precisam ter um nome.";
      if (names.has(key)) return "Não é possível salvar dois grupos com o mesmo nome.";
      names.add(key);
    }
    return "";
  }

  function saveGroupManager() {
    const folder = folderById(state.folderId);
    if (!folder) return;
    const error = validateWorkingGroups();
    if (error) {
      showGroupNotice(error);
      return;
    }

    folder.collectionGroups = normalizeGroups(state.folderId, state.workingGroups);
    try { if (typeof save === "function") save(); } catch (_) {}
    closeGroupManager();
    try { if (typeof render === "function") render(); } catch (_) {}
    window.FixaTestFolder?.refresh?.();
  }

  function handleGroupModalClick(event) {
    if (event.target.matches?.(".folder-groups-overlay")) {
      closeGroupManager();
      return true;
    }
    if (event.target.closest?.("[data-folder-groups-close]")) {
      closeGroupManager();
      return true;
    }
    if (event.target.closest?.("[data-folder-group-create]")) {
      createWorkingGroup();
      return true;
    }
    const deleteButton = event.target.closest?.("[data-folder-group-delete]");
    if (deleteButton) {
      removeWorkingGroup(deleteButton.dataset.folderGroupDelete);
      return true;
    }
    if (event.target.closest?.("[data-folder-groups-save]")) {
      saveGroupManager();
      return true;
    }
    return false;
  }

  document.addEventListener("click", event => {
    const groupMenuButton = event.target.closest?.("[data-folder-groups]");
    if (groupMenuButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const menu = groupMenuButton.closest(".sidebar-menu");
      const folderId = menu?.dataset.menuId || "";
      try { if (typeof closeSidebarMenu === "function") closeSidebarMenu(); } catch (_) {}
      openGroupManager(folderId);
      return;
    }

    if (event.target.closest?.(".folder-groups-overlay") && handleGroupModalClick(event)) return;

    if (event.target.closest?.("[data-folder-order]")) {
      requestAnimationFrame(enhanceOrderManager);
      return;
    }

    const descending = event.target.closest?.("[data-order-alpha-desc]");
    if (!descending) return;

    event.preventDefault();
    sortVisibleOrderDescending();
  }, true);

  document.addEventListener("change", event => {
    const assignment = event.target.closest?.("[data-folder-group-assignment]");
    if (!assignment) return;
    assignWorkingSubject(assignment.dataset.folderGroupAssignment, assignment.value || "");
  });

  document.addEventListener("input", event => {
    const nameInput = event.target.closest?.("[data-folder-group-name]");
    if (!nameInput) return;
    const group = state.workingGroups.find(item => item.id === nameInput.dataset.folderGroupName);
    if (!group) return;
    group.name = nameInput.value;
    document.querySelectorAll(`[data-folder-group-assignment] option[value="${CSS.escape(group.id)}"]`).forEach(option => {
      option.textContent = cleanName(group.name) || "Grupo";
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.querySelector(".folder-groups-overlay")) {
      closeGroupManager();
      return;
    }
    if (event.key === "Enter" && event.target.matches?.("[data-folder-group-new-name]")) {
      event.preventDefault();
      createWorkingGroup();
    }
  });

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        removeOldTopLevelSortActions(node);
        if (node.matches?.(".sidebar-menu")) ensureFolderGroupAction(node);
        node.querySelectorAll?.(".sidebar-menu").forEach(ensureFolderGroupAction);
        if (node.matches?.("[data-folder-order]") || node.querySelector?.("[data-folder-order]")) {
          node.closest?.(".sidebar-menu") && ensureFolderGroupAction(node.closest(".sidebar-menu"));
          document.querySelectorAll(".sidebar-menu").forEach(ensureFolderGroupAction);
        }
        if (node.id === "collectionOrderModal" || node.querySelector?.("#collectionOrderModal")) {
          enhanceOrderManager();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  removeOldTopLevelSortActions();
  document.querySelectorAll(".sidebar-menu").forEach(ensureFolderGroupAction);
  enhanceOrderManager();

  window.FixaFolderGroups = {
    getGroups: groupsForFolder,
    open: openGroupManager
  };

  window.FixaCollectionsMenuActions = {
    enhanceOrderManager,
    sortVisibleOrderDescending,
    openGroupManager,
    groupsForFolder
  };
})();
