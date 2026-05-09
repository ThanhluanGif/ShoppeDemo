const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (Authentication)
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is Admin (Authorization)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware to check if user is Admin or Vendor (Staff)
const isStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Staff only.' });
  }
};

// Middleware to optionally populate req.user if token exists
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Optional protect error:', error.message);
      next(); // Continue even if token fails
    }
  } else {
    next();
  }
};

module.exports = { protect, isAdmin, isStaff, optionalProtect };
