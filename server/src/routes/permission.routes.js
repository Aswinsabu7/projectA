const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const permissionController = require('../controllers/permission.controller');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.ROLE_VIEW), permissionController.getPermissions);
router.get('/grouped', requirePermission(PERMISSIONS.ROLE_VIEW), permissionController.getPermissionGroups);

module.exports = router;
