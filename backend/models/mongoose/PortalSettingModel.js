const mongoose = require('mongoose');

const portalSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'portal_config' },
    academicYear: { type: String, default: '2026-27' },
    applicationsOpen: { type: Boolean, default: true },
    supportEmail: { type: String, default: 'helpdesk-demo@aicte-portal.edu' },
    helplineNumber: { type: String, default: '011-29581000 / 1800-11-2428 (Demo)' },
    portalBannerMessage: {
      type: String,
      default:
        'Approval Process 2026–2027 & Student Application Portal are now open for Academic Year 2026–27.',
    },
    maxUploadSizeMb: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PortalSetting || mongoose.model('PortalSetting', portalSettingSchema);
