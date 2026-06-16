import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this role, redirect to their main dashboard
    const redirectPath =
      user.role === 'Admin'
        ? '/admin-dashboard'
        : user.role === 'Doctor'
        ? '/doctor-dashboard'
        : '/patient-dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
