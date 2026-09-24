/* Redesign visual da aba Desempenho e objetivos.
   Não altera dados, metas nem regras de negócio; apenas apresentação e estrutura visual. */
(() => {
  'use strict';

  if (window.FixaHomePerformanceGoalsRedesignV1) return;
  window.FixaHomePerformanceGoalsRedesignV1 = true;

  const STYLE_ID = 'fixaHomePerformanceGoalsRedesignV1Style';

  function icon(type) {
    const icons = {
      performance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V10M12 19V5M19 19v-7"></path></svg>',
      review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"></path><path d="M9 10h6M9 14h6"></path></svg>',
      activity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6z"></path></svg>',
      priority: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"></path></svg>',
      status: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>',
      chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"></path><path d="M4 19h16"></path><path d="m7 15 4-4 3 2 5-6"></path></svg>'
    };
    return icons[type] || '';
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Desktop: a terceira caixa termina dentro da tela.
         Quando Desempenho excede a altura disponível, só a lista da coluna esquerda rola. */
      @media (min-width: 861px) {
        body.fixa-home-v3-active {
          overflow: hidden !important;
        }

        body.fixa-home-v3-active #appShell.app:not(.locked) > main {
          height: 100dvh !important;
          min-height: 0 !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          grid-template-rows: 56px minmax(0, 1fr) !important;
          align-content: stretch !important;
        }

        body.fixa-home-v3-active #home.home-view.active {
          height: 100% !important;
          min-height: 0 !important;
          overflow: hidden !important;
          padding-bottom: 16px !important;
        }

        #home.home-view .fixa-week-main-shell {
          height: var(--fixa-third-line-height, 430px) !important;
          min-height: 260px !important;
          max-height: var(--fixa-third-line-height, 430px) !important;
          overflow: hidden !important;
          border: 1px solid #dfe7f2 !important;
          border-radius: 16px !important;
          background: #f8fbff !important;
          box-shadow: 0 8px 28px rgba(15, 23, 42, .045) !important;
        }

        #home.home-view .fixa-week-main-stage {
          flex: 1 1 auto !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: hidden !important;
          padding: 14px 16px 16px !important;
        }

        #home.home-view .fixa-week-main-stage [data-fixa-main-panel]:not([hidden]) {
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: hidden !important;
        }

        #home.home-view [data-fixa-main-panel="performance-goals"]:not([hidden]) {
          display: grid !important;
          grid-template-columns: minmax(0, 1.02fr) minmax(0, .98fr) !important;
          gap: 18px !important;
          align-items: stretch !important;
        }

        #home.home-view [data-fixa-main-panel="performance-goals"] > .fixa-week-main-pane {
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: hidden !important;
          border: 1px solid #dce6f3 !important;
          border-radius: 16px !important;
          padding: 14px 18px 16px !important;
          background: #ffffff !important;
          box-shadow: 0 10px 28px rgba(15, 23, 42, .055) !important;
        }

        #home.home-view [data-fixa-main-panel="performance-goals"] > .fixa-week-performance-panel {
          display: flex !important;
          flex-direction: column !important;
        }

        #home.home-view [data-fixa-main-panel="performance-goals"] > .fixa-week-goals-panel {
          display: flex !important;
          flex-direction: column !important;
        }

        #home.home-view .fixa-week-performance-panel .fixa-week-performance-list {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow-y: scroll !important;
          overflow-x: hidden !important;
          padding-right: 7px !important;
          scrollbar-gutter: stable !important;
          scrollbar-width: thin !important;
          scrollbar-color: #aab5c6 #f4f7fb !important;
        }

        #home.home-view .fixa-week-performance-panel .fixa-week-performance-list::-webkit-scrollbar {
          width: 7px !important;
        }

        #home.home-view .fixa-week-performance-panel .fixa-week-performance-list::-webkit-scrollbar-track {
          background: #f4f7fb !important;
          border-radius: 999px !important;
        }

        #home.home-view .fixa-week-performance-panel .fixa-week-performance-list::-webkit-scrollbar-thumb {
          border-radius: 999px !important;
          background: #aab5c6 !important;
        }
      }

      /* Navegação interna inspirada na proposta visual aprovada. */
      #home.home-view .fixa-week-content-tabs {
        min-height: 58px !important;
        height: auto !important;
        padding: 8px 12px !important;
        gap: 7px !important;
        border-bottom: 1px solid #e5ebf4 !important;
        background: rgba(255,255,255,.92) !important;
        overflow-x: auto !important;
      }

      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab] {
        min-height: 42px !important;
        height: 42px !important;
        padding: 0 15px !important;
        border: 1px solid transparent !important;
        border-radius: 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        color: #53617a !important;
        background: transparent !important;
        font-size: 13px !important;
        font-weight: 760 !important;
        white-space: nowrap !important;
        box-shadow: none !important;
      }

      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab] svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.9 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab].active,
      #home.home-view .fixa-week-content-tabs [data-fixa-main-tab][aria-selected="true"] {
        color: #155be8 !important;
        border-color: #c9dcff !important;
        background: linear-gradient(180deg, #eef5ff 0%, #eaf2ff 100%) !important;
        box-shadow: inset 0 -2px 0 #3b82f6, 0 4px 12px rgba(37,99,235,.08) !important;
      }

      /* Cabeçalhos dos dois cartões. */
      #home.home-view [data-fixa-main-panel="performance-goals"] .home-panel-head {
        min-height: 52px !important;
        margin: 0 0 5px !important;
        padding: 0 !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
        gap: 12px !important;
        overflow: visible !important;
      }

      #home.home-view [data-fixa-main-panel="performance-goals"] .home-panel-head > .fixa-pg-title-wrap {
        min-width: 0 !important;
        display: grid !important;
        gap: 2px !important;
      }

      #home.home-view [data-fixa-main-panel="performance-goals"] .home-panel-head h3 {
        min-height: 0 !important;
        width: auto !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        color: #111c36 !important;
        background: transparent !important;
        font-size: 20px !important;
        line-height: 25px !important;
        font-weight: 850 !important;
        box-shadow: none !important;
      }

      #home.home-view [data-fixa-main-panel="performance-goals"] .home-panel-head h3 svg {
        width: 44px !important;
        height: 44px !important;
        padding: 10px !important;
        border-radius: 12px !important;
        box-sizing: border-box !important;
        color: #2563eb !important;
        background: #eef5ff !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
      }

      #home.home-view .fixa-pg-subtitle {
        margin: 0 !important;
        color: #6a7690 !important;
        padding-left: 56px !important;
        font-size: 11px !important;
        line-height: 14px !important;
        font-weight: 600 !important;
      }


      #home.home-view .fixa-pg-period-pill {
        min-height: 36px !important;
        height: 36px !important;
        padding: 0 12px !important;
        border: 1px solid #cfe0fb !important;
        border-radius: 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 7px !important;
        color: #4f6487 !important;
        background: #fbfdff !important;
        font-size: 10.5px !important;
        line-height: 1 !important;
        font-weight: 750 !important;
        white-space: nowrap !important;
        box-shadow: 0 2px 8px rgba(37,99,235,.04) !important;
      }

      #home.home-view .fixa-pg-period-pill svg {
        width: 16px !important;
        height: 16px !important;
        fill: none !important;
        stroke: #2563eb !important;
        stroke-width: 1.9 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #home.home-view .fixa-week-goals-panel .fixa-week-add-goals {
        min-height: 34px !important;
        height: 34px !important;
        padding: 0 11px !important;
        border: 1px solid #d6e3f6 !important;
        border-radius: 9px !important;
        color: #2563eb !important;
        background: #f8fbff !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        box-shadow: none !important;
        white-space: nowrap !important;
      }

      #home.home-view .fixa-week-goals-panel .fixa-week-add-goals:hover {
        border-color: #a9c5f5 !important;
        background: #eef5ff !important;
      }

      /* Desempenho recente. */
      #home.home-view .fixa-week-performance-list {
        margin: 0 !important;
        padding: 0 !important;
        display: grid !important;
        gap: 8px !important;
        list-style: none !important;
      }

      #home.home-view .fixa-week-performance-row {
        min-height: 64px !important;
        height: auto !important;
        border: 1px solid #e0e8f3 !important;
        border-radius: 12px !important;
        padding: 9px 11px !important;
        display: grid !important;
        grid-template-columns: minmax(0,1fr) auto !important;
        align-items: center !important;
        gap: 12px !important;
        color: #172033 !important;
        background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%) !important;
        box-shadow: 0 2px 8px rgba(15,23,42,.025) !important;
      }

      #home.home-view .fixa-week-performance-row > span {
        min-width: 0 !important;
        display: grid !important;
        grid-template-columns: 44px minmax(0,1fr) !important;
        grid-template-rows: auto auto !important;
        column-gap: 11px !important;
        row-gap: 1px !important;
        align-items: center !important;
        color: inherit !important;
        font-size: 0 !important;
      }

      #home.home-view .fixa-week-performance-row > span > i {
        grid-column: 1 !important;
        grid-row: 1 / span 2 !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        border-radius: 10px !important;
        display: grid !important;
        place-items: center !important;
        background: #eef5ff !important;
        color: #2563eb !important;
      }

      #home.home-view .fixa-week-performance-row > span > i.green {
        color: #059669 !important;
        background: #eafaf3 !important;
      }

      #home.home-view .fixa-week-performance-row > span > i.orange {
        color: #ea580c !important;
        background: #fff3e9 !important;
      }

      #home.home-view .fixa-week-performance-row > span > i svg {
        width: 20px !important;
        height: 20px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
      }

      #home.home-view .fixa-performance-label {
        grid-column: 2 !important;
        grid-row: 1 !important;
        min-width: 0 !important;
        color: #172033 !important;
        font-size: 13px !important;
        line-height: 16px !important;
        font-weight: 820 !important;
      }

      #home.home-view .fixa-performance-description {
        grid-column: 2 !important;
        grid-row: 2 !important;
        min-width: 0 !important;
        color: #77839a !important;
        font-size: 11px !important;
        line-height: 13px !important;
        font-style: normal !important;
        font-weight: 550 !important;
      }

      #home.home-view .fixa-week-performance-row > b {
        min-width: 86px !important;
        min-height: 32px !important;
        padding: 0 11px !important;
        border-radius: 999px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #2455b7 !important;
        background: #eef5ff !important;
        font-size: 10.5px !important;
        line-height: 1 !important;
        font-weight: 850 !important;
        white-space: nowrap !important;
      }

      #home.home-view .fixa-week-performance-row[data-tone="green"] > b {
        color: #047857 !important;
        background: #eafaf3 !important;
      }

      #home.home-view .fixa-week-performance-row[data-tone="orange"] > b {
        color: #c2410c !important;
        background: #fff1e6 !important;
      }

      /* Objetivos da semana. */
      #home.home-view .fixa-week-goal-list {
        margin: 0 !important;
        padding: 0 !important;
        display: grid !important;
        gap: 12px !important;
        list-style: none !important;
      }

      #home.home-view .fixa-week-goal {
        min-height: 96px !important;
        border: 1px solid #dfe7f2 !important;
        border-radius: 14px !important;
        padding: 10px 14px !important;
        display: grid !important;
        gap: 6px !important;
        background: linear-gradient(180deg, #fff 0%, #fbfdff 100%) !important;
        box-shadow: 0 3px 10px rgba(15,23,42,.03) !important;
      }

      #home.home-view .fixa-week-goal-head {
        min-width: 0 !important;
        display: grid !important;
        grid-template-columns: 40px minmax(0,1fr) auto !important;
        grid-template-rows: auto !important;
        align-items: center !important;
        gap: 10px !important;
      }

      #home.home-view .fixa-week-goal-head > i {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        border-radius: 11px !important;
        display: grid !important;
        place-items: center !important;
        color: #2563eb !important;
        background: #eef5ff !important;
      }

      #home.home-view .fixa-week-goal:nth-child(2) .fixa-week-goal-head > i {
        color: #7c3aed !important;
        background: #f5efff !important;
      }

      #home.home-view .fixa-week-goal:nth-child(3) .fixa-week-goal-head > i {
        color: #059669 !important;
        background: #eafaf3 !important;
      }

      #home.home-view .fixa-week-goal-head > i svg {
        width: 19px !important;
        height: 19px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
      }

      #home.home-view .fixa-week-goal-head > span {
        min-width: 0 !important;
        display: grid !important;
        gap: 2px !important;
      }

      #home.home-view .fixa-week-goal-head strong {
        color: #111c36 !important;
        font-size: 12.5px !important;
        line-height: 15px !important;
        font-weight: 850 !important;
      }

      #home.home-view .fixa-goal-description {
        color: #748098 !important;
        font-size: 9.5px !important;
        line-height: 12px !important;
        font-weight: 560 !important;
      }

      #home.home-view .fixa-week-goal-head small {
        margin-top: 2px !important;
        color: #334155 !important;
        font-size: 10px !important;
        line-height: 12px !important;
        font-weight: 750 !important;
      }

      #home.home-view .fixa-goal-reward {
        align-self: start !important;
        min-width: 64px !important;
        min-height: 28px !important;
        padding: 0 10px !important;
        border-radius: 999px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #7c3aed !important;
        background: #f3e8ff !important;
        font-size: 10px !important;
        line-height: 1 !important;
        font-weight: 850 !important;
        white-space: nowrap !important;
      }

      #home.home-view .fixa-goal-progress-line {
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        align-items: center !important;
        gap: 10px !important;
      }

      #home.home-view .fixa-week-goal .home-progress {
        height: 7px !important;
        min-height: 7px !important;
        border-radius: 999px !important;
        overflow: hidden !important;
        background: #e8eef7 !important;
      }

      #home.home-view .fixa-week-goal .home-progress > span {
        min-width: 8px !important;
        border-radius: inherit !important;
        background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
      }

      #home.home-view .fixa-goal-percent {
        min-width: 30px !important;
        color: #64748b !important;
        font-size: 10px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        text-align: right !important;
      }

      @media (max-width: 980px) {
        #home.home-view [data-fixa-main-panel="performance-goals"]:not([hidden]) {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 760px) {
        #home.home-view [data-fixa-main-panel="performance-goals"] > .fixa-week-main-pane {
          padding: 14px !important;
        }

        #home.home-view .fixa-week-performance-row {
          grid-template-columns: minmax(0,1fr) !important;
        }

        #home.home-view .fixa-week-performance-row > b {
          justify-self: start !important;
          margin-left: 48px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const performanceDescriptions = new Map([
    ['Média de acertos', 'Percentual de questões corretas'],
    ['Evolução em relação ao período anterior', 'Comparação com seus últimos estudos'],
    ['Questões respondidas', 'Total de questões que você resolveu'],
    ['Dias estudados', 'Quantidade de dias com atividade'],
    ['Média dos testes da semana', 'Desempenho médio nos testes'],
    ['Média dos testes de semana', 'Desempenho médio nos testes'],
    ['Média dos testes de hoje', 'Desempenho médio nos testes'],
    ['Média dos testes de mês', 'Desempenho médio nos testes'],
    ['Tempo médio por questão', 'Tempo que você leva para responder'],
    ['Melhor resultado', 'Seu maior percentual de acertos'],
    ['Acertos mais recentes', 'Seu desempenho nas últimas questões']
  ]);

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function decorateTabs() {
    const map = {
      'performance-goals': ['performance', 'Desempenho e objetivos'],
      'review-summary': ['review', 'Revisões e resumo'],
      'activities': ['activity', 'Atividades'],
      'priorities': ['priority', 'Prioridades'],
      'status': ['status', 'Status das questões'],
      'chart': ['chart', 'Gráfico de desempenho']
    };

    document.querySelectorAll('#home.home-view .fixa-week-content-tabs [data-fixa-main-tab]').forEach(button => {
      const item = map[button.dataset.fixaMainTab];
      if (!item) return;
      const [kind, label] = item;
      const current = normalizeText(button.textContent);
      if (current !== label || !button.querySelector('svg')) {
        button.innerHTML = icon(kind) + '<span>' + label + '</span>';
      }
    });
  }

  function decoratePanelHead(panel, type) {
    const head = panel?.querySelector(':scope > .home-panel-head');
    const h3 = head?.querySelector('h3');
    if (!head || !h3) return;

    let wrap = head.querySelector(':scope > .fixa-pg-title-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'fixa-pg-title-wrap';
      head.insertBefore(wrap, h3);
      wrap.appendChild(h3);
    }

    if (type === 'performance') {
      h3.innerHTML = icon('performance') + 'Desempenho recente';
      let subtitle = wrap.querySelector('.fixa-pg-subtitle');
      if (!subtitle) {
        subtitle = document.createElement('p');
        subtitle.className = 'fixa-pg-subtitle';
        wrap.appendChild(subtitle);
      }
      subtitle.textContent = 'Acompanhe sua evolução e principais métricas de estudo.';
    } else {
      h3.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M16 8l4-4M17 4h3v3"></path></svg>Objetivos da semana';
      let subtitle = wrap.querySelector('.fixa-pg-subtitle');
      if (!subtitle) {
        subtitle = document.createElement('p');
        subtitle.className = 'fixa-pg-subtitle';
        wrap.appendChild(subtitle);
      }
      subtitle.textContent = 'Conquiste seus objetivos e ganhe XP estudando.';
    }
  }

  function decoratePerformance() {
    const panel = document.querySelector('#home.home-view [data-fixa-main-panel="performance-goals"] .fixa-week-performance-panel');
    decoratePanelHead(panel, 'performance');

    document.querySelectorAll('#home.home-view .fixa-week-performance-row').forEach(row => {
      const holder = row.querySelector(':scope > span');
      const value = row.querySelector(':scope > b');
      if (!holder || !value) return;

      const iconEl = holder.querySelector(':scope > i');
      let label = holder.querySelector(':scope > .fixa-performance-label');
      let description = holder.querySelector(':scope > .fixa-performance-description');

      if (!label) {
        const raw = [...holder.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join(' ');
        const text = normalizeText(raw) || normalizeText(holder.textContent);
        holder.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        label = document.createElement('strong');
        label.className = 'fixa-performance-label';
        label.textContent = text;
        holder.appendChild(label);
      }

      if (!description) {
        description = document.createElement('em');
        description.className = 'fixa-performance-description';
        holder.appendChild(description);
      }

      const labelText = normalizeText(label.textContent);
      let desc = performanceDescriptions.get(labelText);
      if (!desc && labelText.startsWith('Média dos testes')) desc = 'Desempenho médio nos testes';
      description.textContent = desc || 'Indicador do seu desempenho no período';

      const tone = iconEl?.classList.contains('green')
        ? 'green'
        : iconEl?.classList.contains('orange')
          ? 'orange'
          : 'blue';
      row.dataset.tone = tone;
    });
  }

  function goalDescription(label) {
    const text = normalizeText(label).toLowerCase();
    if (text.startsWith('resolver questões')) return 'Resolva questões e avance no seu aprendizado.';
    if (text.startsWith('fazer testes')) return 'Realize testes completos para fixar o conteúdo.';
    if (text.startsWith('dominar questões')) return 'Acerte questões e domine os temas.';
    return 'Acompanhe seu progresso neste objetivo.';
  }


  function periodLabel() {
    const active = document.querySelector('#home.home-view [data-fixa-week-period].active');
    const key = active?.dataset.fixaWeekPeriod || 'week';
    if (key === 'today') return 'Hoje';
    if (key === 'month') return 'Este mês';
    return 'Esta semana';
  }

  function ensureGoalsPeriodPill(panel) {
    const head = panel?.querySelector(':scope > .home-panel-head');
    if (!head) return;

    let pill = head.querySelector(':scope > .fixa-pg-period-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'fixa-pg-period-pill';
      pill.setAttribute('aria-label', 'Período atual dos objetivos');
      head.appendChild(pill);
    }
    pill.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"></rect><path d="M8 3v6M16 3v6M4 10h16"></path></svg><span>' + periodLabel() + '</span>';
  }

  function decorateGoals() {
    const panel = document.querySelector('#home.home-view [data-fixa-main-panel="performance-goals"] .fixa-week-goals-panel');
    decoratePanelHead(panel, 'goals');
    ensureGoalsPeriodPill(panel);

    document.querySelectorAll('#home.home-view .fixa-week-goal').forEach(row => {
      const head = row.querySelector('.fixa-week-goal-head');
      const copy = head?.querySelector(':scope > span');
      const title = copy?.querySelector('strong');
      const progressText = copy?.querySelector('small');
      const progress = row.querySelector(':scope > .home-progress');
      if (!head || !copy || !title || !progress) return;

      let description = copy.querySelector('.fixa-goal-description');
      if (!description) {
        description = document.createElement('span');
        description.className = 'fixa-goal-description';
        title.insertAdjacentElement('afterend', description);
      }
      description.textContent = goalDescription(title.textContent);

      const match = normalizeText(progressText?.textContent).match(/(\d+)\s*\/\s*(\d+)/);
      const current = match ? Number(match[1]) : 0;
      const target = match ? Number(match[2]) : 0;
      const percent = target > 0 ? Math.max(0, Math.min(100, Math.round(current / target * 100))) : 0;

      let line = row.querySelector(':scope > .fixa-goal-progress-line');
      if (!line) {
        line = document.createElement('div');
        line.className = 'fixa-goal-progress-line';
        progress.insertAdjacentElement('beforebegin', line);
        line.appendChild(progress);
        const pct = document.createElement('span');
        pct.className = 'fixa-goal-percent';
        line.appendChild(pct);
      }
      const pct = line.querySelector('.fixa-goal-percent');
      if (pct) pct.textContent = percent + '%';
    });
  }

  let frame = 0;
  let decorating = false;

  function apply() {
    if (decorating) return;
    decorating = true;
    try {
      ensureStyle();
      decorateTabs();
      decoratePerformance();
      decorateGoals();
    } finally {
      decorating = false;
    }
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      apply();
    });
  }

  const root = document.querySelector('#home') || document.body;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('#home [data-fixa-main-tab], #home [data-fixa-week-period], #home .subject')) {
      requestAnimationFrame(schedule);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.closest('#home select')) requestAnimationFrame(schedule);
  }, true);

  window.addEventListener('fixa-cloud-data-loaded', schedule);
  window.addEventListener('load', schedule, { once: true });
  schedule();
})();
