const Car = require('../models/car.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const csv = require('csv-parse');

exports.createCar = async (req, res) => {
  try {
    const car = await Car.create({
      ...req.body,
      owner_id: req.user.role === 'secretary' ? req.body.owner_id : req.user.id
    });

    res.status(201).json({
      success: true,
      data: car
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.bulkCreateCars = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const results = {
      success: [],
      failed: []
    };

    for (const carData of req.body) {
      try {
        const car = await Car.create(carData, { transaction });
        results.success.push(car.vin);
      } catch (error) {
        results.failed.push({
          vin: carData.vin,
          reason: error.message
        });
      }
    }

    await transaction.commit();
    res.status(201).json({ results });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.vin, {
      include: [{ model: User, attributes: ['id', 'full_name', 'email'] }]
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== car.owner_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.vin);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== car.owner_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await car.update(req.body);
    res.json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchCars = async (req, res) => {
  try {
    const { vin, brand, model, owner_id } = req.query;
    const whereClause = {};

    if (vin) whereClause.vin = { [Op.like]: `%${vin}%` };
    if (brand) whereClause.brand = { [Op.like]: `%${brand}%` };
    if (model) whereClause.model = { [Op.like]: `%${model}%` };
    if (owner_id) whereClause.owner_id = owner_id;

    // Non-secretary users can only see their own cars
    if (req.user.role !== 'secretary') {
      whereClause.owner_id = req.user.id;
    }

    const cars = await Car.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'full_name', 'email'] }]
    });

    res.json(cars);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteCar = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const car = await Car.findByPk(req.params.vin);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== car.owner_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await car.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};