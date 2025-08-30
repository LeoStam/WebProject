const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      console.log('Received token:', token);
      console.log('Required roles:', roles);
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'is set' : 'is NOT set');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      const user = await User.findByPk(decoded.user.id);
      console.log('Found user:', user ? `${user.username} (${user.role})` : 'not found');
      
      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      // Attach user to request FIRST
      req.user = user;

      // Check role permissions
      if (roles.length > 0) {
        // Secretary has full admin privileges
        if (user.role === 'secretary') {
          // Secretary can do everything
          next();
          return;
        }

        // For other users, check if their role is in the allowed roles
        const hasPermission = roles.includes(user.role);
        
        if (!hasPermission) {
          console.log('Role check failed. User role:', user.role, 'Required roles:', roles);
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      console.error('Error details:', error.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};