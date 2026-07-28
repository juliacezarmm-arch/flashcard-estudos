(() => {
  "use strict";

  document.addEventListener("click", event => {
    const closeButton = event.target.closest?.(".category-modal-close");
    if (!closeButton) return;

    const modal = closeButton.closest("#actionModal");
    if (!modal) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    modal.classList.remove("category-manager-modal");

    if (typeof closeModal === "function") {
      closeModal();
      return;
    }

    modal.classList.remove("show");
    modal.hidden = true;
  }, true);
})();
