const { Appointment, User, Car, Task } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/db.config');

exports.getAllAppointments = async (req, res) => {
  try {
    let whereClause = {};
    
    // Filter appointments based on user role
    if (req.user.role === 'customer') {
      // Customers can only see their own appointments
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'mechanic') {
      // Mechanics can only see appointments assigned to them
      whereClause.mechanic_id = req.user.id;
    }
    // Secretaries can see all appointments (no filter)

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'appointmentCustomer',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: User,
          as: 'appointmentMechanic',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['vin', 'brand', 'model', 'plate_number']
        },
        {
          model: Task,
          as: 'tasks'
        }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createAppointment = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { date, start_time, reason, car_vin, problem_description, customer_id } = req.body;

    // Validate required fields
    if (!date || !start_time || !reason || !car_vin) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, start_time, reason, car_vin'
      });
    }

    // Validate work hours (08:00 - 16:00)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM format'
      });
    }

    const [hours, minutes] = start_time.split(':').map(Number);
    if (hours < 8 || hours >= 16) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Appointments must be between 08:00 and 16:00'
      });
    }

    // Determine customer_id based on role
    const appointmentCustomerId = req.user.role === 'secretary' ? 
      customer_id : req.user.id;

    if (!appointmentCustomerId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    // Verify customer exists
    const customer = await User.findOne({
      where: {
        id: appointmentCustomerId,
        role: 'customer',
        is_active: true
      }
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive customer'
      });
    }

    // Verify car exists and belongs to customer
    const car = await Car.findOne({
      where: {
        vin: car_vin,
        owner_id: appointmentCustomerId
      }
    });

    if (!car) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Car not found or does not belong to customer'
      });
    }

    // Find available mechanics
    const allMechanics = await User.findAll({
      where: { 
        role: 'mechanic',
        is_active: true
      }
    });

    // Check each mechanic for availability
    const availableMechanics = [];
    for (const mechanic of allMechanics) {
      const conflictingAppointments = await Appointment.count({
        where: {
          mechanic_id: mechanic.id,
          date,
          start_time: {
            [Op.between]: [
              start_time,
              // Add 2 hours to check for conflicts
              new Date(new Date(`1970-01-01T${start_time}:00`).getTime() + 2*60*60*1000)
                .toTimeString().split(' ')[0].substring(0, 5)
            ]
          },
          status: {
            [Op.notIn]: ['cancelled', 'completed']
          }
        }
      });

      if (conflictingAppointments === 0) {
        availableMechanics.push(mechanic);
      }
    }

    if (availableMechanics.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No mechanics available at this time. Please try a different time slot.'
      });
    }

    // Assign first available mechanic
    const selectedMechanic = availableMechanics[0];

    const appointment = await Appointment.create({
      date,
      start_time,
      reason,
      problem_description,
      status: 'created',
      customer_id: appointmentCustomerId,
      mechanic_id: selectedMechanic.id,
      car_vin
    }, { transaction });

    // Fetch the created appointment with all relations
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'appointmentCustomer',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: User,
          as: 'appointmentMechanic',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['vin', 'brand', 'model', 'plate_number']
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: createdAppointment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAppointment = async (req, res) => {
  const transaction = await db.transaction();
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
          as: 'appointmentCustomer',
          attributes: ['id', 'full_name', 'email'] 
        },
        { 
          model: User, 
          as: 'appointmentMechanic',
          attributes: ['id', 'full_name', 'email'] 
        },
        { 
          model: Car,
          as: 'car'
        },
        {
          model: Task,
          as: 'tasks'
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
      status,
      search_text
    } = req.query;

    const whereClause = {};

    // Date range filter
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    // Status filter
    if (status) whereClause.status = status;

    // Role-based filters
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'mechanic') {
      whereClause.mechanic_id = req.user.id;
    }

    // Build include clause
    const includeClause = [
      { 
        model: User, 
        as: 'appointmentCustomer',
        attributes: ['id', 'full_name', 'email'],
        include: [{
          model: require('../models').Customer,
          as: 'customerProfile',
          attributes: ['afm']
        }]
      },
      { 
        model: User, 
        as: 'appointmentMechanic',
        attributes: ['id', 'full_name', 'email'] 
      },
      { 
        model: Car,
        as: 'car'
      },
      { 
        model: Task,
        as: 'tasks'
      }
    ];

    let appointments;

    if (search_text) {
      // If there's search text, we need to filter by full name or AFM
      // First, find customers that match the search
      const matchingCustomers = await User.findAll({
        where: {
          full_name: { [Op.like]: `%${search_text}%` },
          role: 'customer'
        },
        include: [{
          model: require('../models').Customer,
          as: 'customerProfile',
          where: {
            afm: { [Op.like]: `%${search_text}%` }
          },
          required: false
        }],
        attributes: ['id']
      });

      // Also find customers by AFM only
      const afmCustomers = await require('../models').Customer.findAll({
        where: {
          afm: { [Op.like]: `%${search_text}%` }
        },
        attributes: ['user_id']
      });

      // Combine customer IDs
      const customerIds = [
        ...matchingCustomers.map(c => c.id),
        ...afmCustomers.map(c => c.user_id)
      ].filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

      // Add customer filter to where clause
      if (customerIds.length > 0) {
        whereClause.customer_id = { [Op.in]: customerIds };
      } else {
        // If no customers match, return empty result
        return res.json({
          success: true,
          data: []
        });
      }
    }

    appointments = await Appointment.findAll({
      where: whereClause,
      include: includeClause,
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the user has permission to cancel
    if (req.user.role !== 'secretary' && appointment.customer_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    await appointment.update({
      status: 'cancelled',
      cancelled_at: new Date()
    }, { transaction });

    await transaction.commit();
    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.assignMechanic = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const { mechanic_id } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify mechanic exists and is active
    const mechanic = await User.findOne({
      where: {
        id: mechanic_id,
        role: 'mechanic',
        is_active: true
      }
    });

    if (!mechanic) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid or inactive mechanic' });
    }

    // Check mechanic availability
    const hasConflict = await Appointment.findOne({
      where: {
        mechanic_id,
        date: appointment.date,
        start_time: {
          [Op.between]: [
            appointment.start_time,
            new Date(new Date(`1970-01-01 ${appointment.start_time}`).getTime() + 2*60*60*1000)
              .toTimeString().split(' ')[0]
          ]
        },
        status: {
          [Op.notIn]: ['cancelled', 'completed']
        },
        id: { [Op.ne]: appointment.id }
      }
    });

    if (hasConflict) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Mechanic is not available at this time'
      });
    }

    await appointment.update({
      mechanic_id,
      status: 'assigned'
    }, { transaction });

    await transaction.commit();
    res.json({
      success: true,
      message: 'Mechanic assigned successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error assigning mechanic:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.startWork = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    console.log(`Starting work on appointment ${req.params.id}`);
    console.log(`Appointment found:`, appointment ? {
      id: appointment.id,
      status: appointment.status,
      mechanic_id: appointment.mechanic_id
    } : 'null');
    console.log(`Current user:`, { id: req.user.id, role: req.user.role });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // For mechanics, they can start work if:
    // 1. They are assigned to the appointment (mechanic_id matches), OR
    // 2. No mechanic is assigned yet and they want to take it
    if (req.user.role === 'mechanic') {
      if (appointment.mechanic_id && appointment.mechanic_id !== req.user.id) {
        await transaction.rollback();
        return res.status(403).json({ message: 'This appointment is assigned to another mechanic' });
      }
      
      // If no mechanic assigned, assign current mechanic
      if (!appointment.mechanic_id) {
        await appointment.update({ mechanic_id: req.user.id }, { transaction });
      }
    }

    // Allow starting work on created, assigned, or scheduled appointments
    const allowedStatuses = ['created', 'assigned', 'scheduled'];
    if (!allowedStatuses.includes(appointment.status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot start work on appointments with status: ${appointment.status}. Must be created, assigned, or scheduled.`
      });
    }

    await appointment.update({
      status: 'in_progress'
    }, { transaction });

    await transaction.commit();
    
    const updatedAppointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'appointmentCustomer',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: User,
          as: 'appointmentMechanic',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['vin', 'brand', 'model', 'plate_number']
        },
        {
          model: Task,
          as: 'tasks'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Work started successfully',
      data: updatedAppointment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error starting work:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};