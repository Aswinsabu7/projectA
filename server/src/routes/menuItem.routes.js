const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const menuItemController = require('../controllers/menuItem.controller');
const menuItemValidator = require('../validators/menuItem.validator');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

// Any authenticated user can fetch active menu items (filtered client-side by their permissions)
router.get('/', menuItemController.getMenuItems);

// Admin-only routes for managing menu items
router.get('/all', requirePermission(PERMISSIONS.MENU_EDIT), menuItemController.getAllMenuItems);

router.get('/:id', requirePermission(PERMISSIONS.MENU_EDIT), menuItemController.getMenuItemById);

router.post(
  '/',
  requirePermission(PERMISSIONS.MENU_EDIT),
  validate(menuItemValidator.createMenuItem),
  menuItemController.createMenuItem
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.MENU_EDIT),
  validate(menuItemValidator.updateMenuItem),
  menuItemController.updateMenuItem
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.MENU_EDIT),
  menuItemController.deleteMenuItem
);

module.exports = router;
