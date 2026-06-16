import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials and force reload or redirect if token expires
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API Mappings
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
};

export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getRecommendations: (params) => api.get('/doctors/recommendations', { params }),
  approveDoctor: (id, approved) => api.put(`/doctors/${id}/approve`, { approved }),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`)
};

export const appointmentService = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: () => api.get('/appointments'),
  updateAppointment: (id, status) => api.put(`/appointments/${id}`, { status }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`)
};

export const reportService = {
  uploadReport: (formData) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getReports: (params) => api.get('/reports', { params }),
  deleteReport: (id) => api.delete(`/reports/${id}`)
};

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (params) => api.get('/reviews', { params }),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put('/notifications/read', { id })
};

export const analyticsService = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getDoctorAnalytics: () => api.get('/analytics/doctor')
};

export default api;
export { API_URL };
