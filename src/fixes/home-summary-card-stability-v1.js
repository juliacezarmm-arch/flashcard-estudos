(() => {
  'use strict';
  if (window.FixaHomeSummaryCardStabilityV1) return;
  window.FixaHomeSummaryCardStabilityV1 = true;

  const innerHtmlDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (!innerHtmlDescriptor?.get || !innerHtmlDescriptor?.set) return;

  function labelOf(card) {
    return card?.querySelector('strong')?.textContent?.trim() || '';
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
    if (!label || label !== labelOf(current)) return false;

    if (!updateText(current, 'strong', incoming)) return false;
    if (!updateText(current, '.home-card-number', incoming)) return false;
    updateText(current, 'small', incoming);
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
      return;
    }

    const updated = incoming.every((card, index) => updateCardInPlace(current[index], card));
    if (!updated) innerHtmlDescriptor.set.call(grid, html);
  }

  function patchGrid() {
    const grid = document.querySelector('#homeSummaryCards');
    if (!grid || grid.dataset.fixaStableSummaryPatched === '1') return Boolean(grid);

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
    return true;
  }

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
