/* Estilo do menu de coleções em sobreposição */
(() => {
  "use strict";
  if (document.querySelector("#fixaCollectionsOverlayStyles")) return;
  const style = document.createElement("style");
  style.id = "fixaCollectionsOverlayStyles";
  style.textContent = `
      :root {
        --collections-drawer-width: min(390px, calc(100vw - 24px));
      }

      body.collections-overlay-open {
        overflow: hidden !important;
      }

      #appShell.app:not(.locked) {
        grid-template-columns: minmax(0, 1fr) !important;
        max-width: none !important;
        width: 100% !important;
      }

      #appShell.app:not(.locked) > main {
        grid-column: 1 !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      #appShell .mobile-topline {
        display: flex !important;
      }

      #appShell .mobile-menu-toggle {
        display: grid !important;
      }

      @media (min-width: 861px) {
        #appShell .topbar {
          gap: 14px !important;
        }

        #appShell .mobile-topline {
          flex: 0 0 auto !important;
        }

        #appShell .topbar-right {
          width: auto !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
        }
      }

      #collectionsSidebar {
        position: fixed !important;
        inset: 0 auto 0 0 !important;
        z-index: 310 !important;
        width: var(--collections-drawer-width) !important;
        min-width: 0 !important;
        height: 100dvh !important;
        padding: 18px 18px 14px !important;
        gap: 14px !important;
        overflow: hidden !important;
        border: 0 !important;
        border-right: 1px solid #dbe5f4 !important;
        border-radius: 0 18px 18px 0 !important;
        background: #fff !important;
        box-shadow: 22px 0 60px rgba(15, 23, 42, 0.18) !important;
        transform: translateX(calc(-100% - 24px)) !important;
        transition: transform 220ms ease !important;
        will-change: transform;
      }

      #appShell.collections-overlay-open #collectionsSidebar {
        transform: translateX(0) !important;
      }

      #mobileNavBackdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 300 !important;
        display: block !important;
        background: rgba(20, 31, 55, 0.38) !important;
        backdrop-filter: blur(1.5px);
      }

      #mobileNavBackdrop[hidden] {
        display: none !important;
      }

      .collections-drawer-head {
        min-height: 48px;
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) 40px;
        align-items: center;
        gap: 10px;
      }

      .collections-drawer-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #15213a;
        font-size: 18px;
        font-weight: 850;
      }

      .collections-drawer-title svg {
        width: 23px;
        height: 23px;
        flex: 0 0 23px;
        stroke: #2563eb;
        stroke-width: 2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .collections-drawer-icon-button {
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
        border: 1px solid #dce5f2;
        border-radius: 10px;
        padding: 0;
        display: grid;
        place-items: center;
        color: #172033;
        background: #fff;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      }

      .collections-drawer-icon-button:hover,
      .collections-drawer-icon-button:focus-visible {
        color: #1d4ed8;
        border-color: #b9cdf3;
        background: #f7faff;
      }

      .collections-drawer-icon-button svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .collections-drawer-search-wrap {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 42px;
        gap: 8px;
      }

      .collections-drawer-search {
        min-height: 44px;
        border: 1px solid #dce5f2;
        border-radius: 10px;
        padding: 0 12px 0 40px;
        color: #172033;
        background:
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='19' height='19' viewBox='0 0 24 24' fill='none' stroke='%23687386' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-4-4'/%3E%3C/svg%3E") no-repeat 13px center,
          #fff;
      }

      .collections-drawer-search:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }

      .collections-filter-tabs {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e7edf6;
      }

      .collections-filter-tab {
        min-height: 39px;
        border: 1px solid #dce5f2;
        border-radius: 9px;
        padding: 8px 10px;
        color: #53617a;
        background: #fff;
        font-size: 13px;
        font-weight: 800;
        box-shadow: none;
      }

      .collections-filter-tab:hover {
        color: #1d4ed8;
        border-color: #bfd1f3;
        background: #f7faff;
      }

      .collections-filter-tab.active {
        color: #1d4ed8;
        border-color: #a9c4ff;
        background: #eef4ff;
      }

      #collectionsSidebar .subjects {
        min-height: 0;
        flex: 1 1 auto;
        gap: 8px !important;
        padding: 0 5px 8px 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-gutter: stable;
        -webkit-overflow-scrolling: touch !important;
        overscroll-behavior: contain !important;
        touch-action: pan-y !important;
      }

      #collectionsSidebar .folder-block {
        gap: 4px !important;
      }

      #collectionsSidebar .folder-title {
        min-height: 43px;
        grid-template-columns: auto minmax(0, 1fr) auto auto auto !important;
        gap: 8px !important;
        margin: 0 !important;
        border: 0 !important;
        border-radius: 9px !important;
        padding: 8px 6px !important;
        color: #17233c !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      #collectionsSidebar .folder-title:hover {
        background: #f5f8fd !important;
      }

      #collectionsSidebar .folder-icon {
        width: 22px !important;
        height: 17px !important;
      }

      #collectionsSidebar .folder-name {
        color: #17233c;
        font-size: 13px;
        font-weight: 850;
      }

      .drawer-folder-count {
        color: #7a859b;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
      }

      #collectionsSidebar .folder-options,
      #collectionsSidebar .folder-toggle-mark {
        width: 27px !important;
        height: 27px !important;
        border-color: transparent !important;
        background: transparent !important;
      }

      #collectionsSidebar .folder-options:hover,
      #collectionsSidebar .folder-toggle-mark:hover {
        border-color: #dbe5f4 !important;
        background: #fff !important;
      }

      #collectionsSidebar .subject {
        width: calc(100% - 14px) !important;
        min-height: 43px;
        margin-left: 14px !important;
        grid-template-columns: 24px minmax(0, 1fr) auto 30px 28px !important;
        align-items: center;
        gap: 7px !important;
        border: 0 !important;
        border-radius: 9px !important;
        padding: 7px 5px 7px 8px !important;
        color: #26324b !important;
        background: transparent !important;
      }

      #collectionsSidebar .subject:hover {
        background: #f4f8ff !important;
      }

      #collectionsSidebar .subject.active {
        color: #fff !important;
        background: linear-gradient(135deg, #2d6df6, #1d4ed8) !important;
        box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2) !important;
      }

      #collectionsSidebar .subject > span:not(.collection-book-icon) {
        min-width: 0;
        overflow: hidden;
        font-size: 12px;
        font-weight: 750;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #collectionsSidebar .subject > small {
        color: #7a859b;
        font-size: 10px;
        font-weight: 750;
        white-space: nowrap;
      }

      #collectionsSidebar .subject.active > small,
      #collectionsSidebar .subject.active .subject-options,
      #collectionsSidebar .subject.active .collection-favorite {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      .collection-book-icon {
        width: 18px;
        height: 22px;
        border: 1px solid color-mix(in srgb, var(--book-color) 74%, #fff);
        border-radius: 3px 5px 5px 3px;
        display: inline-block;
        position: relative;
        flex: 0 0 18px;
        background: linear-gradient(90deg, color-mix(in srgb, var(--book-color) 74%, #fff) 0 4px, var(--book-color) 4px 100%);
        box-shadow: inset -2px 0 0 rgba(255, 255, 255, 0.25);
      }

      .collection-book-icon::before {
        content: "";
        position: absolute;
        left: 6px;
        right: 3px;
        top: 5px;
        height: 2px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.82);
      }

      .collection-favorite {
        width: 30px;
        height: 30px;
        min-width: 30px;
        min-height: 30px;
        border: 0;
        border-radius: 8px;
        padding: 0;
        display: grid;
        place-items: center;
        color: #7b88a0;
        background: transparent;
        font-size: 18px;
        line-height: 1;
        box-shadow: none;
      }

      .collection-favorite:hover {
        color: #1d4ed8;
        background: #eaf2ff;
      }

      .collection-favorite.is-favorite {
        color: #2563eb;
      }

      #collectionsSidebar .subject.active .collection-book-icon {
        border-color: rgba(255, 255, 255, 0.72);
        box-shadow: 0 0 0 1px rgba(255,255,255,.18), inset -2px 0 0 rgba(255,255,255,.28);
      }

      .collections-empty-filter {
        margin: 10px 2px;
        border: 1px dashed #cbd8eb;
        border-radius: 10px;
        padding: 18px 14px;
        color: #687386;
        background: #f9fbff;
        font-size: 13px;
        line-height: 1.45;
        text-align: center;
      }

      .collections-manage-button {
        min-height: 44px;
        border: 1px solid #d7e3f4;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        color: #1d4ed8;
        background: #fff;
        font-size: 13px;
        font-weight: 800;
        box-shadow: none;
      }

      .collections-manage-button:hover {
        border-color: #afc8f5;
        background: #f5f9ff;
      }

      #collectionsSidebar .side-footer {
        display: none !important;
      }

      @media (max-width: 560px) {
        :root { --collections-drawer-width: min(90vw, 370px); }
        #collectionsSidebar {
          border-radius: 0 16px 16px 0 !important;
          padding: 14px 14px 12px !important;
        }
        .collections-drawer-title { font-size: 17px; }
        .drawer-folder-count { display: none; }
      }

            @media (pointer: coarse), (max-width: 860px) {
        #mobileNavBackdrop {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        #collectionsSidebar,
        #collectionsSidebar .subject,
        #collectionsSidebar .folder-title,
        #collectionsSidebar .folder-options,
        #collectionsSidebar .folder-toggle-mark,
        .collections-drawer-icon-button,
        .collections-filter-tab {
          transition: none !important;
        }

        #collectionsSidebar {
          will-change: auto;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        #collectionsSidebar { transition: none !important; }
      }
    `;
  document.head.appendChild(style);
})();
