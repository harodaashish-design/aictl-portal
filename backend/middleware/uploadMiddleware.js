const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const ALLOWED_DOC_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
const ALLOWED_DOC_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const ALLOWED_AVATAR_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const ALLOWED_AVATAR_EXTS = new Set(['.jpg', '.jpeg', '.png']);

function ensureSubdir(sub) {
  const dir = path.join(env.uploadsDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createUploader(subdir, allowedMimes, allowedExts, maxMb = env.uploadMaxSizeMb) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureSubdir(subdir));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeBase = path
        .basename(file.originalname || 'file', ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${safeBase}_${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (!allowedMimes.has(mime) || !allowedExts.has(ext)) {
      return cb(
        new AppError(
          `Invalid file type (${ext || mime}). Allowed formats: ${Array.from(allowedExts).join(', ')}`,
          400
        )
      );
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxMb * 1024 * 1024,
    },
  });
}

const uploadDocument = createUploader('documents', ALLOWED_DOC_MIMES, ALLOWED_DOC_EXTS);
const uploadAvatar = createUploader('avatars', ALLOWED_AVATAR_MIMES, ALLOWED_AVATAR_EXTS, 2);

module.exports = {
  uploadDocument,
  uploadAvatar,
};
