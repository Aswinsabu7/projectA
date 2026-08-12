const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const pagination = require('../middleware/pagination');
const roleController = require('../controllers/role.controller');
const roleValidator = require('../validators/role.validator');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/active', requirePermission(PERMISSIONS.ROLE_VIEW), roleController.getActiveRoles);
router.get('/', requirePermission(PERMISSIONS.ROLE_VIEW), pagination(), roleController.getRoles);
router.get('/:id', requirePermission(PERMISSIONS.ROLE_VIEW), roleController.getRoleById);
router.post(
  '/',
  requirePermission(PERMISSIONS.ROLE_CREATE),
  validate(roleValidator.createRole),
  roleController.createRole
);
router.put(
  '/:id',
  requirePermission(PERMISSIONS.ROLE_EDIT),
  validate(roleValidator.updateRole),
  roleController.updateRole
);
router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.ROLE_EDIT),
  validate(roleValidator.updateStatus),
  roleController.updateStatus
);
router.patch(
  '/:id/permissions',
  requirePermission(PERMISSIONS.ROLE_EDIT),
  validate(roleValidator.assignPermissions),
  roleController.assignPermissions
);
router.delete('/:id', requirePermission(PERMISSIONS.ROLE_DELETE), roleController.deleteRole);

module.exports = router;
