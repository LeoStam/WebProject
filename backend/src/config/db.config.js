const { Sequelize } = require('sequelize');

// Προσθήκη ελέγχου για missing variables
const requiredEnvVars = ['DB_DATABASE', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
});

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Έλεγχος σύνδεσης με πιο περιγραφικό μήνυμα
sequelize.authenticate()
  .then(() => console.log('✅ Database connection established successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = sequelize;