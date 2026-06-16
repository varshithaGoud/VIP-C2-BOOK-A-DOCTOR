import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import MedicalReport from './models/MedicalReport.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medconnect';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Wipe database collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalReport.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database wiped clean...');

    // 2. Create Patient and Admin
    console.log('Creating Admin and Patient...');
    const adminUser = await User.create({
      name: 'Platform Administrator',
      email: 'admin@medconnect.org',
      password: 'admin123',
      phone: '+1 (555) 111-2222',
      gender: 'Other',
      role: 'Admin',
      isVerified: true
    });

    const patientUser = await User.create({
      name: 'Clara Oswald',
      email: 'patient@medconnect.org',
      password: 'patient123',
      phone: '+1 (555) 555-6666',
      gender: 'Female',
      role: 'Patient',
      isVerified: true
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      age: 28,
      bloodGroup: 'A+',
      emergencyContact: '+1 (555) 999-9999',
      address: '742 Evergreen Terrace, Springfield'
    });

    // 3. Create Doctors representing all specialties
    console.log('Creating seed Doctors...');

    const doctorsData = [
      {
        name: 'Alistair Carter',
        email: 'doctor@medconnect.org',
        specialization: 'Cardiologist',
        qualification: 'MD, FACC Cardiology',
        experience: 12,
        consultationFee: 150,
        hospitalName: 'Apollo Cardiology Center',
        clinicAddress: 'Suite 404, Heart Wing, Health Ave',
        rating: 5.0,
        totalReviews: 1,
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
      },
      {
        name: 'Sarah Jenkins',
        email: 'neurologist@medconnect.org',
        specialization: 'Neurologist',
        qualification: 'MD, PhD Clinical Neurology',
        experience: 15,
        consultationFee: 180,
        hospitalName: 'Max Neurological Clinic',
        clinicAddress: 'Floor 2, Brain Diagnostics, Neuro St',
        rating: 4.8,
        totalReviews: 2,
        slots: ['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM']
      },
      {
        name: 'Michael Chang',
        email: 'dermatologist@medconnect.org',
        specialization: 'Dermatologist',
        qualification: 'MD, Dermatology & Cosmetology',
        experience: 8,
        consultationFee: 90,
        hospitalName: 'Fortis Skin & Laser Care',
        clinicAddress: 'Suite 11, Beauty Ward, Laser Lane',
        rating: 4.7,
        totalReviews: 1,
        slots: ['09:30 AM', '10:30 AM', '02:30 PM', '03:30 PM']
      },
      {
        name: 'James Miller',
        email: 'orthopedic@medconnect.org',
        specialization: 'Orthopedic',
        qualification: 'MS, M.Ch Orthopedics',
        experience: 10,
        consultationFee: 120,
        hospitalName: 'Mayo Bone & Joint Center',
        clinicAddress: 'Suite 55, Ortho Clinic, Joint Rd',
        rating: 4.9,
        totalReviews: 3,
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM']
      },
      {
        name: 'Lisa Vance',
        email: 'pediatrician@medconnect.org',
        specialization: 'Pediatrician',
        qualification: 'MD, Pediatrics Care',
        experience: 9,
        consultationFee: 80,
        hospitalName: 'City Childrens Wellness',
        clinicAddress: 'Suite 101, Kids Ward, Pediatric Way',
        rating: 4.9,
        totalReviews: 1,
        slots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:00 PM']
      },
      {
        name: 'Sophia Martinez',
        email: 'dentist@medconnect.org',
        specialization: 'Dentist',
        qualification: 'BDS, MDS Oral Surgery',
        experience: 6,
        consultationFee: 70,
        hospitalName: 'MedConnect Dental Hub',
        clinicAddress: 'Suite 3A, Dental Wing, Smile Ave',
        rating: 4.6,
        totalReviews: 2,
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
      }
    ];

    const createdDoctorUserIds = [];

    for (let index = 0; index < doctorsData.length; index++) {
      const doc = doctorsData[index];
      
      // Create User
      const userDoc = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'doctor123', // Same password for all mock doctors
        phone: `+1 (555) 777-${1000 + index}`,
        gender: index % 2 === 0 ? 'Male' : 'Female',
        role: 'Doctor',
        isVerified: true
      });

      createdDoctorUserIds.push(userDoc._id);

      // Create Doctor profile
      await Doctor.create({
        userId: userDoc._id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        hospitalName: doc.hospitalName,
        clinicAddress: doc.clinicAddress,
        availability: [
          { day: 'Monday', slots: doc.slots },
          { day: 'Wednesday', slots: doc.slots },
          { day: 'Friday', slots: doc.slots }
        ],
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        approved: true
      });
    }

    console.log('Seed doctors created.');

    // 4. Create Mock Appointments
    console.log('Creating mock appointments...');

    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0);

    // Appointment 1: Completed (feeds revenue analytics)
    const datePast = new Date(baseDate);
    datePast.setDate(datePast.getDate() - 10);
    
    await Appointment.create({
      patientId: patientUser._id,
      doctorId: createdDoctorUserIds[0], // Dr. Carter
      appointmentDate: datePast,
      appointmentTime: '10:00 AM',
      reason: 'Routine ECG screening and blood pressure checkout.',
      status: 'Completed'
    });

    // Appointment 2: Confirmed (upcoming)
    const dateUpcoming1 = new Date(baseDate);
    dateUpcoming1.setDate(dateUpcoming1.getDate() + 2);
    
    await Appointment.create({
      patientId: patientUser._id,
      doctorId: createdDoctorUserIds[0], // Dr. Carter
      appointmentDate: dateUpcoming1,
      appointmentTime: '11:00 AM',
      reason: 'Cardiology consultation review.',
      status: 'Confirmed'
    });

    // Appointment 3: Pending
    const dateUpcoming2 = new Date(baseDate);
    dateUpcoming2.setDate(dateUpcoming2.getDate() + 5);
    
    await Appointment.create({
      patientId: patientUser._id,
      doctorId: createdDoctorUserIds[1], // Dr. Jenkins (Neurologist)
      appointmentDate: dateUpcoming2,
      appointmentTime: '10:00 AM',
      reason: 'Chronic migraine checks.',
      status: 'Pending'
    });

    console.log('Mock appointments generated.');

    // 5. Create Medical Report
    console.log('Creating mock medical reports...');
    await MedicalReport.create({
      patientId: patientUser._id,
      reportTitle: 'Cardiac Stress Test (ECG) Report',
      reportFile: '/uploads/reports/sample-stress-test.pdf',
      uploadDate: new Date()
    });

    // 6. Create Review
    console.log('Creating doctor reviews...');
    await Review.create({
      patientId: patientUser._id,
      doctorId: createdDoctorUserIds[0],
      rating: 5,
      reviewText: 'Dr. Carter was exceptionally detailed in explaining my ECG report. The clinic was very professional.'
    });

    console.log('Seeding complete successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedData();
