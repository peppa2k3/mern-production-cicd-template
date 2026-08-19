const router = require('express').Router();
const controller = require('./kol.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./kol.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { requireKolOwnership } = require('./kol.middleware');
const { PERMISSIONS } = require('../../common/constants/roles');

// Public
router.get('/public', controller.listPublic);
router.get('/public/:route', controller.getByRoute);
router.post('/public/:id/products/:productId/click', controller.trackClick);

// Self-service (KOL/staff managing their own page) + Admin
router.get(
  '/me',
  authenticate,
  requirePermissions(PERMISSIONS.KOL_MANAGE_OWN),
  controller.getOwnProfile
);

router.get('/', authenticate, requirePermissions(PERMISSIONS.KOL_MANAGE), controller.listAdmin);
router.post(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.KOL_MANAGE),
  validate(schema.create),
  controller.create
);
router.patch(
  '/:id',
  authenticate,
  requireKolOwnership,
  validate(schema.update),
  controller.update
);
router.delete(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.KOL_MANAGE),
  controller.remove
);

router.post(
  '/:id/products',
  authenticate,
  requireKolOwnership,
  validate(schema.addProduct),
  controller.addProduct
);
router.delete('/:id/products/:productId', authenticate, requireKolOwnership, controller.removeProduct);
router.patch(
  '/:id/products/:productId/pin',
  authenticate,
  requireKolOwnership,
  validate(schema.pin),
  controller.setPin
);
router.patch(
  '/:id/products/reorder',
  authenticate,
  requireKolOwnership,
  validate(schema.reorder),
  controller.reorder
);

module.exports = router;
