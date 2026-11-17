const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 220 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Public Notice', 'Corrigendum', 'Academic Calendar', 'Scheme', 'General'],
      default: 'General',
    },
    publishDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
