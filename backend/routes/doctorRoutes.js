import express from 'express';
import {
  getDoctors,
  getDoctorById,
  approveDoctor,
  deleteDoctor,
  getRecommendations
} from '../controllers/doctorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/recommendations', getRecommendations);
router.get('/:id', getDoctorById);

// Admin-only actions
router.put('/:id/approve', protect, admin, approveDoctor);
router.delete('/:id', protect, admin, deleteDoctor);

export default router;
