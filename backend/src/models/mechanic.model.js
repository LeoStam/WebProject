const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./user.model');

const Mechanic = db.define('Mechanic', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  specialty: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Mechanic.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Mechanic;