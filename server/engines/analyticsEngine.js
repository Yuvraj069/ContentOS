'use strict';

// Ported from js/analyticsEngine.js — same formulas, same thresholds.
// IIFE wrapper replaced with module.exports; posts/followers passed as params.

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var analyticsEngine = {
  // 1. DAY-OF-WEEK & TIME NICHE PREDICTIONS GENERATOR
  getWeeklyDayPredictions: function (posts, followers) {
    var daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var dayStats = {};

    for (var d = 0; d < daysOrder.length; d++) {
      dayStats[daysOrder[d]] = {
        posts: [],
        totalReach: 0,
        formats: {},
        topics: {},
        times: {}
      };
    }

    var userPosts = Array.isArray(posts) ? posts : [];

    for (var i = 0; i < userPosts.length; i++) {
      var post = userPosts[i];
      if (!post.date) continue;

      var dateObj = new Date(post.date + 'T00:00:00');
      if (isNaN(dateObj.getTime())) continue;

      var dayName = DAYS[dateObj.getDay()];
      if (!dayStats[dayName]) continue;

      var reach = Number(post.reach) || 1000;
      var fmt = post.format || 'Reel';
      var topic = post.topic || 'General';
      var time = post.time || '18:00';

      dayStats[dayName].posts.push(post);
      dayStats[dayName].totalReach += reach;
      dayStats[dayName].formats[fmt] = (dayStats[dayName].formats[fmt] || 0) + reach;
      dayStats[dayName].topics[topic] = (dayStats[dayName].topics[topic] || 0) + reach;
      dayStats[dayName].times[time] = (dayStats[dayName].times[time] || 0) + reach;
    }

    var predictions = [];
    var followerCount = followers || 12500;

    for (var j = 0; j < daysOrder.length; j++) {
      var day = daysOrder[j];
      var stats = dayStats[day];

      var bestFmt = 'Reel';
      var maxFmtVal = -1;
      for (var f in stats.formats) {
        if (stats.formats[f] > maxFmtVal) {
          maxFmtVal = stats.formats[f];
          bestFmt = f;
        }
      }

      var bestTopic = 'Productivity Systems';
      var maxTopVal = -1;
      for (var t in stats.topics) {
        if (stats.topics[t] > maxTopVal) {
          maxTopVal = stats.topics[t];
          bestTopic = t;
        }
      }

      var defaultTimes = {
        Monday: '08:30 AM (Morning Focus)',
        Tuesday: '06:00 PM (Peak Activity)',
        Wednesday: '12:30 PM (Midday Break)',
        Thursday: '06:00 PM (High Reach)',
        Friday: '05:00 PM (Weekend Transition)',
        Saturday: '11:00 AM (Weekend Chill)',
        Sunday: '07:30 PM (Weekly Prep)'
      };

      var bestTime = defaultTimes[day];
      var maxTimeVal = -1;
      for (var tm in stats.times) {
        if (stats.times[tm] > maxTimeVal) {
          maxTimeVal = stats.times[tm];
          bestTime = tm + ' (Logged Peak)';
        }
      }

      var avgReach = stats.posts.length > 0
        ? Math.round(stats.totalReach / stats.posts.length)
        : Math.round(followerCount * (0.8 + (j * 0.05)));
      var viralScore = Math.min(98, Math.max(65, Math.round(70 + (avgReach / followerCount * 20))));

      var hooks = {
        Monday: '"Start your week with this 1 simple workflow shift..."',
        Tuesday: '"Why 90% of creators fail at [niche topic] (And how to fix it)"',
        Wednesday: '"Mid-week reset: 3 tools that saved me 5 hours this week"',
        Thursday: '"10 rules for [niche topic] I wish I knew 2 years ago"',
        Friday: '"Steal my exact weekend setup template for [niche topic]"',
        Saturday: '"Behind the scenes: How I structure my creative workflow"',
        Sunday: '"Sunday prep: 5 habits for a productive week ahead"'
      };

      predictions.push({
        day: day,
        bestFormat: bestFmt,
        bestTopic: bestTopic,
        bestTime: bestTime,
        avgReach: avgReach,
        viralScore: viralScore,
        suggestedHook: hooks[day],
        loggedCount: stats.posts.length
      });
    }

    return predictions;
  },

  // 2. SVG PERFORMANCE TREND GRAPH
  renderPerformanceTrendChart: function (userPosts) {
    var posts = Array.isArray(userPosts) ? userPosts.slice() : [];
    if (posts.length === 0) {
      return { empty: true };
    }

    posts.sort(function (a, b) {
      return new Date(a.date || 0) - new Date(b.date || 0);
    });

    var width = 760;
    var height = 240;
    var padding = { top: 30, right: 30, bottom: 40, left: 50 };
    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;

    var maxReach = 1;
    for (var i = 0; i < posts.length; i++) {
      var r = Number(posts[i].reach) || 1000;
      if (r > maxReach) maxReach = r;
    }

    var points = [];
    var numPts = posts.length;

    for (var k = 0; k < numPts; k++) {
      var x = padding.left + (numPts > 1 ? (k / (numPts - 1)) * chartW : chartW / 2);
      var reachVal = Number(posts[k].reach) || 1000;
      var yReach = padding.top + chartH - ((reachVal / maxReach) * chartH);
      points.push({ x: x, y: yReach, title: posts[k].title, reach: reachVal, date: posts[k].date });
    }

    return { points: points, width: width, height: height, padding: padding, chartW: chartW, chartH: chartH };
  },

  // 3. FORMAT EFFICIENCY
  getFormatEfficiency: function (userPosts) {
    var posts = Array.isArray(userPosts) ? userPosts : [];
    var formatTotals = { Reel: { count: 0, reach: 0 }, Carousel: { count: 0, reach: 0 }, Static: { count: 0, reach: 0 } };

    for (var i = 0; i < posts.length; i++) {
      var fmt = posts[i].format || 'Reel';
      if (fmt.indexOf('Reel') !== -1) fmt = 'Reel';
      else if (fmt.indexOf('Carousel') !== -1) fmt = 'Carousel';
      else fmt = 'Static';

      formatTotals[fmt].count++;
      formatTotals[fmt].reach += Number(posts[i].reach) || 1000;
    }

    var formats = ['Reel', 'Carousel', 'Static'];
    var avgs = {};
    var maxAvgReach = 1;

    for (var f = 0; f < formats.length; f++) {
      var item = formatTotals[formats[f]];
      var avg = item.count > 0 ? Math.round(item.reach / item.count) : 1000;
      avgs[formats[f]] = avg;
      if (avg > maxAvgReach) maxAvgReach = avg;
    }

    return { avgs: avgs, maxAvgReach: maxAvgReach };
  },

  // 4. PRECISION POST PREDICTION MODEL
  predictPostPerformance: function (title, format, topic, followers) {
    var cleanTitle = String(title || '').trim();
    var cleanFormat = format || 'Reel';
    var followerCount = followers || 12500;

    if (!cleanTitle) {
      return {
        score: 65,
        predictedReach: (Math.round(followerCount * 0.5)).toLocaleString() + ' - ' + (Math.round(followerCount * 0.9)).toLocaleString(),
        predictedEngRate: '8.4%',
        tips: ['Type a caption hook or title snippet to calculate day-and-niche precision predictions.']
      };
    }

    var baseScore = 65;

    if (cleanTitle.length >= 18 && cleanTitle.length <= 65) baseScore += 12;
    else if (cleanTitle.length > 5) baseScore += 6;

    var powerKeywords = ['how', 'mistake', 'secret', 'rule', 'setup', 'shortcut', 'top', 'doubled', 'why', 'fix', 'best', 'guide'];
    var keywordHits = 0;
    var lowerTitle = cleanTitle.toLowerCase();
    for (var k = 0; k < powerKeywords.length; k++) {
      if (lowerTitle.indexOf(powerKeywords[k]) !== -1) keywordHits++;
    }
    baseScore += Math.min(16, keywordHits * 7);

    if (cleanFormat === 'Reel') baseScore += 14;
    else if (cleanFormat === 'Carousel') baseScore += 10;
    else baseScore += 4;

    var finalScore = Math.min(98, Math.max(50, baseScore));

    var minReach = Math.round(followerCount * (finalScore / 100) * 0.75);
    var maxReach = Math.round(followerCount * (finalScore / 100) * 1.45);
    var engRate = (6.5 + (finalScore * 0.08)).toFixed(1) + '%';

    var tips = [];
    if (keywordHits === 0) tips.push('Add power words like "Secrets", "How-To", or "Mistakes" to boost initial reach.');
    if (cleanFormat === 'Static') tips.push('Switching to a 30s Reel or multi-slide Carousel could boost predicted reach by +35%.');
    if (tips.length === 0) tips.push('Strong title structure! High engagement probability based on your follower count and niche.');

    return {
      score: finalScore,
      predictedReach: minReach.toLocaleString() + ' - ' + maxReach.toLocaleString(),
      predictedEngRate: engRate,
      tips: tips
    };
  }
};

module.exports = analyticsEngine;
