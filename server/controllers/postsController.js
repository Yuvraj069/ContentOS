const Post = require('../models/Post');
const validators = require('../engines/validators');
const multer = require('multer');

// multer: memory storage, 1MB limit, .csv only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are allowed'));
    }
  }
});

const VALID_FORMATS = ['Reel', 'Carousel', 'Static'];

function validatePostData(data) {
  const errors = [];
  const tRes = validators.required(data.title, 'Title');
  if (!tRes.valid) errors.push(tRes.error);

  const dRes = validators.required(data.date, 'Date');
  if (!dRes.valid) errors.push(dRes.error);

  if (!VALID_FORMATS.includes(data.format)) {
    errors.push('Format must be Reel, Carousel, or Static');
  }

  const likesRes = validators.nonNegative(data.likes, 'Likes');
  if (!likesRes.valid) errors.push(likesRes.error);

  const commentsRes = validators.nonNegative(data.comments, 'Comments');
  if (!commentsRes.valid) errors.push(commentsRes.error);

  const sharesRes = validators.nonNegative(data.shares, 'Shares');
  if (!sharesRes.valid) errors.push(sharesRes.error);

  const reachNum = Number(data.reach);
  if (isNaN(reachNum) || reachNum < 1) {
    errors.push('Reach must be at least 1');
  }

  return errors;
}

// GET /api/posts — supports ?page, ?limit, ?format, ?topic, ?from, ?to
async function getPosts(req, res, next) {
  try {
    const { page = 1, limit = 10, format, topic, from, to } = req.query;
    const filter = { user: req.user.id };

    if (format) filter.format = format;
    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Post.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts
async function createPost(req, res, next) {
  try {
    const errors = validatePostData(req.body);
    if (errors.length > 0) return res.status(400).json({ error: errors[0] });

    const post = await Post.create({
      user: req.user.id,
      title: String(req.body.title).trim(),
      format: req.body.format,
      topic: String(req.body.topic || '').trim(),
      date: req.body.date,
      likes: Number(req.body.likes) || 0,
      comments: Number(req.body.comments) || 0,
      shares: Number(req.body.shares) || 0,
      reach: Number(req.body.reach)
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id
async function updatePost(req, res, next) {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const errors = validatePostData(req.body);
    if (errors.length > 0) return res.status(400).json({ error: errors[0] });

    post.title = String(req.body.title).trim();
    post.format = req.body.format;
    post.topic = String(req.body.topic || '').trim();
    post.date = req.body.date;
    post.likes = Number(req.body.likes) || 0;
    post.comments = Number(req.body.comments) || 0;
    post.shares = Number(req.body.shares) || 0;
    post.reach = Number(req.body.reach);

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id
async function deletePost(req, res, next) {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts/import — CSV import via multer
async function importPosts(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const csv = req.file.buffer.toString('utf-8');
    const lines = csv.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) return res.status(400).json({ error: 'CSV has no data rows' });

    // Parse header: title,format,topic,date,likes,comments,shares,reach
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedCols = ['title', 'format', 'topic', 'date', 'likes', 'comments', 'shares', 'reach'];
    for (const col of expectedCols) {
      if (!header.includes(col)) {
        return res.status(400).json({ error: 'CSV missing column: ' + col });
      }
    }

    let added = 0;
    let skipped = 0;
    const toInsert = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row = {};
      header.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });

      // Validate each row with ported validators
      const errors = validatePostData(row);
      if (errors.length > 0) { skipped++; continue; }

      toInsert.push({
        user: req.user.id,
        title: row.title,
        format: row.format,
        topic: row.topic || '',
        date: row.date,
        likes: Number(row.likes) || 0,
        comments: Number(row.comments) || 0,
        shares: Number(row.shares) || 0,
        reach: Number(row.reach)
      });
      added++;
    }

    if (toInsert.length > 0) await Post.insertMany(toInsert);

    res.json({ added, skipped });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPosts, createPost, updatePost, deletePost, importPosts, upload };
