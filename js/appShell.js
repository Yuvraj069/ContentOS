/**
 * ContentOS - App Shell Orchestrator
 * Wires sidebar + topbar + main content panel + router together.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var shellRootEl = null;
  var contentEl = null;
  var sidebarSlot = null;
  var topbarSlot = null;
  var mainEl = null;

  App.appShell = {
    /**
     * Initialize App Shell layout and router.
     */
    init: function () {
      App.theme.initTheme();

      shellRootEl = App.dom.qs('#app');
      if (!shellRootEl) {
        shellRootEl = App.dom.createElement('div', { id: 'app' });
        document.body.appendChild(shellRootEl);
      }

      App.dom.clearContainer(shellRootEl);

      var layout = App.dom.createElement('div', { className: 'app-layout' });

      sidebarSlot = App.dom.createElement('div', { id: 'sidebarSlot' });

      mainEl = App.dom.createElement('main', { className: 'app-main' });

      topbarSlot = App.dom.createElement('div', { id: 'topbarSlot' });

      contentEl = App.dom.createElement('section', { className: 'app-content', id: 'appContent' });

      mainEl.appendChild(topbarSlot);
      mainEl.appendChild(contentEl);

      layout.appendChild(sidebarSlot);
      layout.appendChild(mainEl);

      shellRootEl.appendChild(layout);

      this.updateNavigation(window.location.hash || '#/dashboard');

      App.router.init(contentEl);
    },

    /**
     * Re-render topbar and sidebar navigation components on hashchange.
     * Hides shell chrome when on #/connect page.
     * @param {string} currentHash
     */
    updateNavigation: function (currentHash) {
      var isConnectPage = (currentHash || '').indexOf('#/connect') === 0;

      if (isConnectPage) {
        if (sidebarSlot) sidebarSlot.style.display = 'none';
        if (topbarSlot) topbarSlot.style.display = 'none';
        if (mainEl) {
          mainEl.style.marginLeft = '0';
          mainEl.style.width = '100%';
        }
        if (contentEl) {
          contentEl.style.padding = '0';
          contentEl.style.maxWidth = '100%';
        }
      } else {
        if (sidebarSlot) {
          sidebarSlot.style.display = 'block';
          App.dom.clearContainer(sidebarSlot);
          sidebarSlot.appendChild(App.components.sidebar.render(currentHash));
        }
        if (topbarSlot) {
          topbarSlot.style.display = 'block';
          App.dom.clearContainer(topbarSlot);
          topbarSlot.appendChild(App.components.topbar.render());
        }
        if (mainEl) {
          mainEl.style.marginLeft = '';
          mainEl.style.width = '';
        }
        if (contentEl) {
          contentEl.style.padding = '';
          contentEl.style.maxWidth = '';
        }
      }
    }
  };
})(window.ContentOS);
