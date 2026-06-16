import React, { useState } from 'react';
import { Mail, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter your email');
    }
    
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err || 'Failed to request reset');
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
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Reset Password</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">
            {submitted ? 'Check your email for the reset link' : 'We will email you instructions to reset your password'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-bold text-sm">
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <p className="text-xs text-slate-500">
              If the email exists in our system, we sent a password reset link to <strong className="text-slate-700">{email}</strong>.
            </p>
            <Link to="/login" className="btn-primary py-2.5 rounded-xl text-xs font-bold w-full max-w-xs mx-auto">
              Return to Sign In
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
