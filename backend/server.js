const env = require('./config/env');
const { connectDB } = require('./config/db');
const { seedDemoData } = require('./services/seedService');
const app = require('./app');

async function startServer() {
  try {
    await connectDB();
    await seedDemoData();

    app.listen(env.port, () => {
      console.log(`=================================================`);
      console.log(`AICTE Academic Demo Portal Backend Running`);
      console.log(`URL: http://localhost:${env.port}/api`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
