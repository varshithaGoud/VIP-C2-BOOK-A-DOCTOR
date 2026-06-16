import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the doctor's User ID
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews by the same patient for the same doctor
reviewSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
