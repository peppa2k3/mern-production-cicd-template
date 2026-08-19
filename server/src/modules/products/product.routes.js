const router = require('express').Router();
const controller = require('./product.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./product.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

// Public
router.get('/public', validate(schema.query, 'query'), controller.listPublic);
router.get('/public/featured', controller.featured);
router.get('/public/hot', controller.hot);
router.get('/public/slug/:slug', controller.getBySlug);
router.post('/public/:id/click', controller.trackClick);

// Admin / Staff
router.get(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.PRODUCT_READ),
  controller.listAdmin
);
router.get(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.PRODUCT_READ),
  controller.getById
);
router.post(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.PRODUCT_CREATE),
  validate(schema.create),
  controller.create
);
router.patch(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.PRODUCT_UPDATE),
  validate(schema.update),
  controller.update
);
router.delete(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.PRODUCT_DELETE),
  controller.remove
);

module.exports = router;
