import express from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { protect, patient, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, patient, createAppointment)
  .get(protect, getAppointments);

router
  .route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, admin, deleteAppointment);

export default router;
