
/* ===== categories.js ===== */
(() => {
  "use strict";

  const CATEGORY_UNCATEGORIZED = "__uncategorized__";
  let categoryFilterSelect = null;
  let questionCategorySelect = null;
  let pendingQuestionCategory = null;

  function cleanCategoryName(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function categoryKey(value) {
    return cleanCategoryName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function subjectById(subjectId) {
    return data.subjects.find(subject => subject.id === subjectId) || null;
  }

  function ensureSubjectCategory(subject, value) {
    if (!subject) return "";
    const name = cleanCategoryName(value);
    if (!name) return "";
    subject.categories = Array.isArray(subject.categories) ? subject.categories : [];
    const existing = subject.categories.find(item => categoryKey(item) === categoryKey(name));
    if (existing) return existing;
    subject.categories.push(name);
    return name;
  }

  function normalizeSubjectCategories(subject) {
    if (!subject) return [];
    subject.categories = Array.isArray(subject.categories)
      ? subject.categories.map(cleanCategoryName).filter(Boolean)
      : [];

    (subject.cards || []).forEach(card => {
      card.category = cleanCategoryName(card.category || card.categoria || "");
      if (card.category) card.category = ensureSubjectCategory(subject, card.category);
    });

    const unique = [];
    const used = new Set();
    subject.categories.forEach(name => {
      const key = categoryKey(name);
      if (!key || used.has(key)) return;
      used.add(key);
      unique.push(name);
    });
    subject.categories = unique;
    return [...unique].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  function categoriesWithCounts(subject) {
    const categories = normalizeSubjectCategories(subject);
    return categories.map(name => ({
      name,
      count: (subject.cards || []).filter(card => categoryKey(card.category) === categoryKey(name)).length
    }));
  }

  function addStyles() {
    if (document.querySelector("#fixaCategoryStyles")) return;
    const style = document.createElement("style");
    style.id = "fixaCategoryStyles";
    style.textContent = `
      .category-filter { flex: 1 1 190px; min-width: 170px; }
      .category-pill { color: #5b45b5; border: 1px solid #ddd6fe; background: #f3f0ff; }
      .category-manager-list { display: grid; gap: 8px; margin-top: 4px; }
      .category-manager-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center; padding: 9px; border: 1px solid var(--line); border-radius: 9px; background: #f8faff; }
      .category-manager-row small { color: var(--muted); white-space: nowrap; }
      .category-delete-check { display: inline-flex; align-items: center; gap: 6px; color: var(--danger); font-size: 13px; white-space: nowrap; }
      .category-delete-check input { width: auto; margin: 0; }
      .category-manager-empty { margin: 0; padding: 12px; border-radius: 9px; color: var(--muted); background: #f6f8fc; }
      @media (max-width: 700px) {
        .category-manager-row { grid-template-columns: 1fr; }
        .category-manager-row small, .category-delete-check { white-space: normal; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCategoryFilter() {
    if (categoryFilterSelect?.isConnected) return categoryFilterSelect;
    const statusFilter = document.querySelector("#cardFilter");
    const statusLabel = statusFilter?.closest("label");
    if (!statusLabel?.parentElement) return null;

    const label = document.createElement("label");
    label.className = "select-with-icon category-filter";
    label.innerHTML = `
      <svg class="filter-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h10l6 6-7 7-9-9z"></path>
        <circle cx="9" cy="10" r="1"></circle>
      </svg>
      <select id="cardCategoryFilter" aria-label="Filtrar por categoria">
        <option value="all">Todas as categorias</option>
      </select>
    `;
    statusLabel.insertAdjacentElement("afterend", label);
    categoryFilterSelect = label.querySelector("select");
    categoryFilterSelect.addEventListener("change", () => renderQuestions(currentSubject() || { cards: [] }));
    return categoryFilterSelect;
  }

  function ensureQuestionCategoryField() {
    if (questionCategorySelect?.isConnected) return questionCategorySelect;
    const collectionSelect = document.querySelector("#questionCollection");
    const collectionLabel = collectionSelect?.closest("label");
    if (!collectionLabel?.parentElement) return null;

    const label = document.createElement("label");
    label.id = "questionCategoryWrap";
    label.innerHTML = `
      Categoria (opcional)
      <select id="questionCategory">
        <option value="">Sem categoria</option>
        <option value="__new__">+ Criar nova categoria</option>
      </select>
    `;
    collectionLabel.insertAdjacentElement("afterend", label);
    questionCategorySelect = label.querySelector("select");
    questionCategorySelect.addEventListener("change", () => {
      if (questionCategorySelect.value !== "__new__") return;
      const subject = currentSubject();
      const name = cleanCategoryName(window.prompt("Nome da nova categoria:"));
      if (!subject || !name) {
        questionCategorySelect.value = "";
        return;
      }
      const savedName = ensureSubjectCategory(subject, name);
      save();
      renderCategoryControls(subject, savedName);
    });
    return questionCategorySelect;
  }

  function renderCategoryControls(subject = currentSubject(), preferredQuestionCategory = null) {
    const filter = ensureCategoryFilter();
    const editor = ensureQuestionCategoryField();
    const categories = subject ? categoriesWithCounts(subject) : [];

    if (filter) {
      const previous = filter.value || "all";
      const hasUncategorized = Boolean(subject?.cards?.some(card => !cleanCategoryName(card.category)));
      filter.innerHTML = [
        '<option value="all">Todas as categorias</option>',
        ...categories.map(item => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)} (${item.count})</option>`),
        ...(hasUncategorized ? ['<option value="__uncategorized__">Sem categoria</option>'] : [])
      ].join("");
      const allowed = new Set(["all", ...categories.map(item => item.name), ...(hasUncategorized ? [CATEGORY_UNCATEGORIZED] : [])]);
      filter.value = allowed.has(previous) ? previous : "all";
    }

    if (editor) {
      const previous = preferredQuestionCategory !== null
        ? cleanCategoryName(preferredQuestionCategory)
        : cleanCategoryName(editor.value);
      editor.innerHTML = [
        '<option value="">Sem categoria</option>',
        ...categories.map(item => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`),
        '<option value="__new__">+ Criar nova categoria</option>'
      ].join("");
      const matched = categories.find(item => categoryKey(item.name) === categoryKey(previous));
      editor.value = matched?.name || "";
    }
  }

  function renderedCardsForSubject(subject) {
    if (!subject?.cards) return [];
    let cards = subject.cards.map((card, index) => ({ card, index }));
    const filter = document.querySelector("#cardFilter")?.value || "all";
    if (filter === "all") {
      cards = cards.filter(item => item.card.status !== "frozen");
    } else {
      cards = cards.filter(item => (item.card.status || "new") === filter);
    }
    const query = normalizeSearchText(document.querySelector("#cardSearch")?.value || "").trim();
    if (query) cards = cards.filter(item => cardSearchText(item.card).includes(query));
    const sort = document.querySelector("#cardSort")?.value || "newest";
    cards.sort((a, b) => {
      if (sort === "oldest") return a.index - b.index;
      if (sort === "az") return a.card.q.localeCompare(b.card.q);
      if (sort === "za") return b.card.q.localeCompare(a.card.q);
      return b.index - a.index;
    });
    return cards;
  }

  function applyCategoryPresentation(subject) {
    renderCategoryControls(subject);
    const selected = categoryFilterSelect?.value || "all";
    const items = renderedCardsForSubject(subject);
    const articles = [...document.querySelectorAll("#questionList .question-item")];
    let visible = 0;

    articles.forEach((article, position) => {
      const card = items[position]?.card;
      if (!card) return;
      article.querySelector(".category-pill")?.remove();
      if (card.category) {
        const codePill = article.querySelector(".question-code-pill");
        if (codePill) {
          const pill = document.createElement("span");
          pill.className = "pill category-pill";
          pill.textContent = card.category;
          codePill.insertAdjacentElement("afterend", pill);
        }
      }
      const matches = selected === "all"
        || (selected === CATEGORY_UNCATEGORIZED && !cleanCategoryName(card.category))
        || categoryKey(card.category) === categoryKey(selected);
      article.hidden = !matches;
      if (matches) visible += 1;
    });

    document.querySelector("#categoryEmptyResult")?.remove();
    if (articles.length && !visible) {
      const empty = document.createElement("div");
      empty.id = "categoryEmptyResult";
      empty.className = "empty";
      empty.textContent = "Nenhuma questão encontrada nesta categoria.";
      document.querySelector("#questionList")?.appendChild(empty);
    }
  }

  const originalCardSearchText = cardSearchText;
  cardSearchText = function categoryAwareSearchText(card) {
    return `${originalCardSearchText(card)} ${normalizeSearchText(card?.category || "")}`.trim();
  };

  const originalRenderQuestions = renderQuestions;
  renderQuestions = function renderQuestionsWithCategories(subject) {
    originalRenderQuestions(subject);
    applyCategoryPresentation(subject);
  };

  const originalRenderCollectionSelects = renderCollectionSelects;
  renderCollectionSelects = function renderCollectionSelectsWithCategories() {
    originalRenderCollectionSelects();
    renderCategoryControls(currentSubject());
  };

  const originalFillQuestionFormForEdit = fillQuestionFormForEdit;
  fillQuestionFormForEdit = function fillQuestionFormForEditWithCategory(card, index) {
    originalFillQuestionFormForEdit(card, index);
    renderCategoryControls(currentSubject(), card?.category || "");
  };

  const originalResetQuestionForm = resetQuestionForm;
  resetQuestionForm = function resetQuestionFormWithCategory() {
    originalResetQuestionForm();
    renderCategoryControls(currentSubject(), "");
  };

  const originalParseJsonCards = parseJsonCards;
  parseJsonCards = function parseJsonCardsWithCategories(text) {
    const cards = originalParseJsonCards(text);
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : parsed.cards || parsed.questoes || parsed.questions || [];
      let sourceIndex = 0;
      cards.forEach(card => {
        while (sourceIndex < items.length) {
          const item = items[sourceIndex++];
          const question = item?.pergunta || item?.question || item?.q || item?.frente || "";
          if (!question) continue;
          card.category = cleanCategoryName(item.categoria || item.category || item.assunto || "");
          break;
        }
      });
    } catch (error) {
      console.warn("[Fixa Categorias] Não foi possível ler categorias do JSON:", error);
    }
    return cards;
  };

  const originalImportCards = importCards;
  importCards = function importCardsWithCategories(cards) {
    const targetId = document.querySelector("#importCollection")?.value || data.selected;
    const target = subjectById(targetId);
    (cards || []).forEach(card => {
      card.category = cleanCategoryName(card.category || card.categoria || "");
      if (target && card.category) card.category = ensureSubjectCategory(target, card.category);
    });
    const total = originalImportCards(cards);
    if (total) renderCategoryControls(target || currentSubject());
    return total;
  };

  const originalExportCardToJson = exportCardToJson;
  exportCardToJson = function exportCardToJsonWithCategory(card, imagePath = "") {
    const exported = originalExportCardToJson(card, imagePath);
    if (card?.category) exported.categoria = card.category;
    return exported;
  };

  const originalSidebarMenuHtml = sidebarMenuHtml;
  sidebarMenuHtml = function sidebarMenuHtmlWithCategories(type) {
    const html = originalSidebarMenuHtml(type);
    if (type !== "subject" || html.includes('data-subject-action="categories"')) return html;
    return html.replace(
      '<button type="button" data-subject-action="rename">✎ Renomear coleção</button>',
      '<button type="button" data-subject-action="rename">✎ Renomear coleção</button>\n        <button type="button" data-subject-action="categories">⌑ Gerenciar categorias</button>'
    );
  };

  function openCategoryManager(subjectId) {
    const subject = subjectById(subjectId);
    if (!subject) return;
    const categories = categoriesWithCounts(subject);
    const rows = categories.length
      ? categories.map(item => `
          <div class="category-manager-row" data-category-row data-category-old="${escapeHtml(item.name)}">
            <input data-category-name value="${escapeHtml(item.name)}" aria-label="Nome da categoria ${escapeHtml(item.name)}">
            <small>${item.count} questão${item.count === 1 ? "" : "ões"}</small>
            <label class="category-delete-check"><input type="checkbox" data-category-delete> Excluir</label>
          </div>
        `).join("")
      : '<p class="category-manager-empty">Esta coleção ainda não possui categorias.</p>';

    openModal(
      `Categorias — ${subject.name}`,
      `<div class="modal-form">
        <p>Organize as questões por assunto. Excluir uma categoria não exclui as questões; elas ficam como “Sem categoria”.</p>
        <div class="category-manager-list">${rows}</div>
        <label>Nova categoria<input id="newCategoryInput" placeholder="Ex.: Ortografia"></label>
        <p class="notice" id="categoryManagerError"></p>
      </div>`,
      `<button class="secondary" type="button" data-modal-close>Cancelar</button>
       <button type="button" data-save-categories="${escapeHtml(subject.id)}">Salvar categorias</button>`
    );
  }

  function saveCategoryManager(subjectId) {
    const subject = subjectById(subjectId);
    if (!subject) return;
    const rows = [...document.querySelectorAll("[data-category-row]")];
    const mapping = new Map();
    const names = [];
    let invalid = false;

    rows.forEach(row => {
      const oldName = cleanCategoryName(row.dataset.categoryOld);
      const deleted = Boolean(row.querySelector("[data-category-delete]")?.checked);
      const newName = cleanCategoryName(row.querySelector("[data-category-name]")?.value);
      if (!deleted && !newName) invalid = true;
      mapping.set(categoryKey(oldName), deleted ? "" : newName);
      if (!deleted && newName) names.push(newName);
    });

    const added = cleanCategoryName(document.querySelector("#newCategoryInput")?.value);
    if (added) names.push(added);
    const keys = names.map(categoryKey);
    const duplicate = new Set(keys).size !== keys.length;
    const notice = document.querySelector("#categoryManagerError");
    if (invalid || duplicate) {
      if (notice) notice.textContent = invalid
        ? "Preencha o nome das categorias mantidas ou marque Excluir."
        : "Não é possível cadastrar categorias com o mesmo nome.";
      return;
    }

    (subject.cards || []).forEach(card => {
      const key = categoryKey(card.category);
      if (mapping.has(key)) card.category = mapping.get(key);
    });
    subject.categories = [];
    names.forEach(name => ensureSubjectCategory(subject, name));
    (subject.cards || []).forEach(card => {
      if (card.category) card.category = ensureSubjectCategory(subject, card.category);
    });

    closeModal();
    save();
    render();
    if (el.collectionMessage) setMessage(el.collectionMessage, "Categorias atualizadas.");
  }

  function assignPendingCategory(attempt = 0) {
    const pending = pendingQuestionCategory;
    if (!pending) return;
    const subject = subjectById(pending.subjectId);
    if (!subject) {
      pendingQuestionCategory = null;
      return;
    }

    let card = null;
    if (Number.isInteger(pending.editingIndex)) {
      card = subject.cards[pending.editingIndex] || null;
    } else {
      card = [...subject.cards].reverse().find(item =>
        item.q === pending.question && new Date(item.createdAt || 0).getTime() >= pending.startedAt - 1500
      ) || null;
    }

    if (!card && attempt < 30) {
      setTimeout(() => assignPendingCategory(attempt + 1), 100);
      return;
    }
    pendingQuestionCategory = null;
    if (!card) return;
    card.category = pending.category ? ensureSubjectCategory(subject, pending.category) : "";
    save();
    render();
  }

  document.querySelector("#questionForm")?.addEventListener("submit", () => {
    const subject = currentSubject();
    pendingQuestionCategory = {
      subjectId: subject?.id || "",
      editingIndex: Number.isInteger(editingCardIndex) ? editingCardIndex : null,
      question: document.querySelector("#questionText")?.value.trim() || "",
      category: cleanCategoryName(questionCategorySelect?.value === "__new__" ? "" : questionCategorySelect?.value),
      startedAt: Date.now()
    };
    setTimeout(() => assignPendingCategory(), 0);
  }, true);

  document.addEventListener("click", event => {
    const categoryAction = event.target.closest?.('[data-subject-action="categories"]');
    if (categoryAction) {
      const menu = categoryAction.closest(".sidebar-menu");
      const subjectId = menu?.dataset.menuId || openSidebarMenu?.id || "";
      openCategoryManager(subjectId);
      return;
    }

    const saveButton = event.target.closest?.("[data-save-categories]");
    if (saveButton) saveCategoryManager(saveButton.dataset.saveCategories);
  });

  function updateGuidelines() {
    const guidelines = document.querySelector("#guidelinesText");
    if (!guidelines) return;
    const note = 'O campo "categoria" é opcional. Exemplo: "categoria": "Ortografia".';
    if ("value" in guidelines) {
      if (!guidelines.value.includes('"categoria"')) guidelines.value = `${note}\n\n${guidelines.value}`;
    } else if (!guidelines.textContent.includes('"categoria"')) {
      guidelines.textContent = `${note}\n\n${guidelines.textContent}`;
    }
  }

  addStyles();
  data.subjects.forEach(normalizeSubjectCategories);
  ensureCategoryFilter();
  ensureQuestionCategoryField();
  updateGuidelines();
  save();
  render();
})();


/* ===== categories-manager-ui.js ===== */
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


/* ===== category-modal-close-fix.js ===== */
(() => {
  "use strict";

  document.addEventListener("click", event => {
    const closeButton = event.target.closest?.(".category-modal-close");
    if (!closeButton) return;

    const modal = closeButton.closest("#actionModal");
    if (!modal) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    modal.classList.remove("category-manager-modal");

    if (typeof closeModal === "function") {
      closeModal();
      return;
    }

    modal.classList.remove("show");
    modal.hidden = true;
  }, true);
})();


/* ===== collection-order-manager.js ===== */
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
