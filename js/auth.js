/** ContentOS - Real Password Authentication & Session Gating */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var STORAGE_KEY_ACCOUNTS = 'contentos:accounts';
  var STORAGE_KEY_SESSION = 'contentos:session';

  App.auth = {
    getAccounts: function () {
      return App.storage.get(STORAGE_KEY_ACCOUNTS, {});
    },

    saveAccount: function (handle, password, niche) {
      var accounts = this.getAccounts();
      var cleanHandle = String(handle || '').trim().toLowerCase();
      accounts[cleanHandle] = {
        handle: cleanHandle,
        password: String(password || '').trim(),
        niche: niche || 'Lifestyle',
        createdAt: Date.now()
      };
      App.storage.set(STORAGE_KEY_ACCOUNTS, accounts);
      return accounts[cleanHandle];
    },

    login: function (handle, password) {
      var cleanHandle = String(handle || '').trim().toLowerCase();
      var cleanPass = String(password || '').trim();

      if (!cleanHandle || cleanHandle.length < 2) {
        return { success: false, error: 'Handle must be at least 2 characters' };
      }
      if (!cleanPass || cleanPass.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters' };
      }

      var accounts = this.getAccounts();

      if (!accounts[cleanHandle]) {
        return { success: false, error: 'Account @' + cleanHandle + ' does not exist. Please register first.' };
      }

      if (accounts[cleanHandle].password !== cleanPass) {
        return { success: false, error: 'Incorrect password for @' + cleanHandle };
      }

      // Save session
      var session = {
        handle: cleanHandle,
        loggedInAt: Date.now()
      };
      App.storage.set(STORAGE_KEY_SESSION, session);

      // Save profile
      App.storage.set(App.storage.getUserKey('contentos:profile'), {
        handle: cleanHandle,
        niche: accounts[cleanHandle].niche || 'Lifestyle',
        createdAt: Date.now()
      });

      return { success: true, session: session };
    },

    register: function (handle, password, niche, initialFollowers) {
      var cleanHandle = String(handle || '').trim().toLowerCase();
      var cleanPass = String(password || '').trim();
      var followerNum = Number(initialFollowers);

      if (!cleanHandle || cleanHandle.length < 2) {
        return { success: false, error: 'Handle must be at least 2 characters' };
      }
      if (!cleanPass || cleanPass.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters' };
      }
      if (isNaN(followerNum) || followerNum < 1) {
        return { success: false, error: 'Please enter a valid follower count (minimum 1)' };
      }

      var accounts = this.getAccounts();
      if (accounts[cleanHandle]) {
        return { success: false, error: 'Account @' + cleanHandle + ' already exists. Please login instead.' };
      }

      // Register new user
      this.saveAccount(cleanHandle, cleanPass, niche);

      // Save session
      var session = {
        handle: cleanHandle,
        loggedInAt: Date.now()
      };
      App.storage.set(STORAGE_KEY_SESSION, session);

      // Save profile
      App.storage.set(App.storage.getUserKey('contentos:profile'), {
        handle: cleanHandle,
        niche: niche || 'Lifestyle',
        createdAt: Date.now()
      });

      // Save initial monthly followers count for new user!
      if (App.followersStore) {
        App.followersStore.setMonthlyFollowers(followerNum);
      }

      return { success: true, session: session };
    },

    getSession: function () {
      return App.storage.get(STORAGE_KEY_SESSION, null);
    },

    logout: function () {
      App.storage.remove(STORAGE_KEY_SESSION);
      window.location.href = 'login.html';
    },

    requireAuth: function () {
      var session = this.getSession();
      if (!session) {
        window.location.href = 'login.html';
        return null;
      }
      return session;
    },

    redirectIfAuthenticated: function () {
      var session = this.getSession();
      if (session) {
        window.location.href = 'dashboard.html';
      }
    }
  };
})(window.ContentOS);
