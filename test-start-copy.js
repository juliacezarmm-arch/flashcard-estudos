(() => {
  const note = document.querySelector('#testStartNote');
  if (!note) return;

  function updateCopy() {
    const text = String(note.textContent || '').trim();
    const match = text.match(/^(\d+) quest(?:ão|ões) compatíve(?:l|is) disponíve(?:l|is)\. Você pediu (\d+); o teste usará (\d+)\.$/i);
    if (!match) return;

    const total = Number(match[1]);
    const used = Number(match[3]);
    const totalLabel = total === 1 ? 'Há 1 questão disponível para o teste.' : `Há ${total} questões disponíveis para o teste.`;
    const usedLabel = used === 1 ? 'Será utilizada 1 questão.' : `Serão utilizadas ${used} questões.`;
    note.textContent = `${totalLabel} ${usedLabel}`;
  }

  new MutationObserver(updateCopy).observe(note, {
    childList: true,
    characterData: true,
    subtree: true
  });

  updateCopy();
})();
