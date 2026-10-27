const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateIdea, listSavedHooks, saveHook, deleteSavedHook } = require('../controllers/ideasController');

router.use(auth);

// Order matters: /saved/list must come before /:niche to avoid "saved" being treated as niche param
router.get('/saved/list', listSavedHooks);
router.post('/saved', saveHook);
router.delete('/saved/:id', deleteSavedHook);
router.get('/:niche', generateIdea);

module.exports = router;
