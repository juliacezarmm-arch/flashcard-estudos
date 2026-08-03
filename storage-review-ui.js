(() => {
  "use strict";

  if (document.querySelector("#storageReviewUiStyle")) return;

  const BUCKET = "questoes-imagens";
  const PREFIX = "storage://";
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  let migrationRunning = false;
  let lastSignature = "";

  const style = document.createElement("style");
  style.id = "storageReviewUiStyle";
  style.textContent = `
    .review-tab-badge {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #b45309;
      background: #fff1d6;
      font-size: 10px;
      font-weight: 800;
      line-height: 1;
    }

    .storage-review-card {
      border: 1px solid #f2d39b;
      border-radius: 13px;
      padding: 18px;
      display: grid;
      gap: 16px;
      background: #fffaf0;
    }

    .storage-review-card.is-success {
      border-color: #bfe6ca;
      background: #f3fbf5;
    }

    .storage-review-card.is-error {
      border-color: #fecaca;
      background: #fff6f6;
    }

    .storage-review-main {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: 14px;
    }

    .storage-review-icon {
      width: 48px;
      height: 48px;
      border: 1px solid #f1cf91;
      border-radius: 12px;
      display: grid;
      place-items: center;
      color: #b45309;
      background: #fff3da;
    }

    .storage-review-card.is-success .storage-review-icon {
      border-color: #bfe6ca;
      color: #15803d;
      background: #eaf8ee;
    }

    .storage-review-card.is-error .storage-review-icon {
      border-color: #fecaca;
      color: #b91c1c;
      background: #feecec;
    }

    .storage-review-icon svg {
      width: 26px;
      height: 26px;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .storage-review-copy {
      min-width: 0;
      display: grid;
      gap: 6px;
    }

    .storage-review-kicker {
      width: max-content;
      border-radius: 999px;
      padding: 4px 8px;
      color: #b45309;
      background: #fff0cf;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .storage-review-card.is-success .storage-review-kicker {
      color: #15803d;
      background: #e4f6e9;
    }

    .storage-review-card.is-error .storage-review-kicker {
      color: #b91c1c;
      background: #fee2e2;
    }

    .storage-review-copy h4 {
      margin: 0;
      color: #172033;
      font-size: 17px;
      line-height: 1.3;
    }

    .storage-review-copy p {
      max-width: 760px;
      margin: 0;
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }

    .storage-review-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .storage-review-stat {
      min-height: 30px;
      border: 1px solid #ead9b9;
      border-radius: 8px;
      padding: 6px 9px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #52617a;
      background: rgba(255, 255, 255, 0.72);
      font-size: 12px;
    }

    .storage-review-stat strong {
      color: #172033;
      font-size: 12px;
    }

    .storage-review-collections {
      border-top: 1px solid rgba(180, 83, 9, 0.13);
      padding-top: 12px;
      display: grid;
      gap: 7px;
    }

    .storage-review-collection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: #52617a;
      font-size: 12px;
    }

    .storage-review-collection strong {
      overflow: hidden;
      color: #172033;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .storage-review-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border-top: 1px solid rgba(180, 83, 9, 0.13);
      padding-top: 14px;
    }

    .storage-review-note {
      margin: 0;
      color: #7c6a4d;
      font-size: 11px;
      line-height: 1.45;
    }

    #sendStorageImagesNow {
      flex: 0 0 auto;
      min-height: 40px;
      padding: 0 16px;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #fff;
      background: #2563eb;
      font-size: 13px;
      font-weight: 700;
    }

    #sendStorageImagesNow:hover:not(:disabled) {
      background: #1d4ed8;
    }

    #sendStorageImagesNow:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    .storage-review-progress {
      height: 7px;
      border-radius: 999px;
      overflow: hidden;
      background: #eadfca;
    }

    .storage-review-progress span {
      display: block;
      width: var(--review-progress, 0%);
      height: 100%;
      border-radius: inherit;
      background: #2563eb;
      transition: width 180ms ease;
    }

    @media (max-width: 700px) {
      .storage-review-main {
        grid-template-columns: 1fr;
      }

      .storage-review-actions {
        align-items: stretch;
        flex-direction: column;
      }

      #sendStorageImagesNow {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  function storageReady() {
    return typeof supabaseClient !== "undefined"
      && Boolean(supabaseClient)
      && typeof currentUser !== "undefined"
      && Boolean(currentUser?.id);
  }

  function currentData() {
    return typeof data !== "undefined" && data ? data : null;
  }

  function dataUrlToBlob(dataUrl) {
    const match = String(dataUrl || "").match(/^data:([^;,]+);base64,(.+)$/s);
    if (!match) return null;
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: match[1] });
  }

  function extensionFor(type) {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/webp") return "webp";
    return "png";
  }

  function safeSegment(value, fallback) {
    const clean = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return clean || fallback;
  }

  async function sha256(blob) {
    const bytes = await blob.arrayBuffer();
    if (crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(digest)]
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function pendingStorageImages() {
    const source = currentData();
    const cards = [];
    const collections = new Map();
    const uniqueImages = new Set();

    (source?.subjects || []).forEach(subject => {
      let collectionCount = 0;
      (subject.cards || []).forEach(card => {
        const image = String(card.image || "");
        if (!image.startsWith("data:image/")) return;
        cards.push({ subject, card, image });
        uniqueImages.add(image);
        collectionCount += 1;
      });
      if (collectionCount) {
        collections.set(subject.id || subject.name, {
          id: subject.id || subject.name,
          name: subject.name || "Coleção sem nome",
          count: collectionCount
        });
      }
    });

    return {
      cards,
      collections: [...collections.values()],
      uniqueCount: uniqueImages.size
    };
  }

  function elements() {
    return {
      count: document.querySelector("#reviewQuestionsCount"),
      empty: document.querySelector("#reviewQuestionsEmpty"),
      list: document.querySelector("#reviewQuestionsList"),
      tab: document.querySelector("#showReviewQuestions")
    };
  }

  function ensureTabBadge(tab) {
    if (!tab) return null;
    let badge = tab.querySelector(".review-tab-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "review-tab-badge";
      tab.appendChild(badge);
    }
    return badge;
  }

  function collectionRows(collections) {
    return collections.map(collection => `
      <div class="storage-review-collection">
        <strong>${escapeText(collection.name)}</strong>
        <span>${collection.count} ${collection.count === 1 ? "questão" : "questões"}</span>
      </div>
    `).join("");
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderPendingReview(force = false) {
    const { count, empty, list, tab } = elements();
    if (!count || !empty || !list || !tab) return;

    const pending = pendingStorageImages();
    const signature = `${pending.cards.length}:${pending.uniqueCount}:${storageReady()}:${migrationRunning}`;
    if (!force && signature === lastSignature) return;
    lastSignature = signature;

    const badge = ensureTabBadge(tab);
    count.textContent = `${pending.cards.length} ${pending.cards.length === 1 ? "pendência" : "pendências"}`;

    if (badge) {
      badge.hidden = pending.cards.length === 0;
      badge.textContent = String(pending.cards.length);
    }

    if (!pending.cards.length) {
      empty.hidden = false;
      list.hidden = true;
      list.innerHTML = "";
      return;
    }

    empty.hidden = true;
    list.hidden = false;
    list.innerHTML = `
      <article class="storage-review-card" id="storageReviewMigrationCard">
        <div class="storage-review-main">
          <span class="storage-review-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 8.5A3.5 3.5 0 0 1 7.5 5h1A5.5 5.5 0 0 1 19 7.4 4 4 0 0 1 18 15H7a4 4 0 0 1-3-6.5z"></path>
              <path d="M12 18V9"></path>
              <path d="m8.5 12.5 3.5-3.5 3.5 3.5"></path>
            </svg>
          </span>
          <div class="storage-review-copy">
            <span class="storage-review-kicker">Ação necessária</span>
            <h4>Enviar imagens para o armazenamento</h4>
            <p>Estas imagens ainda estão salvas dentro das questões. Para manter o Fixa leve e reduzir o consumo de dados, elas precisam ser enviadas ao armazenamento de imagens.</p>
            <div class="storage-review-stats">
              <span class="storage-review-stat"><strong>${pending.cards.length}</strong> ${pending.cards.length === 1 ? "questão" : "questões"}</span>
              <span class="storage-review-stat"><strong>${pending.uniqueCount}</strong> ${pending.uniqueCount === 1 ? "imagem diferente" : "imagens diferentes"}</span>
              <span class="storage-review-stat"><strong>${pending.collections.length}</strong> ${pending.collections.length === 1 ? "coleção" : "coleções"}</span>
            </div>
          </div>
        </div>
        <div class="storage-review-collections">
          ${collectionRows(pending.collections)}
        </div>
        <div class="storage-review-progress" id="storageReviewProgress" hidden><span></span></div>
        <div class="storage-review-actions">
          <p class="storage-review-note" id="storageReviewStatus">As questões e as imagens continuarão iguais. Somente o local de armazenamento será alterado.</p>
          <button id="sendStorageImagesNow" type="button" ${storageReady() ? "" : "disabled"}>
            ${storageReady() ? "Enviar imagens agora" : "Aguardando conexão..."}
          </button>
        </div>
      </article>
    `;

    document.querySelector("#sendStorageImagesNow")?.addEventListener("click", migrateFromReview);
  }

  function setMigrationProgress(done, total, message) {
    const progress = document.querySelector("#storageReviewProgress");
    const progressBar = progress?.querySelector("span");
    const status = document.querySelector("#storageReviewStatus");
    const button = document.querySelector("#sendStorageImagesNow");
    const percentage = total ? Math.round((done / total) * 100) : 0;

    if (progress) progress.hidden = false;
    if (progressBar) progressBar.style.setProperty("--review-progress", `${percentage}%`);
    if (status) status.textContent = message;
    if (button) button.textContent = done < total ? `Enviando ${done + 1} de ${total}...` : "Finalizando...";
  }

  async function prepareUploadGroups(pending) {
    const groups = new Map();

    for (const item of pending.cards) {
      const collectionId = safeSegment(item.subject.id || item.subject.name, "colecao");
      const groupKey = `${collectionId}::${item.image}`;
      if (!groups.has(groupKey)) {
        const blob = dataUrlToBlob(item.image);
        if (!blob) throw new Error("Uma das imagens não pôde ser lida.");
        if (!ALLOWED_TYPES.has(blob.type)) throw new Error("Uma das imagens está em formato inválido. Use PNG, JPG ou WebP.");
        if (blob.size > MAX_FILE_SIZE) throw new Error("Uma das imagens ultrapassa o limite de 5 MB e precisa ser substituída.");
        const hash = await sha256(blob);
        groups.set(groupKey, {
          blob,
          collectionId,
          path: `${currentUser.id}/${collectionId}/${hash}.${extensionFor(blob.type)}`,
          cards: []
        });
      }
      groups.get(groupKey).cards.push(item.card);
    }

    return [...groups.values()];
  }

  async function migrateFromReview() {
    if (migrationRunning) return;
    if (!storageReady()) {
      renderMigrationError("Entre novamente na sua conta para enviar as imagens.");
      return;
    }

    const pending = pendingStorageImages();
    if (!pending.cards.length) {
      renderPendingReview(true);
      return;
    }

    const button = document.querySelector("#sendStorageImagesNow");
    migrationRunning = true;
    if (button) button.disabled = true;

    const uploadedPaths = [];
    try {
      const groups = await prepareUploadGroups(pending);

      for (let index = 0; index < groups.length; index += 1) {
        const group = groups[index];
        setMigrationProgress(index, groups.length, `Enviando imagem ${index + 1} de ${groups.length}...`);

        const { error } = await supabaseClient.storage.from(BUCKET).upload(group.path, group.blob, {
          contentType: group.blob.type,
          cacheControl: "3600",
          upsert: false
        });

        if (error && !/already exists|duplicate|resource exists/i.test(error.message || "")) {
          throw new Error(error.message || "Não foi possível enviar uma das imagens.");
        }
        if (!error) uploadedPaths.push(group.path);
      }

      groups.forEach(group => {
        group.cards.forEach(card => {
          card.image = `${PREFIX}${group.path}`;
          card.imageStoragePath = group.path;
        });
      });

      setMigrationProgress(groups.length, groups.length, "Salvando as novas referências das imagens...");
      if (typeof save === "function") save();
      if (typeof render === "function") render();

      await new Promise(resolve => setTimeout(resolve, 900));
      renderMigrationSuccess(pending.cards.length, groups.length);
      window.dispatchEvent(new CustomEvent("fixa:storage-images-migrated", {
        detail: { cards: pending.cards.length, images: groups.length }
      }));
    } catch (error) {
      if (uploadedPaths.length) {
        try {
          await supabaseClient.storage.from(BUCKET).remove(uploadedPaths);
        } catch (rollbackError) {
          console.error("[Fixa Storage] Falha ao desfazer uploads incompletos:", rollbackError);
        }
      }
      console.error("[Fixa Storage] Falha na migração pela revisão:", error);
      renderMigrationError(error?.message || "Não foi possível enviar as imagens.");
    } finally {
      migrationRunning = false;
      lastSignature = "";
    }
  }

  function renderMigrationSuccess(cardCount, imageCount) {
    const { count, empty, list, tab } = elements();
    const badge = ensureTabBadge(tab);
    if (count) count.textContent = "0 pendências";
    if (badge) badge.hidden = true;
    if (empty) empty.hidden = true;
    if (!list) return;

    list.hidden = false;
    list.innerHTML = `
      <article class="storage-review-card is-success">
        <div class="storage-review-main">
          <span class="storage-review-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"></path></svg>
          </span>
          <div class="storage-review-copy">
            <span class="storage-review-kicker">Concluído</span>
            <h4>Imagens enviadas com sucesso</h4>
            <p>${imageCount} ${imageCount === 1 ? "imagem foi enviada" : "imagens foram enviadas"} ao armazenamento e ${cardCount} ${cardCount === 1 ? "questão foi atualizada" : "questões foram atualizadas"}. O conteúdo das questões não foi alterado.</p>
          </div>
        </div>
      </article>
    `;
  }

  function renderMigrationError(message) {
    const list = document.querySelector("#reviewQuestionsList");
    if (!list) return;
    list.hidden = false;
    list.innerHTML = `
      <article class="storage-review-card is-error">
        <div class="storage-review-main">
          <span class="storage-review-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 17h.01"></path></svg>
          </span>
          <div class="storage-review-copy">
            <span class="storage-review-kicker">Não foi possível concluir</span>
            <h4>O envio das imagens foi interrompido</h4>
            <p>${escapeText(message)} As imagens continuam salvas nas questões e nenhuma delas foi removida.</p>
            <div class="storage-review-actions">
              <p class="storage-review-note">Corrija o problema indicado e tente novamente.</p>
              <button id="sendStorageImagesNow" type="button">Tentar enviar novamente</button>
            </div>
          </div>
        </div>
      </article>
    `;
    document.querySelector("#sendStorageImagesNow")?.addEventListener("click", migrateFromReview);
  }

  function init() {
    renderPendingReview(true);
    document.querySelector("#showReviewQuestions")?.addEventListener("click", () => {
      setTimeout(() => renderPendingReview(true), 0);
    });

    setInterval(() => renderPendingReview(false), 1500);
  }

  window.FixaStorageReview = {
    refresh: () => renderPendingReview(true),
    migrate: migrateFromReview,
    pending: pendingStorageImages
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
