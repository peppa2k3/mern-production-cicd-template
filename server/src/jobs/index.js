const cron = require('node-cron');
const logger = require('../config/logger');
const ActivityLog = require('../modules/activity-logs/activityLog.model');

// Example scheduled job: purge activity logs older than 180 days, runs daily
// at 02:00. Add further jobs here (e.g. expired refresh token cleanup,
// scheduled reports) - each job stays a small, isolated function.
cron.schedule('0 2 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
    logger.info(`Cron: purged ${result.deletedCount} old activity logs`);
  } catch (err) {
    logger.error(`Cron purge failed: ${err.message}`);
  }
});

logger.info('Cron jobs registered');
