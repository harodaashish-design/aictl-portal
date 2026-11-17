const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User, Notification, PasswordResetToken } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidEmail, isValidPhone, sanitizeUser } = require('../utils/validators');
const { signAuthToken, generateResetToken, hashToken } = require('../services/tokenService');

const registerStudent = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    enrollmentNumber,
    college,
    university,
    course,
    branch,
    academicYear,
    password,
    confirmPassword,
  } = req.body;

  const requiredFields = {
    name,
    email,
    phone,
    enrollmentNumber,
    college,
    university,
    course,
    branch,
    academicYear,
    password,
    confirmPassword,
  };

  for (const [field, val] of Object.entries(requiredFields)) {
    if (!val || String(val).trim() === '') {
      return next(new AppError(`Field "${field}" is required.`, 400));
    }
  }

  if (!isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!isValidPhone(phone)) {
    return next(new AppError('Please provide a valid 10-digit mobile number.', 400));
  }

  if (String(password).length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Password and Confirm Password do not match.', 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedEnroll = enrollmentNumber.trim().toUpperCase();

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  const existingEnrollment = await User.findOne({ enrollmentNumber: normalizedEnroll });
  if (existingEnrollment) {
    return next(new AppError('An account with this enrollment number already exists.', 409));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    enrollmentNumber: normalizedEnroll,
    college: college.trim(),
    university: university.trim(),
    course: course.trim(),
    branch: branch.trim(),
    academicYear: academicYear.trim(),
    passwordHash,
    role: 'student',
    isActive: true,
  });

  await Notification.create({
    title: 'Registration Successful',
    message: `Welcome ${createdUser.name}! Your AICTE student account (${createdUser.enrollmentNumber}) has been registered successfully.`,
    type: 'success',
    recipientId: String(createdUser._id),
    isRead: false,
  });

  res.status(201).json({
    success: true,
    message: 'Student registration successful. Please log in with your credentials.',
    user: sanitizeUser(createdUser),
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { identifier, email, password, portalType } = req.body;
  const loginKey = (identifier || email || '').trim();

  if (!loginKey || !password) {
    return next(new AppError('Email/Enrollment Number and password are required.', 400));
  }

  const normalizedLower = loginKey.toLowerCase();
  const normalizedUpper = loginKey.toUpperCase();

  const user = await User.findOne({
    $or: [{ email: normalizedLower }, { enrollmentNumber: normalizedUpper }],
  });

  if (!user) {
    return next(new AppError('Invalid credentials. Please check your login details.', 401));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    return next(new AppError('Invalid credentials. Please check your login details.', 401));
  }

  if (!user.isActive) {
    return next(
      new AppError('Your account has been deactivated by an administrator. Contact helpdesk.', 403)
    );
  }

  if (portalType === 'admin' && user.role !== 'admin') {
    return next(
      new AppError('Access denied. This login portal is restricted to Administrators only.', 403)
    );
  }

  if (portalType === 'student' && user.role !== 'student') {
    return next(
      new AppError('Please use the Administrator Login portal for admin accounts.', 403)
    );
  }

  const token = signAuthToken(user);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: sanitizeUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return next(new AppError('Please enter a valid registered email address.', 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Always respond gracefully to avoid account enumeration in production
  if (!user) {
    return res.json({
      success: true,
      message:
        'If an account exists with this email, a password reset link has been generated.',
    });
  }

  const { rawToken, hashedToken } = generateResetToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Invalidate previous active tokens for this user
  await PasswordResetToken.updateMany({ userId: String(user._id), used: false }, { used: true });

  await PasswordResetToken.create({
    userId: String(user._id),
    hashedToken,
    expiresAt,
    used: false,
  });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
  console.log(`[PASSWORD RESET DEMO] User: ${normalizedEmail} | Reset URL: ${resetUrl}`);

  res.json({
    success: true,
    message:
      'Password reset link generated. Follow the instructions to reset your password within 30 minutes.',
    ...(env.nodeEnv !== 'production'
      ? {
          demoResetToken: rawToken,
          demoResetUrl: `/reset-password?token=${rawToken}`,
        }
      : {}),
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;

  if (!token) {
    return next(new AppError('Reset token is required.', 400));
  }
  if (!password || String(password).length < 6) {
    return next(new AppError('New password must be at least 6 characters long.', 400));
  }
  if (password !== confirmPassword) {
    return next(new AppError('Password and Confirm Password do not match.', 400));
  }

  const hashedToken = hashToken(token);
  const tokenRecord = await PasswordResetToken.findOne({ hashedToken, used: false });

  if (!tokenRecord || new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    return next(new AppError('Password reset token is invalid or has expired.', 400));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(String(tokenRecord.userId), { passwordHash }, { new: true });
  await PasswordResetToken.findByIdAndUpdate(String(tokenRecord._id), { used: true }, { new: true });

  await Notification.create({
    title: 'Password Reset Completed',
    message: 'Your account password was recently reset. If this was not you, contact Helpdesk immediately.',
    type: 'warning',
    recipientId: String(tokenRecord.userId),
    isRead: false,
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now log in.',
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new AppError('All password fields are required.', 400));
  }
  if (String(newPassword).length < 6) {
    return next(new AppError('New password must be at least 6 characters long.', 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new AppError('New password and confirmation do not match.', 400));
  }

  const user = await User.findById(req.user._id);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return next(new AppError('Current password is incorrect.', 400));
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.user._id, { passwordHash }, { new: true });

  await Notification.create({
    title: 'Password Changed',
    message: 'Your portal account password was updated successfully.',
    type: 'info',
    recipientId: req.user._id,
    isRead: false,
  });

  res.json({
    success: true,
    message: 'Password updated successfully.',
  });
});

module.exports = {
  registerStudent,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
