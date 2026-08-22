(() => {
  'use strict';
  if (window.FixaHomeSummaryCardStabilityV1) return;
  window.FixaHomeSummaryCardStabilityV1 = true;

  const innerHtmlDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (!innerHtmlDescriptor?.get || !innerHtmlDescriptor?.set) return;

  const accuracyIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19V5M4 19h16"></path>
        <path d="m7 15 4-4 3 2 5-7"></path>
      </g>
    </svg>`;

  let normalizing = false;

  function ensureStyle() {
    if (document.getElementById('fixaHomeSummaryCardStabilityV1Style')) return;
    const style = document.createElement('style');
    style.id = 'fixaHomeSummaryCardStabilityV1Style';
    style.textContent = `
      #homeSummaryCards .fixa-week-summary-card.fixa-accuracy-summary-card {
        align-items: center !important;
      }
      #homeSummaryCards .fixa-week-summary-card.fixa-accuracy-summary-card .fixa-stable-accuracy-icon {
        display: grid !important;
        place-items: center !important;
        border-radius: 10px !important;
        color: #9333ea !important;
        background: #f7efff !important;
        overflow: hidden !important;
      }
      #homeSummaryCards .fixa-week-summary-card.fixa-accuracy-summary-card .fixa-stable-accuracy-icon svg {
        display: block !important;
        width: 21px !important;
        height: 21px !important;
      }
      @media (min-width: 1160px) {
        #homeSummaryCards .fixa-week-summary-card.fixa-accuracy-summary-card .fixa-stable-accuracy-icon {
          width: 40px !important;
          height: 40px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function labelOf(card) {
    return card?.querySelector('strong')?.textContent?.trim() || '';
  }

  function normalizeAccuracyCard(grid) {
    if (!grid || normalizing) return;
    const card = [...grid.querySelectorAll(':scope > .fixa-week-summary-card')]
      .find(item => labelOf(item) === 'Aproveitamento');
    if (!card) return;

    normalizing = true;
    try {
      card.classList.add('fixa-accuracy-summary-card');
      const target = card.querySelector('.fixa-week-summary-icon');
      if (!target) return;

      const needsIcon = target.dataset.fixaStableAccuracy !== '1' || Boolean(target.querySelector('img'));
      target.className = 'fixa-week-summary-icon purple fixa-stable-accuracy-icon';
      target.dataset.fixaStableAccuracy = '1';
      if (needsIcon) target.innerHTML = accuracyIcon;
    } finally {
      normalizing = false;
    }
  }

  function updateText(target, selector, source) {
    const current = target.querySelector(selector);
    const incoming = source.querySelector(selector);
    if (!current || !incoming) return false;
    if (current.textContent !== incoming.textContent) current.textContent = incoming.textContent;
    return true;
  }

  function updateCardInPlace(current, incoming) {
    const label = labelOf(incoming);
    const currentLabel = labelOf(current);
    if (!label || label !== currentLabel) return false;

    const keepAccuracy = label === 'Aproveitamento';
    const currentIcon = current.querySelector('.fixa-week-summary-icon');
    const incomingIcon = incoming.querySelector('.fixa-week-summary-icon');

    const classes = [...incoming.classList];
    if (keepAccuracy) classes.push('fixa-accuracy-summary-card');
    current.className = [...new Set(classes)].join(' ');

    if (!updateText(current, 'strong', incoming)) return false;
    if (!updateText(current, '.home-card-number', incoming)) return false;
    updateText(current, 'small', incoming);

    if (currentIcon && incomingIcon && !keepAccuracy) {
      const hasOriginalArt = Boolean(currentIcon.querySelector('img'));
      currentIcon.className = incomingIcon.className;
      if (hasOriginalArt) currentIcon.classList.add('fixa-original-summary-art');
    }

    return true;
  }

  function stableSet(grid, html) {
    const template = document.createElement('template');
    template.innerHTML = String(html ?? '');
    const incoming = [...template.content.children];
    const current = [...grid.children];

    const canReuse = incoming.length > 0
      && incoming.length === current.length
      && incoming.every((card, index) => labelOf(card) && labelOf(card) === labelOf(current[index]));

    if (!canReuse) {
      innerHtmlDescriptor.set.call(grid, html);
      normalizeAccuracyCard(grid);
      return;
    }

    const updated = incoming.every((card, index) => updateCardInPlace(current[index], card));
    if (!updated) innerHtmlDescriptor.set.call(grid, html);
    normalizeAccuracyCard(grid);
  }

  function patchGrid() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid) return false;

    if (grid.dataset.fixaStableSummaryPatched !== '1') {
      Object.defineProperty(grid, 'innerHTML', {
        configurable: true,
        enumerable: false,
        get() {
          return innerHtmlDescriptor.get.call(this);
        },
        set(value) {
          stableSet(this, value);
        }
      });
      grid.dataset.fixaStableSummaryPatched = '1';
    }

    normalizeAccuracyCard(grid);
    return true;
  }

  ensureStyle();
  patchGrid();

  let queued = false;
  const queuePatch = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      patchGrid();
    });
  };

  const observer = new MutationObserver(queuePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('fixa-cloud-data-loaded', queuePatch);
  window.addEventListener('load', queuePatch, { once: true });
})();
