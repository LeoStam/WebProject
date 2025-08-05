const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./user.model');

const Secretary = db.define('Secretary', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Secretary.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Secretary;