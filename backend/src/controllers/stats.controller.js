const { User, Car, Appointment, Task } = require('../models');

exports.getStats = async (req, res) => {
  try {
    console.log('Getting stats...');
    
    console.log('Counting users...');
    const totalUsers = await User.count();
    console.log('Total users:', totalUsers);
    
    console.log('Counting cars...');
    const totalCars = await Car.count();
    console.log('Total cars:', totalCars);
    
    console.log('Counting appointments...');
    const totalAppointments = await Appointment.count();
    console.log('Total appointments:', totalAppointments);
    
    console.log('Counting pending tasks...');
    const pendingTasks = await Task.count({
      include: [{
        model: Appointment,
        where: {
          status: 'created'
        }
      }]
    });
    console.log('Pending tasks:', pendingTasks);

    const stats = {
      totalUsers,
      totalCars,
      totalAppointments,
      pendingTasks
    };
    
    console.log('Sending stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
};
