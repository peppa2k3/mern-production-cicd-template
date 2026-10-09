const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), kind: 'access', sessionVersion: user.sessionVersion || 0 }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), kind: 'refresh', sessionVersion: user.sessionVersion || 0, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.jwt.refreshSecret);
  if (payload.kind !== 'refresh') throw new Error('Invalid token kind');
  return payload;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken };
