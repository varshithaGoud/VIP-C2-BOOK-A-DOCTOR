import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profileImage'), updateUserProfile);

export default router;
