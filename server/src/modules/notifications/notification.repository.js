const BaseRepository = require('../../common/utils/BaseRepository');
const Notification = require('./notification.model');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  // Notifications visible to a given user: broadcast to all, targeted at
  // their role, or targeted directly at them.
  findForUser(user, query) {
    const filter = {
      $or: [
        { targetType: 'all' },
        { targetType: 'role', targetRole: user.role._id || user.role },
        { targetType: 'user', recipients: user._id },
      ],
    };
    return this.paginate(filter, query, ['createdBy']);
  }

  markRead(notificationId, userId) {
    return this.model.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
  }

  countUnreadForUser(user) {
    return this.model.countDocuments({
      $or: [
        { targetType: 'all' },
        { targetType: 'role', targetRole: user.role._id || user.role },
        { targetType: 'user', recipients: user._id },
      ],
      readBy: { $ne: user._id },
    });
  }
}

module.exports = new NotificationRepository();
