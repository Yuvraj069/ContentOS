const Post = require('../models/Post');
const FollowerRecord = require('../models/FollowerRecord');
const analyticsEngine = require('../engines/analyticsEngine');
const recommendations = require('../engines/recommendations');
const indulgenceEngine = require('../engines/indulgenceEngine');

// GET /api/analytics/summary
async function getSummary(req, res, next) {
  try {
    const posts = await Post.find({ user: req.user.id }).lean();

    // Get latest follower count for this user
    const followerRecord = await FollowerRecord.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const followers = followerRecord ? followerRecord.count : 12500;

    const stats = recommendations.getStats(posts);
    const topFacts = recommendations.getTopFacts(posts);
    const indulgence = indulgenceEngine.calculateIndulgence(followers, posts);
    const weeklyPredictions = analyticsEngine.getWeeklyDayPredictions(posts, followers);
    const trendChart = analyticsEngine.renderPerformanceTrendChart(posts);
    const formatEfficiency = analyticsEngine.getFormatEfficiency(posts);

    res.json({
      stats,
      topFacts,
      indulgence,
      weeklyPredictions,
      trendChart,
      formatEfficiency,
      followers,
      totalPosts: posts.length
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/analytics/predict — candidate title + format; returns viral score, reach range, eng rate
// Output fields identical to Eval 1 predictPostPerformance
async function predict(req, res, next) {
  try {
    const { title, format, topic } = req.body;

    if (!title && !format) {
      return res.status(400).json({ error: 'Title or format is required' });
    }

    // Get user's latest follower count so predictor uses real data
    const followerRecord = await FollowerRecord.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const followers = followerRecord ? followerRecord.count : 12500;

    const result = analyticsEngine.predictPostPerformance(title, format, topic, followers);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, predict };
