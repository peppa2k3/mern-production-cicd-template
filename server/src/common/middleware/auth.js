const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const env = require('../../config/env');
const User = require('../../modules/users/user.model');

// Verifies the access token from the Authorization header and attaches the
// authenticated user (with populated role/permissions) to req.user.
// Any route behind this middleware requires a logged-in user.
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing access token');
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, env.jwt.accessSecret);

    const user = await User.findById(payload.sub).populate('role');
    if (payload.kind !== 'access' || !user || !user.isActive || payload.sessionVersion !== (user.sessionVersion || 0)) {
      throw AppError.unauthorized('Account is inactive or not found');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Optional auth: attaches req.user if a valid token is present, but does not
// reject the request otherwise. Useful for public endpoints that behave
// slightly differently for logged-in users (e.g. KOL click tracking).
const optionalAuthenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub).populate('role');
    if (payload.kind === 'access' && user && user.isActive && payload.sessionVersion === (user.sessionVersion || 0)) req.user = user;
    next();
  } catch (err) {
    next();
  }
};

module.exports = { authenticate, optionalAuthenticate };
