import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { createAndSendNotification } from '../utils/notificationHelper.js';

// Helper function to update Doctor rating aggregates
const updateDoctorRatings = async (doctorId) => {
  const reviews = await Review.find({ doctorId });
  const totalReviews = reviews.length;
  const rating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1))
    : 0;

  await Doctor.findOneAndUpdate({ userId: doctorId }, {
    rating,
    totalReviews
  });
};

// @desc    Add a review for a doctor
// @route   POST /api/reviews
// @access  Private (Patient)
export const createReview = async (req, res) => {
  try {
    const { doctorId, rating, reviewText } = req.body;
    const patientId = req.user._id;

    // 1. Verify that patient actually had a Completed consultation with this doctor
    const completedConsultation = await Appointment.findOne({
      patientId,
      doctorId,
      status: 'Completed'
    });

    if (!completedConsultation) {
      return res.status(400).json({
        message: 'Access Denied: You can only review doctors with whom you have completed a consultation.'
      });
    }

    // 2. Check if review already exists (unique patient-doctor compounding key)
    const existingReview = await Review.findOne({ patientId, doctorId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this doctor. You can edit your existing review.' });
    }

    // 3. Create Review
    const review = await Review.create({
      patientId,
      doctorId,
      rating,
      reviewText
    });

    // 4. Update aggregates in Doctor collection
    await updateDoctorRatings(doctorId);

    // 5. Notify Doctor of the new review
    const doctorProfile = await Doctor.findOne({ userId: doctorId }).populate('userId', 'name');
    await createAndSendNotification(
      doctorId,
      'New Patient Review',
      `${req.user.name} rated you ${rating} stars: "${reviewText.substring(0, 30)}..."`
    );

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews (filter by doctorId or all reviews)
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const query = doctorId ? { doctorId } : {};

    const reviews = await Review.find(query)
      .populate('patientId', 'name profileImage')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    // Mark verified status
    // If a patient has a completed appointment, they are verified.
    const reviewsWithVerification = await Promise.all(
      reviews.map(async (review) => {
        const hasCompletedAppointment = await Appointment.findOne({
          patientId: review.patientId?._id,
          doctorId: review.doctorId?._id || review.doctorId,
          status: 'Completed'
        });
        return {
          ...review.toObject(),
          isVerifiedPatient: !!hasCompletedAppointment
        };
      })
    );

    res.json(reviewsWithVerification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Patient)
export const updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Security Check: must be the review owner
    if (review.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = rating || review.rating;
    review.reviewText = reviewText || review.reviewText;

    const updatedReview = await review.save();
    
    // Re-aggregate doctor rating
    await updateDoctorRatings(review.doctorId);

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Patient, Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Security Check
    if (req.user.role !== 'Admin' && review.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const doctorId = review.doctorId;
    await review.deleteOne();

    // Re-aggregate doctor rating
    await updateDoctorRatings(doctorId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
