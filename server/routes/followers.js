const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getFollowers, updateFollowers } = require('../controllers/followersController');

router.use(auth);

router.get('/', getFollowers);
router.put('/', updateFollowers);

module.exports = router;
