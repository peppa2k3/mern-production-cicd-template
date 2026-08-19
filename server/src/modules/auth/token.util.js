const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role?.name }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken };
