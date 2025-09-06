const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/me', auth(), userController.getCurrentUser);

// Update own profile
router.put('/me', auth(), userController.updateOwnProfile);

// Secretary operations
router.get('/', auth(['secretary']), userController.getAllUsers);
router.get('/search', auth(['secretary']), userController.searchUsers);
router.get('/:id', auth(['secretary']), userController.getUser);
router.patch('/:id', auth(['secretary']), userController.updateUser);
router.put('/:id', auth(['secretary']), userController.updateUser);
router.patch('/:id/activate', auth(['secretary']), userController.activateUser);
router.delete('/:id', auth(['secretary']), userController.deleteUser);

module.exports = router;