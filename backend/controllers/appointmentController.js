import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { createAndSendNotification } from '../utils/notificationHelper.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    const patientId = req.user._id;

    // 1. Validate Doctor profile
    const doctorProfile = await Doctor.findOne({ userId: doctorId }).populate('userId', 'name email');
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (!doctorProfile.approved) {
      return res.status(400).json({ message: 'Doctor is not currently accepting appointments' });
    }

    // 2. Normalize appointment date to midnight UTC for uniform comparison
    const parsedDate = new Date(appointmentDate);
    parsedDate.setUTCHours(0, 0, 0, 0);

    // 3. Double-Booking Prevention: Check if doctor already has an active appointment at this time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: parsedDate,
      appointmentTime,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'This slot has already been booked for this doctor. Please choose a different date or time.'
      });
    }

    // 4. Create the Appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: parsedDate,
      appointmentTime,
      reason,
      status: 'Pending'
    });

    // 5. Send Real-Time & Email Notifications to the Doctor
    const patientName = req.user.name;
    const dateString = parsedDate.toLocaleDateString();
    
    await createAndSendNotification(
      doctorId,
      'New Appointment Request',
      `${patientName} has requested an appointment on ${dateString} at ${appointmentTime}.`
    );

    const emailMessage = `
      <h2>New Appointment Request</h2>
      <p>Hello Dr. ${doctorProfile.userId.name},</p>
      <p>A new appointment has been requested by patient <strong>${patientName}</strong>.</p>
      <p><strong>Date:</strong> ${dateString}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please log in to your dashboard to confirm or cancel the appointment.</p>
    `;

    await sendEmail({
      email: doctorProfile.userId.email,
      subject: 'MedConnect - New Appointment Request',
      message: emailMessage
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments for logged in user (dynamic based on role)
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    let query = {};

    if (role === 'Patient') {
      query.patientId = userId;
    } else if (role === 'Doctor') {
      query.doctorId = userId;
    } else if (role === 'Admin') {
      // Admin sees everything
    } else {
      return res.status(403).json({ message: 'Invalid role access' });
    }

    // Fetch and populate basic user details
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone gender profileImage')
      .populate('doctorId', 'name email phone gender profileImage')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Populate additional doctor/patient profile clinical info
    const populatedAppointments = await Promise.all(
      appointments.map(async (app) => {
        const docProfile = await Doctor.findOne({ userId: app.doctorId._id }).select(
          'specialization qualification hospitalName clinicAddress consultationFee'
        );
        const patProfile = await Patient.findOne({ userId: app.patientId._id }).select(
          'age bloodGroup address emergencyContact'
        );
        return {
          ...app.toObject(),
          doctorProfile: docProfile,
          patientProfile: patProfile
        };
      })
    );

    res.json(populatedAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status (Confirm, complete, cancel)
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id;
    const role = req.user.role;

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role-based security validation
    if (role === 'Patient') {
      // Patient can ONLY cancel their own appointment
      if (appointment.patientId._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only cancel your own appointments' });
      }
      if (status !== 'Cancelled') {
        return res.status(400).json({ message: 'Patients can only cancel appointments' });
      }
    } else if (role === 'Doctor') {
      // Doctor can manage their own appointments
      if (appointment.doctorId._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only manage your own appointments' });
      }
    } else if (role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized status operation' });
    }

    // Apply the status update
    appointment.status = status;
    const updatedAppointment = await appointment.save();

    // Notify respective parties
    const dateString = new Date(appointment.appointmentDate).toLocaleDateString();
    
    if (role === 'Patient' && status === 'Cancelled') {
      // Notify Doctor
      await createAndSendNotification(
        appointment.doctorId._id,
        'Appointment Cancelled',
        `Patient ${appointment.patientId.name} cancelled the appointment on ${dateString} at ${appointment.appointmentTime}.`
      );
    } else {
      // Notify Patient of Doctor's / Admin's update
      let title = 'Appointment Status Updated';
      let message = `Your appointment on ${dateString} has been updated to "${status}".`;

      if (status === 'Confirmed') {
        title = 'Appointment Confirmed';
        message = `Dr. ${appointment.doctorId.name} has confirmed your appointment on ${dateString} at ${appointment.appointmentTime}.`;
      } else if (status === 'Completed') {
        title = 'Consultation Completed';
        message = `Your consultation with Dr. ${appointment.doctorId.name} is completed. Please write a review!`;
      } else if (status === 'Cancelled') {
        title = 'Appointment Cancelled';
        message = `Dr. ${appointment.doctorId.name} cancelled your appointment on ${dateString} at ${appointment.appointmentTime}.`;
      }

      await createAndSendNotification(appointment.patientId._id, title, message);

      // Send email to patient
      const emailMessage = `
        <h2>${title}</h2>
        <p>Hello ${appointment.patientId.name},</p>
        <p>${message}</p>
        <p>Best regards,<br/>MedConnect Team</p>
      `;

      await sendEmail({
        email: appointment.patientId.email,
        subject: `MedConnect - ${title}`,
        message: emailMessage
      });
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
