/**
 * ContentOS - DOM Utilities
 * Helper functions for DOM queries, element creation, and event binding.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.dom = {
    /**
     * Query selector wrapper.
     * @param {string} selector
     * @param {HTMLElement} [scope=document]
     * @returns {HTMLElement|null}
     */
    qs: function (selector, scope) {
      return (scope || document).querySelector(selector);
    },

    /**
     * Query selector all wrapper.
     * @param {string} selector
     * @param {HTMLElement} [scope=document]
     * @returns {HTMLElement[]}
     */
    qsa: function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },

    /**
     * Create an HTML element with attributes, classes, and inner content.
     * @param {string} tag
     * @param {Object} [attrs={}]
     * @param {string|HTMLElement|HTMLElement[]} [children]
     * @returns {HTMLElement}
     */
    createElement: function (tag, attrs, children) {
      var el = document.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) {
          if (key === 'className' || key === 'class') {
            el.className = attrs[key];
          } else if (key === 'textContent' || key === 'text') {
            el.textContent = attrs[key];
          } else if (key === 'innerHTML' || key === 'html') {
            el.innerHTML = attrs[key];
          } else if (key.indexOf('on') === 0 && typeof attrs[key] === 'function') {
            el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
          } else {
            el.setAttribute(key, attrs[key]);
          }
        });
      }
      if (children !== undefined && children !== null) {
        if (Array.isArray(children)) {
          children.forEach(function (child) {
            if (typeof child === 'string') {
              el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement || child instanceof SVGElement) {
              el.appendChild(child);
            }
          });
        } else if (typeof children === 'string') {
          el.appendChild(document.createTextNode(children));
        } else if (children instanceof HTMLElement || children instanceof SVGElement) {
          el.appendChild(children);
        }
      }
      return el;
    },

    /**
     * Clear all inner HTML of a container safely.
     * @param {HTMLElement} container
     */
    clearContainer: function (container) {
      if (container) {
        container.innerHTML = '';
      }
    },

    /**
     * Add event listener wrapper.
     * @param {HTMLElement} target
     * @param {string} event
     * @param {Function} handler
     */
    on: function (target, event, handler) {
      if (target) {
        target.addEventListener(event, handler);
      }
    },

    /**
     * Remove event listener wrapper.
     * @param {HTMLElement} target
     * @param {string} event
     * @param {Function} handler
     */
    off: function (target, event, handler) {
      if (target) {
        target.removeEventListener(event, handler);
      }
    }
  };
})(window.ContentOS);
