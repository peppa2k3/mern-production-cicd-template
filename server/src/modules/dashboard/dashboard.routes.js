const router = require('express').Router();
const controller = require('./dashboard.controller');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.get('/summary', authenticate, requirePermissions(PERMISSIONS.DASHBOARD_VIEW), controller.summary);

module.exports = router;
