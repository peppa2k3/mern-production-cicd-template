const router = require('express').Router();
const controller = require('./role.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./role.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.use(authenticate, requirePermissions(PERMISSIONS.ROLE_MANAGE));

router.get('/', controller.list);
router.get('/permissions', controller.listPermissions);
router.post('/', validate(schema.create), controller.create);
router.patch('/:id', validate(schema.update), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
