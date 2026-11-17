const express = require('express');
const {
  getStudentDashboardStats,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getMySupportTickets,
  createSupportTicket,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect, requireRole('student'));

router.get('/dashboard', getStudentDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', uploadAvatar.single('photo'), uploadProfilePhoto);
router.get('/support', getMySupportTickets);
router.post('/support', createSupportTicket);

module.exports = router;
