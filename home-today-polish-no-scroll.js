/* Refina a tela Hoje, posiciona as ilustrações e elimina a rolagem no estado vazio desktop */
(() => {
  "use strict";

  if (window.FixaHomeTodayPolishNoScroll) return;

  const ASSETS = {
    study: "./referencias/home-revisar-prancheta.png",
    collections: "./referencias/home-revisoes-hoje.png"
  };

  const style = document.createElement("style");
  style.id = "fixaHomeTodayPolishNoScrollStyle";
  style.textContent = `
    [data-home-panel="today"] .home-study-card,
    [data-home-panel="today"] .home-collections-card,
    [data-home-panel="today"] .home-priority-panel {
      position: relative !important;
      overflow: hidden !important;
      border-radius: 14px !important;
      padding: 20px 22px !important;
    }

    [data-home-panel="today"] .home-study-card {
      padding-right: 132px !important;
    }

    [data-home-panel="today"] .home-collections-card {
      padding-right: 178px !important;
    }

    [data-home-panel="today"] .home-priority-panel {
      padding-right: 190px !important;
    }

    [data-home-panel="today"] .home-study-card h1,
    [data-home-panel="today"] .home-study-card h2,
    [data-home-panel="today"] .home-study-card h3,
    [data-home-panel="today"] .home-collections-card h1,
    [data-home-panel="today"] .home-collections-card h2,
    [data-home-panel="today"] .home-collections-card h3,
    [data-home-panel="today"] .home-priority-panel h1,
    [data-home-panel="today"] .home-priority-panel h2,
    [data-home-panel="today"] .home-priority-panel h3 {
      margin-top: 0 !important;
      margin-bottom: 8px !important;
      line-height: 1.22 !important;
    }

    [data-home-panel="today"] .home-study-card p,
    [data-home-panel="today"] .home-collections-card p,
    [data-home-panel="today"] .home-priority-panel p,
    [data-home-panel="today"] .home-muted {
      line-height: 1.48 !important;
    }

    [data-home-panel="today"] .home-empty-action {
      min-height: 39px !important;
      margin-top: 13px !important;
      padding: 9px 14px !important;
      border-radius: 10px !important;
      box-shadow: none !important;
    }

    .fixa-home-hidden-original-art {
      display: none !important;
    }

    .fixa-home-corner-art {
      position: absolute !important;
      z-index: 1 !important;
      display: block !important;
      object-fit: contain !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    .fixa-home-corner-art--study {
      width: 94px !important;
      height: 94px !important;
      top: 13px !important;
      right: 18px !important;
    }

    .fixa-home-corner-art--collections {
      width: 145px !important;
      height: 112px !important;
      top: 14px !important;
      right: 20px !important;
    }

    [data-home-panel="today"] .home-priority-panel img.fixa-priority-current-art {
      position: absolute !important;
      z-index: 1 !important;
      display: block !important;
      width: 154px !important;
      height: 116px !important;
      max-width: 154px !important;
      max-height: 116px !important;
      top: 20px !important;
      right: 20px !important;
      bottom: auto !important;
      left: auto !important;
      margin: 0 !important;
      object-fit: contain !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    [data-home-panel="today"] .fixa-home-upper-cards {
      gap: 14px !important;
    }

    @media (min-width: 1000px) and (min-height: 720px) {
      body.fixa-home-empty-dashboard {
        overflow: hidden !important;
      }

      body.fixa-home-empty-dashboard .fixa-home-scroll-host {
        overflow-x: hidden !important;
        overflow-y: hidden !important;
        overscroll-behavior: none !important;
        scrollbar-width: none !important;
      }

      body.fixa-home-empty-dashboard .fixa-home-scroll-host::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }

      body.fixa-home-empty-dashboard [data-home-panel="today"] {
        max-height: 100% !important;
        overflow: hidden !important;
        padding-bottom: 0 !important;
      }

      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-study-card,
      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-collections-card {
        min-height: 202px !important;
        height: 202px !important;
      }

      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-priority-panel {
        min-height: 178px !important;
        height: 178px !important;
      }

      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-empty-action {
        margin-top: 11px !important;
      }
    }

    @media (min-width: 1000px) and (min-height: 720px) and (max-height: 790px) {
      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-study-card,
      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-collections-card {
        min-height: 190px !important;
        height: 190px !important;
        padding-top: 17px !important;
        padding-bottom: 17px !important;
      }

      body.fixa-home-empty-dashboard [data-home-panel="today"] .home-priority-panel {
        min-height: 164px !important;
        height: 164px !important;
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }

      .fixa-home-corner-art--study {
        width: 86px !important;
        height: 86px !important;
      }

      .fixa-home-corner-art--collections {
        width: 132px !important;
        height: 102px !important;
      }

      [data-home-panel="today"] .home-priority-panel img.fixa-priority-current-art {
        width: 142px !important;
        height: 105px !important;
        top: 18px !important;
      }
    }

    @media (max-width: 999px), (max-height: 719px) {
      [data-home-panel="today"] .home-study-card,
      [data-home-panel="today"] .home-collections-card,
      [data-home-panel="today"] .home-priority-panel {
        height: auto !important;
        min-height: auto !important;
      }
    }

    @media (max-width: 720px) {
      [data-home-panel="today"] .home-study-card,
      [data-home-panel="today"] .home-collections-card,
      [data-home-panel="today"] .home-priority-panel {
        padding: 18px !important;
        padding-top: 116px !important;
      }

      .fixa-home-corner-art--study,
      .fixa-home-corner-art--collections,
      [data-home-panel="today"] .home-priority-panel img.fixa-priority-current-art {
        top: 14px !important;
        right: 18px !important;
      }
    }
  `;
  document.head.appendChild(style);

  function ensureCornerArt(panel, type, source, alt) {
    let image = panel.querySelector(`.fixa-home-corner-art[data-fixa-home-art="${type}"]`);
    if (!image) {
      image = document.createElement("img");
      image.className = `fixa-home-corner-art fixa-home-corner-art--${type}`;
      image.dataset.fixaHomeArt = type;
      image.src = source;
      image.alt = alt;
      image.loading = "eager";
      image.decoding = "async";
      panel.appendChild(image);
    }
    return image;
  }

  function hideOtherPanelImages(panel, preservedImage) {
    panel.querySelectorAll("img").forEach(image => {
      if (image === preservedImage) return;
      image.classList.add("fixa-home-hidden-original-art");
    });
  }

  function markPriorityImage(panel) {
    const candidates = [...panel.querySelectorAll("img")].filter(image => {
      if (image.classList.contains("home-empty-art")) return false;
      if (image.classList.contains("fixa-home-corner-art")) return false;
      return true;
    });

    const image = candidates[candidates.length - 1];
    if (!image) return null;
    image.classList.remove("fixa-home-hidden-original-art");
    image.classList.add("fixa-priority-current-art");
    return image;
  }

  function commonParent(first, second) {
    if (!first || !second) return null;
    let node = first.parentElement;
    while (node && node !== document.body) {
      if (node.contains(second)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function findScrollHost(panel) {
    const preferred = document.querySelector("#appShell main");
    if (preferred?.contains(panel)) return preferred;

    let node = panel.parentElement;
    while (node && node !== document.body) {
      const computed = getComputedStyle(node);
      if (/auto|scroll/.test(computed.overflowY)) return node;
      node = node.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function visible(element) {
    if (!element) return false;
    if (element.hidden) return false;
    const computed = getComputedStyle(element);
    return computed.display !== "none" && computed.visibility !== "hidden";
  }

  function applyHomePolish() {
    const todayPanel = document.querySelector('[data-home-panel="today"]');
    if (!todayPanel) return;

    const studyPanel = todayPanel.querySelector(".home-study-card");
    const collectionContainer = document.querySelector("#homeCollectionSummary");
    const collectionPanel = collectionContainer?.closest(".home-panel");
    const priorityContainer = document.querySelector("#homePriorities");
    const priorityPanel = priorityContainer?.closest(".home-priority-panel");

    if (collectionPanel) collectionPanel.classList.add("home-collections-card");

    if (studyPanel) {
      const image = ensureCornerArt(
        studyPanel,
        "study",
        ASSETS.study,
        "Prancheta com lista de revisão e lápis"
      );
      hideOtherPanelImages(studyPanel, image);
    }

    if (collectionPanel) {
      const image = ensureCornerArt(
        collectionPanel,
        "collections",
        ASSETS.collections,
        "Livro aberto com materiais de estudo"
      );
      hideOtherPanelImages(collectionPanel, image);
    }

    if (priorityPanel) markPriorityImage(priorityPanel);

    const upperCards = commonParent(studyPanel, collectionPanel);
    if (upperCards) upperCards.classList.add("fixa-home-upper-cards");

    document.querySelectorAll(".fixa-home-scroll-host").forEach(host => {
      if (!host.contains(todayPanel)) host.classList.remove("fixa-home-scroll-host");
    });

    const scrollHost = findScrollHost(todayPanel);
    scrollHost?.classList?.add("fixa-home-scroll-host");

    const allEmpty = Boolean(
      visible(todayPanel)
      && studyPanel?.classList.contains("is-home-empty")
      && collectionPanel?.classList.contains("is-home-empty")
      && priorityPanel?.classList.contains("is-home-empty")
    );

    document.body.classList.toggle("fixa-home-empty-dashboard", allEmpty);
    if (allEmpty && scrollHost && "scrollTop" in scrollHost) scrollHost.scrollTop = 0;
  }

  let queued = false;
  function queueApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyHomePolish();
    });
  }

  new MutationObserver(queueApply).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "style"]
  });

  window.addEventListener("resize", queueApply);
  window.addEventListener("load", queueApply);
  document.addEventListener("click", event => {
    if (event.target.closest('[data-home-tab], [data-view="home"], #homeTopTab')) queueApply();
  });

  queueApply();
  window.FixaHomeTodayPolishNoScroll = { apply: applyHomePolish };
})();
