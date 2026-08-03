(() => {
  if (document.querySelector('#addButtonsStyle')) return;

  const style = document.createElement('style');
  style.id = 'addButtonsStyle';
  style.textContent = `
    /* Etapa 3: padroniza apenas a aparência dos botões da área Adicionar. */
    #add .add-mode {
      width: fit-content;
      max-width: 100%;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      flex: 0 0 auto;
      gap: 4px;
      margin: 0;
      padding: 4px;
      border: 0;
      border-radius: 10px;
      background: #f1f5f9;
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
      background: #e8eefb !important;
    }

    #add .add-mode button.active,
    #add .add-mode button.active:hover {
      color: #2563eb !important;
      background: #ffffff !important;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08) !important;
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
  `;

  document.head.appendChild(style);
})();
