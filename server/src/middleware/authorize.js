const ApiError = require('../utilities/apiError');
const { ROLES } = require('../constants/roles');

/**
 * Authorization middleware factory - checks that the authenticated user holds
 * ALL of the given permissions (Super Admin always bypasses the check).
 * @param {...string} requiredPermissions
 */
function requirePermission(...requiredPermissions) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = new Set(req.user.permissions || []);
    const hasAll = requiredPermissions.every((p) => userPermissions.has(p));

    if (!hasAll) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    return next();
  };
}

/**
 * Restricts access to specific role names only.
 * @param {...string} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    return next();
  };
}

module.exports = { requirePermission, requireRole };
