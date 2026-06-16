import crypto from 'crypto';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { uploadFile } from '../utils/fileUpload.js';

// @desc    Register a new user (Patient, Doctor, Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      role,
      // Patient extra fields
      age,
      bloodGroup,
      emergencyContact,
      address,
      // Doctor extra fields
      specialization,
      qualification,
      experience,
      consultationFee,
      hospitalName,
      clinicAddress
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Set up email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create Base User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gender,
      role: role || 'Patient',
      verificationToken,
      isVerified: true // Auto-verified for convenience
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Create Role-Specific Profile
    if (user.role === 'Patient') {
      await Patient.create({
        userId: user._id,
        age: age || 0,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || phone,
        address: address || 'Not Provided'
      });
    } else if (user.role === 'Doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: specialization || 'General Physician',
        qualification: qualification || 'MBBS',
        experience: experience || 0,
        consultationFee: consultationFee || 0,
        hospitalName: hospitalName || 'General Hospital',
        clinicAddress: clinicAddress || 'Not Provided',
        approved: false // Admin must approve
      });
    }

    // Send Verification Email
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const emailMessage = `
      <h1>Verify your MedConnect account</h1>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'MedConnect Account Verification',
      message: emailMessage
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if user is a doctor and check approval status
      let doctorProfile = null;
      if (user.role === 'Doctor') {
        doctorProfile = await Doctor.findOne({ userId: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        approved: user.role === 'Doctor' ? doctorProfile?.approved : true,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).send('<h1>Invalid or expired verification token</h1>');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Render a nice success page
    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
        <h1 style="color: #0d9488;">MedConnect Verification Successful</h1>
        <p>Your email has been verified. You can now close this tab and log in to the application.</p>
      </div>
    `);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('<h1>Server Error</h1>');
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = {};

    if (user.role === 'Patient') {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'Doctor') {
      profileData = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      user,
      profile: profileData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update base user fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;

    // Handle Profile Image Upload (Multer memory upload)
    if (req.file) {
      const imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'profiles');
      user.profileImage = imageUrl;
    }

    const updatedUser = await user.save();

    // Update Role-Specific details
    let updatedProfile = {};
    if (user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) {
        patient.age = req.body.age !== undefined ? req.body.age : patient.age;
        patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
        patient.emergencyContact = req.body.emergencyContact || patient.emergencyContact;
        patient.address = req.body.address || patient.address;
        updatedProfile = await patient.save();
      }
    } else if (user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        doctor.specialization = req.body.specialization || doctor.specialization;
        doctor.qualification = req.body.qualification || doctor.qualification;
        doctor.experience = req.body.experience !== undefined ? req.body.experience : doctor.experience;
        doctor.consultationFee = req.body.consultationFee !== undefined ? req.body.consultationFee : doctor.consultationFee;
        doctor.hospitalName = req.body.hospitalName || doctor.hospitalName;
        doctor.clinicAddress = req.body.clinicAddress || doctor.clinicAddress;
        if (req.body.availability) {
          doctor.availability = typeof req.body.availability === 'string' 
            ? JSON.parse(req.body.availability) 
            : req.body.availability;
        }
        updatedProfile = await doctor.save();
      }
    }

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        isVerified: updatedUser.isVerified
      },
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email (Normally links to the frontend)
    // For simplicity, we point to a local frontend routing path or standard reset payload
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const emailMessage = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'MedConnect Password Reset Request',
      message: emailMessage
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
