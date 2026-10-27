/* Recommendations Calculator */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  function getEngagement(post) {
    if (!post || !post.reach || Number(post.reach) <= 0) return 0;
    var total = (Number(post.likes) || 0) + (Number(post.comments) || 0) + (Number(post.shares) || 0);
    return total / Number(post.reach);
  }

  App.recommendations = {
    getStats: function (posts) {
      if (!Array.isArray(posts) || posts.length === 0) {
        return { totalPosts: 0, avgEngagement: 0 };
      }

      var totalSum = 0;
      for (var i = 0; i < posts.length; i++) {
        totalSum += getEngagement(posts[i]);
      }
      var avgEng = (totalSum / posts.length) * 100;

      return {
        totalPosts: posts.length,
        avgEngagement: Math.round(avgEng * 10) / 10
      };
    },

    getTopFacts: function (posts) {
      if (!Array.isArray(posts) || posts.length < 3) {
        return null;
      }

      // 1. Best Format
      var formatSum = {};
      var formatCount = {};

      for (var i = 0; i < posts.length; i++) {
        var fmt = posts[i].format || 'Other';
        var eng = getEngagement(posts[i]);
        formatSum[fmt] = (formatSum[fmt] || 0) + eng;
        formatCount[fmt] = (formatCount[fmt] || 0) + 1;
      }

      var bestFormat = 'N/A';
      var bestFormatAvg = -1;
      for (var f in formatSum) {
        var avg = formatSum[f] / formatCount[f];
        if (avg > bestFormatAvg) {
          bestFormatAvg = avg;
          bestFormat = f;
        }
      }

      // 2. Best Day of Week
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var daySum = {};
      var dayCount = {};

      for (var j = 0; j < posts.length; j++) {
        if (!posts[j].date) continue;
        var d = new Date(posts[j].date + 'T00:00:00');
        if (isNaN(d.getTime())) continue;
        var dayName = days[d.getDay()];

        var engDay = getEngagement(posts[j]);
        daySum[dayName] = (daySum[dayName] || 0) + engDay;
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      }

      var bestDay = 'N/A';
      var bestDayAvg = -1;
      for (var day in daySum) {
        var avgDay = daySum[day] / dayCount[day];
        if (avgDay > bestDayAvg) {
          bestDayAvg = avgDay;
          bestDay = day;
        }
      }

      // 3. Top Topic
      var topicSum = {};
      var topicCount = {};

      for (var k = 0; k < posts.length; k++) {
        if (!posts[k].topic) continue;
        var top = String(posts[k].topic).trim();
        if (!top) continue;

        var engTop = getEngagement(posts[k]);
        topicSum[top] = (topicSum[top] || 0) + engTop;
        topicCount[top] = (topicCount[top] || 0) + 1;
      }

      var topTopic = 'General';
      var topTopicAvg = -1;
      for (var t in topicSum) {
        var avgTopic = topicSum[t] / topicCount[t];
        if (avgTopic > topTopicAvg) {
          topTopicAvg = avgTopic;
          topTopic = t;
        }
      }

      return {
        bestFormat: bestFormat + ' (' + (Math.round(bestFormatAvg * 1000) / 10) + '% avg engagement)',
        bestDay: bestDay + ' (' + (Math.round(bestDayAvg * 1000) / 10) + '% avg engagement)',
        topTopic: (topTopic === 'General' ? 'General' : '#' + topTopic) + ' (' + (topTopicAvg >= 0 ? (Math.round(topTopicAvg * 1000) / 10) + '% avg engagement' : 'N/A') + ')'
      };
    }
  };
})(window.ContentOS);
