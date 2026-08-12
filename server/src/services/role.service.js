const ApiError = require('../utilities/apiError');
const { Role, User } = require('../models');

async function listRoles({ page, limit, skip, sort }, filter = {}) {
  const query = { ...filter };
  const [items, total] = await Promise.all([
    Role.find(query).populate('permissions', 'key name group').sort(sort).skip(skip).limit(limit),
    Role.countDocuments(query),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getAllActiveRoles() {
  return Role.find({ isActive: true }).select('name description').sort({ name: 1 });
}

async function getRoleById(id) {
  const role = await Role.findById(id).populate('permissions');
  if (!role) throw ApiError.notFound('Role not found');
  return role;
}

async function createRole(payload, createdBy) {
  const exists = await Role.findOne({ name: payload.name });
  if (exists) throw ApiError.conflict('A role with this name already exists');

  const role = await Role.create({ ...payload, createdBy });
  return getRoleById(role._id);
}

async function updateRole(id, payload, updatedBy) {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystemRole && payload.name && payload.name !== role.name) {
    throw ApiError.forbidden('System role name cannot be changed');
  }

  Object.assign(role, payload, { updatedBy });
  await role.save();
  return getRoleById(role._id);
}

async function setRoleStatus(id, isActive, updatedBy) {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystemRole) throw ApiError.forbidden('System role status cannot be changed');

  role.isActive = isActive;
  role.updatedBy = updatedBy;
  await role.save();
  return role;
}

async function deleteRole(id) {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystemRole) throw ApiError.forbidden('System roles cannot be deleted');

  const inUse = await User.countDocuments({ role: id });
  if (inUse > 0) throw ApiError.conflict('Role is assigned to one or more users and cannot be deleted');

  await role.deleteOne();
  return role;
}

async function assignPermissions(id, permissionIds, updatedBy) {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound('Role not found');

  role.permissions = permissionIds;
  role.updatedBy = updatedBy;
  await role.save();
  return getRoleById(role._id);
}

module.exports = {
  listRoles,
  getAllActiveRoles,
  getRoleById,
  createRole,
  updateRole,
  setRoleStatus,
  deleteRole,
  assignPermissions,
};
