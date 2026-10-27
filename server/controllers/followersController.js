const FollowerRecord = require('../models/FollowerRecord');

function getCurrentMonthKey() {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getFullYear();
}

// GET /api/followers — return current month's follower record for logged-in user
async function getFollowers(req, res, next) {
  try {
    const month = getCurrentMonthKey();
    // populate: left as-is since only user's own record is returned
    let record = await FollowerRecord.findOne({ user: req.user.id, month });
    if (!record) {
      // Try the most recent record
      record = await FollowerRecord.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    }
    res.json({ month, count: record ? record.count : null, isSet: !!record });
  } catch (err) {
    next(err);
  }
}

// PUT /api/followers — upsert current month's follower count
async function updateFollowers(req, res, next) {
  try {
    const count = Number(req.body.count);
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ error: 'Please enter a valid follower count (minimum 1)' });
    }

    const month = getCurrentMonthKey();
    let record = await FollowerRecord.findOne({ user: req.user.id, month });

    if (record) {
      record.count = count;
      await record.save();
    } else {
      record = await FollowerRecord.create({ user: req.user.id, count, month });
    }

    res.json({ month, count: record.count });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFollowers, updateFollowers };
