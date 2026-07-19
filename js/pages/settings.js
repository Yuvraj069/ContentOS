/**
 * ContentOS - Settings Page Controller
 * Route: #/settings
 * Adheres strictly to Product Copy Rule (no implementation jargon in UI labels).
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.pages = window.ContentOS.pages || {};
(function (App) {
  'use strict';

  var activeListeners = [];

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  App.pages.settings = {
    /**
     * Render Settings view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();
      var self = this;

      var profile = App.storage.get('contentos:profile', null);
      var currentTheme = App.theme.getTheme();

      var wrapper = App.dom.createElement('div', { className: 'settings-grid animate-fade-up' });

      // Page Header
      var pageHeader = App.dom.createElement('div', { className: 'page-header' }, [
        App.dom.createElement('div', {}, [
          App.dom.createElement('h1', { className: 'page-title', textContent: 'Settings & Workspace Management' }),
          App.dom.createElement('p', { className: 'page-subtitle', textContent: 'Manage your creator handle preferences, appearance theme, and workspace backups.' })
        ])
      ]);

      wrapper.appendChild(pageHeader);

      // 1. Profile Summary Card
      var profileSection = App.dom.createElement('div', { className: 'settings-section' }, [
        App.dom.createElement('h2', { className: 'settings-section-title', textContent: 'Creator Profile' }),
        App.dom.createElement('div', { style: 'display:flex; justify-space-between; align-items:center;' }, [
          App.dom.createElement('div', {}, [
            App.dom.createElement('h3', { className: 'mono-num', textContent: profile ? ('@' + profile.handle) : 'No Profile Set' }),
            App.dom.createElement('p', { textContent: profile ? (profile.platform + ' • ' + profile.niche + ' • ' + profile.primaryFormat + ' • ' + profile.followerBand) : 'Set up your handle to personalize your workspace.' })
          ]),
          App.dom.createElement('a', {
            href: '#/connect',
            className: 'btn btn-secondary',
            textContent: '✏️ Edit profile'
          })
        ])
      ]);

      // 2. Appearance Theme Card
      var appearanceSection = App.dom.createElement('div', { className: 'settings-section' }, [
        App.dom.createElement('h2', { className: 'settings-section-title', textContent: 'Appearance & Theme' }),
        App.dom.createElement('div', { className: 'theme-toggle-row' }, [
          App.dom.createElement('div', {}, [
            App.dom.createElement('h3', { textContent: 'Theme Mode' }),
            App.dom.createElement('p', { textContent: 'Switch between Dark mode and Light mode.' })
          ]),
          App.dom.createElement('button', {
            id: 'toggleThemeBtn',
            className: 'btn btn-secondary',
            textContent: currentTheme === 'light' ? '☀️ Light Mode (Active)' : '🌙 Dark Mode (Active)'
          })
        ])
      ]);

      // 3. Backup & Restore Data Card (Clean User Copy)
      var dataSection = App.dom.createElement('div', { className: 'settings-section' }, [
        App.dom.createElement('h2', { className: 'settings-section-title', textContent: 'Backup & Restore Workspace' }),
        App.dom.createElement('p', { textContent: 'Download a complete backup file of your posts, schedule, and profile, or restore your workspace from a backup file.' }),
        App.dom.createElement('div', { style: 'display:flex; gap:16px; flex-wrap:wrap; margin-top:8px;' }, [
          App.dom.createElement('button', {
            id: 'exportBackupBtn',
            className: 'btn btn-primary',
            textContent: '📥 Export backup'
          }),
          App.dom.createElement('label', {
            className: 'btn btn-secondary',
            style: 'cursor:pointer;',
            textContent: '📤 Restore from backup'
          }, [
            App.dom.createElement('input', {
              type: 'file',
              id: 'importBackupInput',
              accept: '.json',
              style: 'display:none;'
            })
          ])
        ])
      ]);

      // 4. Danger Zone Card
      var dangerSection = App.dom.createElement('div', { className: 'settings-section danger-zone' }, [
        App.dom.createElement('h2', { className: 'settings-section-title danger-zone-title', textContent: '⚠️ Danger Zone' }),
        App.dom.createElement('p', { textContent: 'Permanently clear all saved post logs, weekly schedule items, and profile settings from this device.' }),
        App.dom.createElement('div', { className: 'form-group', style: 'max-width:320px; margin-top:8px;' }, [
          App.dom.createElement('label', { className: 'form-label', for: 'deleteConfirmInput', textContent: 'Type "DELETE" to enable wipe button:' }),
          App.dom.createElement('input', {
            type: 'text',
            id: 'deleteConfirmInput',
            className: 'form-input',
            placeholder: 'DELETE'
          })
        ]),
        App.dom.createElement('button', {
          id: 'clearAllDataBtn',
          className: 'btn btn-danger',
          disabled: true,
          style: 'align-self:flex-start;',
          textContent: '🔥 Clear all workspace data'
        })
      ]);

      wrapper.appendChild(profileSection);
      wrapper.appendChild(appearanceSection);
      wrapper.appendChild(dataSection);
      wrapper.appendChild(dangerSection);
      container.appendChild(wrapper);

      // Wire Event Listeners
      var themeBtn = App.dom.qs('#toggleThemeBtn', container);
      var exportBtn = App.dom.qs('#exportBackupBtn', container);
      var importInput = App.dom.qs('#importBackupInput', container);
      var deleteInput = App.dom.qs('#deleteConfirmInput', container);
      var clearBtn = App.dom.qs('#clearAllDataBtn', container);

      addListener(themeBtn, 'click', function () {
        var active = App.theme.getTheme();
        var newTheme = active === 'light' ? 'dark' : 'light';
        App.theme.setTheme(newTheme);
        themeBtn.textContent = newTheme === 'light' ? '☀️ Light Mode (Active)' : '🌙 Dark Mode (Active)';
        App.components.toast.show('Switched to ' + newTheme + ' theme', 'success');
      });

      addListener(exportBtn, 'click', function () {
        var res = App.dataTransfer.exportData();
        if (res.success) {
          App.components.toast.show('Workspace backup downloaded successfully!', 'success');
        } else {
          App.components.toast.show(res.error || 'Export failed', 'error');
        }
      });

      addListener(importInput, 'change', function (e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (evt) {
          var res = App.dataTransfer.importData(evt.target.result);
          if (res.success) {
            App.components.toast.show('Workspace restored! Reloading...', 'success');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          } else {
            App.components.toast.show(res.error || 'Failed to restore backup', 'error');
            importInput.value = '';
          }
        };
        reader.onerror = function () {
          App.components.toast.show('Could not read backup file', 'error');
        };
        reader.readAsText(file);
      });

      addListener(deleteInput, 'input', function () {
        var text = deleteInput.value.trim();
        clearBtn.disabled = (text !== 'DELETE');
      });

      addListener(clearBtn, 'click', function () {
        if (deleteInput.value.trim() !== 'DELETE') return;
        App.storage.clearAll();
        App.components.toast.show('Workspace cleared successfully', 'info');
        setTimeout(function () {
          window.location.hash = '#/connect';
          window.location.reload();
        }, 600);
      });
    },

    /**
     * Clean up listeners.
     */
    destroy: function () {
      activeListeners.forEach(function (item) {
        if (item.el) item.el.removeEventListener(item.event, item.handler);
      });
      activeListeners = [];
    }
  };
})(window.ContentOS);
