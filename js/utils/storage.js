/**
 * ContentOS - Storage Utility
 * Safe wrapper around localStorage and sessionStorage with defensive try/catch guards.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.storage = {
    /**
     * Retrieve an item from localStorage or sessionStorage.
     * @param {string} key
     * @param {*} [defaultValue=null]
     * @param {boolean} [useSession=false]
     * @returns {*}
     */
    get: function (key, defaultValue, useSession) {
      if (defaultValue === undefined) defaultValue = null;
      var store = useSession ? window.sessionStorage : window.localStorage;
      try {
        var raw = store.getItem(key);
        if (raw === null || raw === undefined) {
          return defaultValue;
        }
        return JSON.parse(raw);
      } catch (err) {
        console.warn('App.storage.get failed for key:', key, err);
        return defaultValue;
      }
    },

    /**
     * Set an item in localStorage or sessionStorage.
     * @param {string} key
     * @param {*} value
     * @param {boolean} [useSession=false]
     * @returns {boolean} True if write succeeded
     */
    set: function (key, value, useSession) {
      var store = useSession ? window.sessionStorage : window.localStorage;
      try {
        var serialized = JSON.stringify(value);
        store.setItem(key, serialized);
        return true;
      } catch (err) {
        console.warn('App.storage.set failed for key:', key, err);
        return false;
      }
    },

    /**
     * Remove an item from storage.
     * @param {string} key
     * @param {boolean} [useSession=false]
     * @returns {boolean}
     */
    remove: function (key, useSession) {
      var store = useSession ? window.sessionStorage : window.localStorage;
      try {
        store.removeItem(key);
        return true;
      } catch (err) {
        console.warn('App.storage.remove failed for key:', key, err);
        return false;
      }
    },

    /**
     * Clear all storage (used during workspace reset).
     */
    clearAll: function () {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
        return true;
      } catch (err) {
        console.warn('App.storage.clearAll failed:', err);
        return false;
      }
    }
  };
})(window.ContentOS);
