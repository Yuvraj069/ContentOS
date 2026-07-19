/**
 * ContentOS - Hash Router
 * Hash-based client-side router with lifecycle cleanup.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var routes = {
    '#/dashboard': App.pages.dashboard,
    '#/posts': App.pages.posts,
    '#/ideas': App.pages.ideas,
    '#/planner': App.pages.planner,
    '#/settings': App.pages.settings,
    '#/connect': App.pages.connect
  };

  var currentPage = null;
  var containerEl = null;

  function handleRoute() {
    var rawHash = window.location.hash || '#/dashboard';
    var targetHash = rawHash.split('?')[0];

    // Check if profile exists; if not, force connect screen first
    var profile = App.storage.get('contentos:profile', null);
    if (!profile && targetHash !== '#/connect') {
      window.location.hash = '#/connect';
      return;
    }

    var targetPage = routes[targetHash];
    if (!targetPage) {
      targetHash = '#/dashboard';
      targetPage = routes[targetHash];
    }

    // Lifecycle cleanup of outgoing page before rendering incoming page
    if (currentPage && typeof currentPage.destroy === 'function') {
      try {
        currentPage.destroy();
      } catch (err) {
        console.warn('Error during page destroy:', err);
      }
    }

    currentPage = targetPage;

    if (containerEl) {
      containerEl.style.opacity = '0';
      containerEl.style.transition = 'opacity 0.15s ease-out';

      setTimeout(function () {
        App.dom.clearContainer(containerEl);

        if (App.appShell && typeof App.appShell.updateNavigation === 'function') {
          App.appShell.updateNavigation(targetHash);
        }

        if (currentPage && typeof currentPage.render === 'function') {
          currentPage.render(containerEl);
        }

        containerEl.style.opacity = '1';
      }, 150);
    }
  }

  App.router = {
    /**
     * Initialize hash router.
     * @param {HTMLElement} contentContainer
     */
    init: function (contentContainer) {
      containerEl = contentContainer;
      window.addEventListener('hashchange', handleRoute);
      handleRoute();
    },

    /**
     * Programmatically navigate to route.
     * @param {string} hash
     */
    navigate: function (hash) {
      window.location.hash = hash;
    }
  };
})(window.ContentOS);
