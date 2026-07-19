/**
 * ContentOS - Sidebar Navigation Component
 * Persistent desktop sidebar / mobile bottom navigation tab bar.
 * Logo mark is a fully clickable button navigating to #/dashboard from anywhere.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  var NAV_ITEMS = [
    { hash: '#/dashboard', label: 'Dashboard', icon: '📊' },
    { hash: '#/posts', label: 'Post Log', icon: '📝' },
    { hash: '#/ideas', label: 'Ideas', icon: '💡' },
    { hash: '#/planner', label: 'Planner', icon: '📅' },
    { hash: '#/settings', label: 'Settings', icon: '⚙️' }
  ];

  App.components.sidebar = {
    /**
     * Render sidebar nav container.
     * @param {string} currentHash
     * @returns {HTMLElement}
     */
    render: function (currentHash) {
      var sidebar = App.dom.createElement('aside', { className: 'app-sidebar' });

      // Clickable Logo Mark Header Button (Navigates to #/dashboard)
      var logoBtn = App.dom.createElement('button', {
        className: 'sidebar-logo-button',
        onclick: function () {
          window.location.hash = '#/dashboard';
        }
      }, [
        App.dom.createElement('div', { className: 'brand-icon', textContent: 'OS' }),
        App.dom.createElement('span', { className: 'sidebar-logo-text text-gradient', textContent: 'ContentOS' })
      ]);

      var header = App.dom.createElement('div', { className: 'sidebar-header' }, [logoBtn]);

      // Nav Links
      var nav = App.dom.createElement('nav', { className: 'sidebar-nav' });

      NAV_ITEMS.forEach(function (item) {
        var isActive = (currentHash || '#/dashboard').indexOf(item.hash) === 0;

        var link = App.dom.createElement('a', {
          href: item.hash,
          className: 'nav-item' + (isActive ? ' active' : '')
        }, [
          App.dom.createElement('span', { className: 'nav-item-icon', textContent: item.icon }),
          App.dom.createElement('span', { className: 'nav-item-label', textContent: item.label })
        ]);

        nav.appendChild(link);
      });

      sidebar.appendChild(header);
      sidebar.appendChild(nav);

      return sidebar;
    }
  };
})(window.ContentOS);
