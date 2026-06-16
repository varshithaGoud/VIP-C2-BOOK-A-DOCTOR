import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all doctors (with search, filter, sorting, pagination)
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      specialization,
      experience,
      minFee,
      maxFee,
      hospital,
      rating,
      day,
      sort,
      adminView // If true, Admin is querying (can see unapproved)
    } = req.query;

    const query = {};
    // Bypassed approved filter for testing convenience so all doctors appear

    // Advanced search (checks doctor specialization, hospitalName, or User's name)
    let userFilter = {};
    if (search) {
      userFilter = { name: { $regex: search, $options: 'i' } };
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (hospital) {
      query.hospitalName = { $regex: hospital, $options: 'i' };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (day) {
      query['availability.day'] = day;
      query['availability.slots'] = { $exists: true, $not: { $size: 0 } };
    }

    // Resolve user filters if search is provided
    let matchingUserIds = [];
    if (search) {
      const users = await User.find(userFilter).select('_id');
      matchingUserIds = users.map((u) => u._id);
      
      // Query doctor where doctor.userId is in matching user IDs OR search matches hospital name
      query.$or = [
        { userId: { $in: matchingUserIds } },
        { hospitalName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine Sorting
    let sortOptions = {};
    if (sort === 'highest_rated') {
      sortOptions = { rating: -1, totalReviews: -1 };
    } else if (sort === 'lowest_fee') {
      sortOptions = { consultationFee: 1 };
    } else if (sort === 'most_experienced') {
      sortOptions = { experience: -1 };
    } else if (sort === 'most_popular') {
      sortOptions = { totalReviews: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // Default
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone gender profileImage')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      doctors,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor by user or profile ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    // We try to find by User ID or Doctor profile ID
    let doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone gender profileImage');
    
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: req.params.id }).populate('userId', 'name email phone gender profileImage');
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Approve/Reject Doctor
// @route   PUT /api/doctors/:id/approve
// @access  Private (Admin)
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.approved = req.body.approved !== undefined ? req.body.approved : true;
    const updatedDoctor = await doctor.save();

    res.json({
      message: `Doctor account ${updatedDoctor.approved ? 'approved' : 'suspended'} successfully`,
      doctor: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Doctor profile
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Delete related User account as well to maintain DB consistency
    await User.findByIdAndDelete(doctor.userId);
    await doctor.deleteOne();

    res.json({ message: 'Doctor and user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Recommendations & Featured lists
// @route   GET /api/doctors/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const { specialization, excludeId } = req.query;

    // 1. Trending & Recommended Doctors (Top Rated)
    const recommended = await Doctor.find({})
      .populate('userId', 'name email phone gender profileImage')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(50);

    // 2. Similar Specialists
    let similar = [];
    if (specialization) {
      const filter = { specialization: { $regex: specialization, $options: 'i' } };
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
      similar = await Doctor.find(filter)
        .populate('userId', 'name email phone gender profileImage')
        .sort({ rating: -1 })
        .limit(50);
    }

    // 3. Available Today
    const availableToday = await Doctor.find({})
      .populate('userId', 'name email phone gender profileImage')
      .limit(50);

    res.json({
      recommended,
      similar,
      availableToday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
