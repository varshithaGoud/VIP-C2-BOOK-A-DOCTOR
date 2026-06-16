import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Award, Stethoscope, MapPin, Calendar, Clock, HeartPulse, User, MessageSquare } from 'lucide-react';
import { doctorService, appointmentService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Data
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load profile and reviews
  const fetchDoctorProfile = async () => {
    try {
      const { data } = await doctorService.getDoctor(id);
      setDoctor(data);

      const reviewData = await reviewService.getReviews({ doctorId: data.userId?._id || data.userId });
      setReviews(reviewData.data || []);
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load doctor profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, [id]);

  // Determine available slots for the selected date
  const getAvailableSlotsForSelectedDate = () => {
    if (!selectedDate || !doctor?.availability) return [];
    
    // Get day of the week (Monday, Tuesday, etc.)
    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find matching availability day
    const dayConfig = doctor.availability.find(av => av.day === dayName);
    return dayConfig ? dayConfig.slots : [];
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.info('Please sign in to book an appointment');
      return navigate('/login', { state: { from: { pathname: `/doctor/${id}` } } });
    }

    if (user.role !== 'Patient') {
      return toast.error('Only Patients can book doctor appointments');
    }

    if (!selectedDate || !selectedSlot) {
      return toast.error('Please select an appointment date and time slot');
    }

    if (!reason.trim()) {
      return toast.error('Please write a brief reason for your consultation');
    }

    setBookingLoading(true);
    try {
      const payload = {
        doctorId: doctor.userId?._id || doctor.userId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason: reason.trim()
      };

      await appointmentService.createAppointment(payload);
      toast.success('Appointment requested successfully!');
      navigate('/patient-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment. Double booking detected.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <HeartPulse className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-800">Doctor Profile Not Found</h3>
        <button onClick={() => navigate('/search')} className="btn-primary rounded-xl px-4 py-2 mt-4 mx-auto text-xs">
          Return to search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Doctor Bio Layout */}
      <div className="glass-card p-6 md:p-8 border border-slate-200/50 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Photo Column */}
        <div className="relative aspect-[4/3] md:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border">
          {doctor.userId?.profileImage ? (
            <img src={doctor.userId.profileImage.startsWith('/') ? `http://localhost:5001${doctor.userId.profileImage}` : doctor.userId.profileImage} alt={doctor.userId.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary-600 to-teal-500 text-white font-extrabold text-5xl uppercase">
              {doctor.userId?.name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Bio Text Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-extrabold text-xs uppercase tracking-wide">
                {doctor.specialization}
              </span>
              {doctor.approved && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Approved Practice</span>
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Dr. {doctor.userId?.name}</h1>
            <p className="text-sm text-slate-400 font-medium">{doctor.qualification}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EXPERIENCE</span>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                <Award className="h-4 w-4 text-primary-500" />
                <span>{doctor.experience} Years</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CONSULT FEE</span>
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">${doctor.consultationFee} USD</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HOSPITAL</span>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                <Stethoscope className="h-4 w-4 text-primary-500" />
                <span className="truncate">{doctor.hospitalName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RATING</span>
              <div className="flex items-center gap-1 text-sm font-extrabold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{doctor.rating}</span>
                <span className="text-[10px] text-slate-400 font-medium">({doctor.totalReviews})</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-500">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CLINICAL LOCATION</span>
            <div className="flex gap-2 items-start">
              <MapPin className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{doctor.clinicAddress}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Booking slot Form (Left/Center: col-span-2) */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 border border-slate-200/50 space-y-6">
          <h2 className="text-xl font-extrabold flex items-center gap-2 border-b pb-4">
            <Calendar className="h-5.5 w-5.5 text-primary-500" />
            <span>Select Scheduling Slot</span>
          </h2>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* 1. Date Selection */}
            <div className="space-y-2">
              <label className="form-label" htmlFor="bookingDate">Appointment Date</label>
              <div className="relative">
                <input
                  id="bookingDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]} // Block past dates
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(''); // Reset slot selection on date change
                  }}
                  className="form-input pl-10"
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            {/* 2. Slot selection based on weekday availability */}
            {selectedDate && (
              <div className="space-y-3">
                <label className="form-label">Available Time Slots</label>
                
                {getAvailableSlotsForSelectedDate().length === 0 ? (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/10 p-4 rounded-xl">
                    Dr. {doctor.userId?.name} is not available on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s. Please select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getAvailableSlotsForSelectedDate().map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${selectedSlot === slot ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <Clock className="inline-block h-3.5 w-3.5 mr-1 shrink-0" />
                        <span>{slot}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Reason for Appointment */}
            <div className="space-y-2">
              <label className="form-label" htmlFor="reason">Reason for Consultation</label>
              <textarea
                id="reason"
                rows="4"
                placeholder="Explain symptoms, clinical checkups, or prescription renewals..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !selectedDate || !selectedSlot}
              className="btn-primary w-full py-3.5 rounded-xl font-bold shadow-md"
            >
              {bookingLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Request Appointment'
              )}
            </button>
          </form>
        </div>

        {/* Reviews and Ratings panel (Right side: col-span-1) */}
        <div className="glass-card p-6 border border-slate-200/50 space-y-6">
          <h2 className="text-lg font-extrabold flex items-center gap-2 border-b pb-4">
            <MessageSquare className="h-5 w-5 text-primary-500" />
            <span>Patient Reviews ({reviews.length})</span>
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <User className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No reviews yet.</p>
                <p className="text-[10px] text-slate-450">Be the first verified consult review!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-3 border">
                  
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2 items-center">
                      {rev.patientId?.profileImage ? (
                        <img src={rev.patientId.profileImage.startsWith('/') ? `http://localhost:5000${rev.patientId.profileImage}` : rev.patientId.profileImage} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                          {rev.patientId?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{rev.patientId?.name}</p>
                        <span className="text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {rev.isVerifiedPatient && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 font-extrabold text-[8px]">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified Patient</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-350'}`} />
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DoctorDetails;
