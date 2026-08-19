const router = require('express').Router();

// API v1 - each module owns its own sub-router. Adding v2 later means
// creating routes-v2.js and mounting it alongside this one in app.js,
// without touching existing v1 consumers.
router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/users', require('./modules/users/user.routes'));
router.use('/roles', require('./modules/roles/role.routes'));
router.use('/categories', require('./modules/categories/category.routes'));
router.use('/products', require('./modules/products/product.routes'));
router.use('/kol', require('./modules/kol/kol.routes'));
router.use('/notifications', require('./modules/notifications/notification.routes'));
router.use('/contacts', require('./modules/contacts/contact.routes'));
router.use('/files', require('./modules/files/file.routes'));
router.use('/settings', require('./modules/settings/settings.routes'));
router.use('/dashboard', require('./modules/dashboard/dashboard.routes'));

module.exports = router;
