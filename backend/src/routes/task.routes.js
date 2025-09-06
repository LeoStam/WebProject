const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/task.controller');

// Create a new task
router.post('/', auth(), taskController.createTask);

// Get all tasks for an appointment
router.get('/appointment/:appointment_id', auth(), taskController.getTasks);

// Update a task
router.put('/:id', auth(), taskController.updateTask);

// Delete a task
router.delete('/:id', auth(), taskController.deleteTask);

module.exports = router;
