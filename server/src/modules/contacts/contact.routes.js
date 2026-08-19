const router = require('express').Router();
const controller = require('./contact.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./contact.validator');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.post('/', validate(schema.create), controller.submit);

router.use(authenticate, requirePermissions(PERMISSIONS.CONTACT_MANAGE));
router.get('/', controller.list);
router.patch('/:id', validate(schema.update), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
