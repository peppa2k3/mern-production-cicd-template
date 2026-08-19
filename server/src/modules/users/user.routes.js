const router = require('express').Router();
const controller = require('./user.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./user.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.use(authenticate);

router.patch('/me', validate(schema.updateProfile), controller.updateOwnProfile);

router.get('/', requirePermissions(PERMISSIONS.USER_MANAGE), controller.list);
router.post('/', requirePermissions(PERMISSIONS.USER_MANAGE), validate(schema.create), controller.create);
router.get('/:id', requirePermissions(PERMISSIONS.USER_MANAGE), controller.getById);
router.patch('/:id', requirePermissions(PERMISSIONS.USER_MANAGE), validate(schema.update), controller.update);
router.patch('/:id/status', requirePermissions(PERMISSIONS.USER_MANAGE), controller.setActive);
router.delete('/:id', requirePermissions(PERMISSIONS.USER_MANAGE), controller.remove);

module.exports = router;
