const validator = require('validator');

function isValidEmail(email) {
  return typeof email === 'string' && validator.isEmail(email.trim());
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  return /^(?:91)?[6-9]\d{9}$/.test(cleaned) || /^\d{10,12}$/.test(cleaned);
}

function sanitizeUser(user) {
  if (!user) return null;
  const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete plain.passwordHash;
  delete plain.__v;
  return {
    ...plain,
    _id: String(plain._id),
  };
}

function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  isValidEmail,
  isValidPhone,
  sanitizeUser,
  escapeRegex,
};
