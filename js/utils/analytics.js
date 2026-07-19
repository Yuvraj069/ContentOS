/**
 * ContentOS - Analytics & Content Score Calculations
 * Pure mathematical functions for computing performance metrics, Content Score, and format breakdowns.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  /**
   * Calculate engagement rate for a single post: (likes + comments + shares) / reach.
   * Guarded against divide-by-zero.
   * @param {Object} post
   * @returns {number} Decimal rate
   */
  function calculatePostEngagement(post) {
    if (!post || !post.reach || Number(post.reach) <= 0) {
      return 0;
    }
    var interactions = (Number(post.likes) || 0) + (Number(post.comments) || 0) + (Number(post.shares) || 0);
    return interactions / Number(post.reach);
  }

  App.analytics = {
    calculatePostEngagement: calculatePostEngagement,

    /**
     * Compute aggregated metrics for a list of posts.
     * @param {Array} posts
     * @returns {Object} { totalPosts, avgEngagementRate, bestFormat, topPost }
     */
    computeStats: function (posts) {
      if (!Array.isArray(posts) || posts.length === 0) {
        return {
          totalPosts: 0,
          avgEngagementRate: 0,
          bestFormat: 'N/A',
          topPost: null
        };
      }

      var totalEngagementSum = 0;
      var formatEngagementMap = {};
      var formatCountMap = {};
      var topPost = null;
      var highestEngagement = -1;

      posts.forEach(function (post) {
        var rate = calculatePostEngagement(post);
        totalEngagementSum += rate;

        var fmt = post.format || 'Other';
        if (!formatEngagementMap[fmt]) {
          formatEngagementMap[fmt] = 0;
          formatCountMap[fmt] = 0;
        }
        formatEngagementMap[fmt] += rate;
        formatCountMap[fmt] += 1;

        if (rate > highestEngagement) {
          highestEngagement = rate;
          topPost = post;
        }
      });

      var avgEngagementRate = (totalEngagementSum / posts.length) * 100;

      var bestFormat = 'N/A';
      var bestFormatAvg = -1;
      Object.keys(formatEngagementMap).forEach(function (fmt) {
        var avg = formatEngagementMap[fmt] / formatCountMap[fmt];
        if (avg > bestFormatAvg) {
          bestFormatAvg = avg;
          bestFormat = fmt;
        }
      });

      return {
        totalPosts: posts.length,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        bestFormat: bestFormat,
        topPost: topPost
      };
    },

    /**
     * Compute rule-based Content Score (0 - 100).
     * Weights:
     * - Engagement Component (40% weight): 0% - 10% rate mapped to 0 - 100 pts.
     * - Consistency Component (35% weight): Volume scaled up to 5+ posts.
     * - Format Diversity Component (25% weight): 1 format = 40, 2 = 70, 3+ = 100.
     *
     * @param {Array} posts
     * @returns {{score: number, label: string, details: Object}}
     */
    computeContentScore: function (posts) {
      if (!Array.isArray(posts) || posts.length === 0) {
        return {
          score: 0,
          label: 'Just Getting Started',
          details: { engagementScore: 0, consistencyScore: 0, diversityScore: 0 }
        };
      }

      var stats = this.computeStats(posts);

      var engagementScore = Math.min(100, (stats.avgEngagementRate / 10) * 100);
      var consistencyScore = Math.min(100, (posts.length / 5) * 100);

      var formatSet = {};
      posts.forEach(function (p) { if (p.format) formatSet[p.format] = true; });
      var formatCount = Object.keys(formatSet).length;
      var diversityScore = 40;
      if (formatCount === 2) diversityScore = 70;
      if (formatCount >= 3) diversityScore = 100;

      var weightedScore = Math.round(
        (engagementScore * 0.40) +
        (consistencyScore * 0.35) +
        (diversityScore * 0.25)
      );

      var finalScore = Math.max(0, Math.min(100, weightedScore));

      var label = 'Just Getting Started';
      if (finalScore > 85) {
        label = 'Strong Momentum';
      } else if (finalScore >= 60) {
        label = 'Building Steadily';
      }

      return {
        score: finalScore,
        label: label,
        details: {
          engagementScore: Math.round(engagementScore),
          consistencyScore: Math.round(consistencyScore),
          diversityScore: Math.round(diversityScore)
        }
      };
    },

    /**
     * Compute format distribution percentages for donut chart.
     * @param {Array} posts
     * @returns {Array} List of { format, count, percentage, color }
     */
    formatDistribution: function (posts) {
      if (!Array.isArray(posts) || posts.length === 0) {
        return [];
      }

      var formatColors = {
        'Reel': '#8B5CF6',
        'Carousel': '#EC4899',
        'Static': '#3B82F6',
        'Story': '#10B981',
        'Other': '#F59E0B'
      };

      var counts = {};
      posts.forEach(function (post) {
        var fmt = post.format || 'Other';
        counts[fmt] = (counts[fmt] || 0) + 1;
      });

      var total = posts.length;
      var result = [];

      Object.keys(counts).forEach(function (fmt) {
        var count = counts[fmt];
        var percentage = Math.round((count / total) * 100);
        result.push({
          format: fmt,
          count: count,
          percentage: percentage,
          color: formatColors[fmt] || '#9B9BA6'
        });
      });

      return result;
    }
  };
})(window.ContentOS);
