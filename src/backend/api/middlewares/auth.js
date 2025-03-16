const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

/**
 * Authentication middleware
 * Verifies the JWT token in the request header
 */
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    logger.error(`Authentication error: ${err.message}`);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
