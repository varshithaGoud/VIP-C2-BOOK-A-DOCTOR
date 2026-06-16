import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, Users, Calendar, DollarSign, CheckCircle, Trash2, ShieldCheck, Stethoscope, Search, Loader2 } from 'lucide-react';
import { doctorService, appointmentService, analyticsService, authService } from '../services/api';
import { toast } from 'react-toastify';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, approvals, users, appointments
  const [loading, setLoading] = useState(true);

  // States
  const [analytics, setAnalytics] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsData = await analyticsService.getAdminAnalytics();
      setAnalytics(analyticsData.data || null);

      // 2. Fetch Pending Doctor Approvals (doctorService.getDoctors with adminView=true)
      const pendingData = await doctorService.getDoctors({ adminView: 'true' });
      const doctorsList = pendingData.data.doctors || [];
      setPendingDoctors(doctorsList.filter((d) => !d.approved));
      setAllDoctors(doctorsList);

      // 3. Fetch Appointments for log tracking
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveDoctor = async (id, approvedStatus) => {
    try {
      await doctorService.approveDoctor(id, approvedStatus);
      toast.success(approvedStatus ? 'Doctor practice approved' : 'Doctor practice suspended');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update doctor approval status');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete doctor account? This action removes their clinical registry.')) return;
    try {
      await doctorService.deleteDoctor(id);
      toast.success('Doctor deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete doctor account');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      await appointmentService.deleteAppointment(id);
      toast.success('Appointment record deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  // Chart Payloads
  const getMonthlyAppointmentsChartData = () => {
    if (!analytics?.monthlyAppointments) return { labels: [], datasets: [] };

    const labels = analytics.monthlyAppointments.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const counts = analytics.monthlyAppointments.map((item) => item.count);

    return {
      labels,
      datasets: [
        {
          label: 'Appointments',
          data: counts,
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  const getSpecializationChartData = () => {
    if (!analytics?.specializationStats) return { labels: [], datasets: [] };

    const labels = analytics.specializationStats.map((item) => item._id);
    const counts = analytics.specializationStats.map((item) => item.count);

    return {
      labels,
      datasets: [
        {
          label: 'Doctors count',
          data: counts,
          backgroundColor: '#6366f1',
          borderRadius: 6
        }
      ]
    };
  };

  const getUserRatioChartData = () => {
    if (!analytics) return { labels: [], datasets: [] };
    const counts = [analytics.counts?.doctors || 0, analytics.counts?.patients || 0];

    return {
      labels: ['Doctors', 'Patients'],
      datasets: [
        {
          data: counts,
          backgroundColor: ['#0d9488', '#6366f1'],
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Header Card */}
      <div className="glass-card p-6 md:p-8 border border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-2xl">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Admin Administration Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">Control doctor approvals, verify directories, and view clinical logs</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'analytics', label: 'Platform Metrics', icon: Calendar },
            { id: 'approvals', label: `Pending Approvals (${pendingDoctors.length})`, icon: ShieldAlert },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'appointments', label: 'Booking Monitor', icon: Stethoscope }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200/70'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DOCTORS</span>
              <span className="text-lg font-extrabold">{analytics.counts?.doctors} Registered</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-950/20 text-secondary-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PATIENTS</span>
              <span className="text-lg font-extrabold">{analytics.counts?.patients} Accounts</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">APPOINTMENTS</span>
              <span className="text-lg font-extrabold">{analytics.counts?.appointments} Scheduled</span>
            </div>
          </div>

          <div className="glass-card p-5 border flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PLATFORM REVENUE</span>
              <span className="text-lg font-extrabold">${analytics.totalRevenue} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab display sections */}
      <div className="space-y-6">
        
        {/* TAB 1: Analytics Charts */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            
            {/* Main grid line and bar charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="glass-card p-6 border border-slate-200/50">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">Monthly Booking Growth</h3>
                <div className="h-64 flex items-center justify-center">
                  <Line
                    data={getMonthlyAppointmentsChartData()}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              <div className="glass-card p-6 border border-slate-200/50">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">Specialization Ratios</h3>
                <div className="h-64 flex items-center justify-center">
                  <Bar
                    data={getSpecializationChartData()}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

            </div>

            {/* User ratio doughnut and trending doctors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="glass-card p-6 border border-slate-200/50 lg:col-span-1">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">User Division</h3>
                <div className="h-56 flex items-center justify-center">
                  <Doughnut
                    data={getUserRatioChartData()}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              <div className="glass-card p-6 border border-slate-200/50 lg:col-span-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">Top Booked Doctors</h3>
                
                <div className="space-y-3">
                  {analytics.topDoctors?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No appointments completed yet.</p>
                  ) : (
                    analytics.topDoctors.map((doc, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs">
                        <div className="flex gap-3 items-center">
                          <span className="font-extrabold text-primary-600 text-sm">#{i+1}</span>
                          <div>
                            <p className="font-bold">Dr. {doc.doctorName}</p>
                            <p className="text-[10px] text-slate-400">{doc.specialization} • {doc.hospitalName}</p>
                          </div>
                        </div>
                        <span className="font-extrabold px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 rounded-lg">
                          {doc.bookingCount} Bookings
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: Approvals Queue */}
        {activeTab === 'approvals' && (
          <div className="glass-card p-6 border border-slate-200/50 space-y-4">
            <h2 className="text-lg font-extrabold border-b pb-3">Pending Doctor Registrations</h2>
            
            {pendingDoctors.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold">All registrations processed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDoctors.map((doc) => (
                  <div key={doc._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-sm text-slate-800 dark:text-white">Dr. {doc.userId?.name}</p>
                      <p className="text-primary-650 font-semibold">{doc.specialization} • {doc.qualification}</p>
                      <p className="text-slate-400">{doc.hospitalName} • Exp: {doc.experience}y • Fee: ${doc.consultationFee}</p>
                      <p className="text-slate-450 mt-1 truncate max-w-md">Address: {doc.clinicAddress}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleApproveDoctor(doc._id, true)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Approve Profile
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id)}
                        className="px-3.5 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Reject & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: User Registry */}
        {activeTab === 'users' && (
          <div className="glass-card p-6 border border-slate-200/50 space-y-4">
            <h2 className="text-lg font-extrabold border-b pb-3">Platform User Directory</h2>
            
            <div className="space-y-3">
              {allDoctors.map((doc) => (
                <div key={doc._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm">Dr. {doc.userId?.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${doc.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {doc.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-400 font-semibold mt-0.5">{doc.specialization} • {doc.hospitalName}</p>
                    <p className="text-[10px] text-slate-450 mt-1">{doc.userId?.email} • {doc.userId?.phone}</p>
                  </div>

                  <div className="flex gap-2">
                    {doc.approved ? (
                      <button
                        onClick={() => handleApproveDoctor(doc._id, false)}
                        className="px-2.5 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-[10px] font-bold"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveDoctor(doc._id, true)}
                        className="px-2.5 py-1.5 bg-emerald-650 text-white hover:bg-emerald-700 rounded-lg text-[10px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Appointment Monitor */}
        {activeTab === 'appointments' && (
          <div className="glass-card p-6 border border-slate-200/50 space-y-4">
            <h2 className="text-lg font-extrabold border-b pb-3">Scheduled Appointments Logs</h2>
            
            {appointments.length === 0 ? (
              <p className="text-xs text-center text-slate-405 py-6">No scheduled appointments found on the platform.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((app) => (
                  <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold">Patient: {app.patientId?.name}</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-bold text-primary-650">Doctor: Dr. {app.doctorId?.name}</span>
                      </div>
                      <p className="text-slate-400 mt-1 font-semibold">
                        {new Date(app.appointmentDate).toLocaleDateString()} at {app.appointmentTime}
                      </p>
                      <p className="text-[10px] text-slate-450 mt-1 italic">Reason: "{app.reason}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-lg uppercase">
                        {app.status}
                      </span>
                      <button
                        onClick={() => handleDeleteAppointment(app._id)}
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
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
