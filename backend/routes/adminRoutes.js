const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/dashboard', getAdminDashboardStats);

router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);
router.patch('/students/:id/status', toggleStudentActiveStatus);

router.get('/applications', getAllApplications);
router.patch('/applications/:id/status', updateApplicationStatus);
router.get('/reports/export-csv', exportApplicationsCsv);

router.get('/announcements', getAllAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

router.get('/settings', getPortalSettings);
router.put('/settings', updatePortalSettings);

router.get('/support', getAllSupportTickets);
router.patch('/support/:id', replySupportTicket);

module.exports = router;
