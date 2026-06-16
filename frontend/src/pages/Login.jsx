import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Activity, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }
    
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      
      // Role based redirection
      if (loggedUser.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (loggedUser.role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else {
        // Patients go back to where they came from or default dashboard
        if (from === '/') {
          navigate('/patient-dashboard');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8 border border-slate-200/50">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-2xl">
            <Activity className="h-8 w-8 animate-pulse-soft" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Sign In to MedConnect</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">Enter your credentials to manage appointments</p>
        </div>

        {/* Form */}
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

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10 pr-10"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-bold text-sm">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>New to MedConnect? </span>
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
