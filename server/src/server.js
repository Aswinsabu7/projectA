const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');
const { seedInitialData } = require('./seed/seed');
const { initCronJobs } = require('./jobs/cron');

async function bootstrap() {
  await connectDB();

  // Ensures permissions/roles/Super Admin user/default settings exist.
  // Idempotent - safe on every startup - so a fresh clone + fresh MongoDB
  // (e.g. a new contributor's local setup) always has a working login
  // without a separate manual `npm run seed` step.
  await seedInitialData();

  initCronJobs();

  const server = app.listen(env.port, () => {
    logger.info(`ProjectA API listening on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API base: http://localhost:${env.port}${env.apiPrefix}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
}

bootstrap();
