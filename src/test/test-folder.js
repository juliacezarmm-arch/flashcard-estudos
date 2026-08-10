(() => {
  'use strict';
  if (window.FixaTestFolder) return;

  const state = {
    folderId: '',
    allocations: {}
  };

  const iconFolder = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  const iconUsers = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  const iconList = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path></svg>';
  const iconShuffle = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5"></path><path d="M4 20 21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>';
  const iconGrid = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h.01M10 7h.01M16 7h.01M4 12h.01M10 12h.01M16 12h.01M4 17h.01M10 17h.01M16 17h.01"></path></svg>';

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  }

  function appData() {
    try { return typeof data !== 'undefined' ? data : null; } catch (_) { return null; }
  }

  function userId() {
    try {
      return (typeof currentUser !== 'undefined' && currentUser?.id) || window.currentUser?.id || 'local';
    } catch (_) {
      return window.currentUser?.id || 'local';
    }
  }

  function allocationStorageKey() {
    return `fixa:test-folder-allocations:${userId()}`;
  }

  function allSavedAllocations() {
    try { return JSON.parse(localStorage.getItem(allocationStorageKey()) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function persistAllocations() {
    if (!state.folderId) return;
    const saved = allSavedAllocations();
    saved[state.folderId] = state.allocations;
    localStorage.setItem(allocationStorageKey(), JSON.stringify(saved));
  }

  function loadAllocations(folderId) {
    const saved = allSavedAllocations();
    state.allocations = saved?.[folderId] && typeof saved[folderId] === 'object' ? { ...saved[folderId] } : {};
  }

  function folders() {
    return Array.isArray(appData()?.folders) ? appData().folders : [];
  }

  function folderById(folderId = state.folderId) {
    return folders().find(folder => folder.id === folderId) || null;
  }

  function subjectsForFolder(folderId = state.folderId) {
    return (appData()?.subjects || []).filter(subject => subject.folder === folderId);
  }

  function normalizedGroups(folderId = state.folderId) {
    if (!folderId) return [];
    try {
      if (window.FixaFolderGroups?.getGroups) return window.FixaFolderGroups.getGroups(folderId);
    } catch (_) {}

    const folder = folderById(folderId);
    const validSubjects = new Set(subjectsForFolder(folderId).map(subject => subject.id));
    const used = new Set();
    return (Array.isArray(folder?.collectionGroups) ? folder.collectionGroups : []).map(group => ({
      id: String(group.id || ''),
      name: String(group.name || 'Grupo').trim() || 'Grupo',
      subjectIds: (Array.isArray(group.subjectIds) ? group.subjectIds : []).filter(id => validSubjects.has(id) && !used.has(id) && (used.add(id) || true))
    }));
  }

  function groupForSubject(subjectId) {
    return normalizedGroups().find(group => group.subjectIds.includes(subjectId)) || null;
  }

  function ungroupedSubjects() {
    return subjectsForFolder().filter(subject => !groupForSubject(subject.id));
  }

  function testableForSubject(subject) {
    if (!subject) return [];
    return (subject.cards || [])
      .map((card, index) => ({ ...card, originalIndex: index, subjectId: subject.id }))
      .filter(card => card.status !== 'frozen')
      .filter(card => {
        if (card.type === 'select-list') return (card.listItems || []).length > 0;
        try { return typeof isMultipleChoiceTestable === 'function' ? isMultipleChoiceTestable(card) : (card.options || []).length >= 2; }
        catch (_) { return (card.options || []).length >= 2; }
      });
  }

  function availableForGroup(group) {
    return group.subjectIds.reduce((sum, subjectId) => {
      const subject = subjectsForFolder().find(item => item.id === subjectId);
      return sum + testableForSubject(subject).length;
    }, 0);
  }

  function distributionItems() {
    const groups = normalizedGroups().filter(group => group.subjectIds.length);
    return [
      ...ungroupedSubjects().map(subject => ({
        key: `s:${subject.id}`,
        type: 'subject',
        id: subject.id,
        name: subject.name,
        available: testableForSubject(subject).length,
        detail: 'Coleção individual'
      })),
      ...groups.map(group => ({
        key: `g:${group.id}`,
        type: 'group',
        id: group.id,
        name: group.name,
        available: availableForGroup(group),
        detail: `${group.subjectIds.length} coleç${group.subjectIds.length === 1 ? 'ão' : 'ões'}`
      }))
    ];
  }

  function totalRequested() {
    return distributionItems().reduce((sum, item) => sum + Math.max(0, Number(state.allocations[item.key]) || 0), 0);
  }

  function validation() {
    if (!state.folderId) return { valid: false, message: 'Selecione uma pasta para configurar o teste.' };
    const items = distributionItems();
    if (!subjectsForFolder().length) return { valid: false, message: 'Esta pasta ainda não possui coleções.' };
    if (!items.length) return { valid: false, message: 'Esta pasta ainda não possui coleções disponíveis para teste.' };
    const total = totalRequested();
    if (!total) return { valid: false, message: 'Defina a quantidade de questões de pelo menos uma coleção ou grupo.' };
    for (const item of items) {
      const requested = Math.max(0, Number(state.allocations[item.key]) || 0);
      if (requested > item.available) return { valid: false, message: `${item.name} possui apenas ${item.available} questão${item.available === 1 ? '' : 'ões'} disponível${item.available === 1 ? '' : 'is'}.` };
    }
    return { valid: true, message: `${total} questões configuradas para este teste.` };
  }

  function shuffle(items) {
    try { if (typeof shuffleList === 'function') return shuffleList(items); } catch (_) {}
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function addStyles() {
    if (document.querySelector('#fixaTestFolderStyles')) return;
    const style = document.createElement('style');
    style.id = 'fixaTestFolderStyles';
    style.textContent = `
      .test-folder-card{border:1px solid #dbe3f1;border-radius:14px;background:#fff;box-shadow:0 8px 24px rgba(23,32,51,.035);overflow:hidden}
      .test-folder-body{padding:26px 28px;display:grid;gap:22px}
      .test-folder-head{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:18px;align-items:center}
      .test-folder-icon{width:64px;height:64px;border:1px solid #cfe0ff;border-radius:14px;display:grid;place-items:center;color:#2563eb;background:#eef4ff}
      .test-folder-icon svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .test-folder-copy h3{margin:0 0 7px;font-size:20px;color:#172033}
      .test-folder-copy p{margin:0;color:#687086;font-size:13px;line-height:1.5}
      .test-folder-controls{grid-column:2/4;display:flex;flex-wrap:wrap;align-items:center;gap:9px}
      .test-folder-control{min-height:38px;border:1px solid #bfd5ff;border-radius:9px;padding:0 12px;display:inline-flex;align-items:center;gap:8px;color:#334155;background:#fff;font-size:12px;font-weight:750}
      .test-folder-control svg{width:17px;height:17px;fill:none;stroke:#2563eb;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .test-folder-select{min-width:220px;max-width:320px;padding-right:8px;background:#fff !important;border-color:#9fc1ff !important;box-shadow:none !important}
      .test-folder-select span{color:#334155}
      .test-folder-select select{border:0!important;box-shadow:none!important;padding:0 28px 0 2px;font-size:12px;font-weight:800;background:#fff!important;color:#172033!important;min-width:145px}
      .test-folder-total strong{color:#2563eb;font-size:14px}
      .test-folder-start{min-height:44px;min-width:150px;padding:0 20px;border-radius:9px;font-weight:850;box-shadow:0 8px 18px rgba(37,99,235,.16)}
      .test-folder-start:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
      .test-folder-distribution{border-top:1px solid #edf1f7;padding-top:18px;display:grid;gap:10px}
      .test-folder-distribution h4{margin:0 0 4px;font-size:14px;color:#172033}
      .test-folder-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;min-height:58px;border:1px solid #dbe3f1;border-radius:10px;padding:10px 13px;background:#fff}
      .test-folder-row-main{display:flex;align-items:center;gap:11px;min-width:0}
      .test-folder-row-icon{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#2563eb;background:#eef4ff;flex:0 0 auto}
      .test-folder-row-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .test-folder-row-copy{min-width:0}.test-folder-row-copy strong{display:block;color:#172033;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.test-folder-row-copy small{color:#7b879b;font-size:10px}
      .test-folder-amount{display:flex;align-items:center;gap:7px;color:#53617a;font-size:11px;font-weight:700}
      .test-folder-amount input{width:70px;height:36px;padding:5px 8px;text-align:center;font-weight:850;color:#172033}
      .test-folder-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#64748b;font-size:11px}
      .test-folder-message{margin:0;font-size:11px;color:#64748b}.test-folder-message.error{color:#dc2626}.test-folder-message.ok{color:#15803d}
      .test-folder-empty{min-height:150px;border:1px dashed #d8e3f4;border-radius:12px;display:grid;place-items:center;text-align:center;padding:24px;color:#64748b}
      @media(max-width:800px){.test-folder-body{padding:18px}.test-folder-head{grid-template-columns:54px minmax(0,1fr)}.test-folder-icon{width:54px;height:54px}.test-folder-start{grid-column:1/-1;width:100%}.test-folder-controls{grid-column:1/-1}.test-folder-row{grid-template-columns:1fr}.test-folder-amount{justify-content:flex-end}.test-folder-select{min-width:100%;max-width:none;flex:1 1 100%}}
    `;
    document.head.appendChild(style);
  }

  function buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'test-panel';
    panel.id = 'testPanelFolder';
    panel.dataset.testPanelView = 'folder';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="test-folder-card">
        <div class="test-folder-body">
          <div class="test-folder-head">
            <div class="test-folder-icon">${iconFolder}</div>
            <div class="test-folder-copy"><h3>Teste pasta</h3><p>Monte um teste usando as coleções de uma pasta, com distribuição personalizada por coleção ou grupo.</p></div>
            <button type="button" class="test-folder-start" data-folder-test-start>▷ &nbsp; Começar teste</button>
            <div class="test-folder-controls">
              <label class="test-folder-control test-folder-select">${iconFolder}<span>Pasta:</span><select data-folder-test-select aria-label="Pasta do teste"></select></label>
              <span class="test-folder-control test-folder-total">${iconList}Até <strong data-folder-test-total>0</strong> questões</span>
              <span class="test-folder-control">${iconShuffle}Sem repetição</span>
              <span class="test-folder-control">${iconGrid}Alternativas embaralhadas</span>
            </div>
          </div>
          <div class="test-folder-distribution" data-folder-distribution></div>
        </div>
      </div>`;
    return panel;
  }

  function setTabActive(tab) {
    document.querySelectorAll('#test .test-tabs [data-test-panel]').forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function hideAllPanels() {
    document.querySelectorAll('#test [data-test-panel-view]').forEach(panel => {
      panel.hidden = true;
      panel.classList.remove('active');
    });
  }

  function showFolderPanel() {
    hideAllPanels();
    const panel = document.querySelector('#testPanelFolder');
    const tab = document.querySelector('[data-test-panel="folder"]');
    if (panel) { panel.hidden = false; panel.classList.add('active'); }
    if (tab) setTabActive(tab);
    renderFolderPanel();
  }

  function showFolderEngine() {
    hideAllPanels();
    const quick = document.querySelector('#testPanelQuick');
    const folderTab = document.querySelector('[data-test-panel="folder"]');
    if (quick) { quick.hidden = false; quick.classList.add('active'); }
    if (folderTab) setTabActive(folderTab);
  }

  function folderOptions() {
    return folders().map(folder => `<option value="${esc(folder.id)}">${esc(folder.name)}</option>`).join('');
  }

  function ensureFolderSelection() {
    const available = folders();
    if (!available.length) { state.folderId = ''; state.allocations = {}; return; }
    if (!available.some(folder => folder.id === state.folderId)) {
      state.folderId = available[0].id;
      loadAllocations(state.folderId);
    }
  }

  function cleanAllocationsForCurrentStructure() {
    const allowed = new Set(distributionItems().map(item => item.key));
    let changed = false;
    Object.keys(state.allocations).forEach(key => {
      if (allowed.has(key)) return;
      delete state.allocations[key];
      changed = true;
    });
    if (changed) persistAllocations();
  }

  function renderFolderPanel() {
    ensureFolderSelection();
    const select = document.querySelector('[data-folder-test-select]');
    const distribution = document.querySelector('[data-folder-distribution]');
    if (!select || !distribution) return;

    select.innerHTML = folderOptions() || '<option value="">Nenhuma pasta disponível</option>';
    select.value = state.folderId;

    if (!state.folderId) {
      distribution.innerHTML = '<div class="test-folder-empty">Crie uma pasta e uma coleção para montar o Teste pasta.</div>';
      updateSummary();
      return;
    }

    if (!subjectsForFolder().length) {
      distribution.innerHTML = '<div class="test-folder-empty">Esta pasta ainda não possui coleções.</div>';
      updateSummary();
      return;
    }

    cleanAllocationsForCurrentStructure();
    const items = distributionItems();

    distribution.innerHTML = `
      <h4>Distribuição das questões</h4>
      ${items.map(item => `
        <div class="test-folder-row">
          <div class="test-folder-row-main">
            <div class="test-folder-row-icon">${item.type === 'group' ? iconUsers : iconList}</div>
            <div class="test-folder-row-copy"><strong>${esc(item.name)}</strong><small>${item.available} disponível${item.available === 1 ? '' : 'is'} · ${esc(item.detail)}</small></div>
          </div>
          <label class="test-folder-amount">Questões na prova <input type="number" min="0" max="${item.available}" value="${Math.max(0, Number(state.allocations[item.key]) || 0)}" inputmode="numeric" data-folder-amount="${esc(item.key)}"></label>
        </div>`).join('')}
      <div class="test-folder-summary"><span>${ungroupedSubjects().length} coleç${ungroupedSubjects().length === 1 ? 'ão individual' : 'ões individuais'} · ${normalizedGroups().filter(group => group.subjectIds.length).length} grupo${normalizedGroups().filter(group => group.subjectIds.length).length === 1 ? '' : 's'}</span><p class="test-folder-message" data-folder-test-message></p></div>`;
    updateSummary();
  }

  function updateSummary() {
    const totalNode = document.querySelector('[data-folder-test-total]');
    const start = document.querySelector('[data-folder-test-start]');
    const message = document.querySelector('[data-folder-test-message]');
    const total = totalRequested();
    const check = validation();
    if (totalNode) totalNode.textContent = String(total);
    if (start) start.disabled = !check.valid;
    if (message) {
      message.textContent = check.message;
      message.classList.toggle('error', !check.valid && Boolean(state.folderId));
      message.classList.toggle('ok', check.valid);
    }
  }

  function selectedCardsForTest() {
    const selected = [];

    ungroupedSubjects().forEach(subject => {
      const amount = Math.max(0, Number(state.allocations[`s:${subject.id}`]) || 0);
      if (!amount) return;
      selected.push(...shuffle(testableForSubject(subject)).slice(0, amount));
    });

    normalizedGroups().filter(group => group.subjectIds.length).forEach(group => {
      const amount = Math.max(0, Number(state.allocations[`g:${group.id}`]) || 0);
      if (!amount) return;
      const pool = group.subjectIds.flatMap(subjectId => {
        const subject = subjectsForFolder().find(item => item.id === subjectId);
        return testableForSubject(subject);
      });
      selected.push(...shuffle(pool).slice(0, amount));
    });

    const unique = new Map();
    selected.forEach(card => unique.set(`${card.subjectId}:${card.originalIndex}`, card));
    return shuffle([...unique.values()]);
  }

  function startFolderTest() {
    const check = validation();
    if (!check.valid) { updateSummary(); return; }
    const selectedCards = selectedCardsForTest();
    if (!selectedCards.length) return;
    const folder = folderById();
    persistAllocations();

    try {
      testState = {
        active: true,
        questions: selectedCards.map(card => buildTestQuestion(card)),
        index: 0,
        selected: null,
        answered: false,
        score: 0,
        recorded: false,
        subjectName: folder?.name || 'Teste pasta',
        startedAt: Date.now(),
        finishedAt: null,
        id: Date.now().toString(36),
        attempts: {},
        ratings: typeof defaultRatings === 'function' ? defaultRatings() : { again:0, hard:0, good:0, easy:0 },
        mode: 'folder',
        subjectIds: [...new Set(selectedCards.map(card => card.subjectId).filter(Boolean))],
        skipped: 0
      };
      showFolderEngine();
      renderTest();
    } catch (error) {
      console.error('[Fixa Teste pasta] Não foi possível iniciar:', error);
    }
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const folderTab = event.target.closest('[data-test-panel="folder"]');
      if (folderTab) { event.preventDefault(); event.stopPropagation(); showFolderPanel(); return; }

      const otherTestTab = event.target.closest('#test .test-tabs [data-test-panel]:not([data-test-panel="folder"])');
      if (otherTestTab) {
        document.querySelector('#testPanelFolder')?.classList.remove('active');
        const panel = document.querySelector('#testPanelFolder');
        if (panel) panel.hidden = true;
      }

      if (event.target.closest('[data-folder-test-start]')) { startFolderTest(); return; }
    });

    document.addEventListener('change', event => {
      const folderSelect = event.target.closest('[data-folder-test-select]');
      if (folderSelect) {
        state.folderId = folderSelect.value;
        loadAllocations(state.folderId);
        renderFolderPanel();
      }
    });

    document.addEventListener('input', event => {
      const amount = event.target.closest('[data-folder-amount]');
      if (!amount) return;
      state.allocations[amount.dataset.folderAmount] = Math.max(0, Math.floor(Number(amount.value) || 0));
      persistAllocations();
      updateSummary();
    });

    const restart = document.querySelector('#restartTest');
    restart?.addEventListener('click', event => {
      try {
        if (testState?.mode !== 'folder') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        startFolderTest();
      } catch (_) {}
    }, true);
  }

  function init() {
    const test = document.querySelector('#test');
    const tabs = test?.querySelector('.test-tabs');
    const quickTab = tabs?.querySelector('[data-test-panel="quick"]');
    const quickPanel = test?.querySelector('#testPanelQuick');
    if (!test || !tabs || !quickTab || !quickPanel) return;

    addStyles();

    const quickTextNode = [...quickTab.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (quickTextNode) quickTextNode.textContent = ' Teste coleção ';
    else if (!quickTab.textContent.includes('Teste coleção')) quickTab.append(' Teste coleção');

    if (!tabs.querySelector('[data-test-panel="folder"]')) {
      const folderTab = document.createElement('button');
      folderTab.type = 'button';
      folderTab.dataset.testPanel = 'folder';
      folderTab.setAttribute('role', 'tab');
      folderTab.setAttribute('aria-selected', 'false');
      folderTab.innerHTML = `${iconFolder} Teste pasta`;
      quickTab.insertAdjacentElement('afterend', folderTab);
    }

    if (!test.querySelector('#testPanelFolder')) quickPanel.insertAdjacentElement('afterend', buildPanel());

    const quickTitle = document.querySelector('#testIntroPanel .test-start-copy h3');
    if (quickTitle?.textContent.trim() === 'Teste') quickTitle.textContent = 'Teste coleção';

    ensureFolderSelection();
    if (state.folderId) loadAllocations(state.folderId);
    bindEvents();
    window.FixaTestFolder = {
      show: showFolderPanel,
      render: renderFolderPanel,
      start: startFolderTest,
      refresh: renderFolderPanel
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
