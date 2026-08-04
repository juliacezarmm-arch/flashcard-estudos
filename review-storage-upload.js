(() => {
  'use strict';

  if (document.querySelector('#reviewStorageUploadStyle')) return;

  const STORE_KEY = 'flashcard-estudos-v2';
  const BUCKET = 'questoes-imagens';
  const PREFIX = 'storage://';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const signedUrlCache = new Map();
  let uploadingAll = false;

  const style = document.createElement('style');
  style.id = 'reviewStorageUploadStyle';
  style.textContent = `
    .question-review-upload-actions {
      min-width: 154px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .question-review-upload-button,
    #sendAllReviewImages {
      min-height: 34px;
      border: 0;
      border-radius: 8px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #ffffff;
      background: #2563eb;
      font-size: 11px;
      font-weight: 750;
      line-height: 1;
      white-space: nowrap;
      box-shadow: none;
    }

    .question-review-upload-button:hover:not(:disabled),
    #sendAllReviewImages:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .question-review-upload-button:disabled,
    #sendAllReviewImages:disabled {
      cursor: wait;
      opacity: .66;
    }

    .question-review-upload-button.is-success {
      color: #166534;
      background: #dcfce7;
    }

    .question-review-upload-button.is-error {
      color: #b91c1c;
      background: #fee2e2;
    }

    #sendAllReviewImages {
      min-height: 36px;
      font-size: 12px;
    }

    .review-storage-upload-status {
      flex-basis: 100%;
      min-height: 18px;
      margin: 0;
      color: #64748b;
      font-size: 11px;
      line-height: 1.45;
    }

    .review-storage-upload-status.is-error {
      color: #b91c1c;
    }

    .review-storage-upload-status.is-success {
      color: #15803d;
    }

    @media (max-width: 760px) {
      .question-review-upload-actions {
        min-width: 0;
        align-items: flex-start;
      }

      .question-review-upload-button {
        width: 100%;
      }

      #sendAllReviewImages {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  function storageReady() {
    return typeof supabaseClient !== 'undefined'
      && Boolean(supabaseClient)
      && typeof currentUser !== 'undefined'
      && Boolean(currentUser?.id);
  }

  function readStoredData() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function imageIssue(imageValue) {
    const image = String(imageValue || '').trim();
    if (!image) return null;
    if (image.startsWith('data:image/')) return 'embedded';
    if (image.startsWith(PREFIX)) return image.slice(PREFIX.length).trim() ? null : 'invalid';
    if (/^(https?:|blob:)/i.test(image)) return null;
    return 'file';
  }

  function collectPendingItems() {
    const stored = readStoredData();
    const subjects = Array.isArray(stored?.subjects) ? stored.subjects : [];
    const pending = [];

    subjects.forEach((subject, subjectIndex) => {
      const cards = Array.isArray(subject?.cards) ? subject.cards : [];
      cards.forEach((card, cardIndex) => {
        const issue = imageIssue(card?.image);
        if (!issue) return;
        pending.push({
          subjectIndex,
          cardIndex,
          subjectId: subject?.id || '',
          subjectName: subject?.name || 'Coleção',
          questionCode: card?.questionCode || '',
          image: String(card?.image || ''),
          issue
        });
      });
    });

    return pending;
  }

  function dataUrlToBlob(dataUrl) {
    const match = String(dataUrl || '').match(/^data:([^;,]+);base64,(.+)$/s);
    if (!match) return null;
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: match[1] });
  }

  function extensionFor(type) {
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'image/webp') return 'webp';
    return 'png';
  }

  function safeSegment(value, fallback) {
    const clean = String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return clean || fallback;
  }

  function validateBlob(blob, fileName = 'imagem') {
    if (!blob || !ALLOWED_TYPES.has(blob.type)) {
      throw new Error(`A imagem “${fileName}” precisa estar em PNG, JPG ou WebP.`);
    }
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`A imagem “${fileName}” ultrapassa o limite de 5 MB.`);
    }
  }

  async function sha256(blob) {
    const buffer = await blob.arrayBuffer();
    if (crypto?.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      return [...new Uint8Array(digest)]
        .map(value => value.toString(16).padStart(2, '0'))
        .join('');
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function liveCard(item) {
    if (typeof data === 'undefined' || !data?.subjects) return null;
    const byIndex = data.subjects?.[item.subjectIndex]?.cards?.[item.cardIndex];
    if (byIndex) return byIndex;

    const subject = data.subjects.find(entry =>
      (item.subjectId && entry.id === item.subjectId)
      || entry.name === item.subjectName
    );
    if (!subject) return null;
    return subject.cards?.find(card =>
      (item.questionCode && card.questionCode === item.questionCode)
      || card.image === item.image
    ) || null;
  }

  function storedCard(stored, item) {
    const byIndex = stored?.subjects?.[item.subjectIndex]?.cards?.[item.cardIndex];
    if (byIndex) return byIndex;

    const subject = stored?.subjects?.find(entry =>
      (item.subjectId && entry.id === item.subjectId)
      || entry.name === item.subjectName
    );
    if (!subject) return null;
    return subject.cards?.find(card =>
      (item.questionCode && card.questionCode === item.questionCode)
      || card.image === item.image
    ) || null;
  }

  function persistReference(item, path) {
    const reference = `${PREFIX}${path}`;
    const stored = readStoredData();
    const localCard = storedCard(stored, item);
    if (localCard) {
      localCard.image = reference;
      localCard.imageStoragePath = path;
      localStorage.setItem(STORE_KEY, JSON.stringify(stored));
    }

    const currentCard = liveCard(item);
    if (currentCard) {
      currentCard.image = reference;
      currentCard.imageStoragePath = path;
      if (typeof save === 'function') save();
    }

    window.dispatchEvent(new CustomEvent('fixa:storage-image-uploaded', {
      detail: { path, subjectId: item.subjectId, questionCode: item.questionCode }
    }));
  }

  async function uploadBlobForItem(item, blob, fileName) {
    if (!storageReady()) {
      throw new Error('Entre novamente na sua conta antes de enviar a imagem.');
    }

    validateBlob(blob, fileName);
    const hash = await sha256(blob);
    const collection = safeSegment(item.subjectId || item.subjectName, 'colecao');
    const path = `${currentUser.id}/${collection}/${hash}.${extensionFor(blob.type)}`;
    const { error } = await supabaseClient.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      cacheControl: '3600',
      upsert: false
    });

    if (error && !/already exists|duplicate|resource exists/i.test(error.message || '')) {
      throw new Error(error.message || 'Não foi possível enviar a imagem ao Storage.');
    }

    persistReference(item, path);
    return path;
  }

  async function uploadExistingImage(item) {
    const blob = dataUrlToBlob(item.image);
    if (!blob) throw new Error('A imagem incorporada não pôde ser lida.');
    return uploadBlobForItem(item, blob, `imagem-${item.questionCode || item.cardIndex + 1}.${extensionFor(blob.type)}`);
  }

  function chooseReplacementImage(item, button) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.hidden = true;
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return;
      await runButtonUpload(item, button, () => uploadBlobForItem(item, file, file.name));
    }, { once: true });

    input.click();
  }

  function setToolbarStatus(message, state = '') {
    let status = document.querySelector('#reviewStorageUploadStatus');
    const toolbar = document.querySelector('#reviewQuestionsSection .question-review-toolbar');
    if (!toolbar) return;

    if (!status) {
      status = document.createElement('p');
      status.id = 'reviewStorageUploadStatus';
      status.className = 'review-storage-upload-status';
      toolbar.appendChild(status);
    }

    status.className = `review-storage-upload-status${state ? ` is-${state}` : ''}`;
    status.textContent = message;
  }

  function refreshReviewList() {
    document.querySelector('#refreshReviewQuestions')?.click();
    requestAnimationFrame(enhanceReviewList);
  }

  async function runButtonUpload(item, button, operation) {
    const original = button.textContent;
    button.disabled = true;
    button.classList.remove('is-error', 'is-success');
    button.textContent = 'Enviando...';
    setToolbarStatus('Enviando a imagem ao Storage...');

    try {
      await operation();
      button.classList.add('is-success');
      button.textContent = 'Enviada ✓';
      setToolbarStatus('Imagem enviada ao Storage e questão atualizada.', 'success');
      setTimeout(refreshReviewList, 450);
    } catch (error) {
      console.error('[Fixa Storage] Falha no envio pela revisão:', error);
      button.classList.add('is-error');
      button.textContent = 'Tentar novamente';
      button.disabled = false;
      setToolbarStatus(error?.message || 'Não foi possível enviar a imagem.', 'error');
      return;
    }

    button.disabled = false;
    if (!button.isConnected) button.textContent = original;
  }

  function createItemButton(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'question-review-upload-button';
    button.dataset.subjectIndex = String(item.subjectIndex);
    button.dataset.cardIndex = String(item.cardIndex);

    if (item.issue === 'embedded') {
      button.textContent = 'Enviar ao Storage';
      button.addEventListener('click', () => runButtonUpload(item, button, () => uploadExistingImage(item)));
    } else {
      button.textContent = 'Escolher imagem';
      button.addEventListener('click', () => chooseReplacementImage(item, button));
    }

    if (!storageReady()) {
      button.title = 'Aguardando a conexão com a sua conta.';
    }

    return button;
  }

  function ensureSendAllButton(pending) {
    const toolbar = document.querySelector('#reviewQuestionsSection .question-review-toolbar');
    if (!toolbar) return;

    let button = toolbar.querySelector('#sendAllReviewImages');
    const embedded = pending.filter(item => item.issue === 'embedded');

    if (!embedded.length) {
      button?.remove();
      return;
    }

    if (!button) {
      button = document.createElement('button');
      button.id = 'sendAllReviewImages';
      button.type = 'button';
      const note = toolbar.querySelector('.question-review-note');
      toolbar.insertBefore(button, note || null);
      button.addEventListener('click', uploadAllEmbeddedImages);
    }

    button.textContent = `Enviar todas ao Storage (${embedded.length})`;
    button.disabled = uploadingAll;
  }

  async function uploadAllEmbeddedImages() {
    if (uploadingAll) return;
    if (!storageReady()) {
      setToolbarStatus('Entre novamente na sua conta antes de enviar as imagens.', 'error');
      return;
    }

    const items = collectPendingItems().filter(item => item.issue === 'embedded');
    if (!items.length) {
      refreshReviewList();
      return;
    }

    uploadingAll = true;
    enhanceReviewList();
    let completed = 0;

    try {
      for (const item of items) {
        setToolbarStatus(`Enviando imagem ${completed + 1} de ${items.length}...`);
        await uploadExistingImage(item);
        completed += 1;
      }
      setToolbarStatus(`${completed} ${completed === 1 ? 'imagem enviada' : 'imagens enviadas'} ao Storage.`, 'success');
      refreshReviewList();
    } catch (error) {
      console.error('[Fixa Storage] Falha no envio em lote:', error);
      setToolbarStatus(`${completed} enviadas. ${error?.message || 'O envio foi interrompido.'}`, 'error');
      refreshReviewList();
    } finally {
      uploadingAll = false;
      enhanceReviewList();
    }
  }

  function enhanceReviewList() {
    const list = document.querySelector('#reviewQuestionsList');
    if (!list || list.hidden) return;

    const pending = collectPendingItems();
    const rows = [...list.querySelectorAll('.question-review-item')];

    rows.forEach((row, index) => {
      if (row.querySelector('.question-review-upload-actions')) return;
      const item = pending[index];
      if (!item) return;

      const badge = row.querySelector('.question-review-badge');
      const actions = document.createElement('div');
      actions.className = 'question-review-upload-actions';
      if (badge) {
        badge.replaceWith(actions);
        actions.appendChild(badge);
      } else {
        row.appendChild(actions);
      }
      actions.appendChild(createItemButton(item));
    });

    ensureSendAllButton(pending);
  }

  async function signedUrl(path) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expires > Date.now()) return cached.url;
    if (!storageReady()) return '';

    const { data: result, error } = await supabaseClient.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (error || !result?.signedUrl) return '';
    signedUrlCache.set(path, {
      url: result.signedUrl,
      expires: Date.now() + 50 * 60 * 1000
    });
    return result.signedUrl;
  }

  function resolveStorageImage(img) {
    const source = img.getAttribute('src') || '';
    if (!source.startsWith(PREFIX) || img.dataset.storageResolving === source) return;
    const path = source.slice(PREFIX.length).trim();
    if (!path) return;

    img.dataset.storageResolving = source;
    signedUrl(path).then(url => {
      if (url && img.isConnected) img.src = url;
      delete img.dataset.storageResolving;
    });
  }

  function resolveStorageImages(root = document) {
    if (root.matches?.('img')) resolveStorageImage(root);
    root.querySelectorAll?.('img').forEach(resolveStorageImage);
  }

  function init() {
    const reviewList = document.querySelector('#reviewQuestionsList');
    if (reviewList) {
      new MutationObserver(() => requestAnimationFrame(enhanceReviewList)).observe(reviewList, {
        childList: true,
        subtree: true
      });
    }

    document.querySelector('#showReviewQuestions')?.addEventListener('click', () => {
      setTimeout(enhanceReviewList, 0);
    });
    document.querySelector('#refreshReviewQuestions')?.addEventListener('click', () => {
      setTimeout(enhanceReviewList, 0);
    });

    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes' && record.target.matches?.('img')) {
          resolveStorageImage(record.target);
          return;
        }
        record.addedNodes.forEach(node => {
          if (node.nodeType === 1) resolveStorageImages(node);
        });
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    resolveStorageImages();
    enhanceReviewList();

    let attempts = 0;
    const connectionTimer = setInterval(() => {
      attempts += 1;
      enhanceReviewList();
      resolveStorageImages();
      if (storageReady() || attempts >= 80) clearInterval(connectionTimer);
    }, 500);
  }

  window.FixaReviewStorageUpload = {
    refresh: enhanceReviewList,
    uploadAll: uploadAllEmbeddedImages,
    ready: storageReady
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();