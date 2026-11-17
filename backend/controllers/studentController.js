const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { User, Application, Notification, SupportQuery } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidPhone, sanitizeUser } = require('../utils/validators');

const getStudentDashboardStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const applications = await Application.find({ studentId }).sort({ updatedAt: -1 });
  const unreadNotifications = await Notification.countDocuments({
    recipientId: studentId,
    isRead: false,
  });

  const stats = {
    totalApplications: applications.length,
    draftApplications: applications.filter((a) => a.status === 'Draft').length,
    pendingApplications: applications.filter(
      (a) => a.status === 'Submitted' || a.status === 'Under Review'
    ).length,
    approvedApplications: applications.filter((a) => a.status === 'Approved').length,
    rejectedApplications: applications.filter((a) => a.status === 'Rejected').length,
    unreadNotifications,
  };

  res.json({
    success: true,
    stats,
    recentApplications: applications.slice(0, 6),
    student: req.user,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    profile: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, college, university, course, branch, academicYear } = req.body;

  if (phone && !isValidPhone(phone)) {
    return next(new AppError('Please provide a valid 10-digit mobile number.', 400));
  }

  const updates = {};
  if (name !== undefined && String(name).trim() !== '') updates.name = String(name).trim();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (college !== undefined) updates.college = String(college).trim();
  if (university !== undefined) updates.university = String(university).trim();
  if (course !== undefined) updates.course = String(course).trim();
  if (branch !== undefined) updates.branch = String(branch).trim();
  if (academicYear !== undefined) updates.academicYear = String(academicYear).trim();

  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: sanitizeUser(updated),
  });
});

const uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a JPG or PNG image to upload.', 400));
  }

  const currentUser = await User.findById(req.user._id);
  const newPhotoUrl = `/uploads/avatars/${req.file.filename}`;

  // Clean up old avatar safely if it exists
  if (currentUser && currentUser.profilePhoto && currentUser.profilePhoto.startsWith('/uploads/avatars/')) {
    const oldFilename = path.basename(currentUser.profilePhoto);
    const oldPath = path.join(env.uploadsDir, 'avatars', oldFilename);
    if (fs.existsSync(oldPath)) {
      fs.unlink(oldPath, () => {});
    }
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: newPhotoUrl },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Profile photo updated successfully.',
    profilePhoto: newPhotoUrl,
    user: sanitizeUser(updated),
  });
});

const getMySupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportQuery.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({
    success: true,
    tickets,
  });
});

const createSupportTicket = asyncHandler(async (req, res, next) => {
  const { category, subject, message } = req.body;
  if (!subject || !message) {
    return next(new AppError('Subject and message are required for a support request.', 400));
  }

  const ticketId = `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket = await SupportQuery.create({
    ticketId,
    userId: req.user._id,
    name: req.user.name,
    email: req.user.email,
    category: category || 'Technical Support',
    subject: subject.trim(),
    message: message.trim(),
    status: 'Open',
  });

  res.status(201).json({
    success: true,
    message: `Support ticket ${ticketId} created successfully.`,
    ticket,
  });
});

module.exports = {
  getStudentDashboardStats,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getMySupportTickets,
  createSupportTicket,
};
