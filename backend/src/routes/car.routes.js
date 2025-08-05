const express = require('express');
const router = express.Router();
const carController = require('../controllers/car.controller');
const auth = require('../middleware/auth');

router.use(auth()); // Require authentication for all car routes

router.post('/', carController.createCar);
router.post('/bulk', auth(['secretary']), carController.bulkCreateCars);
router.get('/search', carController.searchCars);
router.get('/:vin', carController.getCar);
router.put('/:vin', carController.updateCar);
router.delete('/:vin', carController.deleteCar);

module.exports = router;