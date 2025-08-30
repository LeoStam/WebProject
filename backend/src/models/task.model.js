const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Appointment = require('./appointment.model');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  materials_used: {
    type: DataTypes.TEXT
  },
  hours_worked: {
    type: DataTypes.DECIMAL(4, 2)
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'tasks',
  timestamps: false
});

module.exports = Task;