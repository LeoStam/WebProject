const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats.controller');
const auth = require('../middleware/auth');

// Use auth middleware with admin role
router.get('/', auth(['admin']), controller.getStats);

module.exports = router;
