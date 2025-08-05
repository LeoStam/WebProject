const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./user.model');
const Car = require('./car.model');

const Appointment = db.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      isIn: [['08:00', '10:00', '12:00', '14:00']] // 2-ώρα slots
    }
  },
  status: {
    type: DataTypes.ENUM('created', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'created'
  },
  reason: {
    type: DataTypes.ENUM('service', 'repair'),
    allowNull: false
  },
  problem_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Συσχετίσεις
Appointment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Appointment.belongsTo(User, { foreignKey: 'mechanic_id', as: 'mechanic' });
Appointment.belongsTo(Car, { foreignKey: 'car_vin' });

module.exports = Appointment;