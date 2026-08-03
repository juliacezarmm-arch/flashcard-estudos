(() => {
  if (document.querySelector('#addButtonsStyle')) return;

  const style = document.createElement('style');
  style.id = 'addButtonsStyle';
  style.textContent = `
    /* Botões secundários de Adicionar independentes, sem barra agrupadora. */
    #add .add-mode {
      width: fit-content;
      max-width: 100%;
      min-height: 40px;
      display: flex;
      align-items: center;
      align-self: flex-start;
      flex: 0 0 auto;
      flex-wrap: wrap;
      gap: 9px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      overflow: visible;
    }

    #add .add-mode button {
      flex: 0 0 auto;
      width: auto;
      min-width: max-content;
      min-height: 40px;
      padding: 0 15px;
      border: 1px solid #dbe3ef;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #475569;
      background: #ffffff;
      box-shadow: none;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    #add .add-mode button:hover:not(:disabled):not(.active) {
      color: #2563eb !important;
      border-color: #bfd3ff !important;
      background: #f5f8ff !important;
    }

    #add .add-mode button.active,
    #add .add-mode button.active:hover {
      color: #ffffff !important;
      border-color: #2563eb !important;
      background: #2563eb !important;
      box-shadow: none !important;
    }

    #add .add-mode button.active .mode-svg {
      color: #ffffff !important;
      stroke: currentColor !important;
    }

    #add .add-mode button:disabled {
      color: #94a3b8;
      border-color: #e2e8f0;
      background: #f8fafc !important;
      opacity: 0.6;
    }

    #add .add-mode .mode-svg {
      width: 17px;
      height: 17px;
      flex-basis: 17px;
    }

    @media (max-width: 760px) {
      #add .add-mode {
        width: 100%;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 2px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }

      #add .add-mode::-webkit-scrollbar {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
})();
