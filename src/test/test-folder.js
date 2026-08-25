(() => {
  'use strict';
  if (window.FixaTestFolder) return;

  const state = {
    folderId: '',
    allocations: {},
    weights: {},
    order: [],
    draggedKey: ''
  };

  const iconFolder = '<svg class="test-folder-line-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  const iconUsers = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  const iconList = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path></svg>';
  const iconShuffle = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5"></path><path d="M4 20 21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>';
  const iconDrag = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="6" r="1"></circle><circle cx="16" cy="6" r="1"></circle><circle cx="8" cy="12" r="1"></circle><circle cx="16" cy="12" r="1"></circle><circle cx="8" cy="18" r="1"></circle><circle cx="16" cy="18" r="1"></circle></svg>';

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

  function legacySavedAllocations() {
    try { return JSON.parse(localStorage.getItem(allocationStorageKey()) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function normalizeAllocations(source) {
    const normalized = {};
    if (!source || typeof source !== 'object') return normalized;
    Object.entries(source).forEach(([key, value]) => {
      normalized[key] = Math.max(0, Math.floor(Number(value) || 0));
    });
    return normalized;
  }

  function normalizeWeights(source) {
    const normalized = {};
    if (!source || typeof source !== 'object') return normalized;
    Object.entries(source).forEach(([key, value]) => {
      normalized[key] = Math.min(99, Math.max(1, Math.floor(Number(value) || 1)));
    });
    return normalized;
  }

  function folders() {
    return Array.isArray(appData()?.folders) ? appData().folders : [];
  }

  function folderById(folderId = state.folderId) {
    return folders().find(folder => folder.id === folderId) || null;
  }

  function persistAllocations() {
    if (!state.folderId) return;
    const folder = folderById(state.folderId);
    if (!folder) return;
    folder.testFolderAllocations = normalizeAllocations(state.allocations);
    try { if (typeof save === 'function') save(); } catch (_) {}
  }

  function loadAllocations(folderId) {
    const folder = folderById(folderId);
    const stored = folder?.testFolderAllocations;
    if (stored && typeof stored === 'object') {
      state.allocations = normalizeAllocations(stored);
      return;
    }

    const legacy = legacySavedAllocations()?.[folderId];
    state.allocations = normalizeAllocations(legacy);
    if (folder && legacy && typeof legacy === 'object') {
      folder.testFolderAllocations = { ...state.allocations };
      try { if (typeof save === 'function') save(); } catch (_) {}
    }
  }

  function loadWeights(folderId) {
    const folder = folderById(folderId);
    state.weights = normalizeWeights(folder?.testFolderWeights || {});
  }

  function persistWeights() {
    if (!state.folderId) return;
    const folder = folderById(state.folderId);
    if (!folder) return;
    folder.testFolderWeights = normalizeWeights(state.weights);
    try { if (typeof save === 'function') save(); } catch (_) {}
  }

  function weightForKey(key) {
    return Math.min(99, Math.max(1, Math.floor(Number(state.weights[key]) || 1)));
  }

  function loadOrder(folderId) {
    const folder = folderById(folderId);
    state.order = Array.isArray(folder?.testFolderOrder)
      ? folder.testFolderOrder.map(String).filter(Boolean)
      : [];
  }

  function persistOrder(order = state.order) {
    if (!state.folderId) return;
    const folder = folderById(state.folderId);
    if (!folder) return;
    const unique = [];
    const used = new Set();
    (order || []).forEach(key => {
      const value = String(key || '');
      if (!value || used.has(value)) return;
      used.add(value);
      unique.push(value);
    });
    state.order = unique;
    folder.testFolderOrder = [...unique];
    try { if (typeof save === 'function') save(); } catch (_) {}
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
      .map((card, index) => ({ ...card, originalIndex: index, subjectId: subject.id, subjectName: subject.name || "" }))
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

  function baseDistributionItems() {
    return normalizedGroups()
      .filter(group => group.subjectIds.length)
      .map(group => ({
        key: `g:${group.id}`,
        type: 'group',
        id: group.id,
        name: group.name,
        available: availableForGroup(group),
        detail: `${group.subjectIds.length} coleç${group.subjectIds.length === 1 ? 'ão' : 'ões'}`
      }));
  }

  function distributionItems() {
    const base = baseDistributionItems();
    if (!base.length) return [];

    const byKey = new Map(base.map(item => [item.key, item]));
    const ordered = [];
    const used = new Set();

    state.order.forEach(key => {
      const item = byKey.get(key);
      if (!item || used.has(key)) return;
      used.add(key);
      ordered.push(item);
    });

    base.forEach(item => {
      if (used.has(item.key)) return;
      used.add(item.key);
      ordered.push(item);
    });

    const nextOrder = ordered.map(item => item.key);
    const changed = nextOrder.length !== state.order.length || nextOrder.some((key, index) => key !== state.order[index]);
    if (changed) {
      state.order = nextOrder;
      const folder = folderById();
      if (folder) folder.testFolderOrder = [...nextOrder];
    }

    return ordered;
  }

  function totalRequested() {
    return distributionItems().reduce((sum, item) => sum + Math.max(0, Number(state.allocations[item.key]) || 0), 0);
  }

  function totalPoints() {
    return distributionItems().reduce((sum, item) => {
      const amount = Math.max(0, Number(state.allocations[item.key]) || 0);
      return sum + (amount * weightForKey(item.key));
    }, 0);
  }

  function validation() {
    if (!state.folderId) return { valid: false, message: 'Selecione uma pasta para configurar o teste.' };
    const items = distributionItems();
    if (!subjectsForFolder().length) return { valid: false, message: 'Esta pasta ainda não possui coleções.' };
    if (!items.length) return { valid: false, message: 'Crie um grupo nesta pasta para montar o Teste pasta.' };
    const total = totalRequested();
    if (!total) return { valid: false, message: 'Defina a quantidade de questões de pelo menos um grupo.' };
    for (const item of items) {
      const requested = Math.max(0, Number(state.allocations[item.key]) || 0);
      if (requested > item.available) return { valid: false, message: `${item.name} possui apenas ${item.available} questão${item.available === 1 ? '' : 'ões'} disponível${item.available === 1 ? '' : 'is'}.` };
    }
    return { valid: true, message: `${total} questões · ${totalPoints()} pontos configurados para este teste.` };
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
      #test .test-tabs [data-test-panel="folder"] svg{fill:none!important;stroke:#2563eb!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important}
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
      button.test-folder-control{cursor:pointer}
      button.test-folder-control:hover,button.test-folder-control:focus-visible{border-color:#2563eb;background:#eef4ff;color:#1d4ed8}
      .test-folder-group-prompt{border:1px dashed #bfdbfe;border-radius:11px;background:#f8fbff;padding:13px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#475569;font-size:12px}
      .test-folder-group-prompt strong{display:block;color:#172033;font-size:13px}.test-folder-group-prompt button{min-height:34px;border-radius:8px;white-space:nowrap}
      .test-folder-select{min-width:220px;max-width:320px;padding-right:8px;background:#fff !important;border-color:#9fc1ff !important;box-shadow:none !important}
      .test-folder-select span{color:#334155}
      .test-folder-select select{border:0!important;box-shadow:none!important;padding:0 28px 0 2px;font-size:12px;font-weight:800;background:#fff!important;color:#172033!important;min-width:145px}
      .test-folder-total strong{color:#2563eb;font-size:14px}
      .test-folder-start{min-height:44px;min-width:150px;padding:0 20px;border-radius:9px;font-weight:850;box-shadow:0 8px 18px rgba(37,99,235,.16)}
      .test-folder-start:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
      .test-folder-distribution{border-top:1px solid #edf1f7;padding-top:18px;display:grid;gap:10px}
      .test-folder-distribution-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:2px}
      .test-folder-distribution h4{margin:0;font-size:14px;color:#172033}
      .test-folder-distribution-head small{color:#7b879b;font-size:10px}
      .test-folder-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;min-height:58px;border:1px solid #dbe3f1;border-radius:10px;padding:10px 13px;background:#fff;transition:border-color .14s ease,background .14s ease,opacity .14s ease}
      .test-folder-row.is-dragging{opacity:.5;border-color:#8fb4ff;background:#f5f8ff}
      .test-folder-row.is-drag-over{border-color:#2563eb;background:#f8fbff}
      .test-folder-row-main{display:flex;align-items:center;gap:10px;min-width:0}
      .test-folder-drag{width:28px;height:34px;flex:0 0 28px;border:0;padding:0;display:grid;place-items:center;color:#94a3b8;background:transparent;cursor:grab;touch-action:none}
      .test-folder-drag:active{cursor:grabbing}.test-folder-drag:hover,.test-folder-drag:focus-visible{color:#2563eb;background:#eef4ff}
      .test-folder-drag svg{width:18px;height:18px;fill:currentColor;stroke:none}
      .test-folder-sequence{width:25px;height:25px;flex:0 0 25px;display:grid;place-items:center;border:1px solid #d7e2f1;border-radius:999px;color:#53617a;background:#f8faff;font-size:10px;font-weight:850}
      .test-folder-row-icon{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#2563eb;background:#eef4ff;flex:0 0 auto}
      .test-folder-row-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .test-folder-row-copy{min-width:0}.test-folder-row-copy strong{display:block;color:#172033;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.test-folder-row-copy small{color:#7b879b;font-size:10px}
      .test-folder-fields{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap}
      .test-folder-amount,.test-folder-weight{display:flex;align-items:center;gap:7px;color:#53617a;font-size:11px;font-weight:700;white-space:nowrap}
      .test-folder-amount input{width:70px;height:36px;padding:5px 8px;text-align:center;font-weight:850;color:#172033}
      .test-folder-weight input{width:54px;height:36px;padding:5px 8px;text-align:center;font-weight:850;color:#172033}
      .test-folder-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#64748b;font-size:11px}
      .test-folder-message{margin:0;font-size:11px;color:#64748b}.test-folder-message.error{color:#dc2626}.test-folder-message.ok{color:#15803d}
      .test-folder-empty{min-height:150px;border:1px dashed #d8e3f4;border-radius:12px;display:grid;place-items:center;text-align:center;padding:24px;color:#64748b}
      @media(max-width:800px){.test-folder-body{padding:18px}.test-folder-head{grid-template-columns:54px minmax(0,1fr)}.test-folder-icon{width:54px;height:54px}.test-folder-start{grid-column:1/-1;width:100%}.test-folder-controls{grid-column:1/-1}.test-folder-row{grid-template-columns:1fr}.test-folder-fields{justify-content:flex-end}.test-folder-select{min-width:100%;max-width:none;flex:1 1 100%}.test-folder-drag{width:30px;flex-basis:30px}}
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
            <div class="test-folder-copy"><h3>Teste pasta</h3><p>Monte um teste usando os grupos configurados dentro da pasta.</p></div>
            <button type="button" class="test-folder-start" data-folder-test-start>▷ &nbsp; Começar teste</button>
            <div class="test-folder-controls">
              <label class="test-folder-control test-folder-select">${iconFolder}<span>Pasta:</span><select data-folder-test-select aria-label="Pasta do teste"></select></label>
              <span class="test-folder-control test-folder-total">${iconList}Até <strong data-folder-test-total>0</strong> questões</span>
              <button type="button" class="test-folder-control" data-folder-groups-open>${iconUsers}<span>Gerenciar grupos</span></button>
              <span class="test-folder-control">${iconShuffle}Sem repetição</span>
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

  function loadFolderConfiguration(folderId) {
    loadAllocations(folderId);
    loadWeights(folderId);
    loadOrder(folderId);
  }

  function ensureFolderSelection() {
    const available = folders();
    if (!available.length) { state.folderId = ''; state.allocations = {}; state.weights = {}; state.order = []; return; }
    if (!available.some(folder => folder.id === state.folderId)) {
      state.folderId = available[0].id;
      loadFolderConfiguration(state.folderId);
    }
  }

  function cleanConfigForCurrentStructure() {
    const allowed = new Set(distributionItems().map(item => item.key));
    let allocationsChanged = false;
    let weightsChanged = false;
    Object.keys(state.allocations).forEach(key => {
      if (allowed.has(key)) return;
      delete state.allocations[key];
      allocationsChanged = true;
    });
    Object.keys(state.weights).forEach(key => {
      if (allowed.has(key)) return;
      delete state.weights[key];
      weightsChanged = true;
    });
    if (allocationsChanged) persistAllocations();
    if (weightsChanged) persistWeights();
  }

  function updateSequenceNumbers() {
    document.querySelectorAll('[data-folder-order-key] .test-folder-sequence').forEach((badge, index) => {
      badge.textContent = String(index + 1);
    });
  }

  function persistVisibleOrder() {
    const list = [...document.querySelectorAll('[data-folder-order-key]')]
      .map(row => row.dataset.folderOrderKey)
      .filter(Boolean);
    if (!list.length) return;
    persistOrder(list);
    updateSequenceNumbers();
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

    cleanConfigForCurrentStructure();
    const items = distributionItems();

    const groups = normalizedGroups().filter(group => group.subjectIds.length);
    const groupPrompt = groups.length ? '' : `
      <div class="test-folder-group-prompt">
        <span><strong>Essa pasta ainda não tem grupos.</strong><small>Crie grupos para escolher quais áreas entram no Teste pasta.</small></span>
        <button type="button" class="secondary" data-folder-groups-open>Criar grupos</button>
      </div>`;
    const orderHint = items.length > 1 ? '<small>Arraste pelo ícone à esquerda para ordenar a sequência.</small>' : '';

    distribution.innerHTML = `
      <div class="test-folder-distribution-head">
        <h4>Distribuição das questões</h4>
        ${orderHint}
      </div>
      ${groupPrompt}
      ${items.map((item, index) => `
        <div class="test-folder-row" data-folder-order-key="${esc(item.key)}">
          <div class="test-folder-row-main">
            <button type="button" class="test-folder-drag" draggable="true" data-folder-drag-handle="${esc(item.key)}" aria-label="Arrastar ${esc(item.name)} para ordenar" title="Arraste para ordenar">${iconDrag}</button>
            <span class="test-folder-sequence" aria-label="Posição ${index + 1}">${index + 1}</span>
            <div class="test-folder-row-icon">${item.type === 'group' ? iconUsers : iconList}</div>
            <div class="test-folder-row-copy"><strong>${esc(item.name)}</strong><small>${item.available} disponível${item.available === 1 ? '' : 'is'} · ${esc(item.detail)}</small></div>
          </div>
          <div class="test-folder-fields">
            <label class="test-folder-amount">Questões na prova <input type="number" min="0" max="${item.available}" value="${Math.max(0, Number(state.allocations[item.key]) || 0)}" inputmode="numeric" data-folder-amount="${esc(item.key)}"></label>
            <label class="test-folder-weight">Peso <input type="number" min="1" max="99" value="${weightForKey(item.key)}" inputmode="numeric" data-folder-weight="${esc(item.key)}"></label>
          </div>
        </div>`).join('')}
      <div class="test-folder-summary"><span>${groups.length ? `${groups.length} grupo${groups.length === 1 ? '' : 's'} configurado${groups.length === 1 ? '' : 's'}` : 'Nenhum grupo configurado'}</span><p class="test-folder-message" data-folder-test-message></p></div>`;
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
    const items = distributionItems();

    items.forEach(item => {
      const amount = Math.max(0, Number(state.allocations[item.key]) || 0);
      if (!amount) return;
      const weight = weightForKey(item.key);

      const group = normalizedGroups().find(groupItem => groupItem.id === item.id);
      if (!group) return;
      const pool = group.subjectIds.flatMap(subjectId => {
        const subject = subjectsForFolder().find(subjectItem => subjectItem.id === subjectId);
        return testableForSubject(subject);
      });
      selected.push(...shuffle(pool).slice(0, amount).map(card => ({ ...card, testWeight: weight, testDistributionKey: item.key })));
    });

    const unique = new Map();
    selected.forEach(card => unique.set(`${card.subjectId}:${card.originalIndex}`, card));
    return shuffle([...unique.values()]);
  }

  function buildFolderQuestion(card) {
    const built = typeof buildTestQuestion === 'function' ? buildTestQuestion(card) : { ...card };
    if (built.type === 'multiple' && Array.isArray(card.options)) {
      const correctText = card.correctAnswerText || '';
      built.testOptions = card.options.map(text => ({
        text,
        isCorrect: typeof normalizeAnswerText === 'function'
          ? normalizeAnswerText(text) === normalizeAnswerText(correctText)
          : String(text || '').trim().toLowerCase() === String(correctText || '').trim().toLowerCase()
      }));
    }
    return built;
  }
  function startFolderTest() {
    const check = validation();
    if (!check.valid) { updateSummary(); return; }
    const selectedCards = selectedCardsForTest();
    if (!selectedCards.length) return;
    const folder = folderById();
    persistAllocations();
    persistWeights();
    persistOrder(state.order);

    try {
      testState = {
        active: true,
        questions: selectedCards.map(card => ({ ...buildFolderQuestion(card), weight: Math.max(1, Number(card.testWeight) || 1), distributionKey: card.testDistributionKey || '' })),
        index: 0,
        selected: null,
        answered: false,
        score: 0,
        recorded: false,
        subjectName: folder?.name || 'Teste pasta',
        startedAt: Date.now(),
        finishedAt: null,
        pausedAt: null,
        pausedMs: 0,
        paused: false,
        id: Date.now().toString(36),
        attempts: {},
        ratings: typeof defaultRatings === 'function' ? defaultRatings() : { again:0, hard:0, good:0, easy:0 },
        mode: 'folder',
        subjectIds: [...new Set(selectedCards.map(card => card.subjectId).filter(Boolean))],
        weightedMaxPoints: totalPoints(),
        skipped: 0,
        skipActions: 0
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

      if (event.target.closest('[data-folder-groups-open]')) {
        event.preventDefault();
        if (state.folderId && window.FixaFolderGroups?.open) window.FixaFolderGroups.open(state.folderId);
        return;
      }

      if (event.target.closest('[data-folder-test-start]')) { startFolderTest(); return; }
    });

    document.addEventListener('change', event => {
      const folderSelect = event.target.closest('[data-folder-test-select]');
      if (folderSelect) {
        state.folderId = folderSelect.value;
        loadFolderConfiguration(state.folderId);
        renderFolderPanel();
      }
    });

    document.addEventListener('input', event => {
      const amount = event.target.closest('[data-folder-amount]');
      if (amount) {
        state.allocations[amount.dataset.folderAmount] = Math.max(0, Math.floor(Number(amount.value) || 0));
        persistAllocations();
        updateSummary();
        return;
      }

      const weight = event.target.closest('[data-folder-weight]');
      if (weight) {
        const key = weight.dataset.folderWeight;
        const normalized = Math.min(99, Math.max(1, Math.floor(Number(weight.value) || 1)));
        state.weights[key] = normalized;
        persistWeights();
        updateSummary();
      }
    });

    document.addEventListener('dragstart', event => {
      const handle = event.target.closest?.('[data-folder-drag-handle]');
      if (!handle) return;
      const key = handle.dataset.folderDragHandle || '';
      const row = handle.closest('[data-folder-order-key]');
      if (!key || !row) return;
      state.draggedKey = key;
      row.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    });

    document.addEventListener('dragover', event => {
      if (!state.draggedKey) return;
      const targetRow = event.target.closest?.('[data-folder-order-key]');
      if (!targetRow || targetRow.dataset.folderOrderKey === state.draggedKey) return;
      const draggedRow = document.querySelector(`[data-folder-order-key="${CSS.escape(state.draggedKey)}"]`);
      if (!draggedRow || draggedRow === targetRow) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('[data-folder-order-key].is-drag-over').forEach(row => row.classList.remove('is-drag-over'));
      targetRow.classList.add('is-drag-over');
      const rect = targetRow.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      targetRow.parentElement.insertBefore(draggedRow, after ? targetRow.nextSibling : targetRow);
      updateSequenceNumbers();
    });

    document.addEventListener('drop', event => {
      if (!state.draggedKey) return;
      if (event.target.closest?.('[data-folder-order-key]')) event.preventDefault();
      persistVisibleOrder();
      document.querySelectorAll('[data-folder-order-key].is-drag-over').forEach(row => row.classList.remove('is-drag-over'));
    });

    document.addEventListener('dragend', () => {
      if (!state.draggedKey) return;
      document.querySelectorAll('[data-folder-order-key].is-dragging,[data-folder-order-key].is-drag-over').forEach(row => row.classList.remove('is-dragging', 'is-drag-over'));
      persistVisibleOrder();
      state.draggedKey = '';
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
    if (state.folderId) loadFolderConfiguration(state.folderId);
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
