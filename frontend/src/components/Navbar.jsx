import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, User as UserIcon, Calendar, Activity, CheckSquare, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { notificationService } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount, subscribeToNotifications } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dark, setDark] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Load and toggle Dark Mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDark(true);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await notificationService.getNotifications();
      setNotifications(data.slice(0, 5)); // Keep top 5
      const unreads = data.filter(n => !n.readStatus).length;
      if (setUnreadCount) setUnreadCount(unreads);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Subscribe to real-time notification pushes
  useEffect(() => {
    if (!subscribeToNotifications) return;
    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
    });
    return unsubscribe;
  }, [subscribeToNotifications]);

  const markAllRead = async () => {
    try {
      await notificationService.markRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      if (setUnreadCount) setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin-dashboard';
    if (user.role === 'Doctor') return '/doctor-dashboard';
    return '/patient-dashboard';
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-primary-600 font-extrabold text-2xl tracking-tight">
              <Activity className="h-7 w-7 text-primary-600 animate-pulse-soft" />
              <span>Med<span className="text-teal-500">Connect</span></span>
            </Link>

            {/* Instant Search input (Desktop) */}
            {location.pathname !== '/search' && (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
                <input
                  type="text"
                  placeholder="Search doctors, specialities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 w-64 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:w-80 transition-all duration-300"
                />
                <Search className="absolute left-3.5 top-2 h-4 w-4 text-slate-400" />
              </form>
            )}
          </div>

          {/* Navigation Links & Options */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-600 dark:text-slate-300'}`}>
              Home
            </Link>
            <Link to="/search" className={`text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === '/search' ? 'text-primary-600' : 'text-slate-600 dark:text-slate-300'}`}>
              Find Doctors
            </Link>

            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Notification Dropdown wrapper */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-3 px-4 z-50 text-sm">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2 py-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-center text-slate-400 py-4">No notifications yet</p>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif._id} className={`p-2 rounded-xl text-xs ${notif.readStatus ? 'bg-slate-50/50 dark:bg-slate-800/20 text-slate-500' : 'bg-primary-50/50 dark:bg-primary-950/10 text-slate-800 dark:text-slate-200 border-l-2 border-primary-500'}`}>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{notif.title}</p>
                              <p className="mt-0.5">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link to={getDashboardPath()} onClick={() => setShowNotificationDropdown(false)} className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                          View all dashboard notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown wrapper */}
                <div className="relative" ref={profileDropdownRef}>
                  <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none">
                    {user.profileImage ? (
                      <img src={user.profileImage.startsWith('/') ? `http://localhost:5001${user.profileImage}` : user.profileImage} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-500/20" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-primary-500/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user.name}</span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold text-[9px]">
                          {user.role}
                        </span>
                      </div>
                      <Link to={getDashboardPath()} onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Calendar className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button onClick={() => { logout(); setShowProfileDropdown(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 text-left">
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 rounded-full font-bold text-xs shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggler */}
          <div className="flex items-center md:hidden gap-3">
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 rounded-full">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 rounded-full">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-4 pt-2 pb-4 bg-white dark:bg-slate-950 space-y-2 text-sm font-semibold">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Home
          </Link>
          <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
            Find Doctors
          </Link>

          {user ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">
                Dashboard
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="w-full text-left py-2 text-red-600">
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-lg">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 bg-primary-600 text-white rounded-lg">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
