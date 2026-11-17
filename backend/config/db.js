const mongoose = require('mongoose');
const env = require('./env');
const { setActiveDriver, getActiveDriver } = require('../models/dbAdapter');

async function connectDB() {
  if (env.mongodbUri) {
    try {
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: 4000,
      });
      setActiveDriver('mongoose');
      console.log('[DB] Connected to MongoDB via Mongoose.');
      return { driver: 'mongoose', connected: true };
    } catch (err) {
      console.warn(
        `[DB] Could not connect to MONGODB_URI (${err.message}). Falling back to persistent local disk datastore (NeDB).`
      );
    }
  } else {
    console.log(
      '[DB] No MONGODB_URI configured. Using persistent local disk datastore (NeDB) in backend/data/.'
    );
  }

  setActiveDriver('nedb');
  return { driver: getActiveDriver(), connected: true };
}

module.exports = { connectDB };
