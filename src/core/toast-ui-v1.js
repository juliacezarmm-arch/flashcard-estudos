(() => {
  'use strict';
  if (window.FixaToast) return;

  const ROOT_ID = 'fixaToastRoot';
  const STYLE_ID = 'fixaToastStyleV1';
  const timers = new Map();

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .fixa-toast-root{position:fixed;z-index:1800;top:66px;right:24px;width:min(360px,calc(100vw - 32px));display:grid;gap:10px;pointer-events:none}
      .fixa-toast{pointer-events:auto;border:1px solid #bfdbfe;border-radius:12px;background:#fff;color:#172033;box-shadow:0 18px 45px rgba(15,23,42,.18);padding:11px 13px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;font-size:12px;font-weight:750;line-height:1.35;opacity:0;transform:translateX(12px);transition:opacity .18s ease,transform .18s ease}
      .fixa-toast.is-visible{opacity:1;transform:translateX(0)}
      .fixa-toast.is-error{border-color:#fecaca;background:#fffafa;color:#991b1b}
      .fixa-toast.is-success{border-color:#bfdbfe}
      .fixa-toast-message{min-width:0}
      .fixa-toast-close{width:24px;height:24px;border:0;border-radius:7px;background:transparent;color:#64748b;display:grid;place-items:center;padding:0;font-size:18px;line-height:1;cursor:pointer}
      .fixa-toast-close:hover,.fixa-toast-close:focus-visible{background:#f1f5f9;color:#172033}
      @media(max-width:760px){.fixa-toast-root{top:72px;right:12px;left:12px;width:auto}.fixa-toast{font-size:12px}}
    `;
    document.head.appendChild(style);
  }

  function root() {
    ensureStyle();
    let node = document.getElementById(ROOT_ID);
    if (node) return node;
    node = document.createElement('div');
    node.id = ROOT_ID;
    node.className = 'fixa-toast-root';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'false');
    document.body.appendChild(node);
    return node;
  }

  function close(node) {
    if (!node) return;
    const id = node.dataset.toastId || '';
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
    node.classList.remove('is-visible');
    window.setTimeout(() => node.remove(), 180);
  }

  function show(message, options = {}) {
    const text = String(message || '').trim();
    if (!text) return null;
    const type = options.type === 'error' ? 'error' : options.type === 'success' ? 'success' : 'info';
    const id = String(options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const host = root();
    const safeId = window.CSS?.escape ? CSS.escape(id) : id.replace(/["\\]/g, '\\$&');
    let node = host.querySelector(`[data-toast-id="${safeId}"]`);
    if (!node) {
      node = document.createElement('div');
      node.dataset.toastId = id;
      node.setAttribute('role', type === 'error' ? 'alert' : 'status');
      host.appendChild(node);
    }
    node.className = `fixa-toast is-${type}`;
    node.innerHTML = `<div class="fixa-toast-message"></div><button type="button" class="fixa-toast-close" aria-label="Fechar">×</button>`;
    node.querySelector('.fixa-toast-message').textContent = text;
    node.querySelector('.fixa-toast-close')?.addEventListener('click', () => close(node), { once: true });
    requestAnimationFrame(() => node.classList.add('is-visible'));

    if (timers.has(id)) clearTimeout(timers.get(id));
    timers.set(id, window.setTimeout(() => close(node), Number(options.duration || 3000)));
    return node;
  }

  window.FixaToast = { show, close };
})();
