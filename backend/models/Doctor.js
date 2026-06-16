import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  slots: {
    type: [String], // Array of time slots e.g., ["09:00 AM", "09:30 AM", "10:00 AM"]
    default: []
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true
    },
    experience: {
      type: Number, // Number of years
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative']
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true
    },
    clinicAddress: {
      type: String,
      required: [true, 'Clinic address is required'],
      trim: true
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
      ]
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    approved: {
      type: Boolean,
      default: true // Pre-approved for instant testing
    }
  },
  {
    timestamps: true
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
