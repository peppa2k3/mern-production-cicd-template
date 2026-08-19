const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../common/middleware/validate');
const schema = require('./auth.validator');
const { authenticate } = require('../../common/middleware/auth');
const { authLimiter } = require('../../common/middleware/rateLimit');

router.post('/register', authLimiter, validate(schema.register), controller.register);
router.post('/login', authLimiter, validate(schema.login), controller.login);
router.post('/refresh', validate(schema.refresh.fork(['refreshToken'], (s) => s.optional())), controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.post(
  '/change-password',
  authenticate,
  validate(schema.changePassword),
  controller.changePassword
);

module.exports = router;
