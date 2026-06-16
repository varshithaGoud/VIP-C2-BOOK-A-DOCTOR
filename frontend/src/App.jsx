import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import DoctorDetails from './pages/DoctorDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header Sticky Glass Navbar */}
            <Navbar />

            {/* Page Body Contents */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/doctor/:id" element={<DoctorDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Role Protected Dashboards */}
                <Route
                  path="/patient-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Patient']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Doctor']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Platform Footer */}
            <Footer />
          </div>

          {/* Toast Notification Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
