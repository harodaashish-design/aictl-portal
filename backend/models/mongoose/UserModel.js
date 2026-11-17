const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    enrollmentNumber: { type: String, unique: true, sparse: true, trim: true },
    college: { type: String, trim: true, default: '' },
    university: { type: String, trim: true, default: '' },
    course: { type: String, trim: true, default: '' },
    branch: { type: String, trim: true, default: '' },
    academicYear: { type: String, trim: true, default: '2026-27' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    isActive: { type: Boolean, default: true, index: true },
    profilePhoto: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', enrollmentNumber: 'text', college: 'text' });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
