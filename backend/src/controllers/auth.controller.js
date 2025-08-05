const User = require('../models/user.model');
const Customer = require('../models/customer.model');
const Mechanic = require('../models/mechanic.model');
const Secretary = require('../models/secretary.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      username, 
      email, 
      password, 
      full_name, 
      id_number, 
      role,
      afm,
      address,
      specialty
    } = req.body;

    // Basic validation
    if (!['customer', 'mechanic'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name,
      id_number,
      role,
      is_active: false
    }, { transaction });

    // Create role-specific profile
    if (role === 'customer') {
      await Customer.create({
        user_id: user.id,
        afm,
        address
      }, { transaction });
    } else if (role === 'mechanic') {
      await Mechanic.create({
        user_id: user.id,
        specialty
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    await transaction.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Username, email, or ID number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with role-specific data
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Customer, required: false },
        { model: Mechanic, required: false }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account not activated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        full_name: user.full_name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        profile: user.role === 'customer' ? user.Customer : user.Mechanic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.bulkRegister = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const users = req.body.users;
    const results = {
      success: [],
      failed: []
    };

    for (const userData of users) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await User.create({
          ...userData,
          password: hashedPassword,
          is_active: false
        }, { transaction });

        if (userData.role === 'customer') {
          await Customer.create({
            user_id: user.id,
            afm: userData.afm,
            address: userData.address
          }, { transaction });
        } else if (userData.role === 'mechanic') {
          await Mechanic.create({
            user_id: user.id,
            specialty: userData.specialty
          }, { transaction });
        }

        results.success.push(userData.email);
      } catch (error) {
        results.failed.push({
          email: userData.email,
          reason: error.message
        });
      }
    }

    await transaction.commit();
    res.status(201).json({
      success: true,
      results
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createSecretary = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create secretary accounts' });
    }

    const { 
      username, 
      email, 
      password, 
      full_name, 
      id_number,
      department,
      employee_id 
    } = req.body;

    // Create user with secretary role
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name,
      id_number,
      role: 'secretary',
      is_active: true // Secretaries are active by default
    }, { transaction });

    // Create secretary profile
    await Secretary.create({
      user_id: user.id,
      department,
      employee_id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Secretary account created successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};