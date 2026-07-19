/**
 * ContentOS - Planner Store Utility
 * CRUD operations over weekly planner items stored under key 'contentos:planner'.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var STORAGE_KEY = 'contentos:planner';

  App.plannerStore = {
    /**
     * Get all planner items. Ensures output is an Array.
     * @returns {Array}
     */
    getAll: function () {
      var data = App.storage.get(STORAGE_KEY, []);
      if (!Array.isArray(data)) {
        console.warn('App.plannerStore.getAll: Corrupted storage reset to empty array');
        data = [];
        App.storage.set(STORAGE_KEY, data);
      }
      return data;
    },

    /**
     * Add a planned item.
     * @param {Object} itemData { day, topic, format, dayPart }
     * @returns {Object} Created planned item
     */
    add: function (itemData) {
      var items = this.getAll();
      var newItem = {
        id: 'plan_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        day: itemData.day || 'Monday',
        topic: String(itemData.topic || '').trim(),
        format: itemData.format || 'Reel',
        dayPart: itemData.dayPart || 'Anytime',
        createdAt: new Date().toISOString()
      };
      items.push(newItem);
      App.storage.set(STORAGE_KEY, items);
      return newItem;
    },

    /**
     * Update a planned item.
     * @param {string} id
     * @param {Object} updatedFields
     * @returns {Object|null}
     */
    update: function (id, updatedFields) {
      var items = this.getAll();
      var foundIndex = -1;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex === -1) return null;

      var current = items[foundIndex];
      items[foundIndex] = {
        id: current.id,
        day: updatedFields.day || current.day,
        topic: updatedFields.topic !== undefined ? String(updatedFields.topic).trim() : current.topic,
        format: updatedFields.format || current.format,
        dayPart: updatedFields.dayPart || current.dayPart,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };
      App.storage.set(STORAGE_KEY, items);
      return items[foundIndex];
    },

    /**
     * Remove a planned item.
     * @param {string} id
     * @returns {boolean}
     */
    remove: function (id) {
      var items = this.getAll();
      var initialLength = items.length;
      var filtered = items.filter(function (item) {
        return item.id !== id;
      });
      if (filtered.length !== initialLength) {
        App.storage.set(STORAGE_KEY, filtered);
        return true;
      }
      return false;
    }
  };
})(window.ContentOS);
