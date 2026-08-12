const ApiError = require('../utilities/apiError');
const { hashPassword, comparePassword } = require('../utilities/password.util');
const tokenService = require('./token.service');
const { User } = require('../models');

async function login({ username, password }, meta = {}) {
  const user = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
  })
    .select('+password')
    .populate({ path: 'role', populate: { path: 'permissions' } });

  if (!user) {
    throw ApiError.unauthorized('Invalid username or password');
  }

  if (user.status !== 'Active') {
    throw ApiError.forbidden('Your account is inactive. Please contact the administrator.');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid username or password');
  }

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(user, meta);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

async function refresh(rawRefreshToken, meta = {}) {
  if (!rawRefreshToken) {
    throw ApiError.unauthorized('Refresh token is missing');
  }

  let payload;
  try {
    payload = tokenService.verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await tokenService.findStoredRefreshToken(rawRefreshToken);
  if (!stored || stored.revoked) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const user = await User.findById(payload.sub).populate({
    path: 'role',
    populate: { path: 'permissions' },
  });

  if (!user || user.status !== 'Active') {
    throw ApiError.unauthorized('User account is inactive or not found');
  }

  const accessToken = tokenService.generateAccessToken(user);
  const newRefreshToken = await tokenService.generateRefreshToken(user, meta);
  await tokenService.revokeRefreshToken(rawRefreshToken, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken, user: sanitizeUser(user) };
}

async function logout(rawRefreshToken) {
  if (rawRefreshToken) {
    await tokenService.revokeRefreshToken(rawRefreshToken);
  }
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.mustChangePassword = false;
  await user.save({ validateBeforeSave: false });

  await tokenService.revokeAllUserTokens(userId);
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
}

module.exports = { login, refresh, logout, changePassword, sanitizeUser };
