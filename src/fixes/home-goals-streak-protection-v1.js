(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV1?.active) return;

  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const state = {
    protection: { available: 0, maximum: 3, protected_days: [] },
    weekXp: 0,
    syncingProtection: false,
    loadingXp: false,
    awardingGoals: false
  };

  const api = window.FixaHomeGoalsStreakProtectionV1 = {
    active: true,
    refresh: refreshData,
    get weekXp() { return Math.max(0, Number(state.weekXp || 0)); },
    get protection() { return state.protection; }
  };

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

  function startOfDay(base = new Date()) {
    const date = new Date(base);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function startOfWeek(base = new Date()) {
    const date = startOfDay(base);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return date;
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function currentRange() {
    const period = document.querySelector('[data-fixa-week-period].active')?.dataset.fixaWeekPeriod || 'week';
    const now = new Date();
    if (period === 'today') {
      const start = startOfDay(now);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { period, start, end };
    }
    if (period === 'month') {
      return {
        period,
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { period, start, end };
  }

  async function rpc(name, args = {}) {
    const client = getClient();
    if (!client) return { data: null, error: new Error('Supabase indisponível') };
    return client.rpc(name, args);
  }

  function polishXpSummaryCards() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.fixa-week-summary-card'));
    const totalXpCard = cards.find(card =>
      card.classList.contains('fixa-xp-card') ||
      card.querySelector('strong')?.textContent?.trim() === 'XP' ||
      card.querySelector('strong')?.textContent?.trim() === 'XP de todas as coleções'
    );
    if (totalXpCard) {
      const title = totalXpCard.querySelector('strong');
      if (title) title.textContent = 'XP de todas as coleções';
      totalXpCard.querySelector('small.home-muted')?.remove();
    }

    const weekXpCard = cards.find(card => {
      const title = card.querySelector('strong')?.textContent?.trim();
      return title === 'XP na semana' || title === 'XP acumulado na semana';
    });
    if (weekXpCard) {
      const title = weekXpCard.querySelector('strong');
      if (title) title.textContent = 'XP acumulado na semana';
      weekXpCard.querySelector('small.home-muted')?.remove();
      weekXpCard.classList.add('fixa-xp-card');

      const weekNumber = weekXpCard.querySelector('.home-card-number');
      const totalNumber = totalXpCard?.querySelector('.home-card-number');
      if (weekNumber) {
        weekNumber.textContent = (weekNumber.textContent || '').replace(/\s*XP\s*$/i, '').trim();
        weekNumber.style.setProperty('color', '#2563eb', 'important');
        if (totalNumber) {
          const totalStyle = getComputedStyle(totalNumber);
          weekNumber.style.setProperty('font-size', totalStyle.fontSize, 'important');
          weekNumber.style.setProperty('line-height', totalStyle.lineHeight, 'important');
          weekNumber.style.setProperty('font-weight', totalStyle.fontWeight, 'important');
        }
      }
    }
  }

  function queueXpCardPolish() {
    requestAnimationFrame(polishXpSummaryCards);
  }

  function notifyHome() {
    if (typeof window.FixaHomeWeeklyDashboardV2?.refresh === 'function') {
      window.FixaHomeWeeklyDashboardV2.refresh();
    }
    if (typeof window.FixaHomeUnifiedDashboardV2?.refresh === 'function') {
      window.FixaHomeUnifiedDashboardV2.refresh();
    }
    queueXpCardPolish();
  }

  async function loadWeekXp() {
    if (state.loadingXp || !getUserId()) return;
    const client = getClient();
    if (!client?.from) return;

    state.loadingXp = true;
    try {
      const start = startOfWeek(new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const { data: rows, error } = await client
        .from('user_xp_events')
        .select('points,occurred_on')
        .gte('occurred_on', localDateKey(start))
        .lte('occurred_on', localDateKey(end));

      if (!error && Array.isArray(rows)) {
        state.weekXp = rows.reduce((sum, row) => sum + Math.max(0, Number(row?.points || 0)), 0);
      }
    } catch (_) {
    } finally {
      state.loadingXp = false;
      notifyHome();
    }
  }

  function findTopbarStreakBox() {
    const right = document.querySelector('.topbar-right');
    if (!right) return null;
    return Array.from(right.querySelectorAll('button,div,span')).find(element => {
      if (element.classList.contains('fixa-streak-freeze-box')) return false;
      return /^\s*[^\d]*\d+\s+dias?\s*$/i.test((element.textContent || '').trim());
    }) || right.querySelector('[class*=streak], [class*=sequence]');
  }

  function matchFreezeToStreak(box, streakBox) {
    if (!box || !streakBox) return;
    const rect = streakBox.getBoundingClientRect();
    const css = getComputedStyle(streakBox);
    if (!rect.width || !rect.height) return;

    box.style.setProperty('width', `${rect.width}px`, 'important');
    box.style.setProperty('min-width', `${rect.width}px`, 'important');
    box.style.setProperty('max-width', `${rect.width}px`, 'important');
    box.style.setProperty('height', `${rect.height}px`, 'important');
    box.style.setProperty('min-height', `${rect.height}px`, 'important');
    box.style.setProperty('max-height', `${rect.height}px`, 'important');
    box.style.setProperty('padding', css.padding, 'important');
    box.style.setProperty('border-radius', css.borderRadius, 'important');
    box.style.setProperty('font-size', css.fontSize, 'important');
    box.style.setProperty('font-weight', css.fontWeight, 'important');
    box.style.setProperty('line-height', css.lineHeight, 'important');
    box.style.setProperty('box-sizing', css.boxSizing, 'important');
  }

  function ensureProtectionStyle() {
    if (document.getElementById('fixaHomeProtectionDataStyle')) return;
    const style = document.createElement('style');
    style.id = 'fixaHomeProtectionDataStyle';
    style.textContent = `
      .fixa-streak-freeze-box{height:38px;border:1px solid #c8dcff;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:#1d4ed8;background:#edf5ff;font-size:11px;font-weight:850;box-shadow:none;white-space:nowrap;box-sizing:border-box}
      .fixa-streak-freeze-box img{width:18px;height:24px;object-fit:contain;display:block}
      .fixa-streak-freeze-box:hover{background:#e7f1ff;border-color:#b8d1ff}
    `;
    document.head.appendChild(style);
  }

  function renderProtectionBox() {
    ensureProtectionStyle();
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    const streakBox = findTopbarStreakBox();
    let box = right.querySelector('.fixa-streak-freeze-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'fixa-streak-freeze-box';
      box.title = 'Proteção de sequência';
      if (streakBox?.parentElement) streakBox.parentElement.insertBefore(box, streakBox);
      else right.prepend(box);
    }
    box.innerHTML = `<img src="${FROZEN_FIRE_SRC}" alt=""><span>${Math.max(0, Number(state.protection?.available || 0))}</span>`;
    requestAnimationFrame(() => matchFreezeToStreak(box, findTopbarStreakBox()));
  }

  async function syncProtection() {
    if (state.syncingProtection || !getUserId() || !getClient()) return;
    state.syncingProtection = true;
    try {
      const { data: result } = await rpc('sync_streak_protection', {});
      if (result) state.protection = result;
    } catch (_) {
    } finally {
      state.syncingProtection = false;
      renderProtectionBox();
      notifyHome();
    }
  }

  function goalValues() {
    return Array.from(document.querySelectorAll('#homeGoals .fixa-week-goal')).map((card, index) => {
      const small = card.querySelector('small')?.textContent || '';
      const match = small.match(/(\d+)\s*\/\s*(\d+)/);
      return {
        index,
        current: Number(match?.[1] || 0),
        target: Number(match?.[2] || 0),
        reward: [20, 25, 40][index] || 20
      };
    });
  }

  async function awardCompletedGoals() {
    if (state.awardingGoals || !getUserId() || !getClient()) return;
    state.awardingGoals = true;
    try {
      const range = currentRange();
      const keyBase = `${range.period}:${localDateKey(range.start)}`;
      for (const goal of goalValues()) {
        if (!goal.target || goal.current < goal.target) continue;
        await rpc('record_user_xp', {
          p_event_type: 'weekly_goal',
          p_source_key: `home-goal:${keyBase}:${goal.index}`,
          p_occurred_on: localDateKey(new Date()),
          p_folder_id: null,
          p_folder_name: null,
          p_subject_ids: [],
          p_metadata: { reward_points: goal.reward, goal_index: goal.index }
        });
      }
    } catch (_) {
    } finally {
      state.awardingGoals = false;
      await loadWeekXp();
    }
  }

  async function refreshData() {
    renderProtectionBox();
    await Promise.all([loadWeekXp(), syncProtection()]);
    await awardCompletedGoals();
    queueXpCardPolish();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"],#homeTopTab,[data-fixa-week-period]')) {
      queueXpCardPolish();
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#fixaWeekFolderFilter')) queueXpCardPolish();
  }, true);

  window.addEventListener('fixa-xp-updated', loadWeekXp);
  window.addEventListener('load', refreshData, { once: true });
  renderProtectionBox();
  queueXpCardPolish();
  refreshData();
})();