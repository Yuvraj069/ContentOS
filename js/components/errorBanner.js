/**
 * ContentOS - Error Banner Component
 * Displays inline error notice with retry CTA.
 * Adheres strictly to Product Copy Rule (no technical jargon in UI).
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  App.components.errorBanner = {
    /**
     * Render an error banner element.
     * @param {string} message User-facing error message
     * @param {Function} [onRetry] Retry callback
     * @returns {HTMLElement}
     */
    render: function (message, onRetry) {
      var banner = App.dom.createElement('div', {
        className: 'error-banner',
        style: 'background:var(--danger-bg); border:1px solid rgba(239,68,68,0.3); color:var(--text); padding:16px; border-radius:var(--radius-card); display:flex; align-items:center; justify-content:space-between; gap:16px;'
      });

      var textWrap = App.dom.createElement('div', { style: 'display:flex; align-items:center; gap:12px;' }, [
        App.dom.createElement('span', { style: 'color:var(--danger); font-size:18px; font-weight:bold;', textContent: '⚠' }),
        App.dom.createElement('span', { style: 'font-size:var(--font-size-sm);', textContent: message || 'Something went wrong. Please try again.' })
      ]);

      banner.appendChild(textWrap);

      if (onRetry) {
        var retryBtn = App.dom.createElement('button', {
          className: 'btn btn-secondary',
          style: 'padding:4px 12px; font-size:var(--font-size-xs);',
          textContent: 'Try again',
          onclick: onRetry
        });
        banner.appendChild(retryBtn);
      }

      return banner;
    }
  };
})(window.ContentOS);
