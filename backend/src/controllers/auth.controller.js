const { User, Customer, Mechanic, Secretary } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db.config');

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
    
    console.log('Login attempt with:', { email });
    // Find user with role-specific data
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'full_name', 'id_number', 'role', 'is_active'],
      include: [
        { 
          model: Customer, 
          as: 'customerProfile', 
          required: false,
          attributes: ['afm', 'address']
        },
        { 
          model: Mechanic, 
          as: 'mechanicProfile', 
          required: false,
          attributes: ['specialty']
        }
      ]
    });

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (!user.is_active && user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Account not activated' 
      });
    }

    console.log('Attempting login with:', {
      inputPassword: password,
      storedHash: user.password
    });
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        user: {
          id: user.id, 
          role: user.role,
          full_name: user.full_name 
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
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
        customerProfile: user.customerProfile,
        mechanicProfile: user.mechanicProfile
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

// Check admin existence and details
exports.checkAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({
      where: { role: 'admin' },
      attributes: ['id', 'username', 'email', 'role', 'is_active', 'created_at']
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin user found in the system'
      });
    }

    res.json({
      success: true,
      admin: admin
    });
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin status',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('Change password request for user ID:', req.user.id);
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user from database
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({
      password: hashedNewPassword
    });

    console.log('Password changed successfully for user:', user.username);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};