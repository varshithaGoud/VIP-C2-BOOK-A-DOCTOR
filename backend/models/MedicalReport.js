import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportTitle: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true
    },
    reportFile: {
      type: String, // URL/Path to PDF or Image
      required: [true, 'Report file is required']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
