const ActivityLog = require('./activityLog.model');
const logger = require('../../config/logger');

class ActivityLogService {
  // Fire-and-forget audit logging. Never throws - a logging failure should
  // never break the primary business operation that triggered it.
  async log({ user, action, resource, resourceId, metadata, ip }) {
    try {
      await ActivityLog.create({ user, action, resource, resourceId, metadata, ip });
    } catch (err) {
      logger.error(`ActivityLog write failed: ${err.message}`);
    }
  }

  async list(filter, query) {
    const BaseRepository = require('../../common/utils/BaseRepository');
    const repo = new BaseRepository(ActivityLog);
    return repo.paginate(filter, query, ['user']);
  }
}

module.exports = new ActivityLogService();
