const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FollowerRecord = require('../models/FollowerRecord');

// Helper: get current month key matching Eval 1 format (e.g. "Oct 2026")
function getCurrentMonthKey() {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getFullYear();
}

// POST /api/auth/register
// Same validation messages as js/auth.js
async function register(req, res, next) {
  try {
    const { handle, password, niche, initialFollowers } = req.body;
    const cleanHandle = String(handle || '').trim().toLowerCase().replace(/^@+/, '');

    if (!cleanHandle || cleanHandle.length < 2) {
      return res.status(400).json({ error: 'Handle must be at least 2 characters' });
    }
    if (!password || String(password).trim().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    const followerNum = Number(initialFollowers);
    if (isNaN(followerNum) || followerNum < 1) {
      return res.status(400).json({ error: 'Please enter a valid follower count (minimum 1)' });
    }

    const existing = await User.findOne({ handle: cleanHandle });
    if (existing) {
      return res.status(400).json({ error: 'Account @' + cleanHandle + ' already exists. Please login instead.' });
    }

    // Hash password — bcrypt salt rounds = 10; never store plain text
    const passwordHash = await bcrypt.hash(String(password).trim(), 10);

    const user = await User.create({
      handle: cleanHandle,
      passwordHash,
      niche: niche || 'Lifestyle'
    });

    // Also create the first FollowerRecord (registration step)
    await FollowerRecord.create({
      user: user._id,
      count: Math.max(1, followerNum),
      month: getCurrentMonthKey()
    });

    // Sign token with 7d expiry
    const token = jwt.sign(
      { id: user._id, handle: user.handle, niche: user.niche },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, handle: user.handle, niche: user.niche });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { handle, password } = req.body;
    const cleanHandle = String(handle || '').trim().toLowerCase().replace(/^@+/, '');
    const cleanPass = String(password || '').trim();

    if (!cleanHandle || cleanHandle.length < 2) {
      return res.status(400).json({ error: 'Handle must be at least 2 characters' });
    }
    if (!cleanPass || cleanPass.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const user = await User.findOne({ handle: cleanHandle });
    if (!user) {
      return res.status(400).json({ error: 'Account @' + cleanHandle + ' does not exist. Please register first.' });
    }

    // Compare hashed password — bcrypt.compare handles timing-safe comparison
    const match = await bcrypt.compare(cleanPass, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect password for @' + cleanHandle });
    }

    const token = jwt.sign(
      { id: user._id, handle: user.handle, niche: user.niche },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, handle: user.handle, niche: user.niche });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
