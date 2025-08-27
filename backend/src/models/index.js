const User = require('./user.model');
const Customer = require('./customer.model');
const Mechanic = require('./mechanic.model');
const Car = require('./car.model');
const Appointment = require('./appointment.model');
const Task = require('./task.model');

// User - Customer Association (One-to-One)
User.hasOne(Customer, {
  foreignKey: 'user_id',
  as: 'customerProfile'
});
Customer.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Mechanic Association (One-to-One)
User.hasOne(Mechanic, {
  foreignKey: 'user_id',
  as: 'mechanicProfile'
});
Mechanic.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Car Association (One-to-Many)
User.hasMany(Car, {
  foreignKey: 'owner_id',
  as: 'cars'
});
Car.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});

// Car - Appointment Association (One-to-Many)
Car.hasMany(Appointment, {
  foreignKey: 'car_vin',
  as: 'appointments'
});
Appointment.belongsTo(Car, {
  foreignKey: 'car_vin',
  as: 'car'
});

// User - Appointment Associations (Customer and Mechanic)
User.hasMany(Appointment, {
  foreignKey: 'customer_id',
  as: 'appointmentsAsCustomer'
});
User.hasMany(Appointment, {
  foreignKey: 'mechanic_id',
  as: 'appointmentsAsMechanic'
});
Appointment.belongsTo(User, {
  foreignKey: 'customer_id',
  as: 'appointmentCustomer'
});
Appointment.belongsTo(User, {
  foreignKey: 'mechanic_id',
  as: 'appointmentMechanic'
});

// Appointment - Task Association (One-to-Many)
Appointment.hasMany(Task, {
  foreignKey: 'appointment_id',
  as: 'tasks'
});
Task.belongsTo(Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment'
});

module.exports = {
  User,
  Customer,
  Mechanic,
  Car,
  Appointment,
  Task
};
