const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sanitizeUser } = require('../utils/validators');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Allow token query parameter strictly for direct file preview/download in new browser tab
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return next(new AppError('Invalid or expired session token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new AppError('Account associated with this token no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(
      new AppError('Your account has been deactivated by the administrator. Contact helpdesk.', 403)
    );
  }

  req.user = sanitizeUser(user);
  next();
});

module.exports = { protect };
