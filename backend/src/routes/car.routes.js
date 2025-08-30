const express = require('express');
const router = express.Router();
const carController = require('../controllers/car.controller');
const auth = require('../middleware/auth');

// Get all cars (filtered by role)
router.get('/', auth(['secretary', 'customer', 'mechanic']), carController.getAllCars);

// Search cars
router.get('/search', auth(['secretary']), carController.searchCars);

// Bulk operations (Secretary only)
router.post('/bulk', auth(['secretary']), carController.bulkCreateCars);

// Individual car operations
router.post('/', auth(['secretary', 'customer']), carController.createCar);
router.get('/:vin', auth(), carController.getCar);
router.put('/:vin', auth(['secretary']), carController.updateCar);
router.delete('/:vin', auth(['secretary']), carController.deleteCar);

module.exports = router;