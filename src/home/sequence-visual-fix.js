(() => {
  if (document.querySelector('#sequenceVisualFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'sequenceVisualFixStyle';
  style.textContent = `
    /* Altera somente a apresentação dos dias concluídos. */
    [data-home-panel="progress"] .home-sequence-day.is-study i,
    .home-sequence-day.is-study i {
      border-color: #f59e0b !important;
      background: #ffb13b !important;
      color: #111827 !important;
      font-size: 17px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
    }

    [data-home-panel="progress"] .home-sequence-day.is-study i > *,
    .home-sequence-day.is-study i > * {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  function dataRef() {
    try {
      return typeof data !== 'undefined' ? data : window.data;
    } catch (_) {
      return window.data;
    }
  }

  function localDateKey(value) {
    const exactDate = typeof value === 'string' ? value.trim() : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(exactDate)) return exactDate;
    const date = value instanceof Date ? value : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /* Mesma origem/regra usada pelo calendário "Sequência de estudos". */
  function studyDateKey(item) {
    return localDateKey(item?.date || item?.created_at || item?.createdAt || item?.finishedAt || item?.completedAt);
  }

  function studyDates() {
    const history = Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [];
    const dates = new Set(history.map(studyDateKey).filter(Boolean));
    const protectedDays = window.FixaHomeGoalsStreakProtectionV1?.protection?.protected_days || [];
    protectedDays.forEach(value => {
      const key = localDateKey(value);
      if (key) dates.add(key);
    });
    return dates;
  }

  function studyStreak() {
    const dates = studyDates();
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    let count = 0;

    for (let i = 0; i < 365; i += 1) {
      const key = localDateKey(day);
      if (!dates.has(key)) {
        /* Se ainda não estudou hoje, mantém a sequência encerrada ontem. */
        if (i === 0) {
          day.setDate(day.getDate() - 1);
          continue;
        }
        break;
      }
      count += 1;
      day.setDate(day.getDate() - 1);
    }
    return count;
  }

  function syncTopbarStreak() {
    const button = document.querySelector('#homeTopStreak');
    const count = button?.querySelector('b');
    if (!button || !count) return;

    const streak = studyStreak();
    const next = String(streak);
    if (count.textContent !== next) count.textContent = next;

    button.title = `Você estuda há ${streak} dia${streak === 1 ? '' : 's'} consecutivo${streak === 1 ? '' : 's'}.`;
    button.setAttribute('aria-label', `Sequência de ${streak} dia${streak === 1 ? '' : 's'}`);
  }

  function applyCompletedDayChecks() {
    document.querySelectorAll('.home-sequence-day.is-study i').forEach(icon => {
      if (icon.dataset.sequenceVisualApplied === 'true') return;
      icon.dataset.sequenceVisualApplied = 'true';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✓';
    });

    syncTopbarStreak();
  }

  applyCompletedDayChecks();

  const target = document.querySelector('#homeFooterStats') || document.body;
  new MutationObserver(applyCompletedDayChecks).observe(target, {
    childList: true,
    subtree: true
  });

  document.querySelector('#homeTopStreak')?.addEventListener('click', syncTopbarStreak, true);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncTopbarStreak();
  });
  window.addEventListener('load', syncTopbarStreak, { once: true });

  window.FixaSequenceVisualFix = {
    refresh: syncTopbarStreak,
    count: studyStreak
  };
})();
