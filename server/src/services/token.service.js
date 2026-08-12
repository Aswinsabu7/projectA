const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { RefreshToken } = require('../models');

/**
 * Generates a short-lived JWT access token embedding the user id, role and permissions.
 */
function generateAccessToken(user) {
  const permissions = (user.role && user.role.permissions) || [];
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      role: user.role?.name || null,
      roleId: user.role?._id?.toString() || null,
      permissions: permissions.map((p) => (typeof p === 'string' ? p : p.key)),
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
      issuer: env.jwt.issuer,
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret, { issuer: env.jwt.issuer });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a refresh token (opaque random JWT), persists its hash in DB, and returns the raw token.
 */
async function generateRefreshToken(user, meta = {}) {
  const jti = uuidv4();
  const rawToken = jwt.sign({ sub: user._id.toString(), jti }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: env.jwt.issuer,
  });

  const decoded = jwt.decode(rawToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt,
    userAgent: meta.userAgent || '',
    ipAddress: meta.ipAddress || '',
  });

  return rawToken;
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret, { issuer: env.jwt.issuer });
}

async function revokeRefreshToken(rawToken, replacedByRawToken = null) {
  const tokenHash = hashToken(rawToken);
  const update = { revoked: true, revokedAt: new Date() };
  if (replacedByRawToken) update.replacedByTokenHash = hashToken(replacedByRawToken);
  await RefreshToken.findOneAndUpdate({ tokenHash }, update);
}

async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { revoked: true, revokedAt: new Date() }
  );
}

async function findStoredRefreshToken(rawToken) {
  return RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findStoredRefreshToken,
  hashToken,
};
