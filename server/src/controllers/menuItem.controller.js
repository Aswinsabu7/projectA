const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const menuItemService = require('../services/menuItem.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getMenuItems = asyncHandler(async (_req, res) => {
  const items = await menuItemService.listMenuItems();
  return ApiResponse.ok(res, items);
});

const getAllMenuItems = asyncHandler(async (_req, res) => {
  const items = await menuItemService.listAllMenuItems();
  return ApiResponse.ok(res, items);
});

const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await menuItemService.getMenuItemById(req.params.id);
  return ApiResponse.ok(res, item);
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.createMenuItem(req.body);

  await recordAudit({
    action: AUDIT_ACTIONS.CREATE,
    module: 'MenuItem',
    description: `Created menu item "${item.label}"`,
    req,
    after: item,
  });

  return ApiResponse.created(res, item, 'Menu item created successfully');
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const before = await menuItemService.getMenuItemById(req.params.id);
  const item = await menuItemService.updateMenuItem(req.params.id, req.body);

  await recordAudit({
    action: AUDIT_ACTIONS.UPDATE,
    module: 'MenuItem',
    description: `Updated menu item "${item.label}"`,
    req,
    before,
    after: item,
  });

  return ApiResponse.ok(res, item, 'Menu item updated successfully');
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.deleteMenuItem(req.params.id);

  await recordAudit({
    action: AUDIT_ACTIONS.DELETE,
    module: 'MenuItem',
    description: `Deleted menu item "${item.label}"`,
    req,
    before: item,
  });

  return ApiResponse.ok(res, null, 'Menu item deleted successfully');
});

module.exports = {
  getMenuItems,
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
