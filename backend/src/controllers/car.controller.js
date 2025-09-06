const { Car, User } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/db.config');

exports.createCar = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    console.log('Creating car with data:', req.body);
    console.log('User role:', req.user.role, 'User ID:', req.user.id);

    const {
      vin,
      brand,
      model,
      vehicle_type,
      fuel_type,
      production_year,
      doors_count,
      wheels_count,
      color,
      plate_number,
      owner_id
    } = req.body;

    // Validate required fields
    if (!vin || !brand || !model || !vehicle_type || !fuel_type || !production_year) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: vin, brand, model, vehicle_type, fuel_type, production_year'
      });
    }

    // Validate VIN length
    if (vin.length !== 17) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'VIN must be exactly 17 characters long'
      });
    }

    // Validate ENUM values
    const validVehicleTypes = ['passenger', 'truck', 'bus', 'motorcycle'];
    const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg'];

    if (!validVehicleTypes.includes(vehicle_type)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid vehicle_type. Must be one of: ${validVehicleTypes.join(', ')}`
      });
    }

    if (!validFuelTypes.includes(fuel_type)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid fuel_type. Must be one of: ${validFuelTypes.join(', ')}`
      });
    }

    // Validate production year
    const currentYear = new Date().getFullYear();
    if (production_year < 1900 || production_year > currentYear + 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Production year must be between 1900 and ${currentYear + 1}`
      });
    }

    // Determine owner_id based on user role
    let finalOwnerId;
    if (req.user.role === 'secretary') {
      if (!owner_id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Secretary must specify owner_id when creating a car'
        });
      }
      
      // Verify the specified owner exists and is a customer
      const owner = await User.findOne({
        where: {
          id: owner_id,
          role: 'customer',
          is_active: true
        },
        transaction
      });

      if (!owner) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid owner_id: must be an active customer'
        });
      }
      
      finalOwnerId = owner_id;
    } else if (req.user.role === 'customer') {
      // Customers can only create cars for themselves
      finalOwnerId = req.user.id;
    } else {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only customers and secretaries can create cars'
      });
    }

    // Check if VIN already exists
    const existingCar = await Car.findByPk(vin, { transaction });
    if (existingCar) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'A car with this VIN already exists'
      });
    }

    // Check if plate number already exists (if provided)
    if (plate_number) {
      const existingPlate = await Car.findOne({
        where: { plate_number },
        transaction
      });
      
      if (existingPlate) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'A car with this plate number already exists'
        });
      }
    }

    // Create the car
    const carData = {
      vin,
      owner_id: finalOwnerId,
      brand,
      model,
      vehicle_type,
      fuel_type,
      production_year,
      doors_count: doors_count || null,
      wheels_count: wheels_count || 4,
      color: color || null,
      plate_number: plate_number || null
    };

    console.log('Creating car with final data:', carData);

    const car = await Car.create(carData, { transaction });

    // Fetch the created car with owner information
    const createdCar = await Car.findByPk(car.vin, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'username', 'full_name', 'email']
      }],
      transaction
    });

    await transaction.commit();

    console.log('Car created successfully');
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: createdCar
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating car:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate value error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: `${e.path} already exists`
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.bulkCreateCars = async (req, res) => {
  const transaction = await db.transaction();
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
  const transaction = await db.transaction();
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

exports.getAllCars = async (req, res) => {
  try {
    let whereClause = {};
    
    // Filter cars based on user role
    if (req.user.role === 'customer') {
      // Customers can only see their own cars
      whereClause.owner_id = req.user.id;
    }
    // Secretaries and mechanics can see all cars (no filter)
    
    const cars = await Car.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'username', 'full_name', 'email']
      }]
    });
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};