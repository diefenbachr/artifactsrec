/* Modal dialog controller.

   Markup contract:
     <button data-modal-open="releaseModal">Open</button>
     <div class="modal-backdrop" id="releaseModal" role="dialog"
          aria-modal="true" aria-labelledby="releaseModalTitle">
       <div class="modal">
         <button class="modal-close" data-modal-close aria-label="Close"></button>
         ...
       </div>
     </div>

   Closes on the close button, a click on the backdrop, or Escape.
   Traps Tab inside the dialog and restores focus to the trigger on close. */

(function () {
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var lastTrigger = null;
  var openModal = null;

  function focusable(modal) {
    return Array.prototype.filter.call(
      modal.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function open(modal, trigger) {
    lastTrigger = trigger || null;
    openModal = modal;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    var items = focusable(modal);
    var closeBtn = modal.querySelector('[data-modal-close]');
    (closeBtn || items[0] || modal).focus();
  }

  function close() {
    if (!openModal) return;
    openModal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
    openModal = null;
    lastTrigger = null;
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-modal-open]');
    if (trigger) {
      var modal = document.getElementById(trigger.getAttribute('data-modal-open'));
      if (modal) {
        e.preventDefault();
        open(modal, trigger);
      }
      return;
    }

    if (e.target.closest('[data-modal-close]')) {
      e.preventDefault();
      close();
      return;
    }

    // Click on the backdrop itself (not the dialog) closes
    if (openModal && e.target === openModal) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!openModal) return;

    if (e.key === 'Escape') {
      close();
      return;
    }

    if (e.key === 'Tab') {
      var items = focusable(openModal);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
