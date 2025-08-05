const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./user.model');

const Customer = db.define('Customer', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  afm: {
    type: DataTypes.STRING(9),
    allowNull: false,
    unique: true,
    validate: {
      isNumeric: true,
      len: [9, 9]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Customer.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Customer;