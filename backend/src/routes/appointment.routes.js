const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const auth = require('../middleware/auth');

// Basic appointment operations
router.get('/', auth(['secretary', 'customer', 'mechanic']), appointmentController.getAllAppointments);
router.post('/', auth(['secretary', 'customer']), appointmentController.createAppointment);
router.get('/:id', auth(), appointmentController.getAppointment);

// Management operations
router.patch('/:id/cancel', auth(['secretary', 'customer']), appointmentController.cancelAppointment);
router.patch('/:id/assign', auth(['secretary']), appointmentController.assignMechanic);

module.exports = router;