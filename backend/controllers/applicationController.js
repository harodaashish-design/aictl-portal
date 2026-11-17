const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { Application, Notification } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function generateApplicationId() {
  const randomDigits = crypto.randomInt(10000, 99999);
  return `AICTE-2026-${randomDigits}`;
}

async function generateUniqueApplicationId() {
  for (let i = 0; i < 10; i += 1) {
    const candidate = generateApplicationId();
    const exists = await Application.findOne({ applicationId: candidate });
    if (!exists) return candidate;
  }
  return `AICTE-2026-${Date.now().toString().slice(-6)}`;
}

const createApplication = asyncHandler(async (req, res, next) => {
  const {
    personalDetails = {},
    academicDetails = {},
    applicationType,
    title,
    description = '',
    reason = '',
    documents = [],
    saveAsDraft = false,
  } = req.body;

  if (!applicationType || !title || String(title).trim() === '') {
    return next(new AppError('Application Type and Application Title are required.', 400));
  }

  if (!saveAsDraft) {
    if (!personalDetails.fullName || !personalDetails.email || !personalDetails.phone) {
      return next(
        new AppError('Personal details (Full Name, Email, Mobile) are required to submit.', 400)
      );
    }
    if (!academicDetails.college || !academicDetails.course) {
      return next(
        new AppError('Academic details (College and Course) are required to submit.', 400)
      );
    }
  }

  const applicationId = await generateUniqueApplicationId();
  const now = new Date();
  const status = saveAsDraft ? 'Draft' : 'Submitted';

  const timeline = [
    {
      status: 'Draft',
      label: 'Application Created',
      note: `Created by ${req.user.name}.`,
      updatedBy: 'Student',
      timestamp: now,
    },
  ];

  if (!saveAsDraft) {
    timeline.push({
      status: 'Submitted',
      label: 'Application Submitted',
      note: 'Application submitted for AICTE administrative scrutiny.',
      updatedBy: 'Student',
      timestamp: now,
    });
  }

  const application = await Application.create({
    applicationId,
    studentId: req.user._id,
    personalDetails: {
      fullName: personalDetails.fullName || req.user.name,
      enrollmentNumber: personalDetails.enrollmentNumber || req.user.enrollmentNumber || '',
      dateOfBirth: personalDetails.dateOfBirth || '',
      gender: personalDetails.gender || '',
      email: personalDetails.email || req.user.email,
      phone: personalDetails.phone || req.user.phone,
      address: personalDetails.address || '',
    },
    academicDetails: {
      college: academicDetails.college || req.user.college || '',
      university: academicDetails.university || req.user.university || '',
      course: academicDetails.course || req.user.course || '',
      branch: academicDetails.branch || req.user.branch || '',
      semester: academicDetails.semester || '',
      academicYear: academicDetails.academicYear || req.user.academicYear || '2026-27',
      admissionYear: academicDetails.admissionYear || '',
    },
    applicationType: String(applicationType).trim(),
    title: String(title).trim(),
    description: String(description).trim(),
    reason: String(reason).trim(),
    documents: Array.isArray(documents) ? documents : [],
    status,
    adminRemarks: '',
    timeline,
    submittedAt: saveAsDraft ? null : now,
  });

  if (!saveAsDraft) {
    await Notification.create({
      title: `Application Submitted (${application.applicationId})`,
      message: `Your application "${application.title}" has been submitted successfully and queued for review.`,
      type: 'success',
      recipientId: req.user._id,
      relatedApplicationId: application.applicationId,
      isRead: false,
    });
  }

  res.status(201).json({
    success: true,
    message: saveAsDraft
      ? `Application saved as Draft (${application.applicationId}).`
      : `Application submitted successfully (${application.applicationId}).`,
    application,
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = { studentId: req.user._id };
  if (status && status !== 'All') {
    query.status = status;
  }

  let applications = await Application.find(query).sort({ updatedAt: -1 });

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    applications = applications.filter(
      (app) =>
        app.applicationId.toLowerCase().includes(q) ||
        app.title.toLowerCase().includes(q) ||
        app.applicationType.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    applications,
  });
});

const getApplicationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const app =
    (await Application.findOne({ applicationId: id })) || (await Application.findById(id));

  if (!app) {
    return next(new AppError('Application not found.', 404));
  }

  if (req.user.role !== 'admin' && String(app.studentId) !== String(req.user._id)) {
    return next(
      new AppError('Access denied. You can only view your own applications.', 403)
    );
  }

  res.json({
    success: true,
    application: app,
  });
});

const updateDraftApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const app = await Application.findById(id);

  if (!app) {
    return next(new AppError('Application not found.', 404));
  }

  if (String(app.studentId) !== String(req.user._id)) {
    return next(new AppError('Access denied. You cannot modify another student’s application.', 403));
  }

  if (app.status !== 'Draft') {
    return next(
      new AppError('Submitted applications cannot be edited. Only Draft applications are editable.', 400)
    );
  }

  const {
    personalDetails,
    academicDetails,
    applicationType,
    title,
    description,
    reason,
    documents,
    submitNow = false,
  } = req.body;

  const updates = {};
  if (personalDetails) updates.personalDetails = { ...app.personalDetails, ...personalDetails };
  if (academicDetails) updates.academicDetails = { ...app.academicDetails, ...academicDetails };
  if (applicationType) updates.applicationType = String(applicationType).trim();
  if (title) updates.title = String(title).trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (reason !== undefined) updates.reason = String(reason).trim();
  if (Array.isArray(documents)) updates.documents = documents;

  if (submitNow) {
    const now = new Date();
    updates.status = 'Submitted';
    updates.submittedAt = now;
    updates.timeline = [
      ...(app.timeline || []),
      {
        status: 'Submitted',
        label: 'Application Submitted',
        note: 'Draft finalized and submitted by student.',
        updatedBy: 'Student',
        timestamp: now,
      },
    ];
  }

  const updated = await Application.findByIdAndUpdate(String(app._id), updates, { new: true });

  if (submitNow) {
    await Notification.create({
      title: `Application Submitted (${updated.applicationId})`,
      message: `Your draft application "${updated.title}" has been submitted successfully.`,
      type: 'success',
      recipientId: req.user._id,
      relatedApplicationId: updated.applicationId,
      isRead: false,
    });
  }

  res.json({
    success: true,
    message: submitNow
      ? `Application ${updated.applicationId} submitted successfully.`
      : 'Draft updated successfully.',
    application: updated,
  });
});

const submitDraftApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const app = await Application.findById(id);

  if (!app) {
    return next(new AppError('Application not found.', 404));
  }
  if (String(app.studentId) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }
  if (app.status !== 'Draft') {
    return next(new AppError('Only Draft applications can be submitted.', 400));
  }

  const now = new Date();
  const updated = await Application.findByIdAndUpdate(
    String(app._id),
    {
      status: 'Submitted',
      submittedAt: now,
      timeline: [
        ...(app.timeline || []),
        {
          status: 'Submitted',
          label: 'Application Submitted',
          note: 'Submitted by student for verification.',
          updatedBy: 'Student',
          timestamp: now,
        },
      ],
    },
    { new: true }
  );

  await Notification.create({
    title: `Application Submitted (${updated.applicationId})`,
    message: `Your application "${updated.title}" has been submitted successfully.`,
    type: 'success',
    recipientId: req.user._id,
    relatedApplicationId: updated.applicationId,
    isRead: false,
  });

  res.json({
    success: true,
    message: 'Application submitted successfully.',
    application: updated,
  });
});

const deleteDraftApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const app = await Application.findById(id);

  if (!app) {
    return next(new AppError('Application not found.', 404));
  }
  if (String(app.studentId) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }
  if (app.status !== 'Draft') {
    return next(new AppError('Only Draft applications can be deleted.', 400));
  }

  await Application.findByIdAndDelete(String(app._id));

  res.json({
    success: true,
    message: 'Draft application deleted.',
  });
});

