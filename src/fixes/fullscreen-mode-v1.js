(() => {
  'use strict';

  if (window.FixaFullscreenModeV1?.active) return;
  window.FixaFullscreenModeV1 = { active: true };

  const STYLE_ID = 'fixaFullscreenModeV1Style';
  const BUTTON_ID = 'fixaFullscreenButton';

  function icon(isActive) {
    return isActive
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v5H3"></path><path d="M16 3v5h5"></path><path d="M8 21v-5H3"></path><path d="M16 21v-5h5"></path></g></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></g></svg>';
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #appShell .fixa-fullscreen-button{
        order:2!important;
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        padding:0!important;
        border:1px solid #dbe7fb!important;
        border-radius:10px!important;
        background:#fff!important;
        color:#2563eb!important;
        box-shadow:0 1px 3px rgba(15,23,42,.04)!important;
        display:inline-grid!important;
        place-items:center!important;
        cursor:pointer!important;
        flex:0 0 auto!important;
      }
      #appShell .fixa-fullscreen-button svg{
        width:17px!important;
        height:17px!important;
      }
      #appShell .fixa-fullscreen-button:hover,
      #appShell .fixa-fullscreen-button:focus-visible{
        background:#eef4ff!important;
        border-color:#bcd3ff!important;
        outline:none!important;
      }
      body.fixa-fullscreen-active #appShell.app:not(.locked)>main{
        min-height:100dvh!important;
      }
      @media(max-width:760px){
        #appShell .fixa-fullscreen-button{
          width:36px!important;
          height:36px!important;
          min-width:36px!important;
          min-height:36px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  async function enterFullscreen() {
    const target = document.documentElement;
    if (target.requestFullscreen) return target.requestFullscreen();
    if (target.webkitRequestFullscreen) return target.webkitRequestFullscreen();
    throw new Error('fullscreen-unavailable');
  }

  async function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }

  function updateButton() {
    const button = document.getElementById(BUTTON_ID);
    const active = Boolean(fullscreenElement());
    document.body.classList.toggle('fixa-fullscreen-active', active);
    if (!button) return;
    button.innerHTML = icon(active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
    button.title = active ? 'Sair da tela cheia' : 'Tela cheia';
  }

  async function toggleFullscreen() {
    try {
      if (fullscreenElement()) await exitFullscreen();
      else await enterFullscreen();
      updateButton();
    } catch (_) {
      if (window.FixaToast?.show) {
        window.FixaToast.show('Não foi possível ativar a tela cheia neste navegador.', { type: 'warning', id: 'fullscreen-unavailable' });
      }
    }
  }

  function ensureButton() {
    ensureStyle();
    const topbar = document.querySelector('#appShell .topbar-right');
    const auth = topbar?.querySelector(':scope > .auth-panel');
    if (!topbar || !auth) return false;
    let button = document.getElementById(BUTTON_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = BUTTON_ID;
      button.className = 'fixa-fullscreen-button';
      button.type = 'button';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        toggleFullscreen();
      });
    }
    const tools = topbar.querySelector(':scope > #homeTopTools');
    const anchor = tools?.nextElementSibling === auth ? auth : auth;
    if (button.parentElement !== topbar || button.nextElementSibling !== anchor) {
      topbar.insertBefore(button, anchor);
    }
    updateButton();
    return true;
  }

  document.addEventListener('fullscreenchange', updateButton);
  document.addEventListener('webkitfullscreenchange', updateButton);
  window.addEventListener('resize', updateButton);
  window.addEventListener('load', ensureButton, { once: true });
  document.addEventListener('click', () => requestAnimationFrame(ensureButton), true);

  const observer = new MutationObserver(() => ensureButton());
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  ensureButton();
})();
