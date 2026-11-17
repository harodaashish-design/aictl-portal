const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const timelineItemSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    label: { type: String, required: true },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    personalDetails: {
      fullName: { type: String, default: '' },
      enrollmentNumber: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      gender: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    academicDetails: {
      college: { type: String, default: '' },
      university: { type: String, default: '' },
      course: { type: String, default: '' },
      branch: { type: String, default: '' },
      semester: { type: String, default: '' },
      academicYear: { type: String, default: '' },
      admissionYear: { type: String, default: '' },
    },
    applicationType: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    reason: { type: String, default: '' },
    documents: { type: [documentSchema], default: [] },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    adminRemarks: { type: String, default: '' },
    timeline: { type: [timelineItemSchema], default: [] },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
