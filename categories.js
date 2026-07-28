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
