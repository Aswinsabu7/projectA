const { MenuItem, Permission } = require('../models');
const ApiError = require('../utilities/apiError');

async function listMenuItems() {
  return MenuItem.find({ isActive: true }).sort({ order: 1, label: 1 });
}

async function listAllMenuItems() {
  return MenuItem.find().sort({ order: 1, label: 1 });
}

async function getMenuItemById(id) {
  const item = await MenuItem.findById(id);
  if (!item) throw ApiError.notFound('Menu item not found');
  return item;
}

async function createMenuItem(payload) {
  await validatePermissionKey(payload.permission);
  await checkDuplicateKey(payload.key);
  return MenuItem.create(payload);
}

async function updateMenuItem(id, payload) {
  const item = await getMenuItemById(id);
  if (payload.permission) await validatePermissionKey(payload.permission);
  if (payload.key && payload.key !== item.key) await checkDuplicateKey(payload.key);
  Object.assign(item, payload);
  await item.save();
  return item;
}

async function deleteMenuItem(id) {
  const item = await getMenuItemById(id);
  await item.deleteOne();
  return item;
}

async function validatePermissionKey(key) {
  if (!key) return;
  const exists = await Permission.findOne({ key, isActive: true });
  if (!exists) throw ApiError.badRequest(`Permission key "${key}" does not exist`);
}

async function checkDuplicateKey(key) {
  const exists = await MenuItem.findOne({ key });
  if (exists) throw ApiError.badRequest(`Menu item with key "${key}" already exists`);
}

module.exports = {
  listMenuItems,
  listAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
