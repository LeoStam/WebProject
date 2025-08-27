const User = require('../models/user.model');
const Customer = require('../models/customer.model');
const Mechanic = require('../models/mechanic.model');
const { Op } = require('sequelize');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Customer, required: false },
        { model: Mechanic, required: false }
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
    const users = await User.findAll({
      include: [
        { model: Customer, required: false },
        { model: Mechanic, required: false }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Customer, required: false },
        { model: Mechanic, required: false }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requesting user has permission
    if (req.user.role !== 'secretary' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update user
    await user.update(req.body, { transaction });

    // Update role-specific profile
    if (user.role === 'customer') {
      await Customer.update(req.body.customer, {
        where: { user_id: user.id },
        transaction
      });
    } else if (user.role === 'mechanic') {
      await Mechanic.update(req.body.mechanic, {
        where: { user_id: user.id },
        transaction
      });
    }

    await transaction.commit();
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ is_active: true });
    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
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
  const transaction = await sequelize.transaction();
  
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'secretary' && req.user.id !== user.id) {
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