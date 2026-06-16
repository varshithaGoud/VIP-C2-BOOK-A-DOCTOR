import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medconnectsupersecretkey123456!');

      // Get user from database (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Check if user is Admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};

// Check if user is Doctor
export const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'Doctor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Doctor' });
  }
};

// Check if user is Patient
export const patient = (req, res, next) => {
  if (req.user && req.user.role === 'Patient') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Patient' });
  }
};
