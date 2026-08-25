(() => {
  'use strict';
  if (window.FixaCompetitionSelection) return;

  const legacyKey = 'fixa-selected-competition';

  function currentUserId() {
    try {
      return String(window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : '') || '').trim();
    } catch (_) {
      return '';
    }
  }

  function keyFor(userId = currentUserId()) {
    return userId ? `${legacyKey}:${userId}` : legacyKey;
  }

  function get() {
    try {
      const userId = currentUserId();
      return userId ? localStorage.getItem(keyFor(userId)) || '' : '';
    } catch (_) {
      return '';
    }
  }

  function set(value) {
    try {
      const userId = currentUserId();
      if (!userId) return;
      const id = String(value || '');
      if (!id) return remove();
      localStorage.setItem(keyFor(userId), id);
      localStorage.removeItem(legacyKey);
    } catch (_) {}
  }

  function remove() {
    try {
      localStorage.removeItem(keyFor());
      if (currentUserId()) localStorage.removeItem(legacyKey);
    } catch (_) {}
  }

  window.FixaCompetitionSelection = { get, set, remove, keyFor };
})();
