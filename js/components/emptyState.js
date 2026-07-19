/**
 * ContentOS - Empty State Component
 * Renders consistent empty state card with CTA button.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  App.components.emptyState = {
    /**
     * Render an empty state view card.
     * @param {string} title
     * @param {string} description
     * @param {string} [actionLabel]
     * @param {string|Function} [actionTarget] Hash URL string or click callback
     * @returns {HTMLElement}
     */
    render: function (title, description, actionLabel, actionTarget) {
      var card = App.dom.createElement('div', {
        className: 'card empty-state-card',
        style: 'text-align:center; padding: 48px 24px; display:flex; flex-direction:column; align-items:center; gap:16px;'
      });

      var iconSvg =
        '<div style="width:56px; height:56px; border-radius:50%; background:var(--card); display:flex; align-items:center; justify-content:center; color:var(--accent-purple); font-size:24px;">' +
          '✧' +
        '</div>';

      card.innerHTML = iconSvg;

      var titleEl = App.dom.createElement('h3', { textContent: title || 'No Data Available' });
      var descEl = App.dom.createElement('p', { textContent: description || 'Get started by adding your first item.' });

      card.appendChild(titleEl);
      card.appendChild(descEl);

      if (actionLabel && actionTarget) {
        var btn = App.dom.createElement('button', {
          className: 'btn btn-primary',
          textContent: actionLabel
        });

        if (typeof actionTarget === 'string') {
          btn.addEventListener('click', function () {
            window.location.hash = actionTarget;
          });
        } else if (typeof actionTarget === 'function') {
          btn.addEventListener('click', actionTarget);
        }

        card.appendChild(btn);
      }

      return card;
    }
  };
})(window.ContentOS);
