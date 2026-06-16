import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Briefcase, Award, GraduationCap, MapPin, Heart, DollarSign, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Patient'); // 'Patient' or 'Doctor'
  const [loading, setLoading] = useState(false);

  // Core Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  // Patient Extra Fields
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');

  // Doctor Extra Fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      return toast.error('Please fill in all core fields');
    }

    const payload = {
      name,
      email,
      password,
      phone,
      gender,
      role
    };

    if (role === 'Patient') {
      if (!age || !address) {
        return toast.error('Please fill in age and address fields');
      }
      payload.age = Number(age);
      payload.bloodGroup = bloodGroup;
      payload.emergencyContact = emergencyContact || phone;
      payload.address = address;
    } else if (role === 'Doctor') {
      if (!qualification || !experience || !consultationFee || !hospitalName || !clinicAddress) {
        return toast.error('Please complete your medical profile details');
      }
      payload.specialization = specialization;
      payload.qualification = qualification;
      payload.experience = Number(experience);
      payload.consultationFee = Number(consultationFee);
      payload.hospitalName = hospitalName;
      payload.clinicAddress = clinicAddress;
    }

    setLoading(true);
    try {
      await register(payload);
      
      if (role === 'Doctor') {
        toast.info('Registration pending admin approval. You can sign in once approved.');
        navigate('/login');
      } else {
        toast.success('Registration successful!');
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-2xl p-8 border border-slate-200/50">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Create an Account</h2>
          <p className="text-xs text-slate-400">Join the MedConnect healthcare booking portal</p>
          
          {/* Role selector tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full mt-4 w-60">
            <button
              type="button"
              onClick={() => setRole('Patient')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'Patient' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('Doctor')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'Doctor' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Doctor
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-extrabold text-sm uppercase text-primary-600 border-b pb-2">1. Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input pl-10"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input pl-10"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Patient Extra Fields */}
          {role === 'Patient' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm uppercase text-primary-600 border-b pb-2">2. Patient Medical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="form-input"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="emergencyContact">Emergency Contact Phone</label>
                  <input
                    id="emergencyContact"
                    type="tel"
                    placeholder="Emergency contact num"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="form-label" htmlFor="address">Home Address</label>
                  <div className="relative">
                    <input
                      id="address"
                      type="text"
                      placeholder="123 Health Dr, City"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="form-input pl-10"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Extra Fields */}
          {role === 'Doctor' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm uppercase text-primary-600 border-b pb-2">2. Professional Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="form-label" htmlFor="specialization">Specialization</label>
                  <select
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="form-input"
                  >
                    {['General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist'].map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="qualification">Qualification</label>
                  <div className="relative">
                    <input
                      id="qualification"
                      type="text"
                      placeholder="MBBS, MD Cardiology"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="form-input pl-10"
                    />
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="experience">Years of Experience</label>
                  <div className="relative">
                    <input
                      id="experience"
                      type="number"
                      placeholder="5"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="form-input pl-10"
                    />
                    <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="fee">Consultation Fee ($)</label>
                  <div className="relative">
                    <input
                      id="fee"
                      type="number"
                      placeholder="50"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="form-input pl-10"
                    />
                    <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="form-label" htmlFor="hospital">Hospital Affiliation</label>
                  <div className="relative">
                    <input
                      id="hospital"
                      type="text"
                      placeholder="Apollo Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="form-input pl-10"
                    />
                    <Stethoscope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="form-label" htmlFor="clinicAddress">Clinic Address</label>
                  <div className="relative">
                    <input
                      id="clinicAddress"
                      type="text"
                      placeholder="Suite 2B, Hospital Lane"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="form-input pl-10"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-bold text-sm">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
