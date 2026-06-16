import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Star, Check, X, FileText, Settings, User, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentService, reportService, reviewService, authService, analyticsService } from '../services/api';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, availability, reports, profile
  const [loading, setLoading] = useState(true);

  // States
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Patient Reports Search
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientReports, setPatientReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Availability Edit State
  const [availability, setAvailability] = useState([]);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileGender, setProfileGender] = useState('Male');
  const [profileSpecialization, setProfileSpecialization] = useState('');
  const [profileQualification, setProfileQualification] = useState('');
  const [profileExperience, setProfileExperience] = useState('');
  const [profileFee, setProfileFee] = useState('');
  const [profileHospital, setProfileHospital] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Appointments
      const { data } = await appointmentService.getAppointments();
      setAppointments(data || []);

      // Fetch Reviews
      const reviewData = await reviewService.getReviews({ doctorId: user._id });
      setReviews(reviewData.data || []);

      // Fetch Doctor Analytics
      const analyticsData = await analyticsService.getDoctorAnalytics();
      setAnalytics(analyticsData.data || null);

      // Fetch Profile
      const profileInfo = await authService.getProfile();
      const u = profileInfo.data.user;
      const p = profileInfo.data.profile;

      setProfileName(u.name || '');
      setProfilePhone(u.phone || '');
      setProfileGender(u.gender || 'Male');
      setProfileSpecialization(p?.specialization || '');
      setProfileQualification(p?.qualification || '');
      setProfileExperience(p?.experience || '');
      setProfileFee(p?.consultationFee || '');
      setProfileHospital(p?.hospitalName || '');
      setProfileAddress(p?.clinicAddress || '');
      setAvailability(p?.availability || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load doctor dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateAppointment(id, status);
      toast.success(`Appointment status updated to ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // View Reports for a specific patient
  const handleViewPatientReports = async (patientId) => {
    setSelectedPatientId(patientId);
    setReportsLoading(true);
    try {
      const { data } = await reportService.getReports({ patientId });
      setPatientReports(data || []);
    } catch (error) {
      toast.error('Could not fetch patient reports. Check credentials.');
      setPatientReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  // Availability Manager: Adding/removing slots
  const handleAddSlot = (dayName, slotText) => {
    if (!slotText.trim()) return;
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.day === dayName) {
          // Check for duplicate
          if (day.slots.includes(slotText)) return day;
          return { ...day, slots: [...day.slots, slotText.trim()].sort() };
        }
        return day;
      })
    );
  };

  const handleRemoveSlot = (dayName, slotText) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.day === dayName) {
          return { ...day, slots: day.slots.filter((s) => s !== slotText) };
        }
        return day;
      })
    );
  };

  const handleSaveAvailability = async () => {
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('availability', JSON.stringify(availability));
      await authService.updateProfile(formData);
      toast.success('Availability schedule saved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update availability schedule');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('phone', profilePhone);
      formData.append('gender', profileGender);
      formData.append('specialization', profileSpecialization);
      formData.append('qualification', profileQualification);
      formData.append('experience', profileExperience);
      formData.append('consultationFee', profileFee);
      formData.append('hospitalName', profileHospital);
      formData.append('clinicAddress', profileAddress);
      
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      await authService.updateProfile(formData);
      toast.success('Medical profile updated');
      setProfileImageFile(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Appointment splits
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const activeAppointments = appointments.filter((a) => a.status === 'Confirmed');
  const pastAppointments = appointments.filter((a) => ['Completed', 'Cancelled'].includes(a.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Header Card with quick status check */}
      <div className="glass-card p-6 md:p-8 border border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          {user.profileImage ? (
            <img src={user.profileImage.startsWith('/') ? `http://localhost:5001${user.profileImage}` : user.profileImage} alt={user.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-primary-500/10" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white flex items-center justify-center font-bold text-3xl shadow-md uppercase">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Dr. {user.name}</h1>
            <p className="text-xs text-slate-400 font-medium">{profileSpecialization} • {profileHospital}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'appointments', label: 'Dashboard Requests', icon: Calendar },
            { id: 'availability', label: 'Manage Slots', icon: Clock },
            { id: 'reports', label: 'Patient Reports', icon: FileText },
            { id: 'profile', label: 'Doctor Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedPatientId(''); // Clear reports search when toggling tabs
                }}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/75'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Analytical widgets */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EARNINGS</span>
              <span className="text-lg font-extrabold">${analytics.earnings}</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/20 text-blue-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CONSULTATIONS</span>
              <span className="text-lg font-extrabold">{analytics.appointmentCounts?.completed || 0} Done</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">INCOMING</span>
              <span className="text-lg font-extrabold">{pendingAppointments.length} Pending</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl">
              <Star className="h-6 w-6 fill-current text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RATING</span>
              <span className="text-lg font-extrabold">{analytics.ratings?.rating || 0} Stars</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Active Tab Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Appointments lists */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Incoming requests (Pending) */}
              <div className="glass-card p-6 border border-slate-200/50 space-y-4">
                <h2 className="text-lg font-extrabold border-b pb-3 flex items-center gap-2 text-amber-600">
                  <Activity className="h-5 w-5 animate-pulse-soft" />
                  <span>Pending Booking Requests ({pendingAppointments.length})</span>
                </h2>

                {pendingAppointments.length === 0 ? (
                  <p className="text-xs text-center text-slate-450 py-6">No pending booking requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingAppointments.map((app) => (
                      <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-xs space-y-1">
                          <p className="font-extrabold text-sm text-slate-800 dark:text-white">{app.patientId?.name}</p>
                          <p className="text-slate-400 font-semibold">Age: {app.patientProfile?.age || 'N/A'} • Blood: {app.patientProfile?.bloodGroup || 'N/A'}</p>
                          <div className="flex gap-4 pt-1 font-semibold text-slate-450">
                            <span>Date: {new Date(app.appointmentDate).toLocaleDateString()}</span>
                            <span>Time: {app.appointmentTime}</span>
                          </div>
                          <p className="text-slate-500 italic mt-1">"Reason: {app.reason}"</p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                            className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                          >
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                            className="p-2 bg-red-650 text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-red-700 shadow-sm"
                          >
                            <X className="h-4 w-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmed schedule */}
              <div className="glass-card p-6 border border-slate-200/50 space-y-4">
                <h2 className="text-lg font-extrabold border-b pb-3 flex items-center gap-2 text-primary-600">
                  <Calendar className="h-5 w-5" />
                  <span>Confirmed Consultations ({activeAppointments.length})</span>
                </h2>

                {activeAppointments.length === 0 ? (
                  <p className="text-xs text-center text-slate-450 py-6">No scheduled consultations today.</p>
                ) : (
                  <div className="space-y-3">
                    {activeAppointments.map((app) => (
                      <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-xs space-y-1">
                          <p className="font-extrabold text-sm text-slate-800 dark:text-white">{app.patientId?.name}</p>
                          <div className="flex gap-4 pt-1 font-semibold text-slate-450">
                            <span>Date: {new Date(app.appointmentDate).toLocaleDateString()}</span>
                            <span>Time: {app.appointmentTime}</span>
                          </div>
                          <p className="text-slate-500 italic mt-1">"Reason: {app.reason}"</p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleViewPatientReports(app.patientId?._id)}
                            className="px-3 py-1.5 border text-slate-600 dark:text-slate-350 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Reports
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'Completed')}
                            className="p-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                          >
                            <Check className="h-4 w-4" /> Consultation Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Availability slot planner */}
          {activeTab === 'availability' && (
            <div className="glass-card p-6 border border-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Clock className="h-5.5 w-5.5 text-primary-500" />
                  <span>Configure Availability Schedule</span>
                </h2>
                <button
                  onClick={handleSaveAvailability}
                  disabled={profileLoading}
                  className="btn-primary py-2 px-4 rounded-xl text-xs font-bold"
                >
                  Save Schedule
                </button>
              </div>

              <div className="space-y-6">
                {availability.map((day) => (
                  <div key={day.day} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{day.day}</h3>
                      
                      {/* Simple input to add a slot */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = e.target.slotText.value;
                          handleAddSlot(day.day, val);
                          e.target.slotText.value = '';
                        }}
                        className="flex gap-1.5 items-center"
                      >
                        <input
                          name="slotText"
                          type="text"
                          placeholder="e.g. 10:30 AM"
                          className="px-3 py-1 bg-white dark:bg-slate-850 border border-slate-200 rounded-lg text-xs w-28 focus:outline-none"
                        />
                        <button type="submit" className="p-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs font-extrabold px-2">+</button>
                      </form>
                    </div>

                    {day.slots.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold italic">Not available / Off Duty</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-white border dark:bg-slate-850 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-lg"
                          >
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(day.day, s)}
                              className="text-red-500 font-bold hover:text-red-700 focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Patient Reports viewer */}
          {activeTab === 'reports' && (
            <div className="glass-card p-6 border border-slate-200/50 space-y-6">
              <h2 className="text-lg font-extrabold border-b pb-3">Patient Health Reports</h2>
              
              {!selectedPatientId ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">No patient files currently opened.</p>
                  <p className="text-[10px] text-slate-450">Please select "View Reports" on any of your active schedule appointments above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Showing reports for patient ID: {selectedPatientId}</span>
                    <button onClick={() => setSelectedPatientId('')} className="text-xs font-semibold text-primary-600 hover:underline">Clear Search</button>
                  </div>
                  
                  {reportsLoading ? (
                    <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : patientReports.length === 0 ? (
                    <p className="text-xs text-center text-slate-450 py-6 border border-dashed rounded-xl">No reports found for this patient.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {patientReports.map((rep) => (
                        <div key={rep._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                          <div className="flex gap-3 items-center min-w-0">
                            <FileText className="h-8 w-8 text-primary-500 shrink-0" />
                            <div className="min-w-0 text-xs">
                              <h3 className="font-extrabold text-slate-850 dark:text-white truncate">{rep.reportTitle}</h3>
                              <p className="text-slate-400">{new Date(rep.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <a
                            href={rep.reportFile.startsWith('/') ? `http://localhost:5001${rep.reportFile}` : rep.reportFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded-lg text-[10px] font-bold shrink-0"
                          >
                            Open Report
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 md:p-8 border border-slate-200/50 space-y-6">
              <h2 className="text-lg font-extrabold border-b pb-3">Edit Clinical Credentials</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs font-semibold">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Photo selection */}
                  <div className="sm:col-span-2 flex items-center gap-4">
                    {user.profileImage ? (
                      <img src={user.profileImage.startsWith('/') ? `http://localhost:5001${user.profileImage}` : user.profileImage} className="h-16 w-16 rounded-xl object-cover ring-2 ring-primary-500/10" alt="avatar" />
                    ) : (
                      <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase shrink-0">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="form-label text-[10px]">Change Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImageFile(e.target.files[0])}
                        className="form-input py-1.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Gender</label>
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className="form-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Specialization</label>
                    <select
                      value={profileSpecialization}
                      onChange={(e) => setProfileSpecialization(e.target.value)}
                      className="form-input"
                    >
                      {['General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Qualification</label>
                    <input
                      type="text"
                      value={profileQualification}
                      onChange={(e) => setProfileQualification(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      value={profileExperience}
                      onChange={(e) => setProfileExperience(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={profileFee}
                      onChange={(e) => setProfileFee(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      value={profileHospital}
                      onChange={(e) => setProfileHospital(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="form-label">Clinic Address</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary rounded-xl w-full py-3 mt-4"
                >
                  {profileLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Medical Profile'
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Sidebar: Patient Reviews (Right side: col-span-1) */}
        <div className="glass-card p-5 border border-slate-200/50 space-y-4">
          <h2 className="font-extrabold text-sm flex items-center gap-2 border-b pb-3">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-current" />
            <span>Patient Reviews ({reviews.length})</span>
          </h2>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-[10px] text-center text-slate-450 py-6">No patient ratings yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-[10px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{rev.patientId?.name || 'Anonymous'}</span>
                    <span className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? 'fill-current' : 'text-slate-350'}`} />
                    ))}
                  </div>

                  <p className="text-slate-500 leading-relaxed italic">"{rev.reviewText}"</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DoctorDashboard;
