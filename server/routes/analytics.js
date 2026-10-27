const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSummary, predict } = require('../controllers/analyticsController');

router.use(auth);

router.get('/summary', getSummary);
router.post('/predict', predict);

module.exports = router;
