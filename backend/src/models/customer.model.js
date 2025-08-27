const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Customer = db.define('Customer', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',  // This is the table name
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
  tableName: 'customers',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Customer;