import MedicalReport from '../models/MedicalReport.js';
import Appointment from '../models/Appointment.js';
import { uploadFile } from '../utils/fileUpload.js';
import { createAndSendNotification } from '../utils/notificationHelper.js';

// @desc    Upload a new medical report
// @route   POST /api/reports/upload
// @access  Private (Patient)
export const uploadReport = async (req, res) => {
  try {
    const { reportTitle } = req.body;
    const patientId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload using file upload helper
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'reports');

    const report = await MedicalReport.create({
      patientId,
      reportTitle,
      reportFile: fileUrl
    });

    // Create Notification
    await createAndSendNotification(
      patientId,
      'Report Uploaded',
      `Your medical report "${reportTitle}" has been uploaded successfully.`
    );

    res.status(201).json(report);
  } catch (error) {
    console.error('Report upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medical reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    if (role === 'Patient') {
      const reports = await MedicalReport.find({ patientId: userId }).sort({ uploadDate: -1 });
      return res.json(reports);
    } 
    
    if (role === 'Doctor') {
      const { patientId } = req.query;
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID query parameter is required for doctors' });
      }

      // Security Check: Doctor must have a history of appointment with this patient
      const hasAppointment = await Appointment.findOne({
        doctorId: userId,
        patientId: patientId,
        status: { $in: ['Confirmed', 'Completed'] }
      });

      if (!hasAppointment) {
        return res.status(403).json({
          message: 'Access Denied: You must have a confirmed or completed appointment with this patient to view their reports.'
        });
      }

      const reports = await MedicalReport.find({ patientId }).sort({ uploadDate: -1 });
      return res.json(reports);
    }

    if (role === 'Admin') {
      const { patientId } = req.query;
      const query = patientId ? { patientId } : {};
      const reports = await MedicalReport.find(query).populate('patientId', 'name email').sort({ uploadDate: -1 });
      return res.json(reports);
    }

    res.status(403).json({ message: 'Role not authorized to fetch reports' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private (Patient, Admin)
export const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    // Security Check: User must own the report or be Admin
    if (req.user.role !== 'Admin' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();
    res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
