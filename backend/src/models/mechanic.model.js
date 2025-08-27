const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Mechanic = db.define('Mechanic', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',  // This is the table name
      key: 'id'
    }
  },
  specialty: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'mechanics',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Mechanic;