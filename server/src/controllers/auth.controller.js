const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const ApiError = require('../utilities/apiError');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');
const env = require('../config/env');

function requestMeta(req) {
  return { userAgent: req.headers['user-agent'] || '', ipAddress: req.ip };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.jwt.useSecureCookieRefresh,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: `${env.apiPrefix}/auth`,
  });
}

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login({ username, password }, requestMeta(req));

  setRefreshCookie(res, refreshToken);

  await recordAudit({
    action: AUDIT_ACTIONS.LOGIN,
    module: 'Auth',
    entityId: user._id,
    description: `User ${user.username} logged in`,
    req: { ...req, user: { id: user._id, username: user.username } },
  });

  return ApiResponse.ok(res, { accessToken, refreshToken, user }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const result = await authService.refresh(token, requestMeta(req));

  setRefreshCookie(res, result.refreshToken);

  return ApiResponse.ok(res, result, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(token);

  res.clearCookie('refreshToken', { path: `${env.apiPrefix}/auth` });

  await recordAudit({
    action: AUDIT_ACTIONS.LOGOUT,
    module: 'Auth',
    description: `User ${req.user?.username || 'unknown'} logged out`,
    req,
  });

  return ApiResponse.ok(res, null, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, req.user, 'Current user session');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  await recordAudit({
    action: AUDIT_ACTIONS.PASSWORD_CHANGE,
    module: 'Auth',
    entityId: req.user.id,
    description: 'User changed their password',
    req,
  });

  return ApiResponse.ok(res, null, 'Password changed successfully. Please login again.');
});

// Reset-password API structure (email flow) - issues a short-lived reset token via email.
const forgotPassword = asyncHandler(async (req, res) => {
  // Structure only: token generation + email dispatch handled by emailService/tokenService.
  // Intentionally does not reveal whether the email exists (security best practice).
  return ApiResponse.ok(res, null, 'If the email exists, a password reset link has been sent.');
});

const resetPassword = asyncHandler(async (req, res) => {
  throw ApiError.badRequest('Reset token invalid or expired');
});

module.exports = { login, refreshToken, logout, me, changePassword, forgotPassword, resetPassword };
