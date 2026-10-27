/* ContentOS - Form Validation Utility */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.validators = {
    validateHandle: function (handleStr) {
      var clean = String(handleStr || '').trim().replace(/^@+/, '');
      if (clean.length === 0) {
        return { valid: false, error: 'Handle cannot be empty', cleanHandle: '' };
      }
      if (clean.length < 2) {
        return { valid: false, error: 'Handle must be at least 2 characters', cleanHandle: clean };
      }
      return { valid: true, error: null, cleanHandle: clean };
    },

    required: function (value, fieldName) {
      var str = String(value || '').trim();
      if (str.length === 0) {
        return { valid: false, error: (fieldName || 'Field') + ' is required' };
      }
      return { valid: true, error: null };
    },

    nonNegative: function (value, fieldName) {
      if (value === '' || value === null || value === undefined) {
        return { valid: false, error: (fieldName || 'Field') + ' is required' };
      }
      var num = Number(value);
      if (isNaN(num) || num < 0) {
        return { valid: false, error: (fieldName || 'Field') + ' must be 0 or greater' };
      }
      return { valid: true, error: null };
    }
  };
})(window.ContentOS);
