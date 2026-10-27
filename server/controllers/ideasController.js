const SavedHook = require('../models/SavedHook');
const ideaEngine = require('../engines/ideaEngine');

// GET /api/ideas/:niche — generate idea via adviceslip, fallback on failure
async function generateIdea(req, res, next) {
  try {
    const niche = req.params.niche;
    const result = await ideaEngine.generateIdea(niche);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/ideas/saved/list
// populate("user", "handle niche") — viva: populate joins the User document inline
async function listSavedHooks(req, res, next) {
  try {
    const hooks = await SavedHook.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'handle niche'); // populate: attaches handle+niche from User
    res.json(hooks);
  } catch (err) {
    next(err);
  }
}

// POST /api/ideas/saved
async function saveHook(req, res, next) {
  try {
    const { text, niche } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Hook text is required' });
    }
    const hook = await SavedHook.create({
      user: req.user.id,
      niche: niche || req.user.niche || 'Lifestyle',
      text: String(text).trim()
    });
    res.status(201).json(hook);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/ideas/saved/:id
async function deleteSavedHook(req, res, next) {
  try {
    const hook = await SavedHook.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!hook) return res.status(404).json({ error: 'Hook not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateIdea, listSavedHooks, saveHook, deleteSavedHook };