const uploadApplicationDocument = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { docType = 'Supporting Document' } = req.body;

  if (!req.file) {
    return next(new AppError('Please choose a PDF, JPG, or PNG file to upload.', 400));
  }

  const app = await Application.findById(id);
  if (!app) {
    // Clean orphaned uploaded file
    fs.unlink(req.file.path, () => {});
    return next(new AppError('Target application not found.', 404));
  }

  if (String(app.studentId) !== String(req.user._id)) {
    fs.unlink(req.file.path, () => {});
    return next(new AppError('Access denied.', 403));
  }

  const docMeta = {
    _id: crypto.randomBytes(8).toString('hex'),
    docType: String(docType).trim(),
    originalName: req.file.originalname,
    filename: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/api/applications/${String(app._id)}/documents/${req.file.filename}`,
    uploadedAt: new Date(),
  };

  const nextDocs = [...(app.documents || []), docMeta];
  const updated = await Application.findByIdAndUpdate(
    String(app._id),
    { documents: nextDocs },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Document uploaded and attached successfully.',
    document: docMeta,
    application: updated,
  });
});

const getMyDocuments = asyncHandler(async (req, res) => {
  const apps = await Application.find({ studentId: req.user._id }).sort({ updatedAt: -1 });
  const docs = [];

  for (const app of apps) {
    for (const doc of app.documents || []) {
      docs.push({
        ...doc,
        applicationMongoId: String(app._id),
        applicationId: app.applicationId,
        applicationTitle: app.title,
        applicationStatus: app.status,
      });
    }
  }

  res.json({
    success: true,
    documents: docs,
  });
});

const downloadOrPreviewDocument = asyncHandler(async (req, res, next) => {
  const { id, filename } = req.params;
  const { download } = req.query;

  const app = await Application.findById(id);
  if (!app) {
    return next(new AppError('Application not found.', 404));
  }

  if (req.user.role !== 'admin' && String(app.studentId) !== String(req.user._id)) {
    return next(new AppError('Access denied to this document.', 403));
  }

  const safeFilename = path.basename(filename);
  const docEntry = (app.documents || []).find((d) => d.filename === safeFilename);
  if (!docEntry) {
    return next(new AppError('Document record not found on this application.', 404));
  }

  const docsDir = path.resolve(env.uploadsDir, 'documents');
  const fullPath = path.resolve(docsDir, safeFilename);
  if (!fullPath.startsWith(docsDir + path.sep) || !fs.existsSync(fullPath)) {
    return next(new AppError('Stored document file is missing on server.', 404));
  }

  res.setHeader('Content-Type', docEntry.mimeType || 'application/octet-stream');
  if (download === 'true') {
    return res.download(fullPath, docEntry.originalName || safeFilename);
  }
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(docEntry.originalName || safeFilename)}"`
  );
  return res.sendFile(fullPath);
});

const deleteApplicationDocument = asyncHandler(async (req, res, next) => {
  const { id, filename } = req.params;
  const app = await Application.findById(id);

  if (!app) return next(new AppError('Application not found.', 404));
  if (String(app.studentId) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }
  if (app.status !== 'Draft') {
    return next(new AppError('Cannot delete documents from a submitted application.', 400));
  }

  const safeFilename = path.basename(filename);
  const filtered = (app.documents || []).filter((d) => d.filename !== safeFilename);
  const updated = await Application.findByIdAndUpdate(
    String(app._id),
    { documents: filtered },
    { new: true }
  );

  const filePath = path.join(env.uploadsDir, 'documents', safeFilename);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }

  res.json({
    success: true,
    message: 'Document removed from draft.',
    application: updated,
  });
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateDraftApplication,
  submitDraftApplication,
  deleteDraftApplication,
  uploadApplicationDocument,
  getMyDocuments,
  downloadOrPreviewDocument,
  deleteApplicationDocument,
};
