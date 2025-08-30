const { User, Customer, Mechanic } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/db.config');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { 
          model: Customer, 
          as: 'customerProfile',
          required: false 
        },
        { 
          model: Mechanic, 
          as: 'mechanicProfile',
          required: false 
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.findAll({
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
      ],
      attributes: ['id', 'username', 'email', 'full_name', 'id_number', 'role', 'is_active', 'created_at', 'updated_at']
    });
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    console.log('Getting user with ID:', req.params.id);
    const user = await User.findByPk(req.params.id, {
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
      ],
      attributes: ['id', 'username', 'email', 'full_name', 'id_number', 'role', 'is_active', 'created_at', 'updated_at']
    });
    
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('Found user:', user.username, 'Role:', user.role);

    // Check if requesting user has permission
    if (req.user.role !== 'secretary' && req.user.id !== parseInt(req.params.id)) {
      console.log('Permission denied. Requesting user role:', req.user.role, 'ID:', req.user.id);
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    console.log('Updating user with ID:', req.params.id);
    console.log('Update data:', req.body);

    const user = await User.findByPk(req.params.id, { transaction });
    
    if (!user) {
      await transaction.rollback();
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== parseInt(req.params.id)) {
      await transaction.rollback();
      console.log('Permission denied for user update');
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    // Prepare update data (exclude sensitive fields)
    const updateData = {
      full_name: req.body.full_name,
      email: req.body.email,
      id_number: req.body.id_number,
      is_active: req.body.is_active
    };

    // Only secretary can update these fields
    if (req.user.role === 'secretary') {
      if (req.body.role) updateData.role = req.body.role;
    }

    // Update user basic info
    await user.update(updateData, { transaction });

    // Update role-specific profile
    if (user.role === 'customer' && req.body.afm) {
      const customerProfile = await Customer.findOne({ 
        where: { user_id: user.id },
        transaction 
      });
      
      if (customerProfile) {
        await customerProfile.update({
          afm: req.body.afm,
          address: req.body.address
        }, { transaction });
      } else {
        // Create customer profile if it doesn't exist
        await Customer.create({
          user_id: user.id,
          afm: req.body.afm,
          address: req.body.address
        }, { transaction });
      }
    } else if (user.role === 'mechanic' && req.body.specialty) {
      const mechanicProfile = await Mechanic.findOne({ 
        where: { user_id: user.id },
        transaction 
      });
      
      if (mechanicProfile) {
        await mechanicProfile.update({
          specialty: req.body.specialty
        }, { transaction });
      } else {
        // Create mechanic profile if it doesn't exist
        await Mechanic.create({
          user_id: user.id,
          specialty: req.body.specialty
        }, { transaction });
      }
    }

    await transaction.commit();
    
    console.log('User updated successfully');
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateUser = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    console.log('Activating/deactivating user with ID:', req.params.id);
    console.log('Request body:', req.body);

    const user = await User.findByPk(req.params.id, { transaction });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if is_active is provided in request body, otherwise toggle
    let newActiveStatus;
    if (req.body.hasOwnProperty('is_active')) {
      newActiveStatus = req.body.is_active;
    } else {
      // If no status provided, toggle current status
      newActiveStatus = !user.is_active;
    }

    console.log('Current status:', user.is_active, 'New status:', newActiveStatus);

    await user.update({ is_active: newActiveStatus }, { transaction });
    await transaction.commit();

    const statusText = newActiveStatus ? 'activated' : 'deactivated';
    
    console.log(`User ${statusText} successfully`);
    res.json({
      success: true,
      message: `User ${statusText} successfully`,
      data: {
        id: user.id,
        username: user.username,
        is_active: newActiveStatus
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error activating/deactivating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { username, lastName, afm } = req.query;
    const whereClause = {};

    if (username) {
      whereClause.username = { [Op.like]: `%${username}%` };
    }
    if (lastName) {
      whereClause.full_name = { [Op.like]: `%${lastName}%` };
    }

    const users = await User.findAll({
      where: whereClause,
      include: [{
        model: Customer,
        required: false,
        where: afm ? { afm } : null
      }, {
        model: Mechanic,
        required: false
      }]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await user.destroy({ transaction });
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};