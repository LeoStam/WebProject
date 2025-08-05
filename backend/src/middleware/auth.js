const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.user.id);
      
      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      // Check role permissions
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};