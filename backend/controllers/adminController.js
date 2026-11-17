const {
  User,
  Application,
  Notification,
  Announcement,
  PortalSetting,
  SupportQuery,
} = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sanitizeUser } = require('../utils/validators');
const { toCsv } = require('../utils/csvExporter');

const ALLOWED_ADMIN_STATUSES = ['Under Review', 'Approved', 'Rejected'];

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' });
  const applications = await Application.find({}).sort({ updatedAt: -1 });

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.isActive).length;
  const totalApplications = applications.length;
  const draftApplications = applications.filter((a) => a.status === 'Draft').length;
  const pendingApplications = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;
  const approvedApplications = applications.filter((a) => a.status === 'Approved').length;
  const rejectedApplications = applications.filter((a) => a.status === 'Rejected').length;

  const statusBreakdown = [
    { name: 'Submitted', value: applications.filter((a) => a.status === 'Submitted').length, color: '#2563EB' },
    { name: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length, color: '#F59E0B' },
    { name: 'Approved', value: approvedApplications, color: '#16A34A' },
    { name: 'Rejected', value: rejectedApplications, color: '#DC2626' },
    { name: 'Draft', value: draftApplications, color: '#64748B' },
  ];

  // Monthly statistics (last 6 months)
  const monthMap = new Map();
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    const label = dt.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    monthMap.set(key, {
      month: label,
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });
  }

  for (const app of applications) {
    const dt = new Date(app.createdAt || app.submittedAt || Date.now());
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap.has(key)) {
      const bucket = monthMap.get(key);
      bucket.total += 1;
      if (app.status === 'Approved') bucket.approved += 1;
      else if (app.status === 'Rejected') bucket.rejected += 1;
      else if (app.status === 'Submitted' || app.status === 'Under Review') bucket.pending += 1;
    }
  }

  // Application type breakdown
  const typeCount = {};
  for (const app of applications) {
    const t = app.applicationType || 'Other';
    typeCount[t] = (typeCount[t] || 0) + 1;
  }
  const typeBreakdown = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

  const studentMap = new Map(students.map((s) => [String(s._id), sanitizeUser(s)]));
  const recentApplications = applications.slice(0, 6).map((app) => ({
    ...app,
    student: studentMap.get(String(app.studentId)) || null,
  }));

  res.json({
    success: true,
    stats: {
      totalStudents,
      activeStudents,
      totalApplications,
      draftApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    },
    statusBreakdown,
    monthlyStats: Array.from(monthMap.values()),
    typeBreakdown,
    recentApplications,
  });
});

const getAllStudents = asyncHandler(async (req, res) => {
  const { search = '', college = '', status = 'all' } = req.query;
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  const allApps = await Application.find({});

  const appCountByStudent = {};
  for (const app of allApps) {
    const sid = String(app.studentId);
    appCountByStudent[sid] = (appCountByStudent[sid] || 0) + 1;
  }

  const colleges = Array.from(
    new Set(students.map((s) => s.college).filter(Boolean))
  ).sort();

  let filtered = students.map((s) => ({
    ...sanitizeUser(s),
    applicationCount: appCountByStudent[String(s._id)] || 0,
  }));

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.enrollmentNumber || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }

  if (college && college !== 'All') {
    filtered = filtered.filter((s) => s.college === college);
  }

  if (status === 'active') {
    filtered = filtered.filter((s) => s.isActive);
  } else if (status === 'inactive') {
    filtered = filtered.filter((s) => !s.isActive);
  }

  res.json({
    success: true,
    students: filtered,
    colleges,
  });
});

const getStudentDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const student = await User.findById(id);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student account not found.', 404));
  }

  const applications = await Application.find({ studentId: String(student._id) }).sort({
    updatedAt: -1,
  });

  res.json({
    success: true,
    student: sanitizeUser(student),
    applications,
  });
});

const toggleStudentActiveStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const student = await User.findById(id);

  if (!student || student.role !== 'student') {
    return next(new AppError('Student account not found.', 404));
  }

  const nextActive = typeof req.body.isActive === 'boolean' ? req.body.isActive : !student.isActive;
  const updated = await User.findByIdAndUpdate(
    String(student._id),
    { isActive: nextActive },
    { new: true }
  );

  await Notification.create({
    title: nextActive ? 'Account Activated' : 'Account Deactivated',
    message: nextActive
      ? 'Your student portal account has been activated by the administrator.'
      : 'Your student portal account has been deactivated by the administrator.',
    type: nextActive ? 'success' : 'error',
    recipientId: String(student._id),
    isRead: false,
  });

  res.json({
    success: true,
    message: `Student account ${nextActive ? 'activated' : 'deactivated'} successfully.`,
    student: sanitizeUser(updated),
  });
});

