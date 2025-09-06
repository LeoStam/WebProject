const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-admin', authController.checkAdmin);

// Protected routes
router.post('/change-password', auth(), authController.changePassword);
router.post('/create-secretary', auth(['secretary']), authController.createSecretary);
router.post('/bulk-register', auth(['secretary']), authController.bulkRegister);

module.exports = router;