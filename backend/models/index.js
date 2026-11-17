const UserModel = require('./mongoose/UserModel');
const ApplicationModel = require('./mongoose/ApplicationModel');
const NotificationModel = require('./mongoose/NotificationModel');
const AnnouncementModel = require('./mongoose/AnnouncementModel');
const PasswordResetTokenModel = require('./mongoose/PasswordResetTokenModel');
const SupportQueryModel = require('./mongoose/SupportQueryModel');
const PortalSettingModel = require('./mongoose/PortalSettingModel');
const { createModelAdapter } = require('./dbAdapter');

const User = createModelAdapter('Users', UserModel, {
  uniqueFields: ['email'],
  sparseUniqueFields: ['enrollmentNumber'],
  defaults: {
    role: 'student',
    isActive: true,
    academicYear: '2026-27',
    college: '',
    university: '',
    course: '',
    branch: '',
    profilePhoto: '',
  },
  normalize: (doc) => ({
    ...doc,
    email: String(doc.email || '').trim().toLowerCase(),
    name: String(doc.name || '').trim(),
  }),
});

const Application = createModelAdapter('Applications', ApplicationModel, {
  uniqueFields: ['applicationId'],
  defaults: {
    status: 'Draft',
    adminRemarks: '',
    documents: [],
    timeline: [],
    submittedAt: null,
  },
});

const Notification = createModelAdapter('Notifications', NotificationModel, {
  defaults: {
    type: 'info',
    relatedApplicationId: '',
    isRead: false,
  },
});

const Announcement = createModelAdapter('Announcements', AnnouncementModel, {
  defaults: {
    category: 'General',
    publishDate: () => new Date(),
    isActive: true,
    createdBy: 'Admin',
  },
});

const PasswordResetToken = createModelAdapter('PasswordResetTokens', PasswordResetTokenModel, {
  defaults: {
    used: false,
  },
});

const SupportQuery = createModelAdapter('SupportQueries', SupportQueryModel, {
  uniqueFields: ['ticketId'],
  defaults: {
    status: 'Open',
    adminReply: '',
  },
});

const PortalSetting = createModelAdapter('PortalSettings', PortalSettingModel, {
  uniqueFields: ['key'],
  defaults: {
    key: 'portal_config',
    academicYear: '2026-27',
    applicationsOpen: true,
    supportEmail: 'helpdesk-demo@aicte-portal.edu',
    helplineNumber: '011-29581000 / 1800-11-2428 (Demo)',
    portalBannerMessage:
      'Approval Process 2026–2027 & Student Application Portal are now open for Academic Year 2026–27.',
    maxUploadSizeMb: 5,
  },
});

module.exports = {
  User,
  Application,
  Notification,
  Announcement,
  PasswordResetToken,
  SupportQuery,
  PortalSetting,
};
