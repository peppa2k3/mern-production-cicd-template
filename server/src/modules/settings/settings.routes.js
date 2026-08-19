const router = require('express').Router();
const controller = require('./settings.controller');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.get('/public', controller.getPublic);
router.patch('/', authenticate, requirePermissions(PERMISSIONS.SETTINGS_MANAGE), controller.update);

module.exports = router;
