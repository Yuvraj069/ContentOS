/**
 * ContentOS - SVG Charts Component
 * Responsive SVG Bar Chart and SVG Format Donut Chart with JetBrains Mono numbers.
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.components = window.ContentOS.components || {};
(function (App) {
  'use strict';

  App.components.barChart = {
    /**
     * Render SVG Bar Chart for recent post engagement rates.
     * @param {Array} posts Array of post objects
     * @returns {HTMLElement} Container div
     */
    renderBarChart: function (posts) {
      var container = App.dom.createElement('div', { className: 'chart-container', style: 'width:100%; height:100%;' });

      if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px;">No posts available</div>';
        return container;
      }

      var recentPosts = posts.slice(0, 10).reverse();

      var svgWidth = 500;
      var svgHeight = 220;
      var paddingLeft = 40;
      var paddingBottom = 30;
      var paddingTop = 20;
      var paddingRight = 20;

      var chartWidth = svgWidth - paddingLeft - paddingRight;
      var chartHeight = svgHeight - paddingTop - paddingBottom;

      var rates = recentPosts.map(function (p) {
        return App.analytics.calculatePostEngagement(p) * 100;
      });
      var maxRate = Math.max.apply(null, rates.concat([5]));

      var barGap = 12;
      var totalGaps = recentPosts.length + 1;
      var barWidth = Math.max(12, (chartWidth - (totalGaps * barGap)) / recentPosts.length);

      var svgContent = '<svg class="chart-svg" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" width="100%" height="100%">' +
        '<defs>' +
          '<linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="#8B5CF6" />' +
            '<stop offset="100%" stop-color="#EC4899" />' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Grid Axis Lines -->' +
        '<line x1="' + paddingLeft + '" y1="' + (paddingTop + chartHeight) + '" x2="' + (svgWidth - paddingRight) + '" y2="' + (paddingTop + chartHeight) + '" class="chart-axis-line" />' +
        '<line x1="' + paddingLeft + '" y1="' + paddingTop + '" x2="' + paddingLeft + '" y2="' + (paddingTop + chartHeight) + '" class="chart-axis-line" />' +
        '<!-- Axis Labels (JetBrains Mono) -->' +
        '<text x="' + (paddingLeft - 8) + '" y="' + (paddingTop + 10) + '" class="chart-text" text-anchor="end" font-family="var(--font-mono)">' + Math.round(maxRate) + '%</text>' +
        '<text x="' + (paddingLeft - 8) + '" y="' + (paddingTop + chartHeight) + '" class="chart-text" text-anchor="end" font-family="var(--font-mono)">0%</text>';

      recentPosts.forEach(function (post, idx) {
        var rate = rates[idx];
        var barHeight = (rate / maxRate) * chartHeight;
        var x = paddingLeft + barGap + idx * (barWidth + barGap);
        var y = paddingTop + chartHeight - barHeight;

        var shortTitle = (post.title || 'Post').substring(0, 6);

        svgContent +=
          '<rect class="chart-bar" x="' + x + '" y="' + (paddingTop + chartHeight) + '" width="' + barWidth + '" height="0" ' +
                'rx="4" fill="url(#barGradient)" data-target-y="' + y + '" data-target-height="' + barHeight + '">' +
            '<title>' + (post.title || 'Post') + ': ' + rate.toFixed(1) + '% engagement</title>' +
          '</rect>' +
          '<text x="' + (x + barWidth / 2) + '" y="' + (svgHeight - 10) + '" class="chart-text" text-anchor="middle">' +
            shortTitle +
          '</text>';
      });

      svgContent += '</svg>';
      container.innerHTML = svgContent;

      // Animate bar heights
      setTimeout(function () {
        var bars = container.querySelectorAll('.chart-bar');
        bars.forEach(function (bar, index) {
          var targetY = bar.getAttribute('data-target-y');
          var targetHeight = bar.getAttribute('data-target-height');
          setTimeout(function () {
            bar.setAttribute('y', targetY);
            bar.setAttribute('height', targetHeight);
          }, index * 40);
        });
      }, 50);

      return container;
    },

    /**
     * Render SVG Donut Chart for post format breakdown.
     * @param {Array} distribution Format breakdown array
     * @returns {HTMLElement} Container div
     */
    renderDonutChart: function (distribution) {
      var container = App.dom.createElement('div', { className: 'donut-container', style: 'width:100%;' });

      if (!Array.isArray(distribution) || distribution.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:13px;">No format data</div>';
        return container;
      }

      var size = 160;
      var strokeWidth = 24;
      var radius = (size - strokeWidth) / 2;
      var circumference = 2 * Math.PI * radius;

      var accumulatedPercent = 0;
      var svgArcs = '';

      distribution.forEach(function (item) {
        var dashArray = (item.percentage / 100) * circumference;
        var dashOffset = -((accumulatedPercent / 100) * circumference);

        svgArcs +=
          '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + radius + '" ' +
                  'fill="none" stroke="' + item.color + '" stroke-width="' + strokeWidth + '" ' +
                  'stroke-dasharray="' + dashArray + ' ' + (circumference - dashArray) + '" ' +
                  'stroke-dashoffset="' + dashOffset + '" transform="rotate(-90 ' + (size / 2) + ' ' + (size / 2) + ')">' +
            '<title>' + item.format + ': ' + item.percentage + '%</title>' +
          '</circle>';

        accumulatedPercent += item.percentage;
      });

      var svgHtml =
        '<div style="display:flex; justify-content:center; align-items:center;">' +
          '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
            svgArcs +
          '</svg>' +
        '</div>';

      // Donut Legend with JetBrains Mono numbers
      var legendHtml = '<div class="donut-legend">';
      distribution.forEach(function (item) {
        legendHtml +=
          '<div class="legend-item">' +
            '<span><span class="legend-color-dot" style="background-color:' + item.color + '"></span>' + item.format + '</span>' +
            '<strong class="mono-num">' + item.percentage + '% (' + item.count + ')</strong>' +
          '</div>';
      });
      legendHtml += '</div>';

      container.innerHTML = svgHtml + legendHtml;
      return container;
    }
  };
})(window.ContentOS);
