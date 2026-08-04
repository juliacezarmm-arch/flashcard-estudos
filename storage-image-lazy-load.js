(() => {
  'use strict';

  if (window.FixaStorageLazyLoader) return;

  const BUCKET = 'questoes-imagens';
  const PREFIX = 'storage://';
  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const signedUrlCache = new Map();
  const observedImages = new WeakSet();

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

    @keyframes fixa-storage-image-loading {
      to { background-position: -220% 0; }
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

  function init() {
    scan();

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
    clearCache: () => signedUrlCache.clear()
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();