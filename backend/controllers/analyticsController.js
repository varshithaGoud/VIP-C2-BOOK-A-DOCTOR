import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get platform stats and analytics (Admin Only)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. General platform counts
    const totalDoctorsCount = await Doctor.countDocuments({});
    const totalPatientsCount = await Patient.countDocuments({});
    const totalAppointmentsCount = await Appointment.countDocuments({});
    
    // 2. Doctor approval counts
    const pendingDoctors = await Doctor.countDocuments({ approved: false });
    
    // 3. User distribution (role count)
    const userRoleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 4. Specialization Analytics
    const specializationStats = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Monthly Appointments (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAppointments = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // 6. Revenue Analytics (Sum of fees for Completed appointments)
    const revenueDetails = await Appointment.find({ status: 'Completed' })
      .populate('doctorId', '_id');

    // Manually calculate since consultationFee lies in Doctor collection, not Appointment
    let totalRevenue = 0;
    const doctorConsultationFees = new Map();

    const doctors = await Doctor.find({});
    doctors.forEach((doc) => {
      doctorConsultationFees.set(doc.userId.toString(), doc.consultationFee);
    });

    revenueDetails.forEach((app) => {
      const docUserId = app.doctorId?._id?.toString();
      if (docUserId && doctorConsultationFees.has(docUserId)) {
        totalRevenue += doctorConsultationFees.get(docUserId);
      }
    });

    // 7. Most Booked Doctors
    const mostBooked = await Appointment.aggregate([
      { $group: { _id: '$doctorId', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    // Populate user and specialization details for top doctors
    const topDoctors = await Promise.all(
      mostBooked.map(async (item) => {
        const user = await User.findById(item._id).select('name profileImage');
        const docProfile = await Doctor.findOne({ userId: item._id }).select('specialization hospitalName');
        return {
          doctorName: user ? user.name : 'Unknown Doctor',
          profileImage: user ? user.profileImage : '',
          specialization: docProfile ? docProfile.specialization : 'General',
          hospitalName: docProfile ? docProfile.hospitalName : 'General Hospital',
          bookingCount: item.bookingCount
        };
      })
    );

    res.json({
      counts: {
        doctors: totalDoctorsCount,
        patients: totalPatientsCount,
        appointments: totalAppointmentsCount,
        pendingDoctors
      },
      userRoleCounts,
      specializationStats,
      monthlyAppointments,
      totalRevenue,
      topDoctors
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings and appointment summary for a Doctor
// @route   GET /api/analytics/doctor
// @access  Private (Doctor)
export const getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get doctor consultation fee
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    const consultationFee = doctorProfile ? doctorProfile.consultationFee : 0;

    // Fetch appointments
    const appointments = await Appointment.find({ doctorId });
    const completedCount = appointments.filter((app) => app.status === 'Completed').length;
    const pendingCount = appointments.filter((app) => app.status === 'Pending').length;
    const confirmedCount = appointments.filter((app) => app.status === 'Confirmed').length;
    const cancelledCount = appointments.filter((app) => app.status === 'Cancelled').length;

    const totalEarnings = completedCount * consultationFee;

    // Group reviews statistics
    const reviews = await Doctor.findOne({ userId: doctorId }).select('rating totalReviews');

    res.json({
      earnings: totalEarnings,
      consultationFee,
      appointmentCounts: {
        total: appointments.length,
        completed: completedCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount
      },
      ratings: reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
