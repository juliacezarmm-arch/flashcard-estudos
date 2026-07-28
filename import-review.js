(() => {
  "use strict";

  const state = {
    session: null,
    activeIndex: 0,
    busy: false,
    feedback: ""
  };

  const stopWords = new Set(
    "a as o os de da das do dos e em um uma para por com sem que qual quais como ao aos na nas no nos se sua seu ser sobre esta este essa esse".split(" ")
  );

  function addStyles() {
    if (document.querySelector("#fixaImportReviewStyles")) return;
    const style = document.createElement("style");
    style.id = "fixaImportReviewStyles";
    style.textContent = `
      .fixa-import-review{display:grid;gap:14px;border:1px solid var(--line);border-radius:12px;padding:15px;background:#fff}
      .fixa-import-review[hidden]{display:none!important}
      .fixa-import-review h3,.fixa-import-review p{margin:0}
      .fixa-import-review p{color:var(--muted);line-height:1.45}
      .fixa-import-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
      .fixa-import-stat{border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff}
      .fixa-import-stat strong{display:block;font-size:24px;line-height:1}
      .fixa-import-stat span{display:block;margin-top:5px;color:var(--muted);font-size:12px}
      .fixa-import-stat.new strong{color:#15803d}.fixa-import-stat.exact strong{color:#c2410c}.fixa-import-stat.possible strong{color:#7c3aed}
      .fixa-import-notice{border:1px solid #cfe0fb;border-radius:9px;padding:11px;background:#f5f9ff;color:#40506d}
      .fixa-import-notice.success{border-color:#bbf7d0;background:#f0fdf4;color:#166534}
      .fixa-import-grid{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(0,1.7fr);gap:10px;min-height:420px}
      .fixa-import-list-wrap,.fixa-import-compare-wrap{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
      .fixa-import-list-wrap{display:grid;grid-template-rows:auto minmax(0,1fr)}
      .fixa-import-toolbar,.fixa-import-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .fixa-import-toolbar{padding:9px;border-bottom:1px solid var(--line);background:#f8fafc}
      .fixa-import-toolbar button{padding:7px 8px;font-size:12px}
      .fixa-import-list{display:grid;align-content:start;gap:6px;padding:8px;max-height:540px;overflow:auto}
      .fixa-import-item{display:grid;grid-template-columns:auto 1fr;gap:6px 8px;width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;color:var(--text);background:#fff;text-align:left;box-shadow:none}
      .fixa-import-item:hover,.fixa-import-item.active{color:var(--text);border-color:#8eb4ff;background:#f5f9ff}
      .fixa-import-item.decided{border-color:#cbd5e1}
      .fixa-import-tag,.fixa-import-choice{width:max-content;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:800}
      .fixa-import-tag.exact{color:#c2410c;background:#fff1e8}.fixa-import-tag.possible{color:#7c3aed;background:#f3edff}
      .fixa-import-choice{grid-column:2;color:#59657c;background:#eef2f8}
      .fixa-import-choice.decided{color:#166534;background:#dcfce7}
      .fixa-import-question{font-size:13px;font-weight:750;line-height:1.35;overflow-wrap:anywhere}
      .fixa-import-compare-wrap{display:grid;grid-template-rows:minmax(0,1fr) auto}
      .fixa-import-compare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
      .fixa-import-side{padding:13px;min-width:0;overflow:auto}.fixa-import-side+.fixa-import-side{border-left:1px solid var(--line)}
      .fixa-import-side h4{margin:0 0 10px;color:var(--brand-dark)}
      .fixa-import-field{margin-bottom:9px;padding:8px;border-radius:8px;background:#f8fafc}
      .fixa-import-field.changed{background:#fff8d9;box-shadow:inset 3px 0 #eab308}
      .fixa-import-field b{display:block;margin-bottom:4px;color:#53617d;font-size:11px;text-transform:uppercase}
      .fixa-import-field pre{margin:0;font:inherit;font-size:13px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
      .fixa-import-decisions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:10px;border-top:1px solid var(--line);background:#f8fafc}
      .fixa-import-decisions button{min-height:54px;border:1px solid var(--line);color:var(--text);background:#fff;font-size:12px;font-weight:800;box-shadow:none}
      .fixa-import-decisions button.active,.fixa-import-decisions button:hover{color:var(--brand-dark);border-color:var(--brand);background:#eef4ff}
      .fixa-import-footer{padding-top:11px;border-top:1px solid var(--line)}
      .fixa-import-progress{color:var(--muted);font-size:13px;font-weight:750}
      @media(max-width:900px){.fixa-import-summary{grid-template-columns:repeat(2,1fr)}.fixa-import-grid{grid-template-columns:1fr}.fixa-import-list{max-height:280px}}
      @media(max-width:600px){.fixa-import-summary,.fixa-import-compare,.fixa-import-decisions{grid-template-columns:1fr}.fixa-import-side+.fixa-import-side{border-left:0;border-top:1px solid var(--line)}.fixa-import-footer>*{width:100%;text-align:center}}
    `;
    document.head.appendChild(style);
  }

  function escape(value) {
    return typeof escapeHtml === "function"
      ? escapeHtml(String(value || ""))
      : String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function normalize(value) {
    if (typeof normalizeSearchText === "function") return normalizeSearchText(value);
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function fingerprint(value) {
    return normalize(value).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function similarity(first, second) {
    const a = fingerprint(first);
    const b = fingerprint(second);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const setA = new Set(a.split(" ").filter(token => token.length > 2 && !stopWords.has(token)));
    const setB = new Set(b.split(" ").filter(token => token.length > 2 && !stopWords.has(token)));
    const common = [...setA].filter(token => setB.has(token)).length;
    if (common < 3) return 0;
    const dice = (2 * common) / (setA.size + setB.size);
    const containment = common / Math.min(setA.size, setB.size);
    const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.max(dice, containment * 0.92) * 0.85 + lengthRatio * 0.15;
  }

  function findDuplicate(card, cards) {
    const cardKey = fingerprint(card.q);
    let best = { score: 0, index: -1 };
    for (let index = 0; index < cards.length; index += 1) {
      const existing = cards[index];
      if (cardKey && cardKey === fingerprint(existing.q)) return { type: "exact", index, score: 1 };
      const score = similarity(card.q, existing.q);
      if (score > best.score) best = { score, index };
    }
    return best.index >= 0 && best.score >= 0.79
      ? { type: "possible", index: best.index, score: best.score }
      : null;
  }

  function cloneCard(card) {
    const copy = typeof structuredClone === "function" ? structuredClone(card) : JSON.parse(JSON.stringify(card));
    delete copy.subject;
    return typeof normalizeCard === "function" ? normalizeCard(copy) : copy;
  }

  function optionsText(card) {
    if (card.type === "select-list") {
      return (card.listItems || []).map(item => `${item.label} = ${item.answer}`).join("\n") || "Sem itens cadastrados";
    }
    return (card.options || []).map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`).join("\n") || "Sem alternativas cadastradas";
  }

  function answerText(card) {
    if (card.type === "select-list") return card.a || "Resposta não definida";
    return typeof correctAnswerTextForCard === "function"
      ? correctAnswerTextForCard(card) || "Resposta correta não definida"
      : card.correctAnswerText || card.a || "Resposta correta não definida";
  }

  function sameText(first, second) {
    return normalize(first).replace(/\s+/g, " ").trim() === normalize(second).replace(/\s+/g, " ").trim();
  }

  function field(label, value, changed) {
    return `<div class="fixa-import-field ${changed ? "changed" : ""}"><b>${escape(label)}</b><pre>${escape(value || "Não informado")}</pre></div>`;
  }

  function side(card, title, other) {
    return `<article class="fixa-import-side"><h4>${escape(title)}</h4>${field("Pergunta", card.q, fingerprint(card.q) !== fingerprint(other.q))}${field(card.type === "select-list" ? "Itens e respostas" : "Alternativas", optionsText(card), !sameText(optionsText(card), optionsText(other)))}${field("Resposta correta", answerText(card), !sameText(answerText(card), answerText(other)))}${field("Explicação", card.explanation || "Sem explicação", !sameText(card.explanation || "", other.explanation || ""))}</article>`;
  }

  function decisionLabel(value) {
    if (value === "replace") return "Substituir existente";
    if (value === "keep") return "Manter as duas";
    if (value === "skip") return "Não importar";
    return "Aguardando decisão";
  }

  function ensureReviewPanel() {
    const section = document.querySelector("#importQuestionSection");
    const entry = section?.querySelector(".import-box");
    if (!section || !entry) return null;
    entry.id = "importEntryPanel";
    const button = document.querySelector("#bulkImport");
    if (button && !state.busy) button.textContent = "Analisar e importar";
    let panel = document.querySelector("#fixaImportReview");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "fixaImportReview";
    panel.className = "fixa-import-review";
    panel.hidden = true;
    panel.innerHTML = `
      <div><h3>Revisar questões repetidas</h3><p>As questões novas já foram importadas. Decida somente o que fazer com as pendentes.</p></div>
      <div class="fixa-import-summary">
        <div class="fixa-import-stat"><strong data-count="total">0</strong><span>questões encontradas</span></div>
        <div class="fixa-import-stat new"><strong data-count="new">0</strong><span>novas importadas</span></div>
        <div class="fixa-import-stat exact"><strong data-count="exact">0</strong><span>repetidas</span></div>
        <div class="fixa-import-stat possible"><strong data-count="possible">0</strong><span>possivelmente repetidas</span></div>
      </div>
      <div class="fixa-import-notice" data-review-notice></div>
      <div class="fixa-import-grid">
        <section class="fixa-import-list-wrap">
          <div class="fixa-import-toolbar"><strong data-pending-title>Pendentes</strong><div class="row"><button class="secondary" type="button" data-batch="skip">Não importar todas</button><button class="secondary" type="button" data-batch="keep">Manter todas</button></div></div>
          <div class="fixa-import-list" data-pending-list></div>
        </section>
        <section class="fixa-import-compare-wrap">
          <div class="fixa-import-compare" data-comparison></div>
          <div class="fixa-import-decisions"><button type="button" data-decision="skip">Não importar</button><button type="button" data-decision="replace">Substituir existente</button><button type="button" data-decision="keep">Manter as duas</button></div>
        </section>
      </div>
      <div class="fixa-import-footer"><button class="secondary" type="button" data-review-back>Voltar para importar</button><span class="fixa-import-progress" data-review-progress></span><button type="button" data-review-finish>Aplicar decisões e finalizar</button></div>`;
    section.appendChild(panel);
    return panel;
  }

  function nextUndecidedIndex(currentIndex) {
    const pending = state.session?.pending || [];
    for (let index = currentIndex + 1; index < pending.length; index += 1) {
      if (!pending[index].decision) return index;
    }
    for (let index = 0; index < currentIndex; index += 1) {
      if (!pending[index].decision) return index;
    }
    return currentIndex;
  }

  function renderReview() {
    const session = state.session;
    const panel = ensureReviewPanel();
    if (!session || !panel || !session.pending.length) return;
    const subject = data.subjects.find(item => item.id === session.subjectId);
    state.activeIndex = Math.max(0, Math.min(state.activeIndex, session.pending.length - 1));
    const active = session.pending[state.activeIndex];
    const existing = subject?.cards[active.existingIndex];
    panel.querySelector('[data-count="total"]').textContent = session.total;
    panel.querySelector('[data-count="new"]').textContent = session.newCount;
    panel.querySelector('[data-count="exact"]').textContent = session.exactCount;
    panel.querySelector('[data-count="possible"]').textContent = session.possibleCount;
    panel.querySelector("[data-pending-title]").textContent = `Pendentes (${session.pending.length})`;
    const notice = panel.querySelector("[data-review-notice]");
    const baseMessage = `${session.newCount} questão${session.newCount === 1 ? " nova foi importada" : " novas foram importadas"} automaticamente. Revise ${session.pending.length} pendente${session.pending.length === 1 ? "" : "s"}. As decisões serão aplicadas ao finalizar.`;
    notice.textContent = state.feedback || baseMessage;
    notice.classList.toggle("success", Boolean(state.feedback));
    panel.querySelector("[data-pending-list]").innerHTML = session.pending.map((item, index) => `
      <button class="fixa-import-item ${index === state.activeIndex ? "active" : ""} ${item.decision ? "decided" : ""}" type="button" data-review-index="${index}">
        <span class="fixa-import-tag ${item.type}">${item.type === "exact" ? "Repetida" : "Possível"}</span>
        <span class="fixa-import-question">${escape(item.incoming.q)}</span>
        <span class="fixa-import-choice ${item.decision ? "decided" : ""}">${escape(decisionLabel(item.decision))}</span>
      </button>`).join("");
    panel.querySelector("[data-comparison]").innerHTML = existing
      ? side(existing, "Já existe na coleção", active.incoming) + side(active.incoming, "Nova do arquivo", existing)
      : '<div class="empty">A questão existente não foi encontrada.</div>';
    panel.querySelectorAll("[data-decision]").forEach(button => {
      const selected = button.dataset.decision === active.decision;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const decided = session.pending.filter(item => item.decision).length;
    panel.querySelector("[data-review-progress]").textContent = `${decided} de ${session.pending.length} decisões concluídas`;
    panel.querySelector("[data-review-finish]").disabled = decided !== session.pending.length;
  }

  function beginReview(result) {
    state.session = result;
    state.activeIndex = 0;
    state.feedback = "";
    const entry = document.querySelector("#importEntryPanel");
    const panel = ensureReviewPanel();
    if (entry) entry.hidden = true;
    if (panel) panel.hidden = false;
    if (typeof setMessage === "function") setMessage(el.importMessage, "");
    if (typeof render === "function") render();
    renderReview();
  }

  function clearInputs() {
    el.bulkText.value = "";
    pendingImportFile = null;
    el.importFile.value = "";
    el.importFileName.textContent = "Nenhum arquivo escolhido";
  }

  function analyzeAndImport(cards) {
    const subjectId = el.importCollection?.value || data.selected;
    const subject = data.subjects.find(item => item.id === subjectId);
    if (!subject) throw new Error("Selecione uma coleção de destino antes de importar.");
    const pending = [];
    let newCount = 0;
    cards.filter(Boolean).map(cloneCard).forEach((card, index) => {
      const duplicate = findDuplicate(card, subject.cards);
      if (!duplicate) {
        subject.cards.push(card);
        newCount += 1;
      } else {
        pending.push({
          id: `${Date.now()}-${index}`,
          type: duplicate.type,
          existingIndex: duplicate.index,
          incoming: card,
          decision: ""
        });
      }
    });
    data.selected = subject.id;
    if (typeof ensureAllQuestionCodes === "function") ensureAllQuestionCodes(data);
    return {
      subjectId: subject.id,
      total: cards.length,
      newCount,
      exactCount: pending.filter(item => item.type === "exact").length,
      possibleCount: pending.filter(item => item.type === "possible").length,
      pending
    };
  }

  function preserveHistory(existing, incoming) {
    const replacement = cloneCard(incoming);
    ["questionCode", "status", "reviews", "masteryCount", "lastMasteryTestId", "testPriority", "totalCorrect", "totalWrong", "ratingCounts", "lastRating", "lostMasteryCount", "attemptHistory", "lastReviewedAt", "createdAt", "topic", "subtopic"].forEach(key => {
      if (existing[key] !== undefined) replacement[key] = existing[key];
    });
    return typeof normalizeCard === "function" ? normalizeCard(replacement) : replacement;
  }

  function finishReview() {
    const session = state.session;
    if (!session || session.pending.some(item => !item.decision)) return;
    const subject = data.subjects.find(item => item.id === session.subjectId);
    if (!subject) return;
    let kept = 0;
    let replaced = 0;
    let skipped = 0;
    session.pending.forEach(item => {
      const existing = subject.cards[item.existingIndex];
      if (item.decision === "replace" && existing) {
        subject.cards[item.existingIndex] = preserveHistory(existing, item.incoming);
        replaced += 1;
      } else if (item.decision === "keep") {
        const card = cloneCard(item.incoming);
        card.questionCode = "";
        subject.cards.push(card);
        kept += 1;
      } else {
        skipped += 1;
      }
    });
    if (typeof ensureAllQuestionCodes === "function") ensureAllQuestionCodes(data);
    const added = session.newCount + kept;
    closeReview();
    clearInputs();
    if (typeof setMessage === "function") {
      setMessage(el.importMessage, `Importação concluída: ${added} adicionada${added === 1 ? "" : "s"}, ${replaced} substituída${replaced === 1 ? "" : "s"} e ${skipped} não importada${skipped === 1 ? "" : "s"}.`);
    }
    if (typeof render === "function") render();
  }

  function closeReview() {
    state.session = null;
    state.feedback = "";
    const entry = document.querySelector("#importEntryPanel");
    const panel = document.querySelector("#fixaImportReview");
    if (entry) entry.hidden = false;
    if (panel) panel.hidden = true;
  }

  function cancelReview() {
    const imported = state.session?.newCount || 0;
    closeReview();
    clearInputs();
    if (typeof setMessage === "function") {
      setMessage(el.importMessage, `${imported} questão${imported === 1 ? " nova foi mantida" : " novas foram mantidas"}. As repetidas não foram importadas.`);
    }
    if (typeof render === "function") render();
  }

  function handleReviewClick(event) {
    const panel = event.target.closest?.("#fixaImportReview");
    if (!panel || !state.session) return;

    const indexButton = event.target.closest("[data-review-index]");
    const decisionButton = event.target.closest("[data-decision]");
    const batchButton = event.target.closest("[data-batch]");
    const finishButton = event.target.closest("[data-review-finish]");
    const backButton = event.target.closest("[data-review-back]");
    if (!indexButton && !decisionButton && !batchButton && !finishButton && !backButton) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (indexButton) {
      state.activeIndex = Number(indexButton.dataset.reviewIndex) || 0;
      state.feedback = "";
      renderReview();
      return;
    }

    if (decisionButton) {
      const decision = decisionButton.dataset.decision;
      state.session.pending[state.activeIndex].decision = decision;
      state.feedback = `Decisão registrada: ${decisionLabel(decision)}. Continue revisando ou finalize quando todas estiverem decididas.`;
      state.activeIndex = nextUndecidedIndex(state.activeIndex);
      renderReview();
      requestAnimationFrame(() => {
        panel.querySelector(`[data-review-index="${state.activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
      });
      return;
    }

    if (batchButton) {
      const decision = batchButton.dataset.batch;
      state.session.pending.forEach(item => { item.decision = decision; });
      state.feedback = decision === "skip"
        ? "Todas foram marcadas como Não importar. Clique em Aplicar decisões e finalizar."
        : "Todas foram marcadas como Manter as duas. Clique em Aplicar decisões e finalizar.";
      renderReview();
      return;
    }

    if (finishButton) {
      finishReview();
      return;
    }

    if (backButton) cancelReview();
  }

  async function handleImport(event) {
    const button = event.target.closest?.("#bulkImport");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (state.busy || state.session) return;
    state.busy = true;
    const previousText = button.textContent;
    button.disabled = true;
    button.textContent = "Analisando...";
    try {
      const cards = pendingImportFile ? await parseImportFile(pendingImportFile) : parseImportText(el.bulkText.value);
      if (!cards.length) throw new Error(pendingImportFile ? "Não encontrei questões válidas nesse arquivo." : "Cole questões no formato pergunta, linha ---, resposta.");
      cards.forEach(card => normalizeCard(card));
      const result = analyzeAndImport(cards);
      if (result.pending.length) {
        beginReview(result);
      } else {
        clearInputs();
        if (typeof setMessage === "function") setMessage(el.importMessage, `${result.total} questão${result.total === 1 ? "" : "ões"} importada${result.total === 1 ? "" : "s"}. Nenhuma repetida foi encontrada.`);
        if (typeof render === "function") render();
      }
    } catch (error) {
      console.error("[Fixa] Falha na análise da importação:", error);
      if (typeof setMessage === "function") setMessage(el.importMessage, error.message || "Não consegui concluir a análise.", "error");
    } finally {
      state.busy = false;
      button.disabled = false;
      button.textContent = previousText === "Importar questões" ? "Analisar e importar" : previousText;
    }
  }

  function init() {
    addStyles();
    ensureReviewPanel();
    document.addEventListener("click", handleReviewClick, true);
    document.addEventListener("click", handleImport, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
