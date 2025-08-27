require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal Error: JWT_SECRET is not defined in .env');
  process.exit(1);
}
const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');
const app = express();
const jwt = require('jsonwebtoken');

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Allow both nginx (8080) and vite dev server (5173)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.set('jwtSecret', process.env.JWT_SECRET);

//--------------------
// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const carRoutes = require('./routes/car.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const statsRoutes = require('./routes/stats.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stats', statsRoutes);
//-------------------------

// Test database connection
db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Car Garage Management System API');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});