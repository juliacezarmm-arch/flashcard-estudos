(() => {
  if (document.querySelector('#mobileHomeReferenceStyle')) return;

  const style = document.createElement('style');
  style.id = 'mobileHomeReferenceStyle';
  style.textContent = `
    @media (max-width: 860px),
           (max-device-width: 860px),
           (hover: none) and (pointer: coarse) and (orientation: portrait) {
      html,
      body {
        background: #f8fafc !important;
      }

      body.home-active main {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        padding: 0 10px 22px !important;
        background: #f8fafc !important;
        overflow-x: hidden !important;
      }

      .topbar {
        position: sticky !important;
        top: 0 !important;
        z-index: 55 !important;
        gap: 8px !important;
        margin: 0 -10px !important;
        padding: 8px 10px 10px !important;
        background: rgba(255, 255, 255, 0.98) !important;
        border-bottom: 1px solid #e7ecf3 !important;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05) !important;
        backdrop-filter: blur(12px);
      }

      .mobile-topline {
        min-height: 44px !important;
        padding: 0 !important;
      }

      .mobile-topline-left {
        gap: 10px !important;
      }

      .mobile-menu-toggle {
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        min-height: 42px !important;
        border-radius: 9px !important;
        border-color: #dfe5ee !important;
        box-shadow: 0 2px 7px rgba(15, 23, 42, 0.05) !important;
      }

      .mobile-menu-toggle svg {
        width: 20px !important;
        height: 20px !important;
      }

      .mobile-brand {
        gap: 9px !important;
      }

      .mobile-brand-mark {
        width: 38px !important;
        height: 38px !important;
        flex-basis: 38px !important;
        border-radius: 9px !important;
        font-size: 23px !important;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.18) !important;
      }

      .mobile-brand-name {
        font-size: 21px !important;
        font-weight: 800 !important;
      }

      .topbar-right {
        width: 100% !important;
        display: block !important;
      }

      body.home-active .topbar-right > .auth-panel {
        display: none !important;
      }

      body:not(.home-active) #homeTopTools {
        display: none !important;
      }

      body.home-active #homeTopTools {
        position: absolute !important;
        top: 13px !important;
        right: 10px !important;
        z-index: 3 !important;
        display: inline-flex !important;
        width: auto !important;
        margin: 0 !important;
      }

      body.home-active .home-top-bell {
        display: none !important;
      }

      body.home-active .home-top-streak {
        min-height: 32px !important;
        padding: 5px 8px !important;
        border: 0 !important;
        border-radius: 9px !important;
        color: #d97706 !important;
        background: transparent !important;
        box-shadow: none !important;
        font-size: 12px !important;
      }

      body.home-active .home-top-streak .fire img {
        width: 17px !important;
        height: 17px !important;
      }

      body.home-active .home-top-streak small {
        font-size: 10px !important;
        font-weight: 700 !important;
      }

      .topbar-right .tabs {
        width: 100% !important;
        max-width: none !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 6px !important;
        padding: 0 !important;
        overflow: visible !important;
        transform: none !important;
      }

      .topbar-right .tabs .tab {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 42px !important;
        padding: 8px 4px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        border: 1px solid #dfe5ee !important;
        border-radius: 9px !important;
        color: #334155 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        font-size: clamp(10px, 2.6vw, 13px) !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      .topbar-right .tabs .tab:hover {
        color: #2563eb !important;
        border-color: #bfd2ff !important;
        background: #f4f7ff !important;
      }

      .topbar-right .tabs .tab.active,
      .topbar-right .tabs .tab.active:hover {
        color: #ffffff !important;
        border-color: #2563eb !important;
        background: #2563eb !important;
        box-shadow: 0 6px 14px rgba(37, 99, 235, 0.16) !important;
      }

      .topbar-right .tabs .tab svg {
        width: 15px !important;
        height: 15px !important;
        flex: 0 0 15px !important;
      }

      .home-view,
      .home-view.active {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .home-view > .home-shell {
        gap: 12px !important;
      }

      .home-subtabs {
        width: calc(100% + 20px) !important;
        min-height: 45px !important;
        margin: 0 -10px 2px !important;
        padding: 0 10px !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 0 !important;
        border: 0 !important;
        border-bottom: 1px solid #e7ecf3 !important;
        border-radius: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .home-subtab {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 44px !important;
        padding: 0 3px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        border: 0 !important;
        border-bottom: 2px solid transparent !important;
        border-radius: 0 !important;
        color: #64748b !important;
        background: transparent !important;
        box-shadow: none !important;
        font-size: clamp(10px, 2.6vw, 13px) !important;
        font-weight: 650 !important;
        white-space: nowrap !important;
      }

      .home-subtab:hover {
        color: #2563eb !important;
        background: transparent !important;
      }

      .home-subtab.active,
      .home-subtab.active:hover {
        color: #2563eb !important;
        border-bottom-color: #2563eb !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .home-subtab-reference-icon {
        width: 16px !important;
        height: 16px !important;
        flex: 0 0 16px !important;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .home-hero-head {
        width: 100% !important;
        margin: 0 !important;
        padding: 7px 4px 0 !important;
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .home-title h2 {
        margin: 0 !important;
        font-size: clamp(20px, 5vw, 27px) !important;
        line-height: 1.2 !important;
        letter-spacing: -0.02em !important;
      }

      .home-greeting-wave {
        width: clamp(20px, 4.8vw, 25px) !important;
        height: clamp(20px, 4.8vw, 25px) !important;
      }

      .home-hero-actions,
      .home-date-pill {
        display: none !important;
      }

      section[data-home-panel="today"] > .home-shell {
        gap: 12px !important;
      }

      .home-summary-grid {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 7px !important;
      }

      .home-card {
        min-width: 0 !important;
        min-height: clamp(92px, 18vw, 126px) !important;
        padding: clamp(7px, 1.8vw, 12px) !important;
        display: grid !important;
        grid-template-columns: clamp(24px, 5vw, 40px) minmax(0, 1fr) !important;
        align-items: center !important;
        gap: clamp(5px, 1.2vw, 9px) !important;
        border-radius: 11px !important;
        box-shadow: none !important;
      }

      .home-card-art {
        width: clamp(24px, 5vw, 40px) !important;
        height: clamp(24px, 5vw, 40px) !important;
        flex-basis: auto !important;
        margin: 0 !important;
        object-fit: contain !important;
      }

      .home-card > span {
        min-width: 0 !important;
      }

      .home-card strong {
        margin: 0 0 3px !important;
        color: #526079 !important;
        font-size: clamp(8px, 2.05vw, 12px) !important;
        line-height: 1.15 !important;
        font-weight: 650 !important;
        overflow-wrap: anywhere !important;
      }

      .home-card-number {
        display: block !important;
        color: #172033 !important;
        font-size: clamp(18px, 4.4vw, 27px) !important;
        line-height: 1.05 !important;
        font-weight: 750 !important;
      }

      .home-card small {
        margin-top: 6px !important;
        color: #7b879b !important;
        font-size: clamp(7px, 1.75vw, 10px) !important;
        line-height: 1.25 !important;
      }

      .home-today-grid {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      .home-panel {
        padding: 13px !important;
        border-color: #e3e8f0 !important;
        border-radius: 12px !important;
        box-shadow: none !important;
      }

      .home-panel h3 {
        font-size: clamp(14px, 3.3vw, 17px) !important;
        line-height: 1.25 !important;
      }

      .home-muted {
        font-size: clamp(9px, 2.35vw, 12px) !important;
        line-height: 1.4 !important;
      }

      .home-kicker {
        margin-bottom: 4px !important;
        font-size: clamp(9px, 2.2vw, 11px) !important;
      }

      .home-study-head {
        min-height: 0 !important;
        margin-bottom: 10px !important;
      }

      .home-study-art {
        display: none !important;
      }

      .home-study-card .home-focus-box {
        border: 1px solid #e4e9f1 !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        background: #ffffff !important;
      }

      .home-study-card .home-recommendation-list {
        gap: 0 !important;
        margin: 0 !important;
      }

      .home-study-card .home-recommendation {
        min-height: 54px !important;
        padding: 9px 11px !important;
        grid-template-columns: minmax(0, 1fr) 14px !important;
        gap: 8px !important;
        border: 0 !important;
        border-bottom: 1px solid #edf1f5 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transform: none !important;
      }

      .home-study-card .home-recommendation:last-child {
        border-bottom: 0 !important;
      }

      .home-study-card .home-recommendation-meta {
        display: none !important;
      }

      .home-study-card .home-recommendation strong {
        font-size: clamp(11px, 2.8vw, 14px) !important;
      }

      .home-study-card .home-recommendation small {
        font-size: clamp(8px, 2.05vw, 11px) !important;
      }

      .home-collection-scroll {
        max-height: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .home-collection-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      .home-collection-card {
        min-width: 0 !important;
        min-height: 116px !important;
        padding: 10px !important;
        border-radius: 10px !important;
        box-shadow: none !important;
      }

      .home-collection-head {
        margin-bottom: 9px !important;
      }

      .home-collection-name {
        gap: 6px !important;
        font-size: clamp(9px, 2.35vw, 12px) !important;
      }

      .home-collection-name span:last-child {
        white-space: nowrap !important;
      }

      .home-folder-icon .home-svg {
        width: 15px !important;
        height: 15px !important;
      }

      .home-collection-total {
        font-size: clamp(7px, 1.8vw, 10px) !important;
      }

      .home-collection-metrics {
        gap: 4px !important;
        margin-bottom: 8px !important;
      }

      .home-collection-metrics b {
        font-size: clamp(11px, 2.7vw, 14px) !important;
      }

      .home-collection-metrics small,
      .home-collection-foot {
        font-size: clamp(7px, 1.75vw, 10px) !important;
      }

      .home-collection-metrics small {
        white-space: normal !important;
        line-height: 1.2 !important;
      }

      .home-priority-panel {
        min-height: 0 !important;
        overflow: visible !important;
      }

      .home-priority-panel .home-panel-head {
        align-items: center !important;
        gap: 8px !important;
        margin-bottom: 10px !important;
      }

      .home-priority-art {
        display: none !important;
      }

      .home-priority-scroll {
        padding: 0 !important;
        overflow: visible !important;
      }

      .home-priority-list {
        min-width: 0 !important;
        width: 100% !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 7px !important;
      }

      .home-priority-item {
        min-width: 0 !important;
        width: auto !important;
        padding: 9px !important;
        border-radius: 9px !important;
        box-shadow: none !important;
      }

      .home-priority-head {
        gap: 4px !important;
        margin-bottom: 6px !important;
        font-size: clamp(8px, 2.05vw, 11px) !important;
      }

      .home-priority-head strong {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .home-priority-head span {
        font-size: clamp(7px, 1.75vw, 9px) !important;
      }

      .home-priority-sub {
        gap: 4px !important;
        margin: 5px 0 6px !important;
        font-size: clamp(7px, 1.75vw, 9px) !important;
      }

      .home-priority-item .home-progress {
        height: 5px !important;
      }

      .home-priority-head-icon {
        width: 27px !important;
        height: 27px !important;
        flex-basis: 27px !important;
      }

      .home-streak-popover {
        left: auto !important;
        right: 0 !important;
        width: min(286px, calc(100vw - 20px)) !important;
      }
    }

    @media (max-width: 390px) {
      .topbar-right .tabs .tab {
        font-size: 9.5px !important;
        gap: 3px !important;
      }

      .topbar-right .tabs .tab svg {
        width: 13px !important;
        height: 13px !important;
        flex-basis: 13px !important;
      }

      .home-card {
        grid-template-columns: 22px minmax(0, 1fr) !important;
      }

      .home-card-art {
        width: 22px !important;
        height: 22px !important;
      }
    }
  `;
  document.head.appendChild(style);

  const tabIcons = {
    today: '<path d="M4 5h16v15H4z"></path><path d="M8 3v4M16 3v4M4 9h16"></path>',
    progress: '<path d="M5 19V11h3v8zM10.5 19V6h3v13zM16 19V3h3v16z"></path>',
    activity: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path>',
    analysis: '<path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-7"></path>'
  };

  const tabLabels = {
    today: 'Hoje',
    progress: 'Progresso',
    activity: 'Atividade',
    analysis: 'Análise'
  };

  function prepareHomeNavigation() {
    const homeView = document.querySelector('.home-view');
    const shell = homeView?.querySelector(':scope > .home-shell');
    const tabs = shell?.querySelector(':scope > .home-subtabs');
    const header = shell?.querySelector(':scope > .home-hero-head');

    if (shell && tabs && header && tabs.nextElementSibling !== header) {
      shell.insertBefore(tabs, header);
    }

    tabs?.querySelectorAll('[data-home-tab]').forEach(button => {
      const key = button.dataset.homeTab;
      const icon = tabIcons[key];
      const label = tabLabels[key];
      if (!icon || !label) return;
      button.innerHTML = `<svg class="home-subtab-reference-icon" viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label}</span>`;
    });
  }

  prepareHomeNavigation();

  const observer = new MutationObserver(prepareHomeNavigation);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();