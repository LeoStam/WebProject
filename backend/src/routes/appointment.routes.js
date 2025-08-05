const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const auth = require('../middleware/auth');

router.use(auth()); // Require authentication for all appointment routes

// Δημιουργία νέου ραντεβού
router.post('/', appointmentController.createAppointment);

// Αναζήτηση ραντεβού
router.get('/search', appointmentController.searchAppointments);

// Λήψη ραντεβού
router.get('/:id', appointmentController.getAppointment);

// Ενημέρωση ραντεβού
router.put('/:id', appointmentController.updateAppointment);

// Ακύρωση ραντεβού
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;