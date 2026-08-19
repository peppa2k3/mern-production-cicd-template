const router = require('express').Router();
const controller = require('./category.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./category.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

// Public
router.get('/public', controller.listPublic);
router.get('/slug/:slug', controller.getBySlug);

// Admin
router.get('/', authenticate, requirePermissions(PERMISSIONS.CATEGORY_MANAGE), controller.list);
router.post(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.CATEGORY_MANAGE),
  validate(schema.create),
  controller.create
);
router.patch(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.CATEGORY_MANAGE),
  validate(schema.update),
  controller.update
);
router.delete(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.CATEGORY_MANAGE),
  controller.remove
);

module.exports = router;
