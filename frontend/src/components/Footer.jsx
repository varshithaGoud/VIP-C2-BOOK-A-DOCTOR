import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
              <Activity className="h-7 w-7 text-primary-500 animate-pulse-soft" />
              <span>Med<span className="text-primary-400">Connect</span></span>
            </Link>
            <p className="text-sm text-slate-400">
              Connecting patients with top specialists. Book virtual consultations and clinical appointments seamlessly.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-400 font-bold bg-primary-950/20 px-3 py-1.5 rounded-lg w-max border border-primary-500/20">
              <ShieldCheck className="h-4 w-4" />
              <span>HIPAA Compliant Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Book Appointments</Link></li>
              <li><Link to="/search?specialization=Dermatologist" className="hover:text-white transition-colors">Dermatology Care</Link></li>
              <li><Link to="/search?specialization=Cardiologist" className="hover:text-white transition-colors">Cardiology Center</Link></li>
              <li><Link to="/search?specialization=Pediatrician" className="hover:text-white transition-colors">Pediatrics Clinic</Link></li>
            </ul>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Health Tips Blog</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">FAQ & Support</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span>100 Health Avenue, Clinic Suite, NY</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span>support@medconnect.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MedConnect Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for digital healthcare access.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
