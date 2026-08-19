const notificationService = require('./notification.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const send = catchAsync(async (req, res) => {
  const notification = await notificationService.send(req.body, req.user);
  return ApiResponse.created(res, notification, 'Notification sent');
});

const listMine = catchAsync(async (req, res) => {
  const { items, meta } = await notificationService.listForUser(req.user, req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const listAdmin = catchAsync(async (req, res) => {
  const { items, meta } = await notificationService.listAdmin(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const markRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  return ApiResponse.success(res, notification, 'Marked as read');
});

const unreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.unreadCount(req.user);
  return ApiResponse.success(res, { count });
});

module.exports = { send, listMine, listAdmin, markRead, unreadCount };
