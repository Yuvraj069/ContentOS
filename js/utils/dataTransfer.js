/**
 * ContentOS - Data Transfer Utility
 * Export workspace backup file and import backup with strict schema validation.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.dataTransfer = {
    /**
     * Export all workspace data into a downloadable backup file.
     */
    exportData: function () {
      try {
        var profile = App.storage.get('contentos:profile', null);
        var posts = App.postsStore.getAll();
        var planner = App.plannerStore.getAll();

        var payload = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          profile: profile,
          posts: posts,
          planner: planner
        };

        var jsonStr = JSON.stringify(payload, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var dateTag = new Date().toISOString().split('T')[0];
        var a = document.createElement('a');
        a.href = url;
        a.download = 'contentos_backup_' + dateTag + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true };
      } catch (err) {
        console.error('Export failed:', err);
        return { success: false, error: 'Could not create backup file. Please try again.' };
      }
    },

    /**
     * Import backup string with schema validation.
     * @param {string} rawString
     * @returns {{success: boolean, error?: string, counts?: Object}}
     */
    importData: function (rawString) {
      try {
        if (!rawString || typeof rawString !== 'string') {
          return { success: false, error: 'Backup file appears to be empty.' };
        }

        var parsed = JSON.parse(rawString);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return { success: false, error: 'Invalid backup file structure.' };
        }

        if (parsed.posts !== undefined && !Array.isArray(parsed.posts)) {
          return { success: false, error: 'Backup file contains invalid posts data.' };
        }

        if (parsed.planner !== undefined && !Array.isArray(parsed.planner)) {
          return { success: false, error: 'Backup file contains invalid planner schedule data.' };
        }

        if (parsed.profile !== undefined && parsed.profile !== null && typeof parsed.profile !== 'object') {
          return { success: false, error: 'Backup file contains invalid profile data.' };
        }

        if (parsed.profile) {
          App.storage.set('contentos:profile', parsed.profile);
        }
        if (Array.isArray(parsed.posts)) {
          App.storage.set('contentos:posts', parsed.posts);
        }
        if (Array.isArray(parsed.planner)) {
          App.storage.set('contentos:planner', parsed.planner);
        }

        return {
          success: true,
          counts: {
            posts: Array.isArray(parsed.posts) ? parsed.posts.length : 0,
            planner: Array.isArray(parsed.planner) ? parsed.planner.length : 0
          }
        };
      } catch (err) {
        return { success: false, error: 'Unreadable or corrupted backup file.' };
      }
    }
  };
})(window.ContentOS);
