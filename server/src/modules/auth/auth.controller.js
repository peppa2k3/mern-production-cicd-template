const authService = require('./auth.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');
const env = require('../../config/env');

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: `${env.apiPrefix}/auth`,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  return ApiResponse.created(
    res,
    user.toSafeJSON(),
    'Registration submitted. An admin will review your KOL account.'
  );
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body,
    req.headers['user-agent']
  );
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return ApiResponse.success(res, { user: user.toSafeJSON(), accessToken }, 'Logged in');
});

const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return ApiResponse.success(res, { user: user.toSafeJSON(), accessToken }, 'Token refreshed');
});

const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(req.user, token);
  res.clearCookie('refreshToken', { path: `${env.apiPrefix}/auth` });
  return ApiResponse.success(res, null, 'Logged out');
});

const me = catchAsync(async (req, res) => {
  return ApiResponse.success(res, req.user.toSafeJSON());
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword);
  return ApiResponse.success(res, null, 'Password changed. Please log in again.');
});

module.exports = { register, login, refresh, logout, me, changePassword };
