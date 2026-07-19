/**
 * ContentOS - Form Validation Utilities
 * Pure validation functions returning validation result objects.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.validators = {
    /**
     * Check if value is non-empty.
     * @param {*} value
     * @returns {{valid: boolean, error: string|null}}
     */
    required: function (value) {
      var str = value !== null && value !== undefined ? String(value).trim() : '';
      if (str.length === 0) {
        return { valid: false, error: 'This field is required' };
      }
      return { valid: true, error: null };
    },

    /**
     * Check minimum string length.
     * @param {string} value
     * @param {number} min
     * @returns {{valid: boolean, error: string|null}}
     */
    minLength: function (value, min) {
      var str = value !== null && value !== undefined ? String(value).trim() : '';
      if (str.length < min) {
        return { valid: false, error: 'Must be at least ' + min + ' characters' };
      }
      return { valid: true, error: null };
    },

    /**
     * Check maximum string length.
     * @param {string} value
     * @param {number} max
     * @returns {{valid: boolean, error: string|null}}
     */
    maxLength: function (value, max) {
      var str = value !== null && value !== undefined ? String(value).trim() : '';
      if (str.length > max) {
        return { valid: false, error: 'Must be at most ' + max + ' characters' };
      }
      return { valid: true, error: null };
    },

    /**
     * Validate creator handle (2-30 characters after stripping leading @).
     * @param {string} handleStr
     * @returns {{valid: boolean, error: string|null, cleanHandle: string}}
     */
    handle: function (handleStr) {
      var raw = String(handleStr || '').trim();
      var clean = raw.replace(/^@+/, '');

      if (clean.length === 0) {
        return { valid: false, error: 'Handle cannot be empty', cleanHandle: '' };
      }
      if (clean.length < 2) {
        return { valid: false, error: 'Handle must be at least 2 characters', cleanHandle: clean };
      }
      if (clean.length > 30) {
        return { valid: false, error: 'Handle cannot exceed 30 characters', cleanHandle: clean };
      }

      var handleRegex = /^[a-zA-Z0-9_.]+$/;
      if (!handleRegex.test(clean)) {
        return { valid: false, error: 'Handle can only contain letters, numbers, dots, and underscores', cleanHandle: clean };
      }

      return { valid: true, error: null, cleanHandle: clean };
    },

    /**
     * Check if number is valid and >= 0.
     * @param {*} value
     * @returns {{valid: boolean, error: string|null}}
     */
    nonNegativeNumber: function (value) {
      if (value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Number is required' };
      }
      var num = Number(value);
      if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Must be a number 0 or greater' };
      }
      return { valid: true, error: null };
    },

    /**
     * Check that date string is not in the future.
     * @param {string} dateStr Format YYYY-MM-DD
     * @returns {{valid: boolean, error: string|null}}
     */
    notFutureDate: function (dateStr) {
      if (!dateStr) {
        return { valid: false, error: 'Date is required' };
      }
      var inputDate = new Date(dateStr + 'T00:00:00');
      var today = new Date();
      today.setHours(23, 59, 59, 999);

      if (isNaN(inputDate.getTime())) {
        return { valid: false, error: 'Invalid date format' };
      }

      if (inputDate > today) {
        return { valid: false, error: 'Date cannot be in the future' };
      }
      return { valid: true, error: null };
    }
  };
})(window.ContentOS);
