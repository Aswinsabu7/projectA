const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const settingsController = require('../controllers/settings.controller');
const settingsValidator = require('../validators/settings.validator');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.SETTINGS_VIEW), settingsController.getSettings);
router.put(
  '/',
  requirePermission(PERMISSIONS.SETTINGS_EDIT),
  validate(settingsValidator.updateSettings),
  settingsController.updateSettings
);

module.exports = router;
