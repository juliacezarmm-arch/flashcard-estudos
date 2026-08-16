(() => {
  'use strict';

  if (window.FixaStorageLazyLoader) return;

  const BUCKET = 'questoes-imagens';
  const PREFIX = 'storage://';
  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const MAX_EXPLANATION_IMAGE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXPLANATION_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const signedUrlCache = new Map();
  const observedImages = new WeakSet();
  let explanationEditorItems = [];

  const style = document.createElement('style');
  style.id = 'storageImageLazyLoadStyle';
  style.textContent = `
    img.storage-image-lazy {
      background: #f8fafc;
      opacity: .72;
      transition: opacity 160ms ease;
    }

    img.storage-image-lazy.is-loading {
      background:
        linear-gradient(90deg, #f8fafc 0%, #eef2f7 45%, #f8fafc 100%);
      background-size: 220% 100%;
      animation: fixa-storage-image-loading 1.15s linear infinite;
    }

    img.storage-image-lazy.is-loaded {
      opacity: 1;
      background: transparent;
      animation: none;
    }

    img.storage-image-lazy.is-error {
      opacity: 1;
      background: #fff1f2;
    }

    .fixa-explanation-images {
      width: 100%;
      margin-top: 12px;
      display: grid;
      gap: 10px;
      justify-items: center;
    }

    .fixa-explanation-image-row {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .fixa-explanation-image {
      display: block;
      width: auto;
      max-width: min(100%, 760px);
      height: auto;
      max-height: 70vh;
      margin: 0 auto;
      border-radius: 10px;
      object-fit: contain;
    }

    .fixa-answer-explanation-wrap {
      min-width: 0;
    }

    .fixa-explanation-images-label {
      width: 100%;
      display: block;
      justify-self: stretch;
      margin-bottom: -2px;
      text-align: left;
    }

    .fixa-explanation-editor {
      display: grid;
      gap: 9px;
      padding: 11px 12px;
      border: 1px solid #dde2ee;
      border-radius: 10px;
      background: #fafcff;
    }

    .fixa-explanation-editor-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }

    .fixa-explanation-editor-title {
      color: #172033;
      font-size: 13px;
      font-weight: 750;
    }

    .fixa-explanation-editor-add {
      min-height: 34px;
      border: 1px solid #cbd9ef;
      border-radius: 8px;
      padding: 7px 11px;
      color: #2563eb;
      background: #fff;
      font-size: 12px;
      font-weight: 750;
      box-shadow: none;
    }

    .fixa-explanation-editor-add:hover {
      border-color: #9dbaf0;
      color: #1d4ed8;
      background: #f7faff;
    }

    .fixa-explanation-editor-note {
      margin: 0;
      color: #687086;
      font-size: 11px;
      line-height: 1.4;
    }

    .fixa-explanation-editor-list {
      display: grid;
      gap: 8px;
    }

    .fixa-explanation-editor-item {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      padding: 8px;
      border: 1px solid #e4e9f2;
      border-radius: 9px;
      background: #fff;
    }

    .fixa-explanation-editor-preview {
      min-width: 0;
      min-height: 72px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .fixa-explanation-editor-preview img {
      display: block;
      width: auto;
      max-width: 100%;
      max-height: 150px;
      margin: 0 auto;
      border-radius: 8px;
      object-fit: contain;
    }

    .fixa-explanation-editor-remove {
      min-height: 32px;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 6px 9px;
      color: #b91c1c;
      background: #fff7f7;
      font-size: 11px;
      font-weight: 750;
      box-shadow: none;
    }

    .fixa-explanation-editor-remove:hover {
      color: #991b1b;
      background: #fff1f2;
    }

    @keyframes fixa-storage-image-loading {
      to { background-position: -220% 0; }
    }

    @media (max-width: 760px) {
      .fixa-explanation-image {
        max-width: 100%;
        max-height: 62vh;
      }

      .fixa-explanation-editor-item {
        grid-template-columns: 1fr;
      }

      .fixa-explanation-editor-remove {
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

  async function signedUrl(path) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expires > Date.now()) return cached.url;
    if (!storageReady()) return '';

    const { data: result, error } = await supabaseClient.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error || !result?.signedUrl) return '';

    signedUrlCache.set(path, {
      url: result.signedUrl,
      expires: Date.now() + 50 * 60 * 1000
    });
    return result.signedUrl;
  }

  async function load(img) {
    if (!img?.isConnected || img.dataset.storageLoaded === 'true') return;
    const path = img.dataset.storagePath || '';
    if (!path || img.dataset.storageLoading === 'true') return;

    img.dataset.storageLoading = 'true';
    img.classList.add('storage-image-lazy', 'is-loading');
    img.classList.remove('is-error');

    try {
      const url = await signedUrl(path);
      if (!url) throw new Error('URL indisponível');
      if (!img.isConnected) return;

      img.addEventListener('load', () => {
        img.classList.remove('is-loading');
        img.classList.add('is-loaded');
      }, { once: true });

      img.addEventListener('error', () => {
        img.classList.remove('is-loading');
        img.classList.add('is-error');
      }, { once: true });

      img.src = url;
      img.dataset.storageLoaded = 'true';
    } catch (error) {
      img.classList.remove('is-loading');
      img.classList.add('is-error');
      img.alt = img.alt || 'Não foi possível carregar a imagem da questão';
      console.error('[Fixa Storage] Falha no carregamento sob demanda:', error);
    } finally {
      delete img.dataset.storageLoading;
    }
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          load(entry.target);
        });
      }, {
        root: null,
        rootMargin: '320px 0px',
        threshold: 0.01
      })
    : null;

  function observe(img) {
    if (!(img instanceof HTMLImageElement)) return;

    const currentSource = img.getAttribute('src') || '';
    if (currentSource.startsWith(PREFIX)) {
      const path = currentSource.slice(PREFIX.length).trim();
      if (!path) return;
      img.dataset.storageSource = currentSource;
      img.dataset.storagePath = path;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.classList.add('storage-image-lazy');
      img.src = PLACEHOLDER;
    }

    if (!img.dataset.storagePath || img.dataset.storageLoaded === 'true') return;
    if (observedImages.has(img)) return;
    observedImages.add(img);

    if (observer) observer.observe(img);
    else load(img);
  }

  function scan(root = document) {
    if (root instanceof HTMLImageElement) observe(root);
    root.querySelectorAll?.('img').forEach(observe);
  }

  function refreshVisible() {
    document.querySelectorAll('img[data-storage-path]').forEach(img => {
      const rect = img.getBoundingClientRect();
      const nearViewport = rect.bottom >= -320 && rect.top <= window.innerHeight + 320;
      if (nearViewport) load(img);
    });
  }

  function escapeAttribute(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function normalizeExplanationImages(card) {
    const raw = Array.isArray(card?.explanationImages)
      ? card.explanationImages
      : (card?.explanationImage ? [card.explanationImage] : []);

    return raw
      .map(item => typeof item === 'string' ? item : item?.src)
      .map(item => String(item || '').trim())
      .filter(Boolean);
  }

  function explanationText(card) {
    if (card?.explanation) return String(card.explanation).trim();
    if (typeof explanationFromAnswer === 'function') {
      return String(explanationFromAnswer(card?.a) || '').trim();
    }
    return '';
  }

  function explanationImagesHtml(card) {
    const images = normalizeExplanationImages(card);
    if (!images.length) return '';

    const label = explanationText(card)
      ? ''
      : '<strong class="fixa-explanation-images-label">Explicação</strong>';

    return `<div class="fixa-explanation-images">${label}${images.map((source, index) => `
      <div class="fixa-explanation-image-row">
        <img class="fixa-explanation-image" src="${escapeAttribute(source)}" alt="Imagem da explicação ${index + 1}" loading="lazy" decoding="async">
      </div>
    `).join('')}</div>`;
  }

  function wrapAnswerWithExplanationImages(html, card) {
    const images = explanationImagesHtml(card);
    if (!images) return html;
    return `<div class="fixa-answer-explanation-wrap">${html}${images}</div>`;
  }

  function revokeEditorUrls() {
    explanationEditorItems.forEach(item => {
      if (item.kind === 'file' && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }

  function clearExplanationEditor() {
    revokeEditorUrls();
    explanationEditorItems = [];
    renderExplanationEditor();
  }

  function setExplanationEditorFromCard(card) {
    revokeEditorUrls();
    explanationEditorItems = normalizeExplanationImages(card).map(source => ({
      kind: 'stored',
      source
    }));
    renderExplanationEditor();
  }

  function validateExplanationFile(file) {
    if (!file || !ALLOWED_EXPLANATION_IMAGE_TYPES.has(file.type)) {
      throw new Error('Use imagens PNG, JPG ou WebP na explicação.');
    }
    if (file.size > MAX_EXPLANATION_IMAGE_SIZE) {
      throw new Error(`A imagem “${file.name}” ultrapassa o limite de 5 MB.`);
    }
  }

  function addExplanationFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;

    try {
      list.forEach(validateExplanationFile);
    } catch (error) {
      alert(error?.message || 'Não foi possível adicionar a imagem.');
      return;
    }

    list.forEach(file => {
      explanationEditorItems.push({
        kind: 'file',
        file,
        previewUrl: URL.createObjectURL(file)
      });
    });
    renderExplanationEditor();
  }

  function removeExplanationEditorItem(index) {
    const item = explanationEditorItems[index];
    if (item?.kind === 'file' && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    explanationEditorItems.splice(index, 1);
    renderExplanationEditor();
  }

  function renderExplanationEditor() {
    const root = document.querySelector('#fixaExplanationImagesEditor');
    if (!root) return;
    const list = root.querySelector('.fixa-explanation-editor-list');
    if (!list) return;

    list.innerHTML = '';
    explanationEditorItems.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'fixa-explanation-editor-item';

      const preview = document.createElement('div');
      preview.className = 'fixa-explanation-editor-preview';
      const image = document.createElement('img');
      image.alt = `Imagem da explicação ${index + 1}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = item.kind === 'file' ? item.previewUrl : item.source;
      preview.appendChild(image);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'fixa-explanation-editor-remove';
      remove.textContent = 'Remover';
      remove.addEventListener('click', () => removeExplanationEditorItem(index));

      row.append(preview, remove);
      list.appendChild(row);
      observe(image);
    });
  }

  function ensureExplanationEditor() {
    if (document.querySelector('#fixaExplanationImagesEditor')) return;
    const textarea = document.querySelector('#answerText');
    const label = textarea?.closest('label');
    if (!textarea || !label) return;

    const root = document.createElement('div');
    root.id = 'fixaExplanationImagesEditor';
    root.className = 'fixa-explanation-editor';
    root.innerHTML = `
      <div class="fixa-explanation-editor-head">
        <span class="fixa-explanation-editor-title">Imagens da explicação (opcional)</span>
        <button class="fixa-explanation-editor-add" type="button">Adicionar imagem</button>
      </div>
      <p class="fixa-explanation-editor-note">Você pode adicionar mais de uma imagem. Cada imagem será exibida em uma linha própria e centralizada.</p>
      <input class="fixa-explanation-editor-input" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden>
      <div class="fixa-explanation-editor-list"></div>
    `;
    label.insertAdjacentElement('afterend', root);

    const input = root.querySelector('.fixa-explanation-editor-input');
    root.querySelector('.fixa-explanation-editor-add')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', () => {
      addExplanationFiles(input.files);
      input.value = '';
    });

    renderExplanationEditor();
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

  async function fileHash(file) {
    if (!crypto?.subtle) return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return [...new Uint8Array(digest)]
      .map(value => value.toString(16).padStart(2, '0'))
      .join('');
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Não foi possível ler a imagem.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadExplanationFile(file, subject, card) {
    validateExplanationFile(file);
    if (!storageReady()) return fileToDataUrl(file);

    const hash = await fileHash(file);
    const collection = safeSegment(subject?.id || subject?.name, 'colecao');
    const question = safeSegment(card?.questionCode || card?.id || card?.q, 'questao');
    const path = `${currentUser.id}/${collection}/explanations/${question}/${hash}.${extensionFor(file.type)}`;
    const { error } = await supabaseClient.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });

    if (error && !/already exists|duplicate|resource exists/i.test(error.message || '')) {
      console.warn('[Fixa explicação] Storage indisponível; mantendo a imagem incorporada.', error);
      return fileToDataUrl(file);
    }

    return `${PREFIX}${path}`;
  }

  function sameStringList(left, right) {
    if (left.length !== right.length) return false;
    return left.every((value, index) => value === right[index]);
  }

  async function waitForSavedCard(snapshot) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (snapshot.editIndex !== null) {
        const card = snapshot.subject.cards?.[snapshot.editIndex];
        if (card && card !== snapshot.oldCard) return card;
      } else if ((snapshot.subject.cards?.length || 0) > snapshot.beforeLength) {
        return snapshot.subject.cards[snapshot.subject.cards.length - 1];
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    return null;
  }

  async function persistExplanationImagesAfterQuestionSave(snapshot) {
    const card = await waitForSavedCard(snapshot);
    if (!card) return;

    const sources = [];
    let usedFallback = false;
    for (const item of snapshot.items) {
      if (item.kind === 'stored') {
        sources.push(item.source);
        continue;
      }
      const source = await uploadExplanationFile(item.file, snapshot.subject, card);
      if (source.startsWith('data:image/')) usedFallback = true;
      sources.push(source);
    }

    card.explanationImages = sources;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
    if (typeof renderTest === 'function') renderTest();

    if (usedFallback) {
      const message = document.querySelector('#questionMessage');
      if (message) {
        message.textContent = 'Questão salva. Uma imagem da explicação ficou incorporada porque o Storage não estava disponível.';
      }
    }
  }

  function captureQuestionSave(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'questionForm') return;
    if (typeof currentSubject !== 'function') return;

    const subject = currentSubject();
    if (!subject || !Array.isArray(subject.cards)) return;

    const editIndex = typeof editingCardIndex !== 'undefined' && editingCardIndex !== null
      ? Number(editingCardIndex)
      : null;
    const oldCard = editIndex !== null ? subject.cards[editIndex] : null;
    const oldSources = normalizeExplanationImages(oldCard);
    const storedSources = explanationEditorItems
      .filter(item => item.kind === 'stored')
      .map(item => item.source);
    const hasNewFiles = explanationEditorItems.some(item => item.kind === 'file');

    if (!hasNewFiles && sameStringList(oldSources, storedSources)) return;

    const snapshot = {
      subject,
      editIndex,
      oldCard,
      beforeLength: subject.cards.length,
      items: explanationEditorItems.map(item => item.kind === 'stored'
        ? { kind: 'stored', source: item.source }
        : { kind: 'file', file: item.file })
    };

    setTimeout(() => {
      persistExplanationImagesAfterQuestionSave(snapshot).catch(error => {
        console.error('[Fixa explicação] Não foi possível salvar as imagens:', error);
        const message = document.querySelector('#questionMessage');
        if (message) message.textContent = error?.message || 'Não foi possível salvar as imagens da explicação.';
      });
    }, 0);
  }

  function installExplanationHooks() {
    ensureExplanationEditor();

    if (typeof normalizeCard === 'function' && !normalizeCard.__fixaExplanationImagesWrapped) {
      const original = normalizeCard;
      const wrapped = function(card) {
        const result = original.apply(this, arguments);
        const target = result || card;
        if (target && !Array.isArray(target.explanationImages)) {
          target.explanationImages = target.explanationImage ? [target.explanationImage] : [];
        }
        return result;
      };
      wrapped.__fixaExplanationImagesWrapped = true;
      normalizeCard = wrapped;
    }

    if (typeof fillQuestionFormForEdit === 'function' && !fillQuestionFormForEdit.__fixaExplanationImagesWrapped) {
      const original = fillQuestionFormForEdit;
      const wrapped = function(card) {
        const result = original.apply(this, arguments);
        ensureExplanationEditor();
        setExplanationEditorFromCard(card);
        return result;
      };
      wrapped.__fixaExplanationImagesWrapped = true;
      fillQuestionFormForEdit = wrapped;
    }

    if (typeof resetQuestionForm === 'function' && !resetQuestionForm.__fixaExplanationImagesWrapped) {
      const original = resetQuestionForm;
      const wrapped = function() {
        const result = original.apply(this, arguments);
        clearExplanationEditor();
        return result;
      };
      wrapped.__fixaExplanationImagesWrapped = true;
      resetQuestionForm = wrapped;
    }

    if (typeof renderStoredAnswer === 'function' && !renderStoredAnswer.__fixaExplanationImagesWrapped) {
      const original = renderStoredAnswer;
      const wrapped = function(card) {
        return wrapAnswerWithExplanationImages(original.apply(this, arguments), card);
      };
      wrapped.__fixaExplanationImagesWrapped = true;
      renderStoredAnswer = wrapped;
    }

    if (typeof renderTestAnswer === 'function' && !renderTestAnswer.__fixaExplanationImagesWrapped) {
      const original = renderTestAnswer;
      const wrapped = function(question) {
        return wrapAnswerWithExplanationImages(original.apply(this, arguments), question);
      };
      wrapped.__fixaExplanationImagesWrapped = true;
      renderTestAnswer = wrapped;
    }
  }

  function init() {
    scan();
    installExplanationHooks();

    document.addEventListener('submit', captureQuestionSave, true);

    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes' && record.target instanceof HTMLImageElement) {
          observe(record.target);
          return;
        }

        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) scan(node);
        });
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-view], [data-test-panel], .home-subtab, #questionList')) {
        setTimeout(refreshVisible, 0);
      }
    });

    window.addEventListener('resize', refreshVisible, { passive: true });
  }

  window.FixaStorageLazyLoader = {
    observe,
    scan,
    load,
    refreshVisible,
    clearCache: () => signedUrlCache.clear(),
    explanationImages: {
      normalize: normalizeExplanationImages,
      render: explanationImagesHtml,
      setEditorFromCard: setExplanationEditorFromCard,
      clearEditor: clearExplanationEditor
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();