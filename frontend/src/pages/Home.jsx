import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart, Brain, Sparkles, User, Award, ShieldAlert, CheckCircle, ChevronRight, HelpCircle, Activity, Star, Users } from 'lucide-react';
import { doctorService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [topRatedDoctors, setTopRatedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sample doctors for homepage sections
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const { data } = await doctorService.getRecommendations();
        setFeaturedDoctors(data.recommended || []);
        setTopRatedDoctors(data.recommended ? [...data.recommended].sort((a,b) => b.rating - a.rating) : []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load home data:', error);
        setLoading(false);
      }
    };
    loadHomepageData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSpecialtyClick = (specialty) => {
    navigate(`/search?specialization=${encodeURIComponent(specialty)}`);
  };

  // Specialty mapping with icons & descriptions
  const specialties = [
    { name: 'Cardiologist', icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-950/20', desc: 'Heart Health & Blood Pressure' },
    { name: 'Neurologist', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20', desc: 'Brain & Nervous System' },
    { name: 'Dermatologist', icon: Sparkles, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20', desc: 'Skin Care & Treatment' },
    { name: 'Orthopedic', icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20', desc: 'Bone, Joint & Muscle Care' },
    { name: 'Pediatrician', icon: Users, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20', desc: 'Infant & Child Health' },
    { name: 'Dentist', icon: Star, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20', desc: 'Dental & Oral Health' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-teal-50/20 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-16 sm:py-24 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-extrabold tracking-wide uppercase">
              <Activity className="h-4 w-4 animate-pulse-soft" />
              <span>Smart Health Solutions</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Your Health, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">Connected</span> In Minutes
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg">
              Book real-time appointments with verified clinical doctors, secure your digital medical health reports, and consult specialized experts instantly.
            </p>

            {/* Quick search input */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Specialization, doctor name, hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              </div>
              <button type="submit" className="btn-primary rounded-2xl px-6 font-bold py-3 text-sm">
                Find Doctors
              </button>
            </form>

            <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 text-primary-500" />
                <span>100% Verified Doctors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 text-primary-500" />
                <span>No Double Booking</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration / Banner Visual */}
          <div className="hidden lg:block relative justify-self-center">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-400 to-teal-400 blur-3xl opacity-20 animate-pulse-soft"></div>
            <div className="glass-card p-4 border-2 border-white/50 relative overflow-hidden rounded-3xl w-[450px] aspect-square flex flex-col items-center justify-center bg-gradient-to-tr from-primary-500 to-teal-400 text-white">
              <Activity className="h-28 w-28 animate-float text-white/90" />
              <h3 className="text-2xl font-extrabold mt-6">MedConnect Telehealth</h3>
              <p className="text-xs text-white/70 text-center px-8 mt-2">
                Providing standard-grade medical appointment tools and secure records management for families worldwide.
              </p>
              <Link to="/search" className="mt-8 bg-white text-primary-700 hover:bg-slate-50 px-6 py-2.5 rounded-full text-xs font-extrabold shadow-md hover:shadow-lg transition-all">
                Book Consultation Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Specialists Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Search by Top Specialists</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">Access direct support across key medical fields</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map((spec) => {
            const Icon = spec.icon;
            return (
              <button
                key={spec.name}
                onClick={() => handleSpecialtyClick(spec.name)}
                className="glass-card-hover p-6 flex flex-col items-center justify-center text-center group border border-slate-200/55"
              >
                <div className={`p-4 rounded-2xl ${spec.color} transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-4">{spec.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{spec.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Featured Doctors</h2>
            <p className="text-xs text-slate-400">Handpicked certified doctors accepting requests today</p>
          </div>
          <Link to="/search" className="text-xs text-primary-600 dark:text-primary-400 font-extrabold flex items-center hover:underline">
            View All Doctors <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : featuredDoctors.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 border border-dashed rounded-2xl">
            <User className="h-12 w-12 mx-auto mb-3" />
            <p className="text-sm font-semibold">No doctors registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredDoctors.slice(0, 50).map((doc) => (
              <div key={doc._id} className="glass-card-hover flex flex-col justify-between p-5 border border-slate-200/50">
                <div>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
                    {doc.userId?.profileImage ? (
                      <img src={doc.userId.profileImage.startsWith('/') ? `http://localhost:5001${doc.userId.profileImage}` : doc.userId.profileImage} alt={doc.userId.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary-600 to-teal-500 text-white font-extrabold text-4xl">
                        {doc.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-teal-500 text-[9px] font-bold text-white uppercase tracking-wider">
                      {doc.specialization}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">Dr. {doc.userId?.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{doc.qualification}</p>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-medium text-[10px]">({doc.totalReviews} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <span>{doc.experience} Years Exp</span>
                    <span className="text-slate-800 dark:text-slate-200">${doc.consultationFee} Fee</span>
                  </div>
                </div>
                <Link to={`/doctor/${doc._id}`} className="btn-primary rounded-xl w-full py-2 mt-4 text-xs font-extrabold">
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Hospitals Chain */}
      <section className="bg-slate-100 dark:bg-slate-900/40 py-12 border-y border-slate-200/40 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-center font-bold text-xs uppercase tracking-widest text-slate-400">Partnering with Leading Hospitals</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            <span className="font-extrabold text-lg tracking-wider">APOLLO HEALTH</span>
            <span className="font-extrabold text-lg tracking-wider">MAX CLINICS</span>
            <span className="font-extrabold text-lg tracking-wider">FORTIS CARE</span>
            <span className="font-extrabold text-lg tracking-wider">MAYO FOUNDATION</span>
          </div>
        </div>
      </section>

      {/* 5. Health Tips & Blogs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">Health Tips & Blog Section</h2>
          <p className="text-xs text-slate-400">Practical medical guidance written by our top practitioners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Understanding Coronary Care and Heart Habits', author: 'Dr. Sarah Connor', date: 'June 10, 2026', read: '5 min read', desc: 'Practical tips to lower hypertension and balance cholesterol levels in daily habits.' },
            { title: 'Maintaining Skin Moisture During Dry Seasons', author: 'Dr. Amit Patel', date: 'May 24, 2026', read: '4 min read', desc: 'Clinical moisturizer applications, dermatologist warnings, and hydration routines.' },
            { title: 'Boosting Immune Systems in Toddlers & Children', author: 'Dr. Emily Watson', date: 'April 15, 2026', read: '7 min read', desc: 'Guidance on vital pediatric nutrients, balanced diets, and vaccine timetables.' }
          ].map((blog, idx) => (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between border border-slate-200/50">
              <div className="space-y-3">
                <span className="text-[9px] font-extrabold text-primary-500 uppercase tracking-widest">{blog.read}</span>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-150 hover:text-primary-600 transition-colors cursor-pointer">{blog.title}</h3>
                <p className="text-xs text-slate-400">{blog.desc}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100 dark:border-slate-850">
                <span>By {blog.author}</span>
                <span>{blog.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about bookings and medical files</p>
        </div>
        <div className="space-y-4">
          {[
            { q: 'How does double-booking prevention work?', a: 'When you attempt to book a slot, MedConnect checks active appointments in real-time. If the chosen doctor is already scheduled for that specific date and time, the booking is instantly blocked, preventing double booking.' },
            { q: 'How do doctors access my medical reports?', a: 'For privacy, doctors can only view your uploaded medical reports if they have a confirmed or completed appointment scheduled with you. Unrelated practitioners cannot access your files.' },
            { q: 'Are notifications delivered in real-time?', a: 'Yes. MedConnect utilizes Socket.io to push real-time pop-up notification toasts to you immediately when your appointment is confirmed, cancelled, completed, or when a report is uploaded.' }
          ].map((faq, idx) => (
            <div key={idx} className="glass-card p-5 border border-slate-200/50 flex gap-4 items-start">
              <HelpCircle className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-150">{faq.q}</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default Home;
