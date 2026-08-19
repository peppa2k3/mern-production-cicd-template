const router = require('express').Router();
const controller = require('./file.controller');
const upload = require('../../common/middleware/upload');
const { authenticate } = require('../../common/middleware/auth');
const { requirePermissions } = require('../../common/middleware/rbac');
const { PERMISSIONS } = require('../../common/constants/roles');

router.use(authenticate, requirePermissions(PERMISSIONS.PRODUCT_CREATE));

router.post('/single', upload.single('file'), controller.uploadSingle);
router.post('/multiple', upload.array('files', 20), controller.uploadMultiple);

module.exports = router;
