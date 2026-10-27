/** ContentOS - Monthly Followers Store */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var STORAGE_KEY_FOLLOWERS = 'contentos:monthly_followers';

  App.followersStore = {
    getHistory: function () {
      var data = App.storage.get(App.storage.getUserKey(STORAGE_KEY_FOLLOWERS), null);
      if (!data || typeof data !== 'object') {
        return {};
      }
      return data;
    },

    getCurrentMonthKey: function () {
      var d = new Date();
      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[d.getMonth()] + ' ' + d.getFullYear();
    },

    hasFollowersRecorded: function () {
      var history = this.getHistory();
      return Object.keys(history).length > 0;
    },

    getLatestFollowers: function () {
      var history = this.getHistory();
      var currentKey = this.getCurrentMonthKey();
      if (history[currentKey] !== undefined) {
        return Number(history[currentKey]) || 0;
      }
      var keys = Object.keys(history);
      if (keys.length > 0) {
        return Number(history[keys[keys.length - 1]]) || 0;
      }
      return null;
    },

    setMonthlyFollowers: function (count, monthKey) {
      var key = monthKey || this.getCurrentMonthKey();
      var history = this.getHistory();
      history[key] = Math.max(1, Number(count) || 1);
      App.storage.set(App.storage.getUserKey(STORAGE_KEY_FOLLOWERS), history);
      return history[key];
    }
  };
})(window.ContentOS);
