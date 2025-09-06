const { Task, Appointment } = require('../models');
const db = require('../config/db.config');

exports.createTask = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const { appointment_id, description, materials_used, hours_worked, cost } = req.body;

    // Verify appointment exists and user has permission
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized (mechanic assigned to this appointment or secretary)
    if (req.user.role === 'mechanic' && appointment.mechanic_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only add tasks to your own appointments'
      });
    }

    // Only allow task creation for appointments in progress
    if (appointment.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tasks can only be added to appointments in progress'
      });
    }

    // Validate required fields
    if (!description || !cost) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Description and cost are required'
      });
    }

    // Create task
    const task = await Task.create({
      appointment_id,
      description,
      materials_used: materials_used || null,
      hours_worked: hours_worked || null,
      cost: parseFloat(cost)
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{
        model: Appointment,
        as: 'appointment'
      }]
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role === 'mechanic' && task.appointment.mechanic_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks for your own appointments'
      });
    }

    // Only allow updates for appointments in progress
    if (task.appointment.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tasks can only be updated for appointments in progress'
      });
    }

    const { description, materials_used, hours_worked, cost } = req.body;
    
    await task.update({
      description: description || task.description,
      materials_used: materials_used !== undefined ? materials_used : task.materials_used,
      hours_worked: hours_worked !== undefined ? parseFloat(hours_worked) : task.hours_worked,
      cost: cost !== undefined ? parseFloat(cost) : task.cost
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{
        model: Appointment,
        as: 'appointment'
      }]
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role === 'mechanic' && task.appointment.mechanic_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only delete tasks for your own appointments'
      });
    }

    // Only allow deletion for appointments in progress
    if (task.appointment.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tasks can only be deleted for appointments in progress'
      });
    }

    await task.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    // Verify appointment exists and user has permission to view it
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions based on user role
    if (req.user.role === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view tasks for your own appointments'
      });
    } else if (req.user.role === 'mechanic' && appointment.mechanic_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view tasks for your assigned appointments'
      });
    }

    const tasks = await Task.findAll({
      where: { appointment_id },
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
