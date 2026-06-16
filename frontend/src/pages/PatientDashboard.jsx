import React, { useState, useEffect } from 'react';
import { Calendar, FileText, User as UserIcon, Bell, Star, AlertCircle, Trash2, Edit2, Upload, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentService, reportService, reviewService, notificationService, authService } from '../services/api';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, reports, profile, reviews
  const [loading, setLoading] = useState(true);

  // States
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileGender, setProfileGender] = useState('Male');
  const [profileAge, setProfileAge] = useState('');
  const [profileBloodGroup, setProfileBloodGroup] = useState('O+');
  const [profileEmergencyContact, setProfileEmergencyContact] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // File Upload State
  const [reportTitle, setReportTitle] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reportUploading, setReportUploading] = useState(false);

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData.data || []);

      const reportsData = await reportService.getReports();
      setReports(reportsData.data || []);

      const notificationData = await notificationService.getNotifications();
      setNotifications(notificationData.data || []);

      const reviewData = await reviewService.getReviews();
      // Filter reviews written by this user
      const userReviews = reviewData.data?.filter(r => r.patientId?._id === user._id) || [];
      setReviews(userReviews);

      // Populate profile forms
      const profileInfo = await authService.getProfile();
      const u = profileInfo.data.user;
      const p = profileInfo.data.profile;

      setProfileName(u.name || '');
      setProfilePhone(u.phone || '');
      setProfileGender(u.gender || 'Male');
      setProfileAge(p?.age || '');
      setProfileBloodGroup(p?.bloodGroup || 'O+');
      setProfileEmergencyContact(p?.emergencyContact || '');
      setProfileAddress(p?.address || '');

      setLoading(false);
    } catch (error) {
      console.error('Failed to load patient dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  // Appointment status coloring
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-250';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-250';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-250';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-250';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.updateAppointment(id, 'Cancelled');
      toast.success('Appointment cancelled successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
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
      formData.append('age', profileAge);
      formData.append('bloodGroup', profileBloodGroup);
      formData.append('emergencyContact', profileEmergencyContact);
      formData.append('address', profileAddress);
      
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const { data } = await authService.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated successfully');
      setProfileImageFile(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportFile) {
      return toast.error('Please add a report title and select a file');
    }

    setReportUploading(true);
    try {
      const formData = new FormData();
      formData.append('reportTitle', reportTitle.trim());
      formData.append('reportFile', reportFile);

      await reportService.uploadReport(formData);
      toast.success('Medical report uploaded successfully');
      setReportTitle('');
      setReportFile(null);
      // Reset input element
      document.getElementById('reportFileInput').value = '';
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to upload report');
    } finally {
      setReportUploading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report file?')) return;
    try {
      await reportService.deleteReport(id);
      toast.success('Report deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  // Add Review handler
  const [reviewDoctorId, setReviewDoctorId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return toast.error('Please write a review message');
    
    try {
      await reviewService.createReview({
        doctorId: reviewDoctorId,
        rating: reviewRating,
        reviewText: reviewText.trim()
      });
      toast.success('Review posted successfully!');
      setShowReviewModal(false);
      setReviewText('');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    }
  };

  const startEditReview = (rev) => {
    setEditingReviewId(rev._id);
    setEditReviewText(rev.reviewText);
    setEditReviewRating(rev.rating);
  };

  const saveEditedReview = async (id) => {
    try {
      await reviewService.updateReview(id, {
        rating: editReviewRating,
        reviewText: editReviewText
      });
      toast.success('Review updated successfully');
      setEditingReviewId(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      toast.success('Review deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dashboard banner layout */}
      <div className="glass-card p-6 md:p-8 border border-slate-200/50 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          {user.profileImage ? (
            <img src={user.profileImage.startsWith('/') ? `http://localhost:5001${user.profileImage}` : user.profileImage} alt={user.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-primary-500/10" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white flex items-center justify-center font-bold text-3xl shadow-md uppercase">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Welcome, {user.name}</h1>
            <p className="text-xs text-slate-400 font-medium">Patient Account • Secure medical booking dashboard</p>
          </div>
        </div>

        {/* Dashboard Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'reports', label: 'Medical Reports', icon: FileText },
            { id: 'reviews', label: 'My Reviews', icon: Star },
            { id: 'profile', label: 'Profile Settings', icon: UserIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200/70'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Tab Display & Sidebar Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Active Tab Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Appointments List */}
          {activeTab === 'appointments' && (
            <div className="glass-card p-6 md:p-8 border border-slate-200/50 space-y-6">
              <h2 className="text-lg font-extrabold border-b pb-3">My Appointments</h2>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No appointments scheduled.</p>
                  <Link to="/search" className="btn-primary rounded-xl px-4 py-2 mt-4 text-xs mx-auto">
                    Book First Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((app) => (
                    <div key={app._id} className="p-5 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg shrink-0">
                          {app.doctorId?.name?.charAt(0)}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Dr. {app.doctorId?.name}</h3>
                            <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-slate-400 font-semibold">{app.doctorProfile?.specialization} • {app.doctorProfile?.hospitalName}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold text-slate-450 dark:text-slate-400 pt-2 text-[10px]">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(app.appointmentDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{app.appointmentTime}</span>
                          </div>
                          <p className="pt-2 text-slate-500 italic">"Reason: {app.reason}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {app.status === 'Completed' && (
                          <button
                            onClick={() => {
                              setReviewDoctorId(app.doctorId?._id);
                              setShowReviewModal(true);
                            }}
                            className="btn bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center gap-1"
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                            Write Review
                          </button>
                        )}
                        {(app.status === 'Pending' || app.status === 'Confirmed') && (
                          <button
                            onClick={() => handleCancelAppointment(app._id)}
                            className="btn border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-xl py-2 px-3 text-xs font-bold"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Medical Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Upload Form */}
              <div className="glass-card p-6 border border-slate-200/50 space-y-4">
                <h2 className="text-lg font-extrabold border-b pb-3">Upload Medical Report</h2>
                <form onSubmit={handleReportUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1 text-xs">
                    <label className="form-label">Report Title</label>
                    <input
                      type="text"
                      placeholder="Blood Test Report / Dental X-Ray"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="form-label">Select Document (PDF, PNG, JPG)</label>
                    <input
                      id="reportFileInput"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setReportFile(e.target.files[0])}
                      className="form-input pt-2"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportUploading}
                    className="btn-primary rounded-xl py-3 text-xs font-bold md:col-span-2 flex items-center justify-center gap-2"
                  >
                    {reportUploading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Upload className="h-4.5 w-4.5" />
                        <span>Upload Report File</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Uploaded List */}
              <div className="glass-card p-6 border border-slate-200/50 space-y-4">
                <h2 className="text-lg font-extrabold border-b pb-3">My Reports History</h2>
                
                {reports.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-10">No reports uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reports.map((rep) => (
                      <div key={rep._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                        <div className="flex gap-3 items-center min-w-0">
                          <FileText className="h-8 w-8 text-primary-500 shrink-0" />
                          <div className="min-w-0 text-xs">
                            <h3 className="font-extrabold text-slate-800 dark:text-white truncate">{rep.reportTitle}</h3>
                            <p className="text-slate-400">{new Date(rep.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={rep.reportFile.startsWith('/') ? `http://localhost:5001${rep.reportFile}` : rep.reportFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-center shrink-0"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteReport(rep._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Reviews management */}
          {activeTab === 'reviews' && (
            <div className="glass-card p-6 border border-slate-200/50 space-y-6">
              <h2 className="text-lg font-extrabold border-b pb-3">My Written Reviews</h2>
              
              {reviews.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-10">You haven't posted any reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xs">Dr. {rev.doctorId?.name || 'Practitioner'}</h3>
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs mt-1">
                            {editingReviewId === rev._id ? (
                              <select
                                value={editReviewRating}
                                onChange={(e) => setEditReviewRating(Number(e.target.value))}
                                className="border rounded p-1 text-xs font-semibold text-slate-800"
                              >
                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                              </select>
                            ) : (
                              Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                              ))
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {editingReviewId === rev._id ? (
                            <>
                              <button onClick={() => saveEditedReview(rev._id)} className="text-emerald-600 font-bold">Save</button>
                              <button onClick={() => setEditingReviewId(null)} className="text-slate-400 font-semibold">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditReview(rev)} className="text-slate-500 hover:text-slate-700"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteReview(rev._id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingReviewId === rev._id ? (
                        <textarea
                          value={editReviewText}
                          onChange={(e) => setEditReviewText(e.target.value)}
                          className="form-input text-xs"
                          rows="2"
                        />
                      ) : (
                        <p className="text-xs text-slate-500 italic">"{rev.reviewText}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 md:p-8 border border-slate-200/50 space-y-6">
              <h2 className="text-lg font-extrabold border-b pb-3">Edit Profile Settings</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs font-semibold">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Profile image selection */}
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
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Blood Group</label>
                    <select
                      value={profileBloodGroup}
                      onChange={(e) => setProfileBloodGroup(e.target.value)}
                      className="form-input"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={profileEmergencyContact}
                      onChange={(e) => setProfileEmergencyContact(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="form-label">Home Address</label>
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
                    'Save Profile Details'
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Sidebar: Dashboard Notifications inbox (Right side: col-span-1) */}
        <div className="glass-card p-5 border border-slate-200/50 space-y-4">
          <h2 className="font-extrabold text-sm flex items-center gap-2 border-b pb-3">
            <Bell className="h-4.5 w-4.5 text-primary-500" />
            <span>Dashboard Alerts ({notifications.filter(n=>!n.readStatus).length})</span>
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-[10px] text-center text-slate-400 py-6">All clear! No new notices.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className={`p-2.5 rounded-xl border text-[10px] ${notif.readStatus ? 'bg-slate-50/50 text-slate-400 dark:bg-slate-800/10' : 'bg-primary-50/40 border-primary-100 text-slate-800 dark:text-slate-100'}`}>
                  <p className="font-bold">{notif.title}</p>
                  <p className="mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="block mt-1 font-semibold text-[8px] text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Review & Rating Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4 bg-white border">
            <h3 className="font-extrabold text-sm uppercase text-slate-700">Write Consultation Review</h3>
            
            <form onSubmit={submitReview} className="space-y-4">
              <div className="space-y-1">
                <label className="form-label text-[10px]">Select Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="form-input text-xs font-bold"
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Very Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Very Poor)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="form-label text-[10px]">Review Message</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience with this doctor..."
                  rows="3"
                  className="form-input text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-grow py-2 rounded-xl text-xs font-bold"
                >
                  Post Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
