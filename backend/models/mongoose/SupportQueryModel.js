const mongoose = require('mongoose');

const supportQuerySchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: [
        'Approval Process Query',
        'Technical Support',
        'Application Status',
        'Document Upload Issue',
        'Scholarship / Scheme',
        'General Grievance',
      ],
      default: 'Technical Support',
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    adminReply: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SupportQuery || mongoose.model('SupportQuery', supportQuerySchema);
