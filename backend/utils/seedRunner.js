const { connectDB } = require('../config/db');
const { seedDemoData } = require('../services/seedService');

async function run() {
  await connectDB();
  await seedDemoData();
  console.log('[SEED] Seed check complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[SEED] Failed:', err);
  process.exit(1);
});
