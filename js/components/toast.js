/**
 * ContentOS - Toast Notification Component
 * Displays auto-dismissing feedback toasts.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  var containerEl = null;

  function ensureContainer() {
    if (!containerEl || !document.body.contains(containerEl)) {
      containerEl = App.dom.createElement('div', { className: 'toast-container' });
      document.body.appendChild(containerEl);
    }
    return containerEl;
  }

  App.components.toast = {
    /**
     * Show a toast message.
     * @param {string} message
     * @param {string} [type='info'] 'success' | 'error' | 'info'
     * @param {number} [duration=3500] Duration in ms
     */
    show: function (message, type, duration) {
      type = type || 'info';
      duration = duration || 3500;

      var parent = ensureContainer();

      var iconSymbol = 'ℹ';
      if (type === 'success') iconSymbol = '✓';
      if (type === 'error') iconSymbol = '⚠';

      var toastEl = App.dom.createElement('div', { className: 'toast toast-' + type }, [
        App.dom.createElement('span', { className: 'toast-icon', textContent: iconSymbol }),
        App.dom.createElement('span', { className: 'toast-message', textContent: message })
      ]);

      parent.appendChild(toastEl);

      setTimeout(function () {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateY(8px)';
        toastEl.style.transition = 'all 0.25s ease-out';
        setTimeout(function () {
          if (toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
          }
        }, 250);
      }, duration);
    }
  };
})(window.ContentOS);
