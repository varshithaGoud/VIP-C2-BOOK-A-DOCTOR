import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Activity } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      return toast.error('Please enter a password');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Reset failed or token expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8 border border-slate-200/50">
        
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-2xl">
            <Activity className="h-8 w-8 animate-pulse-soft" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Choose New Password</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">Enter your new credential passwords below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="form-label" htmlFor="password">New Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input pl-10"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-bold text-sm">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;