const getAllApplications = asyncHandler(async (req, res) => {
  const { status = 'All', search = '' } = req.query;
  const query = {};
  if (status && status !== 'All') {
    if (status === 'Pending') {
      query.status = { $in: ['Submitted', 'Under Review'] };
    } else {
      query.status = status;
    }
  }

  const applications = await Application.find(query).sort({ updatedAt: -1 });
  const students = await User.find({ role: 'student' });
  const studentMap = new Map(students.map((s) => [String(s._id), sanitizeUser(s)]));

  let enriched = applications.map((app) => ({
    ...app,
    student: studentMap.get(String(app.studentId)) || null,
  }));

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    enriched = enriched.filter(
      (a) =>
        (a.applicationId || '').toLowerCase().includes(q) ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.student?.name || '').toLowerCase().includes(q) ||
        (a.student?.enrollmentNumber || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    applications: enriched,
  });
});

const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminRemarks = '' } = req.body;

  if (!ALLOWED_ADMIN_STATUSES.includes(status)) {
    return next(
      new AppError(
        `Invalid status. Allowed admin actions: ${ALLOWED_ADMIN_STATUSES.join(', ')}.`,
        400
      )
    );
  }

  const app = await Application.findById(id);
  if (!app) {
    return next(new AppError('Application not found.', 404));
  }

  if (app.status === 'Draft') {
    return next(
      new AppError('Draft applications have not been submitted by the student yet.', 400)
    );
  }

  if (status === 'Rejected' && String(adminRemarks).trim() === '') {
    return next(new AppError('Please provide administrative remarks when rejecting an application.', 400));
  }

  const labelMap = {
    'Under Review': 'Under Administrative Review',
    Approved: 'Application Approved',
    Rejected: 'Application Rejected',
  };

  const timelineEntry = {
    status,
    label: labelMap[status],
    note: adminRemarks.trim() || `Status updated to ${status} by ${req.user.name}.`,
    updatedBy: `${req.user.name} (Admin)`,
    timestamp: new Date(),
  };

  const updated = await Application.findByIdAndUpdate(
    String(app._id),
    {
      status,
      adminRemarks: adminRemarks.trim(),
      timeline: [...(app.timeline || []), timelineEntry],
    },
    { new: true }
  );

  const notifTitleMap = {
    'Under Review': `Application Under Review (${updated.applicationId})`,
    Approved: `Application Approved (${updated.applicationId})`,
    Rejected: `Application Rejected (${updated.applicationId})`,
  };
  const notifTypeMap = {
    'Under Review': 'warning',
    Approved: 'success',
    Rejected: 'error',
  };

  await Notification.create({
    title: notifTitleMap[status],
    message: `Your application "${updated.title}" has been marked as ${status}.${
      adminRemarks.trim() ? ` Remarks: ${adminRemarks.trim()}` : ''
    }`,
    type: notifTypeMap[status],
    recipientId: String(updated.studentId),
    relatedApplicationId: updated.applicationId,
    isRead: false,
  });

  res.json({
    success: true,
    message: `Application ${updated.applicationId} marked as ${status}.`,
    application: updated,
  });
});

const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({}).sort({ publishDate: -1, createdAt: -1 });
  res.json({
    success: true,
    announcements,
  });
});

const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, description, category = 'General', isActive = true } = req.body;

  if (!title || !description) {
    return next(new AppError('Announcement title and description are required.', 400));
  }

  const announcement = await Announcement.create({
    title: String(title).trim(),
    description: String(description).trim(),
    category,
    publishDate: new Date(),
    isActive: Boolean(isActive),
    createdBy: req.user.name,
  });

  if (announcement.isActive) {
    const activeStudents = await User.find({ role: 'student', isActive: true });
    for (const student of activeStudents) {
      await Notification.create({
        title: `New Announcement: ${announcement.title}`,
        message: announcement.description,
        type: 'info',
        recipientId: String(student._id),
        isRead: false,
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Announcement published and student notifications dispatched.',
    announcement,
  });
});

const updateAnnouncement = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const existing = await Announcement.findById(id);
  if (!existing) {
    return next(new AppError('Announcement not found.', 404));
  }

  const { title, description, category, isActive } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (category !== undefined) updates.category = category;
  if (typeof isActive === 'boolean') updates.isActive = isActive;

  const updated = await Announcement.findByIdAndUpdate(id, updates, { new: true });

  res.json({
    success: true,
    message: 'Announcement updated successfully.',
    announcement: updated,
  });
});

const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const existing = await Announcement.findById(id);
  if (!existing) {
    return next(new AppError('Announcement not found.', 404));
  }

  await Announcement.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Announcement deleted successfully.',
  });
});

