import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User account of the doctor
      required: true
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    appointmentTime: {
      type: String, // e.g., "10:00 AM"
      required: [true, 'Appointment time is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Prevent double booking at index level or check programmatically (done programmatically in controllers)
const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
