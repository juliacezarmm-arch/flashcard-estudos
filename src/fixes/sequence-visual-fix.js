(() => {
  if (document.querySelector('#sequenceVisualFixStyle')) return;

  const style = document.createElement('style');
  style.id = 'sequenceVisualFixStyle';
  style.textContent = `
    /* Dias de estudo concluídos. */
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

  const permanentStudyDates = new Set();
  let permanentLoaded = false;
  let permanentLoading = false;
  let loadedForUserId = null;

  function dataRef() {
    try {
      return typeof data !== 'undefined' ? data : window.data;
    } catch (_) {
      return window.data;
    }
  }

  function getClient() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !== 'undefined') return supabaseClient;
    } catch (_) {}
    return null;
  }

  function getUserId() {
    try {
      return window.currentUser?.id || (typeof currentUser !== 'undefined' ? currentUser?.id : null) || null;
    } catch (_) {
      return null;
    }
  }

  function localDateKey(value) {
    const exactDate = typeof value === 'string' ? value.trim() : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(exactDate)) return exactDate;
    const date = value instanceof Date ? value : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function studyDateKey(item) {
    return localDateKey(item?.date || item?.created_at || item?.createdAt || item?.finishedAt || item?.completedAt || item?.occurred_on);
  }

  function localHistoryStudyDates() {
    const history = Array.isArray(dataRef()?.testHistory) ? dataRef().testHistory : [];
    return new Set(
      history
        .filter(item => !item?.cancelled && !item?.canceled && !item?.interrupted && Number(item?.total || 0) > 0)
        .map(studyDateKey)
        .filter(Boolean)
    );
  }

  function actualStudyDates() {
    const dates = localHistoryStudyDates();
    permanentStudyDates.forEach(key => dates.add(key));
    return dates;
  }

  function protectedDateSet() {
    const dates = new Set();
    const protectedDays = window.FixaHomeGoalsStreakProtectionV1?.protection?.protected_days || [];
    protectedDays.forEach(value => {
      const key = localDateKey(value);
      if (key) dates.add(key);
    });
    return dates;
  }

  function sequenceDates() {
    const dates = actualStudyDates();
    protectedDateSet().forEach(key => dates.add(key));
    return dates;
  }

  function studyStreak() {
    const dates = sequenceDates();
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

  function calendarMonthFromPopover(popover) {
    const now = new Date();
    const result = { year: now.getFullYear(), month: now.getMonth() };
    const text = popover?.textContent || '';
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const match = text.match(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i);
    if (!match) return result;
    const month = months.indexOf(match[1].toLowerCase());
    if (month >= 0) result.month = month;
    result.year = Number(match[2]) || result.year;
    return result;
  }

  function syncMonthlyCalendar() {
    const popover = document.querySelector('#homeStreakPopover');
    if (!popover) return;
    const study = actualStudyDates();
    const protectedDays = protectedDateSet();
    const { year, month } = calendarMonthFromPopover(popover);

    popover.querySelectorAll('.home-streak-day:not(.is-empty)').forEach(element => {
      const day = Number((element.textContent || '').trim());
      if (!Number.isInteger(day) || day < 1 || day > 31) return;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isProtected = protectedDays.has(key);
      element.classList.toggle('is-study', study.has(key) && !isProtected);
      if (study.has(key)) {
        element.title = `Dia ${day}: estudo concluído`;
        element.setAttribute('aria-label', `Dia ${day}: estudo concluído`);
      }
    });
  }

  function syncWeeklyDays() {
    const study = actualStudyDates();
    const protectedDays = protectedDateSet();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    document.querySelectorAll('.fixa-week-days').forEach(container => {
      Array.from(container.querySelectorAll('.fixa-week-day')).slice(0, 7).forEach((node, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const key = localDateKey(date);
        const active = study.has(key) && !protectedDays.has(key);
        node.classList.toggle('active', active);
        const circle = node.querySelector('i');
        if (circle) circle.textContent = active ? '✓' : '';
      });
    });

    document.querySelectorAll('.home-sequence-days').forEach(container => {
      Array.from(container.querySelectorAll('.home-sequence-day')).slice(0, 7).forEach((node, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const key = localDateKey(date);
        node.classList.toggle('is-study', study.has(key) && !protectedDays.has(key));
      });
    });
  }

  function syncTopbarStreak() {
    const streak = studyStreak();
    const button = document.querySelector('#homeTopStreak');
    const count = button?.querySelector('b');
    if (count) count.textContent = String(streak);
    if (button) {
      button.title = `Você estuda há ${streak} dia${streak === 1 ? '' : 's'} consecutivo${streak === 1 ? '' : 's'}.`;
      button.setAttribute('aria-label', `Sequência de ${streak} dia${streak === 1 ? '' : 's'}`);
    }

    document.querySelectorAll('#homeFooterStats .fixa-week-top-card:first-child .fixa-week-top-head>b').forEach(label => {
      label.textContent = `${streak} dia${streak === 1 ? '' : 's'} seguidos`;
    });
    document.querySelectorAll('.home-sequence-summary strong').forEach(label => {
      label.textContent = String(streak);
    });
  }

  function applyCompletedDayChecks() {
    syncWeeklyDays();
    syncMonthlyCalendar();

    document.querySelectorAll('.home-sequence-day.is-study i').forEach(icon => {
      icon.dataset.sequenceVisualApplied = 'true';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✓';
    });

    syncTopbarStreak();
  }

  async function loadPermanentStudyDates(force = false) {
    const userId = getUserId();
    const client = getClient();
    if (!userId || !client?.from || permanentLoading) return false;
    if (!force && permanentLoaded && loadedForUserId === userId) return true;

    permanentLoading = true;
    try {
      const { data: rows, error } = await client
        .from('user_xp_events')
        .select('occurred_on,event_type')
        .eq('event_type', 'test_completed')
        .order('occurred_on', { ascending: true });

      if (error) {
        console.warn('[Fixa] Não foi possível carregar o histórico permanente de estudo:', error.message);
        return false;
      }

      permanentStudyDates.clear();
      (Array.isArray(rows) ? rows : []).forEach(row => {
        const key = localDateKey(row?.occurred_on);
        if (key) permanentStudyDates.add(key);
      });
      permanentLoaded = true;
      loadedForUserId = userId;
      applyCompletedDayChecks();
      return true;
    } catch (error) {
      console.warn('[Fixa] Falha ao carregar histórico permanente de estudo:', error);
      return false;
    } finally {
      permanentLoading = false;
    }
  }

  function schedulePermanentLoad() {
    [250, 900, 2200, 4500].forEach(delay => {
      window.setTimeout(() => loadPermanentStudyDates(false), delay);
    });
  }

  applyCompletedDayChecks();
  schedulePermanentLoad();

  const target = document.querySelector('#homeFooterStats') || document.body;
  new MutationObserver(() => applyCompletedDayChecks()).observe(target, {
    childList: true,
    subtree: true
  });

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#homeTopStreak')) {
      window.setTimeout(applyCompletedDayChecks, 0);
      window.setTimeout(applyCompletedDayChecks, 120);
    }
  }, true);

  window.addEventListener('fixa-cloud-data-loaded', () => {
    loadPermanentStudyDates(false);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadPermanentStudyDates(false);
      applyCompletedDayChecks();
    }
  });

  window.addEventListener('focus', () => {
    loadPermanentStudyDates(false);
    applyCompletedDayChecks();
  });

  window.addEventListener('load', () => {
    loadPermanentStudyDates(false);
    applyCompletedDayChecks();
  }, { once: true });

  window.FixaSequenceVisualFix = {
    refresh: () => {
      applyCompletedDayChecks();
      loadPermanentStudyDates(false);
    },
    count: studyStreak,
    studyDates: () => new Set(actualStudyDates()),
    permanentDates: () => new Set(permanentStudyDates),
    reloadPermanent: () => loadPermanentStudyDates(true)
  };
})();
