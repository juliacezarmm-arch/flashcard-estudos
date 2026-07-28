(() => {
  "use strict";

  const clean = value => String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const key = value => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const subjectById = id => data.subjects.find(subject => subject.id === id) || null;
  let activeSubjectId = "";
  let searchTerm = "";
  let draggedName = "";

  function normalize(subject) {
    if (!subject) return [];
    subject.categories = Array.isArray(subject.categories) ? subject.categories.map(clean).filter(Boolean) : [];
    const seen = new Set();
    subject.categories = subject.categories.filter(name => {
      const normalized = key(name);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    (subject.cards || []).forEach(card => {
      card.category = clean(card.category || card.categoria || "");
      if (card.category && !subject.categories.some(name => key(name) === key(card.category))) {
        subject.categories.push(card.category);
      }
    });
    return subject.categories;
  }

  function categories(subject) {
    return normalize(subject).map(name => ({
      name,
      count: (subject.cards || []).filter(card => key(card.category) === key(name)).length
    }));
  }

  function ensureStyles() {
    if (document.querySelector("#fixaCategoryManagerUi")) return;
    const style = document.createElement("style");
    style.id = "fixaCategoryManagerUi";
    style.textContent = `
      #actionModal.category-manager-modal{padding:24px;background:rgba(35,48,75,.42);backdrop-filter:blur(4px)}
      #actionModal.category-manager-modal .modal-card{width:min(100%,830px);max-width:830px;max-height:min(92vh,900px);position:relative;overflow:hidden;border:1px solid #dce4f1;border-radius:17px;padding:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:#fff;box-shadow:0 28px 90px rgba(15,23,42,.22)}
      #actionModal.category-manager-modal #modalTitle{margin:0;padding:28px 76px 8px 28px;color:#111a31;font-size:26px;line-height:1.18;letter-spacing:-.02em}
      #actionModal.category-manager-modal #modalBody{min-height:0;overflow:hidden;padding:0 28px 18px}
      #actionModal.category-manager-modal #modalActions{min-height:70px;margin:0;border-top:1px solid #e3e9f3;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff}
      .category-modal-close{width:46px;height:46px;min-width:46px;min-height:46px;position:absolute;top:20px;right:22px;z-index:3;border:0;border-radius:999px;padding:0;color:#25304a;background:#f2f5fa;font-size:30px;font-weight:300;line-height:1}
      .category-modal-close:hover{color:#111a31;background:#e8edf5}
      .category-manager-shell{height:100%;min-height:0;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;gap:16px}
      .category-manager-copy{margin:0;max-width:680px;color:#66718a;font-size:15px;line-height:1.5}
      .category-manager-toolbar{display:grid;grid-template-columns:minmax(150px,.72fr) minmax(180px,.9fr) minmax(230px,1.35fr);gap:14px;align-items:stretch}
      .category-stat-card{min-height:78px;border:1px solid #c9d9fb;border-radius:11px;padding:12px 14px;display:grid;grid-template-columns:43px minmax(0,1fr);align-items:center;gap:12px;background:#f5f8ff}
      .category-stat-icon{width:43px;height:43px;border-radius:999px;display:grid;place-items:center;color:#2563eb;background:#dfe9ff}
      .category-stat-icon svg,.category-search-box svg,.category-row-icon svg,.category-row-button svg,.category-drag-handle svg,.category-new-button svg{width:21px;height:21px;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .category-stat-copy{display:grid;gap:2px}.category-stat-copy strong{color:#111a31;font-size:24px;line-height:1}.category-stat-copy span{color:#53617d;font-size:13px}
      .category-search-box{min-height:78px;position:relative;display:flex;align-items:center;color:#67728b}.category-search-box svg{position:absolute;left:17px;pointer-events:none}.category-search-box input{height:100%;min-height:78px;border-radius:11px;padding-left:52px;font-size:15px;background:#fff}
      .category-new-panel{border:1px solid #c9d9fb;border-radius:11px;padding:12px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:9px;align-items:center;background:#f7faff}.category-new-panel[hidden]{display:none!important}
      .category-manager-list-wrap{min-height:180px;overflow:auto;border-top:1px solid #edf1f7;border-bottom:1px solid #edf1f7;padding:6px 4px 6px 0;scrollbar-color:#b8c1d1 transparent;scrollbar-width:thin}.category-manager-list{display:grid;gap:8px}
      .category-manager-row{min-height:62px;position:relative;border:1px solid #dce4f1;border-radius:11px;padding:9px 11px;display:grid;grid-template-columns:24px 38px minmax(0,1fr) auto auto;gap:10px;align-items:center;background:#fff;transition:.15s ease}.category-manager-row:hover{border-color:#bfd0ee;background:#fbfdff}.category-manager-row.dragging{opacity:.42}.category-manager-row[hidden]{display:none!important}
      .category-drag-handle{width:24px;min-width:24px;height:34px;min-height:34px;border:0;padding:0;color:#9aa6bb;background:transparent;cursor:grab}.category-drag-handle:hover{color:#52607a;background:transparent}.category-drag-handle svg{width:17px;height:22px}
      .category-row-icon{width:36px;height:36px;border-radius:999px;display:grid;place-items:center;color:#4f7cf3;background:#eef3ff}.category-row-name-wrap{min-width:0;display:flex;align-items:center;gap:8px}.category-row-name{overflow:hidden;color:#121c34;font-size:15px;font-weight:720;text-overflow:ellipsis;white-space:nowrap}
      .category-count-badge{min-width:92px;border-radius:8px;padding:7px 11px;color:#2563eb;background:#f0f5ff;font-size:13px;font-weight:650;text-align:center;white-space:nowrap}.category-row-actions{position:relative;display:flex;align-items:center;gap:8px}.category-row-button{width:40px;min-width:40px;height:40px;min-height:40px;border:1px solid #dce4ef;border-radius:12px;padding:0;color:#111827;background:#fff}.category-row-button:hover{border-color:#b9c7dc;color:#111827;background:#f5f7fb}.category-row-button.danger{border-color:transparent;color:#ef2929;background:transparent}.category-row-button.danger:hover{color:#cf1717;background:#fff1f1}
      .category-row-menu{width:150px;position:absolute;top:44px;right:47px;z-index:5;border:1px solid #dce4ef;border-radius:10px;padding:5px;background:#fff;box-shadow:0 14px 34px rgba(15,23,42,.16)}.category-row-menu[hidden]{display:none!important}.category-row-menu button{width:100%;min-height:36px;justify-content:flex-start;color:#172033;background:transparent}.category-row-menu button:hover{background:#f1f5fb}
      .category-manager-empty{margin:0;padding:34px 18px;border:1px dashed #c4cee0;border-radius:11px;color:#68758d;background:#fafcff;text-align:center}.category-manager-error{min-height:20px;margin:0;color:#c33a3a;font-size:13px}.category-manager-error:empty{min-height:0}.category-new-button{min-height:44px;padding-inline:17px;box-shadow:0 8px 20px rgba(37,99,235,.18)}.category-footer-right{display:flex;justify-content:flex-end;gap:9px}
      @media(max-width:760px){#actionModal.category-manager-modal{padding:10px}#actionModal.category-manager-modal .modal-card{max-height:96vh;border-radius:14px}#actionModal.category-manager-modal #modalTitle{padding:22px 65px 7px 18px;font-size:21px}#actionModal.category-manager-modal #modalBody{padding:0 18px 14px}#actionModal.category-manager-modal #modalActions{padding:12px 18px}.category-modal-close{top:13px;right:14px;width:42px;height:42px;min-width:42px;min-height:42px}.category-manager-toolbar{grid-template-columns:1fr 1fr}.category-search-box{grid-column:1/-1;min-height:54px}.category-search-box input{min-height:54px}.category-manager-row{grid-template-columns:20px 34px minmax(0,1fr) auto;gap:7px}.category-count-badge{grid-column:3;justify-self:start;min-width:0}.category-row-actions{grid-column:4;grid-row:1/span 2}.category-new-panel{grid-template-columns:1fr}}
      @media(max-width:520px){.category-manager-toolbar{grid-template-columns:1fr}.category-search-box{grid-column:auto}.category-stat-card{min-height:66px}.category-manager-row{padding:9px 8px}.category-row-button{width:36px;min-width:36px;height:36px;min-height:36px}.category-row-menu{right:41px}#actionModal.category-manager-modal #modalActions{align-items:stretch;flex-direction:column}.category-new-button,.category-footer-right,.category-footer-right button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function rowHtml(item) {
    return `<div class="category-manager-row" draggable="true" data-category-row data-category-name="${escapeHtml(item.name)}">
      <button class="category-drag-handle" type="button" title="Arraste para reorganizar"><svg viewBox="0 0 18 24"><circle cx="5" cy="5" r="1"></circle><circle cx="13" cy="5" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="13" cy="12" r="1"></circle><circle cx="5" cy="19" r="1"></circle><circle cx="13" cy="19" r="1"></circle></svg></button>
      <span class="category-row-icon"><svg viewBox="0 0 24 24"><path d="M7 4h10a2 2 0 0 1 2 2v15l-7-4-7 4V6a2 2 0 0 1 2-2z"></path></svg></span>
      <div class="category-row-name-wrap"><span class="category-row-name">${escapeHtml(item.name)}</span></div>
      <span class="category-count-badge">${item.count} questão${item.count === 1 ? "" : "ões"}</span>
      <div class="category-row-actions"><button class="category-row-button" type="button" data-category-more><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button><div class="category-row-menu" hidden><button type="button" data-category-rename>Renomear</button></div><button class="category-row-button danger" type="button" data-category-delete><svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="m7 7 1 13h8l1-13"></path><path d="M10 11v5M14 11v5"></path></svg></button></div>
    </div>`;
  }

  function openManager(subjectId) {
    const subject = subjectById(subjectId);
    if (!subject) return;
    activeSubjectId = subject.id;
    const items = categories(subject);
    const total = (subject.cards || []).length;
    openModal(`Categorias — ${subject.name}`,
      `<button class="category-modal-close" type="button" data-modal-close>×</button><div class="category-manager-shell"><p class="category-manager-copy">Organize as questões por assunto. Excluir uma categoria não exclui as questões; elas ficam como “Sem categoria”.</p><div class="category-manager-toolbar"><div class="category-stat-card"><span class="category-stat-icon"><svg viewBox="0 0 24 24"><path d="M4 7h6l2 2h8v11H4z"></path><path d="M4 7V5h6l2 2"></path></svg></span><span class="category-stat-copy"><strong>${items.length}</strong><span>Categoria${items.length === 1 ? "" : "s"}</span></span></div><div class="category-stat-card"><span class="category-stat-icon"><svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 3z"></path><path d="M9 9h6M9 12h4"></path></svg></span><span class="category-stat-copy"><strong>${total}</strong><span>Questões no total</span></span></div><label class="category-search-box"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m16 16 4 4"></path></svg><input id="categoryManagerSearch" type="search" placeholder="Buscar categoria" value="${escapeHtml(searchTerm)}"></label></div><div class="category-new-panel" id="categoryNewPanel" hidden><input id="newCategoryInput" maxlength="80" placeholder="Nome da nova categoria"><button type="button" data-category-create>Adicionar</button><button class="secondary" type="button" data-category-new-cancel>Cancelar</button></div><div class="category-manager-list-wrap"><div class="category-manager-list" id="categoryManagerList">${items.length ? items.map(rowHtml).join("") : '<p class="category-manager-empty">Esta coleção ainda não possui categorias.</p>'}</div><p class="category-manager-empty" id="categoryManagerNoResults" hidden>Nenhuma categoria encontrada.</p></div><p class="category-manager-error" id="categoryManagerError"></p></div>`,
      `<button class="category-new-button" type="button" data-category-new><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>Nova categoria</button><div class="category-footer-right"><button class="secondary" type="button" data-modal-close>Fechar</button></div>`);
    el.actionModal.classList.add("category-manager-modal");
    applySearch();
  }

  function subject() { return subjectById(activeSubjectId); }
  function error(message = "") { const node = document.querySelector("#categoryManagerError"); if (node) node.textContent = message; }
  function refresh() { const current = subject(); if (!current) return; save(); render(); openManager(current.id); }
  function applySearch() {
    const input = document.querySelector("#categoryManagerSearch");
    searchTerm = clean(input?.value || searchTerm).toLowerCase();
    const rows = [...document.querySelectorAll("[data-category-row]")];
    let visible = 0;
    rows.forEach(row => { const show = !searchTerm || key(row.dataset.categoryName).includes(key(searchTerm)); row.hidden = !show; if (show) visible += 1; });
    const empty = document.querySelector("#categoryManagerNoResults"); if (empty) empty.hidden = !rows.length || visible > 0;
  }

  ensureStyles();

  document.addEventListener("click", event => {
    const action = event.target.closest?.('[data-subject-action="categories"]');
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const menu = action.closest(".sidebar-menu");
      openManager(menu?.dataset.menuId || openSidebarMenu?.id || "");
      return;
    }
    if (!el.actionModal?.classList.contains("category-manager-modal")) return;
    if (event.target.closest?.("[data-modal-close]")) { el.actionModal.classList.remove("category-manager-modal"); return; }
    if (event.target.closest?.("[data-category-new]")) { document.querySelector("#categoryNewPanel").hidden = false; document.querySelector("#newCategoryInput")?.focus(); return; }
    if (event.target.closest?.("[data-category-new-cancel]")) { document.querySelector("#categoryNewPanel").hidden = true; return; }
    if (event.target.closest?.("[data-category-create]")) {
      const current = subject(); const input = document.querySelector("#newCategoryInput"); const name = clean(input?.value);
      if (!name) return error("Digite o nome da nova categoria.");
      if (normalize(current).some(item => key(item) === key(name))) return error("Já existe uma categoria com esse nome.");
      current.categories.push(name); refresh(); return;
    }
    const more = event.target.closest?.("[data-category-more]");
    if (more) { const menu = more.parentElement.querySelector(".category-row-menu"); document.querySelectorAll(".category-row-menu").forEach(item => { if (item !== menu) item.hidden = true; }); menu.hidden = !menu.hidden; return; }
    const rename = event.target.closest?.("[data-category-rename]");
    if (rename) {
      const row = rename.closest("[data-category-row]"); const oldName = row.dataset.categoryName; const next = clean(window.prompt("Novo nome da categoria:", oldName)); const current = subject();
      if (!next) return;
      if (normalize(current).some(item => key(item) === key(next) && key(item) !== key(oldName))) return error("Já existe uma categoria com esse nome.");
      current.categories = normalize(current).map(item => key(item) === key(oldName) ? next : item); (current.cards || []).forEach(card => { if (key(card.category) === key(oldName)) card.category = next; }); refresh(); return;
    }
    const remove = event.target.closest?.("[data-category-delete]");
    if (remove) {
      const row = remove.closest("[data-category-row]"); const name = row.dataset.categoryName; const current = subject();
      if (!window.confirm(`Excluir a categoria “${name}”? As questões ficarão como “Sem categoria”.`)) return;
      current.categories = normalize(current).filter(item => key(item) !== key(name)); (current.cards || []).forEach(card => { if (key(card.category) === key(name)) card.category = ""; }); refresh(); return;
    }
  }, true);

  document.addEventListener("input", event => { if (event.target.matches?.("#categoryManagerSearch")) applySearch(); });
  document.addEventListener("keydown", event => { if (event.target.matches?.("#newCategoryInput") && event.key === "Enter") { event.preventDefault(); document.querySelector("[data-category-create]")?.click(); } });
  document.addEventListener("dragstart", event => { const row = event.target.closest?.("[data-category-row]"); if (!row) return; draggedName = row.dataset.categoryName; row.classList.add("dragging"); event.dataTransfer.setData("text/plain", draggedName); });
  document.addEventListener("dragover", event => { const list = event.target.closest?.("#categoryManagerList"); const target = event.target.closest?.("[data-category-row]"); if (!list || !target || !draggedName) return; event.preventDefault(); const dragging = [...list.querySelectorAll("[data-category-row]")].find(row => key(row.dataset.categoryName) === key(draggedName)); if (!dragging || dragging === target) return; const rect = target.getBoundingClientRect(); list.insertBefore(dragging, event.clientY > rect.top + rect.height / 2 ? target.nextSibling : target); });
  document.addEventListener("dragend", event => { event.target.closest?.("[data-category-row]")?.classList.remove("dragging"); const current = subject(); if (!current || !draggedName) return; current.categories = [...document.querySelectorAll("#categoryManagerList [data-category-row]")].map(row => row.dataset.categoryName); draggedName = ""; save(); render(); });
})();