const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDatabase = require('./config/database');
const { initSocket } = require('./config/socket');
require('./jobs'); // registers cron jobs (node-cron)

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`Affiliate Platform API running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API base: http://localhost:${env.port}${env.apiPrefix}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

bootstrap();