const exportApplicationsCsv = asyncHandler(async (req, res) => {
  const { status = 'All' } = req.query;
  const query = {};
  if (status && status !== 'All') {
    query.status = status;
  }

  const applications = await Application.find(query).sort({ createdAt: -1 });
  const students = await User.find({ role: 'student' });
  const studentMap = new Map(students.map((s) => [String(s._id), s]));

  const rows = applications.map((app) => {
    const st = studentMap.get(String(app.studentId)) || {};
    return {
      applicationId: app.applicationId,
      studentName: st.name || app.personalDetails?.fullName || '',
      enrollmentNumber: st.enrollmentNumber || app.personalDetails?.enrollmentNumber || '',
      email: st.email || app.personalDetails?.email || '',
      college: st.college || app.academicDetails?.college || '',
      course: st.course || app.academicDetails?.course || '',
      applicationType: app.applicationType,
      title: app.title,
      status: app.status,
      adminRemarks: app.adminRemarks || '',
      submittedAt: app.submittedAt ? new Date(app.submittedAt).toISOString().split('T')[0] : 'Draft',
      updatedAt: app.updatedAt ? new Date(app.updatedAt).toISOString().split('T')[0] : '',
    };
  });

  const csvContent = toCsv(
    [
      { label: 'Application ID', accessor: 'applicationId' },
      { label: 'Student Name', accessor: 'studentName' },
      { label: 'Enrollment Number', accessor: 'enrollmentNumber' },
      { label: 'Email', accessor: 'email' },
      { label: 'College', accessor: 'college' },
      { label: 'Course', accessor: 'course' },
      { label: 'Application Type', accessor: 'applicationType' },
      { label: 'Title', accessor: 'title' },
      { label: 'Status', accessor: 'status' },
      { label: 'Admin Remarks', accessor: 'adminRemarks' },
      { label: 'Submitted Date', accessor: 'submittedAt' },
      { label: 'Last Updated', accessor: 'updatedAt' },
    ],
    rows
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="aicte_applications_report_${new Date().toISOString().slice(0, 10)}.csv"`
  );
  res.send(csvContent);
});

const getPortalSettings = asyncHandler(async (req, res) => {
  const settings = await PortalSetting.findOne({ key: 'portal_config' });
  res.json({
    success: true,
    settings: settings || {},
  });
});

const updatePortalSettings = asyncHandler(async (req, res) => {
  const {
    academicYear,
    applicationsOpen,
    supportEmail,
    helplineNumber,
    portalBannerMessage,
    maxUploadSizeMb,
  } = req.body;

  const updates = {};
  if (academicYear !== undefined) updates.academicYear = String(academicYear).trim();
  if (typeof applicationsOpen === 'boolean') updates.applicationsOpen = applicationsOpen;
  if (supportEmail !== undefined) updates.supportEmail = String(supportEmail).trim();
  if (helplineNumber !== undefined) updates.helplineNumber = String(helplineNumber).trim();
  if (portalBannerMessage !== undefined)
    updates.portalBannerMessage = String(portalBannerMessage).trim();
  if (maxUploadSizeMb !== undefined) updates.maxUploadSizeMb = Number(maxUploadSizeMb) || 5;

  const updated = await PortalSetting.findOneAndUpdate(
    { key: 'portal_config' },
    { $set: updates },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Portal settings updated successfully.',
    settings: updated,
  });
});

const getAllSupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportQuery.find({}).sort({ createdAt: -1 });
  res.json({
    success: true,
    tickets,
  });
});

const replySupportTicket = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminReply } = req.body;
  const ticket = await SupportQuery.findById(id);
  if (!ticket) {
    return next(new AppError('Support ticket not found.', 404));
  }

  const updated = await SupportQuery.findByIdAndUpdate(
    id,
    {
      ...(status ? { status } : {}),
      ...(adminReply !== undefined ? { adminReply: String(adminReply).trim() } : {}),
    },
    { new: true }
  );

  if (updated.userId) {
    await Notification.create({
      title: `Support Ticket Updated (${updated.ticketId})`,
      message: `Your ticket "${updated.subject}" status is now ${updated.status}.${
        updated.adminReply ? ` Reply: ${updated.adminReply}` : ''
      }`,
      type: 'info',
      recipientId: String(updated.userId),
      isRead: false,
    });
  }

  res.json({
    success: true,
    message: 'Support ticket updated.',
    ticket: updated,
  });
});

module.exports = {
  getAdminDashboardStats,
  getAllStudents,
  getStudentDetails,
  toggleStudentActiveStatus,
  getAllApplications,
  updateApplicationStatus,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  exportApplicationsCsv,
  getPortalSettings,
  updatePortalSettings,
  getAllSupportTickets,
  replySupportTicket,
};
