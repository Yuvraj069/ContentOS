/**
 * ContentOS - Dashboard Page Controller
 * Route: #/dashboard
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

  App.pages.dashboard = {
    /**
     * Render Dashboard view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();

      var profile = App.storage.get('contentos:profile', null);
      var posts = App.postsStore.getAll();
      var stats = App.analytics.computeStats(posts);
      var contentScore = App.analytics.computeContentScore(posts);
      var distribution = App.analytics.formatDistribution(posts);

      var userHandle = profile && profile.handle ? ('@' + profile.handle) : 'Creator';

      var wrapper = App.dom.createElement('div', { className: 'dashboard-grid animate-fade-up' });

      // Greeting Header
      var greetingHeader = App.dom.createElement('div', { style: 'grid-column: span 12;' }, [
        App.dom.createElement('h1', { className: 'page-title', textContent: 'Hey, ' + userHandle + ' 👋' }),
        App.dom.createElement('p', { className: 'page-subtitle', textContent: 'Here is your content performance overview and strategy dashboard.' })
      ]);

      wrapper.appendChild(greetingHeader);

      // Handle Zero Posts Case
      if (posts.length === 0) {
        var emptySection = App.dom.createElement('div', { style: 'grid-column: span 12;' });
        var emptyEl = App.components.emptyState.render(
          'Your Workspace is Ready',
          'Log your first content post to calculate your Content Score, unlock engagement bar charts, and view format distribution analytics.',
          '＋ Log Your First Post',
          '#/posts'
        );
        emptySection.appendChild(emptyEl);
        wrapper.appendChild(emptySection);
        container.appendChild(wrapper);
        return;
      }

      // 1. Content Score Card
      var scoreCard = App.dom.createElement('div', { className: 'score-card' });

      var scoreInfo = App.dom.createElement('div', { className: 'score-info' }, [
        App.dom.createElement('div', { className: 'hero-pill', textContent: '✦ ALGORITHMIC SCORE' }),
        App.dom.createElement('h2', { style: 'font-size:var(--font-size-2xl); font-weight:700;', textContent: 'Content Score' }),
        App.dom.createElement('p', { textContent: 'A transparent score evaluating engagement rate (40%), posting volume (35%), and format variety (25%).' })
      ]);

      var scoreRingEl = App.components.scoreRing.render(contentScore.score, contentScore.label);

      scoreCard.appendChild(scoreInfo);
      scoreCard.appendChild(scoreRingEl);
      wrapper.appendChild(scoreCard);

      // 2. Metric Stat Cards Row (JetBrains Mono numbers)
      var statCardsRow = App.dom.createElement('div', { className: 'stat-cards-container' });

      var topEngagementText = stats.topPost ? (App.analytics.calculatePostEngagement(stats.topPost) * 100).toFixed(1) + '%' : 'N/A';

      statCardsRow.appendChild(this.createMetricCard('Total Posts Logged', stats.totalPosts, 'Active performance logs'));
      statCardsRow.appendChild(this.createMetricCard('Average Engagement', stats.avgEngagementRate + '%', 'Interactions / Reach'));
      statCardsRow.appendChild(this.createMetricCard('Top Content Format', stats.bestFormat, 'Highest avg rate'));
      statCardsRow.appendChild(this.createMetricCard('Best Post Engagement', topEngagementText, stats.topPost ? (stats.topPost.title.substring(0, 16) + '...') : 'No posts'));

      wrapper.appendChild(statCardsRow);

      // 3. SVG Bar Chart Card (Recent Posts)
      var barChartCard = App.dom.createElement('div', { className: 'chart-card-large' });
      var barHeader = App.dom.createElement('div', { className: 'chart-header' }, [
        App.dom.createElement('h3', { textContent: 'Recent Post Engagement Rates' }),
        App.dom.createElement('span', { className: 'badge badge-purple', textContent: 'Last 10 Posts' })
      ]);
      var barChartEl = App.components.barChart.renderBarChart(posts);

      barChartCard.appendChild(barHeader);
      barChartCard.appendChild(barChartEl);
      wrapper.appendChild(barChartCard);

      // 4. SVG Donut Chart Card (Format Distribution)
      var donutChartCard = App.dom.createElement('div', { className: 'chart-card-small' });
      var donutHeader = App.dom.createElement('div', { className: 'chart-header' }, [
        App.dom.createElement('h3', { textContent: 'Format Mix' }),
        App.dom.createElement('span', { className: 'badge badge-pink', textContent: 'Distribution' })
      ]);
      var donutChartEl = App.components.barChart.renderDonutChart(distribution);

      donutChartCard.appendChild(donutHeader);
      donutChartCard.appendChild(donutChartEl);
      wrapper.appendChild(donutChartCard);

      // 5. Collapsible Accordion Card
      var accordionCard = App.dom.createElement('div', { className: 'accordion-card' });
      var accordionTrigger = App.dom.createElement('button', {
        className: 'accordion-trigger',
        innerHTML: '<span>📐 How is the Content Score calculated?</span><span id="accordionIcon">＋</span>'
      });
      var accordionContent = App.dom.createElement('div', {
        className: 'accordion-content',
        style: 'display:none;',
        innerHTML:
          '<p style="margin-bottom:8px;">The Content Score is computed using a <strong>transparent, rule-based mathematical formula</strong>:</p>' +
          '<ul style="margin-left:20px; display:flex; flex-direction:column; gap:4px;">' +
            '<li><strong>40% Average Engagement:</strong> Evaluates average interactions <code>(Likes+Comments+Shares)/Reach</code> against a 10% benchmark.</li>' +
            '<li><strong>35% Posting Volume:</strong> Rewards consistent logging up to 5+ active posts.</li>' +
            '<li><strong>25% Format Variety:</strong> Rewards testing multiple content formats (Reels, Carousels, Statics, Stories).</li>' +
          '</ul>'
      });

      addListener(accordionTrigger, 'click', function () {
        var isHidden = accordionContent.style.display === 'none';
        accordionContent.style.display = isHidden ? 'block' : 'none';
        var icon = App.dom.qs('#accordionIcon', accordionTrigger);
        if (icon) icon.textContent = isHidden ? '−' : '＋';
      });

      accordionCard.appendChild(accordionTrigger);
      accordionCard.appendChild(accordionContent);
      wrapper.appendChild(accordionCard);

      container.appendChild(wrapper);
    },

    /**
     * Helper to render metric card with JetBrains Mono font on numbers.
     */
    createMetricCard: function (label, value, subtext) {
      return App.dom.createElement('div', { className: 'metric-card' }, [
        App.dom.createElement('span', { className: 'metric-label', textContent: label }),
        App.dom.createElement('span', { className: 'metric-value mono-num', textContent: value }),
        App.dom.createElement('span', { className: 'metric-subtext', textContent: subtext })
      ]);
    },

    /**
     * Destroy listeners.
     */
    destroy: function () {
      activeListeners.forEach(function (item) {
        if (item.el) item.el.removeEventListener(item.event, item.handler);
      });
      activeListeners = [];
    }
  };
})(window.ContentOS);
