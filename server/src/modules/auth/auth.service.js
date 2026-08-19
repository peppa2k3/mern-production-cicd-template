const bcrypt = require('bcryptjs');
const AppError = require('../../common/errors/AppError');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const { ROLES } = require('../../common/constants/roles');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('./token.util');
const activityLogService = require('../activity-logs/activityLog.service');

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

class AuthService {
  // Public self-registration always creates a KOL account and is inactive
  // until an Admin approves it. This backs the homepage "Đăng ký cộng tác
  // viên" CTA without letting anyone self-assign Admin/Staff roles.
  async register({ name, email, password, phone }) {
    const existing = await User.findOne({ email });
    if (existing) throw AppError.conflict('Email already registered');

    const kolRole = await Role.findOne({ name: ROLES.KOL });
    if (!kolRole) throw AppError.badRequest('KOL role not seeded yet');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: kolRole._id,
      isActive: false, // pending admin approval
    });

    await activityLogService.log({
      user: user._id,
      action: 'auth.register',
      resource: 'User',
      resourceId: user._id,
    });

    return user;
  }

  async login({ email, password }, userAgent) {
    const user = await User.findOne({ email }).select('+passwordHash').populate('role');
    if (!user) throw AppError.unauthorized('Invalid email or password');

    const match = await user.comparePassword(password);
    if (!match) throw AppError.unauthorized('Invalid email or password');

    if (!user.isActive) {
      throw AppError.forbidden('Account is inactive. Please contact an administrator.');
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens.push({
      tokenHash: hashToken(refreshToken),
      userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    user.lastLoginAt = new Date();
    await user.save();

    await activityLogService.log({
      user: user._id,
      action: 'auth.login',
      resource: 'User',
      resourceId: user._id,
    });

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.sub).populate('role');
    if (!user || !user.isActive) throw AppError.unauthorized('Invalid session');

    const tokenHash = hashToken(refreshToken);
    const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
    if (!stored) throw AppError.unauthorized('Refresh token revoked');

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
    const newRefreshToken = signRefreshToken(user);
    user.refreshTokens.push({
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await user.save();

    const accessToken = signAccessToken(user);
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  async logout(user, refreshToken) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
    await user.save();
  }

  async changePassword(user, currentPassword, newPassword) {
    const fullUser = await User.findById(user._id).select('+passwordHash');
    const match = await fullUser.comparePassword(currentPassword);
    if (!match) throw AppError.unauthorized('Current password is incorrect');

    fullUser.passwordHash = await bcrypt.hash(newPassword, 12);
    fullUser.refreshTokens = []; // force re-login on all devices
    await fullUser.save();
  }
}

module.exports = new AuthService();
