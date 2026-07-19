/**
 * ContentOS - Theme Utility
 * Manages light/dark theme persistence and updates the data-theme attribute on <body>.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var STORAGE_KEY = 'contentos:theme';

  App.theme = {
    /**
     * Get current theme setting.
     * @returns {string} 'dark' or 'light'
     */
    getTheme: function () {
      return App.storage.get(STORAGE_KEY, 'dark');
    },

    /**
     * Set active theme and apply to document body.
     * @param {string} themeName 'dark' or 'light'
     */
    setTheme: function (themeName) {
      var validTheme = themeName === 'light' ? 'light' : 'dark';
      App.storage.set(STORAGE_KEY, validTheme);
      document.body.setAttribute('data-theme', validTheme);
      document.documentElement.setAttribute('data-theme', validTheme);
      return validTheme;
    },

    /**
     * Synchronously apply stored theme.
     */
    initTheme: function () {
      var theme = this.getTheme();
      document.body.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  };
})(window.ContentOS);
