import express from 'express';
import { uploadReport, getReports, deleteReport } from '../controllers/reportController.js';
import { protect, patient } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, patient, upload.single('reportFile'), uploadReport);
router.get('/', protect, getReports);
router.delete('/:id', protect, deleteReport);

export default router;
