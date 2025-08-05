const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Car = require('../models/car.model');
const Task = require('../models/task.model');
const { Op } = require('sequelize');

exports.createAppointment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { date, start_time, reason, car_vin, problem_description } = req.body;

    // Validate work hours
    const hours = new Date(`1970-01-01 ${start_time}`).getHours();
    if (hours < 8 || hours >= 16) {
      return res.status(400).json({
        message: 'Appointments must be between 08:00 and 16:00'
      });
    }

    // Find available mechanic
    const availableMechanic = await User.findOne({
      where: { 
        role: 'mechanic',
        is_active: true
      },
      include: [{
        model: Appointment,
        as: 'mechanicAppointments',
        where: {
          date,
          start_time: {
            [Op.between]: [
              start_time,
              new Date(new Date(`1970-01-01 ${start_time}`).getTime() + 2*60*60*1000)
                .toTimeString().split(' ')[0]
            ]
          },
          status: {
            [Op.notIn]: ['cancelled', 'completed']
          }
        },
        required: false
      }],
      having: sequelize.literal('COUNT(mechanicAppointments.id) = 0'),
      group: ['User.id']
    });

    if (!availableMechanic) {
      return res.status(400).json({
        message: 'No mechanics available at this time'
      });
    }

    const appointment = await Appointment.create({
      date,
      start_time,
      reason,
      problem_description,
      status: 'created',
      customer_id: req.user.role === 'secretary' ? req.body.customer_id : req.user.id,
      mechanic_id: availableMechanic.id,
      car_vin
    }, { transaction });

    await transaction.commit();
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAppointment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions and status constraints
    if (req.user.role === 'mechanic') {
      if (appointment.status !== 'in_progress') {
        return res.status(400).json({
          message: 'Can only update appointments in progress'
        });
      }
      // Mechanics can only update tasks and status to completed
      const allowedUpdates = ['status', 'tasks'];
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    } else if (req.user.role === 'customer') {
      if (appointment.status !== 'created') {
        return res.status(400).json({
          message: 'Can only update pending appointments'
        });
      }
      if (appointment.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    await appointment.update(req.body, { transaction });
    await transaction.commit();

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'customer',
          attributes: ['id', 'full_name', 'email'] 
        },
        { 
          model: User, 
          as: 'mechanic',
          attributes: ['id', 'full_name', 'email'] 
        },
        { 
          model: Car
        },
        {
          model: Task
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchAppointments = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      customer_id, 
      status,
      mechanic_id 
    } = req.query;

    const whereClause = {};

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    if (status) whereClause.status = status;

    // Role-based filters
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'mechanic') {
      whereClause.mechanic_id = req.user.id;
    } else if (customer_id) {
      whereClause.customer_id = customer_id;
    }

    if (mechanic_id && req.user.role === 'secretary') {
      whereClause.mechanic_id = mechanic_id;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'customer',
          attributes: ['id', 'full_name', 'email'] 
        },
        { 
          model: User, 
          as: 'mechanic',
          attributes: ['id', 'full_name', 'email'] 
        },
        { model: Car },
        { model: Task }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment can be cancelled
    if (['in_progress', 'completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        message: 'Cannot cancel appointment in current status'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await appointment.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};