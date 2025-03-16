const logger = require('../../utils/logger');

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 * @param {Array} roles - Array of allowed roles
 */
module.exports = function (roles) {
  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied: User ${req.user.id} with role ${req.user.role} attempted to access a resource restricted to ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    // User has required role, proceed
    next();
  };
};
