(() => {
  "use strict";

  const style = document.createElement("style");
  style.id = "fixaImportReviewCompactText";
  style.textContent = `
    .fixa-import-question {
      display: -webkit-box;
      max-height: calc(1.35em * 3);
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);

  function addTitles(root = document) {
    root.querySelectorAll?.(".fixa-import-question").forEach(item => {
      item.title = item.textContent.trim();
    });
  }

  addTitles();
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.matches?.(".fixa-import-question")) node.title = node.textContent.trim();
      addTitles(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
