const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./user.model');

const Car = db.define('Car', {
  vin: {
    type: DataTypes.STRING(17),
    primaryKey: true,
    validate: {
      len: [17, 17]
    }
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  vehicle_type: {
    type: DataTypes.ENUM('passenger', 'truck', 'bus', 'motorcycle'),
    allowNull: false
  },
  fuel_type: {
    type: DataTypes.ENUM('petrol', 'diesel', 'electric', 'hybrid', 'lpg'),
    allowNull: false
  },
  production_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  doors_count: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  wheels_count: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 2,
      max: 12
    }
  },
  color: DataTypes.STRING(30),
  plate_number: {
    type: DataTypes.STRING(20),
    unique: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Car.belongsTo(User, { foreignKey: 'owner_id' });
User.hasMany(Car, { foreignKey: 'owner_id' });

module.exports = Car;