const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const pagination = require('../middleware/pagination');
const userController = require('../controllers/user.controller');
const userValidator = require('../validators/user.validator');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.USER_VIEW), pagination(), userController.getUsers);
router.get('/:id', requirePermission(PERMISSIONS.USER_VIEW), userController.getUserById);
router.post(
  '/',
  requirePermission(PERMISSIONS.USER_CREATE),
  validate(userValidator.createUser),
  userController.createUser
);
router.put(
  '/:id',
  requirePermission(PERMISSIONS.USER_EDIT),
  validate(userValidator.updateUser),
  userController.updateUser
);
router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.USER_EDIT),
  validate(userValidator.updateStatus),
  userController.updateStatus
);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), userController.deleteUser);

module.exports = router;
