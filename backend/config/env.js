const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: (process.env.MONGODB_URI || '').trim(),
  jwtSecret:
    process.env.JWT_SECRET || 'aicte_academic_demo_fallback_jwt_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadMaxSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB) || 5,
  demoSeed: process.env.DEMO_SEED !== 'false',
  uploadsDir: path.resolve(__dirname, '../uploads'),
  dataDir: path.resolve(__dirname, '../data'),
};

module.exports = env;
