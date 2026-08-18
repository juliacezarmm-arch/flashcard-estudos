(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV1?.active) return;

  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const state = {
    protection: { available: 0, maximum: 3, protected_days: [] },
    weekXp: 0,
    syncingProtection: false,
    loadingXp: false,
    awardingGoals: false,
    toastQueue: [],
    toastActive: false
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

  function normalizedDateKey(value) {
    const exact = typeof value === 'string' ? value.trim() : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(exact)) return exact;
    const date = value instanceof Date ? value : new Date(value || 0);
    return Number.isNaN(date.getTime()) ? '' : localDateKey(date);
  }

  function protectedDaySet() {
    const values = Array.isArray(state.protection?.protected_days) ? state.protection.protected_days : [];
    return new Set(values.map(normalizedDateKey).filter(Boolean));
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

  // O visual dos cards de XP pertence exclusivamente ao renderizador principal da Home.
  // Este módulo cuida apenas dos dados de XP/proteção e não reescreve mais títulos, cores ou números.
  function queueXpCardPolish() {}

  function removeGoalChooser() {
    document.querySelectorAll('[data-fixa-add-goals]').forEach(button => button.remove());
  }

  function applyProtectedCalendarVisuals() {
    const protectedDays = protectedDaySet();
    const weekStart = startOfWeek(new Date());

    document.querySelectorAll('.home-sequence-days').forEach(container => {
      const days = Array.from(container.querySelectorAll('.home-sequence-day')).slice(0, 7);
      days.forEach((element, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = localDateKey(date);
        const isProtected = protectedDays.has(key);
        element.classList.toggle('is-protected', isProtected);
        if (!isProtected) return;
        element.classList.remove('is-lost', 'is-study');
        const label = `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)}: sequência protegida`;
        element.title = label;
        element.setAttribute('aria-label', label);
      });
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    document.querySelectorAll('#homeStreakPopover .home-streak-day:not(.is-empty)').forEach(element => {
      const day = Number((element.textContent || '').trim());
      if (!Number.isInteger(day) || day < 1 || day > 31) return;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isProtected = protectedDays.has(key);
      element.classList.toggle('is-protected', isProtected);
      if (isProtected) element.classList.remove('is-study');
    });

    const streak = Number(window.FixaSequenceVisualFix?.count?.());
    if (Number.isFinite(streak)) {
      document.querySelectorAll('.home-sequence-summary strong').forEach(element => {
        element.textContent = String(streak);
      });
    }
  }

  function notifyHome() {
    if (typeof window.FixaHomeWeeklyDashboardV2?.refresh === 'function') {
      window.FixaHomeWeeklyDashboardV2.refresh();
    }
    if (typeof window.FixaHomeUnifiedDashboardV2?.refresh === 'function') {
      window.FixaHomeUnifiedDashboardV2.refresh();
    }
    removeGoalChooser();
    requestAnimationFrame(() => {
      applyProtectedCalendarVisuals();
      window.FixaSequenceVisualFix?.refresh?.();
    });
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

    const streakText = Array.from(streakBox.querySelectorAll('span,b,strong')).find(element =>
      /\d+\s+dias?/i.test((element.textContent || '').trim())
    ) || streakBox;
    const streakTextCss = getComputedStyle(streakText);
    const freezeCount = box.querySelector('span');
    if (freezeCount) {
      freezeCount.style.setProperty('font-size', streakTextCss.fontSize, 'important');
      freezeCount.style.setProperty('font-weight', streakTextCss.fontWeight, 'important');
      freezeCount.style.setProperty('line-height', streakTextCss.lineHeight, 'important');
    }
  }

  function ensureProtectionStyle() {
    if (document.getElementById('fixaHomeProtectionDataStyle')) return;
    const style = document.createElement('style');
    style.id = 'fixaHomeProtectionDataStyle';
    style.textContent = `
      [data-fixa-add-goals]{display:none!important}
      .fixa-streak-help{position:relative;width:0;height:38px;display:block;flex:0 0 0;overflow:visible;z-index:271}
      .fixa-streak-help-button{position:absolute;right:10px;top:0;width:38px;height:38px;padding:0;border:1px solid #bfd4ff;border-radius:50%;display:inline-grid;place-items:center;background:#fff;color:#1d4ed8;font-size:16px;font-weight:850;line-height:1;box-shadow:0 2px 8px rgba(37,99,235,.08);cursor:pointer;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease}
      .fixa-streak-help-button:hover,.fixa-streak-help-button[aria-expanded="true"]{border-color:#93b7ff;background:#f6f9ff;color:#1746a2;box-shadow:0 4px 12px rgba(37,99,235,.12)}
      .fixa-streak-help-popover{position:absolute;z-index:270;top:48px;right:10px;width:min(320px,calc(100vw - 24px));padding:14px 15px;border:1px solid #dbe6f5;border-radius:12px;background:#fff;color:#334155;box-shadow:0 16px 40px rgba(15,23,42,.16);font-size:12px;line-height:1.5;text-align:left}
      .fixa-streak-help-popover[hidden]{display:none!important}
      .fixa-streak-help-popover h4{margin:0 0 9px;color:#172033;font-size:14px;line-height:1.25}
      .fixa-streak-help-popover ul{margin:0;padding-left:18px;display:grid;gap:6px}
      .fixa-streak-help-popover strong{color:#1d4ed8}
      .fixa-panel-help-bg{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:rgba(15,23,42,.38);backdrop-filter:blur(3px)}
      .fixa-panel-help-modal{position:relative;width:min(700px,calc(100vw - 32px));max-height:min(88vh,760px);overflow:auto;padding:34px 38px 34px;border:1px solid #e1e8f2;border-radius:20px;background:#fff;color:#172033;box-shadow:0 28px 80px rgba(15,23,42,.24)}
      .fixa-panel-help-close{position:absolute;top:16px;right:18px;width:36px;height:36px;border:0;border-radius:10px;display:grid;place-items:center;background:transparent;color:#475569;font-size:27px;line-height:1;cursor:pointer}
      .fixa-panel-help-close:hover{background:#f1f5f9;color:#172033}
      .fixa-panel-help-head{text-align:center;padding:0 30px}
      .fixa-panel-help-mark{width:58px;height:58px;margin:0 auto 12px;border:2px solid #2563eb;border-radius:50%;display:grid;place-items:center;color:#2563eb;font-size:27px;font-weight:800}
      .fixa-panel-help-head h3{margin:0;color:#172033;font-size:24px;line-height:1.2}
      .fixa-panel-help-head p{margin:8px 0 0;color:#64748b;font-size:13px;line-height:1.5}
      .fixa-panel-help-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:28px 0 18px}
      .fixa-panel-help-tab{min-height:50px;padding:8px 12px;border:1px solid #d7e2f2;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#172033;font-size:13px;font-weight:800;cursor:pointer;box-shadow:none}
      .fixa-panel-help-tab:hover{background:#f8fafc;border-color:#c6d5e8}
      .fixa-panel-help-tab.active{border-color:#2563eb;background:#f4f8ff;color:#1d4ed8;box-shadow:0 0 0 1px rgba(37,99,235,.05)}
      .fixa-panel-help-tab svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .fixa-panel-help-content{min-height:246px;padding:26px 28px;border:1px solid #cfe0ff;border-radius:14px;background:#fbfdff}
      .fixa-panel-help-topic-head{display:flex;align-items:center;gap:16px;margin-bottom:18px}
      .fixa-panel-help-topic-icon{width:54px;height:54px;border:1px solid #cfe0ff;border-radius:50%;display:grid;place-items:center;background:#f4f8ff;color:#2563eb;flex:0 0 54px}
      .fixa-panel-help-topic-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .fixa-panel-help-topic-head h4{margin:0;font-size:20px;color:#172033}
      .fixa-panel-help-copy{color:#334155;font-size:14px;line-height:1.65}
      .fixa-panel-help-copy p{margin:0 0 12px}
      .fixa-panel-help-copy p:last-child{margin-bottom:0}
      .fixa-panel-help-copy ul{margin:0;padding-left:20px;display:grid;gap:8px}
      .fixa-panel-help-copy strong{color:#1d4ed8}
      .fixa-panel-help-tip{margin-top:18px;padding:14px 16px;border:1px solid #d9e6ff;border-radius:12px;background:#f3f7ff;color:#334155;font-size:13px;line-height:1.5}
      .fixa-panel-help-tip strong{color:#1d4ed8}
      .fixa-streak-freeze-box{height:38px;border:1px solid #c8dcff;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#1d4ed8;background:#edf5ff;font-size:13px;font-weight:850;box-shadow:none;white-space:nowrap;box-sizing:border-box}
      .fixa-streak-freeze-box img{width:18px;height:18px;object-fit:contain;display:block;flex:0 0 18px}
      .fixa-streak-freeze-box span{font-size:13px;font-weight:850;line-height:1}
      .fixa-streak-freeze-box:hover{background:#e7f1ff;border-color:#b8d1ff}
      .home-sequence-day.is-protected i,[data-home-panel="progress"] .home-sequence-day.is-protected i{border-color:#3b82f6!important;background:#2563eb!important;color:#fff!important}
      .home-sequence-day.is-protected i>*,[data-home-panel="progress"] .home-sequence-day.is-protected i>*{display:none!important}
      .home-sequence-day.is-protected i::before,[data-home-panel="progress"] .home-sequence-day.is-protected i::before{content:'❄';display:block;color:#fff;font-size:15px;font-weight:800;line-height:1}
      .home-streak-day.is-protected{background:#2563eb!important;color:#fff!important;font-weight:800!important}
      .home-streak-day.is-protected.is-today{outline-color:#1d4ed8!important;color:#fff!important}
      .fixa-streak-protection-toast{position:fixed;z-index:220;top:18px;left:50%;max-width:min(92vw,520px);padding:11px 15px;border:1px solid #bfdbfe;border-radius:10px;color:#1e3a8a;background:#eff6ff;box-shadow:0 12px 32px rgba(15,23,42,.16);font-size:13px;font-weight:750;line-height:1.4;text-align:center;opacity:0;pointer-events:none;transform:translate(-50%,-8px);transition:opacity .18s ease,transform .18s ease}
      .fixa-streak-protection-toast.is-visible{opacity:1;transform:translate(-50%,0)}
      @media(max-width:760px){.fixa-streak-protection-toast{top:12px;font-size:12px;padding:10px 12px}.fixa-streak-help-popover{right:-78px}.fixa-panel-help-bg{padding:12px}.fixa-panel-help-modal{width:calc(100vw - 24px);padding:28px 18px 22px;border-radius:16px}.fixa-panel-help-head h3{font-size:21px}.fixa-panel-help-tabs{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:22px}.fixa-panel-help-content{min-height:0;padding:20px 18px}.fixa-panel-help-topic-head{align-items:flex-start}.fixa-panel-help-copy{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function closeProtectionHelp() {
    const help = document.querySelector('.fixa-streak-help');
    const button = help?.querySelector('.fixa-streak-help-button');
    const popover = help?.querySelector('.fixa-streak-help-popover');
    if (popover) popover.hidden = true;
    document.querySelector('#fixaPanelHelpModal')?.remove();
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  const HELP_ICONS = {
    sequence:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>',
    protection:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.9 8.1 7 10 4.1-1.9 7-5.3 7-10V6l-7-3Z"></path><path d="M12 8v6M9.5 11h5"></path></svg>',
    xp:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="m9 9 6 6M15 9l-6 6"></path></svg>',
    goals:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle></svg>'
  };

  function helpTopicMarkup(topic) {
    if (topic === 'protection') {
      return `<div class="fixa-panel-help-topic-head"><div class="fixa-panel-help-topic-icon">${HELP_ICONS.protection}</div><h4>Proteção</h4></div><div class="fixa-panel-help-copy"><ul><li>Você ganha <strong>1 proteção a cada 4 dias consecutivos</strong> estudando.</li><li>É possível acumular no máximo <strong>3 proteções</strong>.</li><li>Se perder um dia, <strong>1 proteção é usada automaticamente</strong> e sua sequência continua.</li><li>O dia salvo pela proteção aparece em <strong>azul</strong> no calendário.</li><li>Completar <strong>100% dos objetivos da semana</strong> também pode conceder +1 proteção, respeitando o limite de 3.</li></ul></div><div class="fixa-panel-help-tip"><strong>Dica:</strong> o número ao lado do fogo gelado mostra quantas proteções você tem disponíveis.</div>`;
    }
    if (topic === 'xp') {
      return `<div class="fixa-panel-help-topic-head"><div class="fixa-panel-help-topic-icon">${HELP_ICONS.xp}</div><h4>XP</h4></div><div class="fixa-panel-help-copy"><p>XP são os pontos que registram seu progresso de estudo dentro do Fixa.</p><p><strong>XP Coleções</strong> mostra o total acumulado ligado às suas coleções, enquanto <strong>XP Semana</strong> mostra o que foi conquistado na semana atual.</p><p>Resolver testes, cumprir objetivos e outras atividades elegíveis podem acrescentar XP.</p></div><div class="fixa-panel-help-tip"><strong>Dica:</strong> use o XP semanal para acompanhar o ritmo da semana sem confundir com o acumulado geral.</div>`;
    }
    if (topic === 'goals') {
      return `<div class="fixa-panel-help-topic-head"><div class="fixa-panel-help-topic-icon">${HELP_ICONS.goals}</div><h4>Objetivos</h4></div><div class="fixa-panel-help-copy"><p>Os objetivos da semana acompanham metas como <strong>resolver questões</strong>, <strong>fazer testes</strong> e <strong>dominar questões</strong>.</p><p>Cada objetivo mostra o progresso atual e a recompensa de XP correspondente.</p><p>Ao completar <strong>100% dos objetivos da semana</strong>, você também pode ganhar +1 proteção, respeitando o limite máximo de 3.</p></div><div class="fixa-panel-help-tip"><strong>Dica:</strong> o card “Objetivo da semana” resume o progresso geral das metas semanais.</div>`;
    }
    return `<div class="fixa-panel-help-topic-head"><div class="fixa-panel-help-topic-icon">${HELP_ICONS.sequence}</div><h4>Sequência</h4></div><div class="fixa-panel-help-copy"><p>A sequência mostra quantos dias consecutivos você manteve atividade de estudo.</p><p>Quando um dia é salvo por uma proteção disponível, ele continua contando para manter a sequência e aparece em <strong>azul</strong> no calendário.</p></div><div class="fixa-panel-help-tip"><strong>Dica:</strong> manter a sequência ativa ajuda a visualizar sua constância de estudo ao longo dos dias.</div>`;
  }

  function openPanelHelp() {
    ensureProtectionStyle();
    if (document.querySelector('#fixaPanelHelpModal')) {
      closeProtectionHelp();
      return;
    }

    const bg = document.createElement('div');
    bg.id = 'fixaPanelHelpModal';
    bg.className = 'fixa-panel-help-bg';
    bg.innerHTML = `<section class="fixa-panel-help-modal" role="dialog" aria-modal="true" aria-labelledby="fixaPanelHelpTitle"><button class="fixa-panel-help-close" type="button" aria-label="Fechar ajuda">×</button><div class="fixa-panel-help-head"><div class="fixa-panel-help-mark">?</div><h3 id="fixaPanelHelpTitle">Ajuda do painel</h3><p>Entenda como funcionam os indicadores do seu progresso.</p></div><div class="fixa-panel-help-tabs" role="tablist" aria-label="Tópicos da ajuda"><button class="fixa-panel-help-tab active" type="button" role="tab" aria-selected="true" data-fixa-help-topic="sequence">${HELP_ICONS.sequence}<span>Sequência</span></button><button class="fixa-panel-help-tab" type="button" role="tab" aria-selected="false" data-fixa-help-topic="protection">${HELP_ICONS.protection}<span>Proteção</span></button><button class="fixa-panel-help-tab" type="button" role="tab" aria-selected="false" data-fixa-help-topic="xp">${HELP_ICONS.xp}<span>XP</span></button><button class="fixa-panel-help-tab" type="button" role="tab" aria-selected="false" data-fixa-help-topic="goals">${HELP_ICONS.goals}<span>Objetivos</span></button></div><div class="fixa-panel-help-content" data-fixa-help-content>${helpTopicMarkup('sequence')}</div></section>`;
    document.body.appendChild(bg);

    const helpButton = document.querySelector('.fixa-streak-help-button');
    helpButton?.setAttribute('aria-expanded', 'true');

    const close = () => {
      bg.remove();
      helpButton?.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
    };
    const onKeydown = event => {
      if (event.key === 'Escape') close();
    };

    bg.querySelector('.fixa-panel-help-close')?.addEventListener('click', close);
    bg.addEventListener('click', event => {
      if (event.target === bg) close();
    });
    bg.querySelectorAll('[data-fixa-help-topic]').forEach(tab => {
      tab.addEventListener('click', () => {
        const topic = tab.dataset.fixaHelpTopic || 'sequence';
        bg.querySelectorAll('[data-fixa-help-topic]').forEach(item => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const content = bg.querySelector('[data-fixa-help-content]');
        if (content) content.innerHTML = helpTopicMarkup(topic);
      });
    });
    document.addEventListener('keydown', onKeydown);
  }

  function ensureProtectionHelp(right, freezeBox) {
    if (!right || !freezeBox) return;
    let help = right.querySelector('.fixa-streak-help');
    if (!help) {
      help = document.createElement('div');
      help.className = 'fixa-streak-help';
      help.innerHTML = `<button class="fixa-streak-help-button" type="button" aria-label="Ajuda do painel" aria-expanded="false" aria-controls="fixaPanelHelpModal">?</button>`;
      help.querySelector('.fixa-streak-help-button')?.addEventListener('click', openPanelHelp);
    }
    if (freezeBox.parentElement && help.parentElement === freezeBox.parentElement) {
      freezeBox.parentElement.insertBefore(help, freezeBox);
    } else if (freezeBox.parentElement) {
      freezeBox.parentElement.insertBefore(help, freezeBox);
    }
  }

  function ensureProtectionToast() {
    ensureProtectionStyle();
    let toast = document.querySelector('#fixaStreakProtectionToast');
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'fixaStreakProtectionToast';
    toast.className = 'fixa-streak-protection-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toast);
    return toast;
  }

  function runProtectionToastQueue() {
    if (state.toastActive || !state.toastQueue.length) return;
    const message = state.toastQueue.shift();
    const toast = ensureProtectionToast();
    state.toastActive = true;
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        state.toastActive = false;
        runProtectionToastQueue();
      }, 220);
    }, 2600);
  }

  function queueProtectionToast(message) {
    if (!message) return;
    state.toastQueue.push(message);
    runProtectionToastQueue();
  }

  function showProtectionFeedback(result) {
    const awards = Array.isArray(result?.awarded_events) ? result.awarded_events : [];
    const usedDays = Array.isArray(result?.used_days) ? result.used_days : [];
    const events = [
      ...awards.map(item => ({
        type: 'award',
        date: normalizedDateKey(item?.occurred_on),
        message: `Você ganhou uma proteção de sequência — ${Math.max(0, Number(item?.available || 0))} de ${Math.max(1, Number(item?.maximum || 3))}`
      })),
      ...usedDays.map(value => ({
        type: 'used',
        date: normalizedDateKey(value),
        message: 'Proteção utilizada — sua sequência foi mantida'
      }))
    ].sort((a, b) => a.date.localeCompare(b.date) || (a.type === 'award' ? -1 : 1));

    events.forEach(event => queueProtectionToast(event.message));
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
    ensureProtectionHelp(right, box);
    box.innerHTML = `<img src="${FROZEN_FIRE_SRC}" alt=""><span>${Math.max(0, Number(state.protection?.available || 0))}</span>`;
    requestAnimationFrame(() => matchFreezeToStreak(box, findTopbarStreakBox()));
  }

  async function syncProtection() {
    if (state.syncingProtection || !getUserId() || !getClient()) return;
    state.syncingProtection = true;
    try {
      const { data: result } = await rpc('sync_streak_protection', {});
      if (result) {
        state.protection = {
          available: Math.max(0, Number(result.available || 0)),
          maximum: Math.max(1, Number(result.maximum || 3)),
          protected_days: Array.isArray(result.protected_days) ? result.protected_days : []
        };
        showProtectionFeedback(result);
      }
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
      const goals = goalValues();
      for (const goal of goals) {
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

      const weeklyComplete = range.period === 'week'
        && goals.length >= 3
        && goals.every(goal => goal.target > 0 && goal.current >= goal.target);

      if (weeklyComplete) {
        const { data: reward } = await rpc('award_streak_freeze', {
          p_source_key: `weekly-goal:${localDateKey(range.start)}`
        });
        if (reward) {
          state.protection = {
            available: Math.max(0, Number(reward.available || 0)),
            maximum: Math.max(1, Number(reward.maximum || 3)),
            protected_days: Array.isArray(reward.protected_days) ? reward.protected_days : []
          };
          if (reward.awarded) {
            queueProtectionToast(`Você ganhou uma proteção de sequência — ${state.protection.available} de ${state.protection.maximum}`);
          }
          renderProtectionBox();
          notifyHome();
        }
      }
    } catch (_) {
    } finally {
      state.awardingGoals = false;
      await loadWeekXp();
    }
  }

  async function refreshData() {
    renderProtectionBox();
    removeGoalChooser();
    await Promise.all([loadWeekXp(), syncProtection()]);
    await awardCompletedGoals();
    removeGoalChooser();
    requestAnimationFrame(applyProtectedCalendarVisuals);
  }

  window.addEventListener('fixa-xp-updated', loadWeekXp);
  window.addEventListener('load', refreshData, { once: true });
  document.addEventListener('click', event => {
    if (event.target.closest('#homeTopStreak')) {
      requestAnimationFrame(applyProtectedCalendarVisuals);
    }
    if (!event.target.closest('[data-view="home"], #homeTopTab, [data-fixa-main-tab], [data-fixa-week-period]')) return;
    requestAnimationFrame(() => {
      removeGoalChooser();
      applyProtectedCalendarVisuals();
    });
  }, true);
  renderProtectionBox();
  removeGoalChooser();
  refreshData();
})();