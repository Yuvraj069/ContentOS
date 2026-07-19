/**
 * ContentOS - Main Application Entry Point
 * Boots app shell on DOM ready.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (App.appShell && typeof App.appShell.init === 'function') {
      App.appShell.init();
    } else {
      console.error('ContentOS: App.appShell missing or uninitialized.');
    }
  });
})(window.ContentOS);
