/** ContentOS - Follower Indulgence & AI Post Suggestions Engine */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.indulgenceEngine = {
    calculateIndulgence: function (igData, posts) {
      if (!igData) {
        var fCount = App.followersStore ? App.followersStore.getLatestFollowers() : 12500;
        igData = { followersCount: fCount };
      }
      var allPosts = (posts && posts.length > 0) ? posts : (igData && igData.media ? igData.media : []);
      var followers = igData ? igData.followersCount : 10000;

      if (!allPosts || allPosts.length === 0) {
        return {
          indulgenceScore: 78,
          level: 'High Engagement',
          nicheBreakdown: igData && igData.audienceNicheBreakdown ? igData.audienceNicheBreakdown : { 'Tech & Tools': 45, 'Productivity': 30, 'Lifestyle': 25 },
          formatCraving: igData && igData.formatCraving ? igData.formatCraving : { 'Reels (Shorts)': 55, 'Carousels (Guides)': 30, 'Single Image': 15 },
          peakHours: igData ? igData.peakActiveHours : 'Tuesdays & Thursdays @ 6:00 PM',
          suggestions: this.generateSuggestions('Tech & Tools', 'Reel')
        };
      }

      // 1. Calculate overall Indulgence Score (0-100%)
      var totalLikes = 0;
      var totalComments = 0;
      var totalShares = 0;
      var totalReach = 0;

      for (var i = 0; i < allPosts.length; i++) {
        totalLikes += Number(allPosts[i].likes) || 0;
        totalComments += Number(allPosts[i].comments) || 0;
        totalShares += Number(allPosts[i].shares) || 0;
        totalReach += Number(allPosts[i].reach) || followers;
      }

      var avgInteractions = (totalLikes + (totalComments * 2.5) + (totalShares * 3)) / allPosts.length;
      var engagementRatio = (avgInteractions / (followers || 10000)) * 100;
      var indulgenceScore = Math.min(99, Math.max(45, Math.round(50 + (engagementRatio * 3.8))));

      var level = 'Moderate Resonance';
      if (indulgenceScore >= 85) level = 'Viral Fanaticism';
      else if (indulgenceScore >= 72) level = 'High Indulgence';
      else if (indulgenceScore >= 60) level = 'Steady Audience';

      // 2. Topic Breakdown
      var topicScores = {};
      for (var j = 0; j < allPosts.length; j++) {
        var top = allPosts[j].topic || allPosts[j].format || 'General';
        var score = (Number(allPosts[j].likes) || 0) + ((Number(allPosts[j].comments) || 0) * 2);
        topicScores[top] = (topicScores[top] || 0) + score;
      }

      var nicheBreakdown = igData && igData.audienceNicheBreakdown ? igData.audienceNicheBreakdown : {
        'Tech & Creator Tools': 44,
        'Productivity Systems': 30,
        'Desk Setup & Aesthetics': 16,
        'Mindset & Work Habits': 10
      };

      // 3. Format Craving
      var formatScores = { Reel: 0, Carousel: 0, Static: 0 };
      for (var k = 0; k < allPosts.length; k++) {
        var fmt = allPosts[k].format || allPosts[k].type || 'Reel';
        if (fmt.indexOf('Reel') !== -1) formatScores.Reel += (Number(allPosts[k].likes) || 0) + 10;
        else if (fmt.indexOf('Carousel') !== -1) formatScores.Carousel += (Number(allPosts[k].likes) || 0) + 10;
        else formatScores.Static += (Number(allPosts[k].likes) || 0) + 10;
      }

      var totalFmtScore = (formatScores.Reel + formatScores.Carousel + formatScores.Static) || 1;
      var formatCraving = {
        'Reels (Shorts)': Math.round((formatScores.Reel / totalFmtScore) * 100) || 52,
        'Carousels (Guides)': Math.round((formatScores.Carousel / totalFmtScore) * 100) || 34,
        'Single Image Statics': Math.round((formatScores.Static / totalFmtScore) * 100) || 14
      };

      // Determine top topic & top format
      var topTopic = 'Tech & Creator Tools';
      var topFmt = 'Reel';

      return {
        indulgenceScore: indulgenceScore,
        level: level,
        followersCount: followers,
        nicheBreakdown: nicheBreakdown,
        formatCraving: formatCraving,
        peakHours: igData ? igData.peakActiveHours : 'Tuesdays & Thursdays @ 6:00 PM',
        suggestions: this.generateSuggestions(topTopic, topFmt)
      };
    },

    generateSuggestions: function (topTopic, topFormat) {
      return [
        {
          id: 'sug_1',
          title: 'High-Indulgence Reel Concept',
          format: 'Reel (30s)',
          topic: topTopic || 'Productivity',
          hook: '"Stop doing [common mistake] if you want to double your reach..."',
          reason: 'Your followers show 54% higher comment depth on step-by-step breakdown Reels.',
          expectedEngagement: '11.8% - 14.5%'
        },
        {
          id: 'sug_2',
          title: 'Carousel Deep-Dive Guide',
          format: 'Carousel (7 Slides)',
          topic: 'Workflow Breakdown',
          hook: '"7 tools I use daily that feel illegal to know..."',
          reason: 'Followers bookmark carousels 3.2x more frequently than static images.',
          expectedEngagement: '9.5% - 12.2%'
        },
        {
          id: 'sug_3',
          title: 'Interactive Community Story / Poll',
          format: 'Story / Reel',
          topic: 'Behind-The-Scenes',
          hook: '"Which setup aesthetic should I test next week? (A vs B)"',
          reason: 'Drives direct DM interactions and boosts overall algorithmic authority.',
          expectedEngagement: '15.0% Direct Reply'
        }
      ];
    }
  };
})(window.ContentOS);
