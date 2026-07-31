(() => {
  const style = document.createElement('style');
  style.id = 'sidebarFooterPolishStyle';
  style.textContent = `
    @media (min-width: 761px) {
      #collectionsSidebar .side-footer {
        flex: 0 0 auto;
        margin-top: auto;
        padding: 10px 0 0;
        border-top: 1px solid #edf1f7 !important;
        background: transparent;
        display: grid;
        justify-items: center;
        gap: 6px;
      }

      #collectionsSidebar .side-footer::before,
      #collectionsSidebar .side-footer::after {
        display: none !important;
        content: none !important;
      }

      #collectionsSidebar .app-version {
        width: auto;
        min-height: 28px;
        margin: 0;
        border: 0 !important;
        border-radius: 999px;
        padding: 5px 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #7b879d;
        background: #f5f8fc;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        box-shadow: none !important;
      }

      #collectionsSidebar .app-version::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #4f7df5;
        flex: 0 0 auto;
      }

      #collectionsSidebar .app-version span {
        margin: 0 1px;
        color: #a5afc0;
      }
    }
  `;
  document.head.appendChild(style);

  const testStartNote = document.querySelector('#testStartNote');

  function correctTestStartText() {
    if (!testStartNote) return;
    const text = String(testStartNote.textContent || '').trim();
    const match = text.match(/^(\d+) quest(?:ão|ões) compatíve(?:l|is) disponíve(?:l|is)\. Você pediu (\d+); o teste usará (\d+)\.$/i);
    if (!match) return;

    const available = Number(match[1]);
    const used = Number(match[3]);
    const availableText = available === 1
      ? 'Há 1 questão disponível para o teste.'
      : `Há ${available} questões disponíveis para o teste.`;
    const usedText = used === 1
      ? 'Será utilizada 1 questão.'
      : `Serão utilizadas ${used} questões.`;

    testStartNote.textContent = `${availableText} ${usedText}`;
  }

  if (testStartNote) {
    new MutationObserver(correctTestStartText).observe(testStartNote, {
      childList: true,
      characterData: true,
      subtree: true
    });
    correctTestStartText();
  }
})();
