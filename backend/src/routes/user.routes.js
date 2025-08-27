const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

router.use(auth()); // Require authentication for all user routes

// Get current user profile
router.get('/me', auth(), userController.getCurrentUser);

// GET all users (Secretary only)
router.get('/', auth(['secretary']), userController.getAllUsers);

// Search users (Secretary only)
router.get('/search', auth(['secretary']), userController.searchUsers);

// Get user by ID
router.get('/:id', userController.getUser);

// Update user by ID
router.patch('/:id', userController.updateUser);

// Activate user account (Secretary only)
router.patch('/:id/activate', auth(['secretary']), userController.activateUser);

// Delete user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;