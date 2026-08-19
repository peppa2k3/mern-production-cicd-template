const notificationRepository = require('./notification.repository');
const AppError = require('../../common/errors/AppError');
const { getIO } = require('../../config/socket');
const logger = require('../../config/logger');

class NotificationService {
  async send(data, actor) {
    const notification = await notificationRepository.create({ ...data, createdBy: actor._id });

    // Emit in realtime to the right room(s). Socket emit failures should
    // never fail the HTTP request - the notification is already persisted
    // and will show up on next fetch/login regardless.
    try {
      const io = getIO();
      const payload = notification.toObject();

      if (data.targetType === 'all') {
        io.emit('notification:new', payload);
      } else if (data.targetType === 'role') {
        io.to(`role:${data.targetRole}`).emit('notification:new', payload);
      } else if (data.targetType === 'user') {
        data.recipients.forEach((userId) => {
          io.to(`user:${userId}`).emit('notification:new', payload);
        });
      }
    } catch (err) {
      logger.warn(`Socket emit skipped: ${err.message}`);
    }

    return notification;
  }

  listForUser(user, query) {
    return notificationRepository.findForUser(user, query);
  }

  listAdmin(query) {
    return notificationRepository.paginate({}, query, ['createdBy', 'targetRole']);
  }

  async markRead(id, userId) {
    const notification = await notificationRepository.markRead(id, userId);
    if (!notification) throw AppError.notFound('Notification not found');
    return notification;
  }

  unreadCount(user) {
    return notificationRepository.countUnreadForUser(user);
  }
}

module.exports = new NotificationService();
