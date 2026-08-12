const { AuditLog } = require('../models');
const logger = require('../config/logger');

/**
 * Records an audit trail entry. Failures are logged but never block the request.
 * @param {object} params
 * @param {string} params.action - one of AUDIT_ACTIONS
 * @param {string} params.module - e.g. 'Subscriber', 'User', 'Role', 'Auth'
 * @param {string|null} [params.entityId]
 * @param {string} [params.description]
 * @param {object} [params.req] - express request (to extract user/ip/agent)
 * @param {object} [params.before]
 * @param {object} [params.after]
 */
async function recordAudit({ action, module, entityId = null, description = '', req = null, before = null, after = null }) {
  try {
    await AuditLog.create({
      action,
      module,
      entityId,
      description,
      performedBy: req?.user?.id || null,
      performedByUsername: req?.user?.username || 'system',
      ipAddress: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || '',
      before,
      after,
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

module.exports = { recordAudit };
