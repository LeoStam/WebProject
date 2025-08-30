const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats.controller');
const auth = require('../middleware/auth');

// Allow secretary role to access stats
router.get('/', auth(['secretary']), controller.getStats);

module.exports = router;
