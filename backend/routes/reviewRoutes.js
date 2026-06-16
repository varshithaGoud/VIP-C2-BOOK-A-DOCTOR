import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, patient, createReview)
  .get(getReviews);

router
  .route('/:id')
  .put(protect, patient, updateReview)
  .delete(protect, deleteReview);

export default router;
