const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const pagination = require('../middleware/pagination');
const auditLogController = require('../controllers/auditLog.controller');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.AUDIT_LOG_VIEW), pagination(), auditLogController.getAuditLogs);

module.exports = router;
