const ApiError = require('../utilities/apiError');
const asyncHandler = require('../utilities/asyncHandler');
const tokenService = require('../services/token.service');
const { User } = require('../models');

/**
 * Authenticates the request using the Bearer access token.
 * Populates req.user with { id, username, role, permissions }.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized('Access token is missing');
  }

  let payload;
  try {
    payload = tokenService.verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await User.findById(payload.sub).select('status').lean();
  if (!user || user.status !== 'Active') {
    throw ApiError.unauthorized('User account is inactive or not found');
  }

  req.user = {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    roleId: payload.roleId,
    permissions: payload.permissions || [],
  };

  next();
});

module.exports = authenticate;
