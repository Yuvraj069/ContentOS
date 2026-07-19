/**
 * ContentOS - SVG Content Score Ring Component
 * Renders an animated SVG progress circle for the Content Score.
 * Numbers styled with JetBrains Mono.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  App.components.scoreRing = {
    /**
     * Render SVG progress ring for Content Score.
     * @param {number} score 0 - 100
     * @param {string} label Status label
     * @returns {HTMLElement} Container div
     */
    render: function (score, label) {
      var size = 160;
      var strokeWidth = 14;
      var radius = (size - strokeWidth) / 2;
      var circumference = 2 * Math.PI * radius;
      var clampedScore = Math.max(0, Math.min(100, score || 0));
      var offset = circumference - (clampedScore / 100) * circumference;

      var container = App.dom.createElement('div', { className: 'score-ring-container' });

      var svgHtml =
        '<svg class="score-ring-svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
          '<defs>' +
            '<linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
              '<stop offset="0%" stop-color="#8B5CF6" />' +
              '<stop offset="100%" stop-color="#EC4899" />' +
            '</linearGradient>' +
          '</defs>' +
          '<!-- Background Track -->' +
          '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + radius + '" ' +
                  'fill="none" stroke="var(--hairline)" stroke-width="' + strokeWidth + '" />' +
          '<!-- Progress Arc -->' +
          '<circle class="score-progress-arc" cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + radius + '" ' +
                  'fill="none" stroke="url(#scoreRingGradient)" stroke-width="' + strokeWidth + '" ' +
                  'stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + circumference + '" ' +
                  'transform="rotate(-90 ' + (size / 2) + ' ' + (size / 2) + ')" ' +
                  'style="transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);" />' +
          '<!-- Numeric Score Text (JetBrains Mono) -->' +
          '<text x="50%" y="46%" text-anchor="middle" dominant-baseline="central" ' +
                'fill="var(--text)" font-size="36px" font-weight="700" font-family="var(--font-mono)">' +
            clampedScore +
          '</text>' +
          '<!-- Qualitative Label Text -->' +
          '<text x="50%" y="70%" text-anchor="middle" dominant-baseline="central" ' +
                'fill="var(--text-dim)" font-size="11px" font-weight="600" font-family="var(--font-body)">' +
            (label || 'CONTENT SCORE') +
          '</text>' +
        '</svg>';

      container.innerHTML = svgHtml;

      // Animate progress arc after paint
      setTimeout(function () {
        var arc = container.querySelector('.score-progress-arc');
        if (arc) {
          arc.style.strokeDashoffset = offset;
        }
      }, 50);

      return container;
    }
  };
})(window.ContentOS);
