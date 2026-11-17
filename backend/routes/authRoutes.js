const express = require('express');
const {
  registerStudent,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter, passwordResetLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/register', authRateLimiter, registerStudent);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
