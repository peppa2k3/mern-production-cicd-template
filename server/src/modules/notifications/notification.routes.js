const router = require('express').Router();
const controller = require('./notification.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./notification.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.use(authenticate);

router.get('/me', requirePermissions(PERMISSIONS.NOTIFICATION_READ_OWN), controller.listMine);
router.get(
  '/me/unread-count',
  requirePermissions(PERMISSIONS.NOTIFICATION_READ_OWN),
  controller.unreadCount
);
router.patch(
  '/:id/read',
  requirePermissions(PERMISSIONS.NOTIFICATION_READ_OWN),
  controller.markRead
);

router.get('/', requirePermissions(PERMISSIONS.NOTIFICATION_SEND), controller.listAdmin);
router.post(
  '/',
  requirePermissions(PERMISSIONS.NOTIFICATION_SEND),
  validate(schema.create),
  controller.send
);

module.exports = router;
