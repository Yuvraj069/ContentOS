const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPosts, createPost, updatePost, deletePost, importPosts, upload } = require('../controllers/postsController');

// All routes require auth middleware — route guard
router.use(auth);

// Import must be before /:id routes to avoid conflict
router.post('/import', upload.single('file'), importPosts);

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
