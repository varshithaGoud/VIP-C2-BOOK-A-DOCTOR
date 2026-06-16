import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required']
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact number is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
