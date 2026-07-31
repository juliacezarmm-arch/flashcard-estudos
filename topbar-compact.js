(() => {
  const style = document.createElement('style');
  style.id = 'topbarCompactStyle';
  style.textContent = `
    @media (min-width: 761px) {
      html,
      body {
        height: 100%;
        overflow: hidden;
      }

      body {
        min-height: 0;
      }

      .app {
        width: 100%;
        height: 100dvh;
        min-height: 0 !important;
        align-items: stretch;
        overflow: hidden;
      }

      #collectionsSidebar {
        position: sticky;
        top: 0;
        height: 100dvh;
        max-height: 100dvh;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      #subjects {
        flex: 1 1 auto;
        min-height: 0;
        max-height: none !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-gutter: stable;
      }

      #collectionsSidebar .side-footer {
        flex: 0 0 auto;
        margin-top: auto;
      }

      main {
        min-width: 0;
        height: 100dvh;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .topbar-title {
        display: none !important;
      }

      .topbar {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0 !important;
      }

      .topbar-right {
        width: 100% !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 14px !important;
      }

      .topbar-right .tabs {
        order: 1 !important;
        width: auto !important;
        display: flex !important;
        grid-template-columns: none !important;
        justify-content: flex-start !important;
        gap: 10px;
      }

      .topbar-right .auth-panel {
        order: 2 !important;
        width: auto !important;
        margin-left: auto;
        justify-self: auto !important;
        flex: 0 0 auto;
      }
    }
  `;
  document.head.appendChild(style);
})();
