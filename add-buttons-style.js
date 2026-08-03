(() => {
  if (document.querySelector('#addButtonsStyle')) return;

  const style = document.createElement('style');
  style.id = 'addButtonsStyle';
  style.textContent = `
    /* Mantém as abas secundárias de Adicionar fora do cartão branco. */
    #add .add-workspace.add-workspace-tabs-outside {
      width: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    #add .add-workspace.add-workspace-tabs-outside > .unified-add-panel {
      width: 100%;
      flex: 1 1 auto;
      min-height: 0;
    }

    /* Mesmo padrão visual das abas Hoje, Progresso, Atividade e Análise. */
    #add .add-mode {
      width: fit-content;
      max-width: 100%;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      flex: 0 0 auto;
      flex-wrap: nowrap;
      gap: 4px;
      margin: 0;
      padding: 4px;
      border: 0;
      border-radius: 10px;
      background: #f1f5f9;
      box-shadow: none;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    #add .add-mode::-webkit-scrollbar {
      display: none;
    }

    #add .add-mode button {
      flex: 0 0 auto;
      width: auto;
      min-width: max-content;
      min-height: 30px;
      padding: 0 14px;
      border: 0;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #64748b;
      background: transparent;
      box-shadow: none;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    #add .add-mode button:hover:not(:disabled):not(.active) {
      color: #2563eb !important;
      background: transparent !important;
    }

    #add .add-mode button.active,
    #add .add-mode button.active:hover {
      color: #2563eb !important;
      background: #ffffff !important;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08) !important;
    }

    #add .add-mode button.active .mode-svg {
      color: #2563eb !important;
      stroke: currentColor !important;
    }

    #add .add-mode button:disabled {
      color: #94a3b8;
      background: transparent !important;
      opacity: 0.55;
    }

    #add .add-mode .mode-svg {
      width: 17px;
      height: 17px;
      flex-basis: 17px;
    }

    @media (min-width: 861px) {
      #add.view.active .add-workspace.add-workspace-tabs-outside {
        height: 100%;
      }

      #add.view.active .add-workspace.add-workspace-tabs-outside > .unified-add-panel {
        height: auto !important;
      }
    }

    @media (max-width: 760px) {
      #add .add-mode {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);

  function moveAddTabsOutsidePanel() {
    const addMode = document.querySelector('#add .add-mode');
    const addPanel = addMode?.closest('.unified-add-panel');
    const addWorkspace = addPanel?.parentElement;
    if (!addMode || !addPanel || !addWorkspace) return;

    if (addMode.parentElement === addPanel) {
      addWorkspace.insertBefore(addMode, addPanel);
    }

    addWorkspace.classList.add('add-workspace-tabs-outside');
  }

  moveAddTabsOutsidePanel();

  const addView = document.querySelector('#add');
  if (addView) {
    new MutationObserver(moveAddTabsOutsidePanel).observe(addView, {
      childList: true,
      subtree: true
    });
  }
})();
