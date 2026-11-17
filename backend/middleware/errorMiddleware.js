const multer = require('multer');
const env = require('../config/env');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File too large. Maximum allowed size is ${env.uploadMaxSizeMb} MB.`;
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  if (err && (err.code === 11000 || err.errorType === 'uniqueViolated')) {
    statusCode = 409;
    message = 'A record with this unique identifier (email or enrollment number) already exists.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (env.nodeEnv !== 'production' && statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
