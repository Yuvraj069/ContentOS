/* LocalStorage Utility */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.storage = {
    get: function (key, defaultValue) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) {
          return defaultValue !== undefined ? defaultValue : null;
        }
        return JSON.parse(raw);
      } catch (e) {
        return defaultValue !== undefined ? defaultValue : null;
      }
    },

    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },

    remove: function (key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Separates each handle's data by name only — not a security boundary. Anyone can log in as any handle and see that handle's data, since there's no password verification.
    getUserKey: function (baseKey) {
      var session = App.storage.get('contentos:session', null);
      var handle = session ? session.handle : 'guest';
      return baseKey + ':' + handle;
    }
  };
})(window.ContentOS);
