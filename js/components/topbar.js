/**
 * ContentOS - Topbar Header Component
 * Displays @handle · platform · niche badge or prompt to connect profile.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  App.components.topbar = {
    /**
     * Render topbar element.
     * @returns {HTMLElement}
     */
    render: function () {
      var topbar = App.dom.createElement('header', { className: 'app-topbar' });

      var profile = App.storage.get('contentos:profile', null);

      var leftSlot = App.dom.createElement('div', { className: 'topbar-left' }, [
        App.dom.createElement('span', {
          style: 'font-weight:600; font-size:var(--font-size-sm); color:var(--text-dim);',
          textContent: 'Content Strategy Workspace'
        })
      ]);

      var rightSlot = App.dom.createElement('div', { className: 'topbar-right' });

      if (profile && profile.handle) {
        var initial = profile.handle.charAt(0).toUpperCase();

        var profileWidget = App.dom.createElement('a', {
          href: '#/settings',
          className: 'topbar-profile',
          style: 'text-decoration:none;'
        }, [
          App.dom.createElement('div', { className: 'topbar-avatar', textContent: initial }),
          App.dom.createElement('div', { className: 'topbar-user-info' }, [
            App.dom.createElement('span', { className: 'topbar-handle mono-num', textContent: '@' + profile.handle }),
            App.dom.createElement('span', { className: 'topbar-details', textContent: (profile.platform || 'Instagram') + ' • ' + (profile.niche || 'Creator') })
          ])
        ]);
        rightSlot.appendChild(profileWidget);
      } else {
        var promptBtn = App.dom.createElement('a', {
          href: '#/connect',
          className: 'btn btn-primary',
          style: 'padding:6px 16px; font-size:var(--font-size-xs);',
          textContent: '✦ Set Up Workspace Profile'
        });
        rightSlot.appendChild(promptBtn);
      }

      topbar.appendChild(leftSlot);
      topbar.appendChild(rightSlot);

      return topbar;
    }
  };
})(window.ContentOS);
