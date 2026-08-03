(() => {
  "use strict";

  const BUCKET = "questoes-imagens";
  const PREFIX = "storage://";
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
  const signedCache = new Map();
  const pendingImages = new Map();
  let signedTimer = null;
  let migrationRunning = false;

  function storageReady() {
    return typeof supabaseClient !== "undefined" && supabaseClient && typeof currentUser !== "undefined" && currentUser?.id;
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2).replace(".", ",")} MB`;
  }

  function mimeFromName(name = "") {
    const lower = String(name).toLowerCase();
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".png")) return "image/png";
    return "";
  }

  function extensionFor(type) {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/webp") return "webp";
    return "png";
  }

  function normalizeType(blob, name = "") {
    return ALLOWED_TYPES.has(blob.type) ? blob.type : mimeFromName(name);
  }

  function validateImage(blob, name) {
    const type = normalizeType(blob, name);
    if (!ALLOWED_TYPES.has(type)) {
      throw new Error(`Imagem recusada: “${name}” não está em um formato permitido. Use PNG, JPG ou WebP. Nenhuma questão foi importada.`);
    }
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`Imagem recusada: “${name}” possui ${formatBytes(blob.size)} e o limite é 5 MB. Substitua essa imagem no ZIP por uma versão menor e importe novamente. Nenhuma questão foi importada.`);
    }
    return type;
  }

  async function sha256(blob) {
    const bytes = await blob.arrayBuffer();
    if (crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function safeSegment(value, fallback) {
    const clean = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return clean || fallback;
  }

  async function uploadBlob(blob, originalName, collectionId) {
    if (!storageReady()) throw new Error("Entre na sua conta antes de importar imagens.");
    const type = validateImage(blob, originalName);
    const hash = await sha256(blob);
    const path = `${currentUser.id}/${safeSegment(collectionId, "colecao")}/${hash}.${extensionFor(type)}`;
    const { error } = await supabaseClient.storage.from(BUCKET).upload(path, blob, {
      contentType: type,
      cacheControl: "3600",
      upsert: false
    });
    if (error && !/already exists|duplicate|resource exists/i.test(error.message || "")) {
      throw new Error(`Não foi possível enviar a imagem “${originalName}”: ${error.message || "erro no Storage"}. Nenhuma questão foi importada.`);
    }
    return path;
  }

  function zipEntry(zip, imageName) {
    const clean = String(imageName || "").replace(/^\.\//, "").replace(/\\/g, "/");
    if (!clean) return null;
    return zip.file(clean)
      || zip.file(clean.split("/").pop())
      || zip.file(new RegExp(`${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"))[0]
      || null;
  }

  function dataUrlToBlob(dataUrl) {
    const match = String(dataUrl || "").match(/^data:([^;,]+);base64,(.+)$/);
    if (!match) return null;
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: match[1] });
  }

  async function parseZipToStorage(file) {
    if (!window.JSZip) throw new Error("Biblioteca ZIP não carregada.");
    if (!storageReady()) throw new Error("Entre na sua conta antes de importar um ZIP com imagens.");

    const zip = await window.JSZip.loadAsync(file);
    const jsonEntry = Object.values(zip.files).find(entry => !entry.dir && entry.name.toLowerCase().endsWith(".json"));
    if (!jsonEntry) throw new Error("ZIP sem arquivo JSON.");

    const cards = parseJsonCards(await jsonEntry.async("text"));
    const collectionId = el.importCollection?.value || data.selected || "colecao";
    const prepared = [];

    for (const card of cards) {
      if (!card.image || String(card.image).startsWith(PREFIX) || /^https?:/i.test(String(card.image))) continue;
      let blob;
      let originalName;
      if (String(card.image).startsWith("data:")) {
        blob = dataUrlToBlob(card.image);
        originalName = `imagem-${prepared.length + 1}.${extensionFor(blob?.type || "image/png")}`;
      } else {
        const entry = zipEntry(zip, card.image);
        if (!entry) throw new Error(`Imagem não encontrada no ZIP: “${card.image}”. Corrija o arquivo e tente novamente. Nenhuma questão foi importada.`);
        originalName = entry.name.split("/").pop();
        blob = await entry.async("blob");
        if (!blob.type) blob = new Blob([await blob.arrayBuffer()], { type: mimeFromName(originalName) });
      }
      if (!blob) throw new Error(`Não foi possível ler a imagem “${originalName}”. Nenhuma questão foi importada.`);
      validateImage(blob, originalName);
      prepared.push({ card, blob, originalName });
    }

    const uploaded = [];
    try {
      for (let index = 0; index < prepared.length; index += 1) {
        const item = prepared[index];
        const button = document.querySelector("#bulkImport");
        if (button) button.textContent = `Enviando imagem ${index + 1} de ${prepared.length}...`;
        const path = await uploadBlob(item.blob, item.originalName, collectionId);
        item.card.image = `${PREFIX}${path}`;
        item.card.imageStoragePath = path;
        uploaded.push(path);
      }
    } catch (error) {
      if (uploaded.length) await supabaseClient.storage.from(BUCKET).remove(uploaded).catch(() => {});
      throw error;
    }

    return cards;
  }

  const originalParseImportFile = typeof parseImportFile === "function" ? parseImportFile : null;
  window.parseImportFile = async function storageParseImportFile(file) {
    if (file?.name?.toLowerCase().endsWith(".zip")) return parseZipToStorage(file);
    return originalParseImportFile ? originalParseImportFile(file) : [];
  };

  function queueSignedImage(img, path) {
    const cached = signedCache.get(path);
    if (cached && cached.expires > Date.now()) {
      img.src = cached.url;
      return;
    }
    if (!pendingImages.has(path)) pendingImages.set(path, new Set());
    pendingImages.get(path).add(img);
    clearTimeout(signedTimer);
    signedTimer = setTimeout(flushSignedImages, 40);
  }

  async function flushSignedImages() {
    if (!storageReady() || !pendingImages.size) return;
    const paths = [...pendingImages.keys()];
    const targets = new Map(pendingImages);
    pendingImages.clear();
    try {
      const { data: rows, error } = await supabaseClient.storage.from(BUCKET).createSignedUrls(paths, 3600);
      if (error) throw error;
      (rows || []).forEach((row, index) => {
        const path = row.path || paths[index];
        if (!row.signedUrl) return;
        signedCache.set(path, { url: row.signedUrl, expires: Date.now() + 50 * 60 * 1000 });
        (targets.get(path) || []).forEach(img => { if (img.isConnected) img.src = row.signedUrl; });
      });
    } catch (error) {
      console.error("[Fixa Storage] Falha ao assinar imagens:", error);
      targets.forEach(images => images.forEach(img => {
        img.alt = "Não foi possível carregar a imagem da questão";
        img.classList.add("storage-image-error");
      }));
    }
  }

  function resolveStorageImages(root = document) {
    root.querySelectorAll?.("img").forEach(img => {
      const source = img.getAttribute("src") || "";
      if (source.startsWith(PREFIX)) queueSignedImage(img, source.slice(PREFIX.length));
    });
  }

  async function migrateEmbeddedImages() {
    if (migrationRunning || !storageReady() || typeof data === "undefined") return;
    const pending = [];
    (data.subjects || []).forEach(subject => (subject.cards || []).forEach(card => {
      if (String(card.image || "").startsWith("data:image/")) pending.push({ subject, card });
    }));
    if (!pending.length) return;

    migrationRunning = true;
    let changed = 0;
    try {
      for (let index = 0; index < pending.length; index += 1) {
        const { subject, card } = pending[index];
        const blob = dataUrlToBlob(card.image);
        if (!blob || blob.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(blob.type)) continue;
        try {
          const path = await uploadBlob(blob, `imagem-existente-${index + 1}.${extensionFor(blob.type)}`, subject.id);
          card.image = `${PREFIX}${path}`;
          card.imageStoragePath = path;
          changed += 1;
        } catch (error) {
          console.error("[Fixa Storage] Imagem antiga mantida no banco:", error);
        }
      }
      if (changed && typeof save === "function") {
        save();
        if (typeof render === "function") render();
        console.info(`[Fixa Storage] ${changed} imagem(ns) migrada(s) para o Storage.`);
      }
    } finally {
      migrationRunning = false;
    }
  }

  async function exportWithStorage(event) {
    const button = event.target.closest?.("#exportCollection");
    if (!button || typeof currentSubject !== "function") return;
    const subject = currentSubject();
    if (!subject?.cards?.some(card => String(card.image || "").startsWith(PREFIX))) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      button.disabled = true;
      button.textContent = "Preparando ZIP...";
      const zip = new window.JSZip();
      const imagesFolder = zip.folder("imagens");
      const exportedCards = [];
      const fileByPath = new Map();
      let imageIndex = 1;
      for (const card of subject.cards) {
        let imagePath = card.image || "";
        if (String(imagePath).startsWith(PREFIX)) {
          const path = imagePath.slice(PREFIX.length);
          if (!fileByPath.has(path)) {
            const { data: blob, error } = await supabaseClient.storage.from(BUCKET).download(path);
            if (error || !blob) throw new Error(`Não foi possível baixar uma imagem da coleção: ${error?.message || "arquivo indisponível"}`);
            const extension = extensionFor(blob.type || mimeFromName(path));
            const name = `imagem_${String(imageIndex).padStart(3, "0")}.${extension}`;
            imagesFolder.file(name, blob);
            fileByPath.set(path, `imagens/${name}`);
            imageIndex += 1;
          }
          imagePath = fileByPath.get(path);
        }
        exportedCards.push(exportCardToJson(card, imagePath));
      }
      zip.file("flashcards.json", JSON.stringify(exportedCards, null, 2));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugFileName(subject.name)}_flashcards.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Fixa Storage] Falha ao exportar:", error);
      if (typeof setMessage === "function") setMessage(el.importMessage, error.message || "Não foi possível exportar a coleção.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Exportar coleção";
    }
  }

  function init() {
    resolveStorageImages();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.matches?.("img")) resolveStorageImages(node.parentElement || document);
      else resolveStorageImages(node);
    }))).observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", exportWithStorage, true);
    document.addEventListener("click", event => {
      if (event.target.closest?.("#saveQuestion")) setTimeout(migrateEmbeddedImages, 500);
    });

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (storageReady()) {
        clearInterval(timer);
        migrateEmbeddedImages();
        resolveStorageImages();
      } else if (attempts >= 60) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
