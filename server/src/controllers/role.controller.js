const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const roleService = require('../services/role.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getRoles = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.name = new RegExp(search.trim(), 'i');

  const result = await roleService.listRoles(req.pagination, filter);
  return ApiResponse.ok(res, result.items, 'Roles fetched successfully', {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

const getActiveRoles = asyncHandler(async (_req, res) => {
  const roles = await roleService.getAllActiveRoles();
  return ApiResponse.ok(res, roles);
});

const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return ApiResponse.ok(res, role);
});

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    module: 'Role',
    entityId: role._id,
    description: `Created role ${role.name}`,
    req,
    after: role,
  });

  return ApiResponse.created(res, role);
});

const updateRole = asyncHandler(async (req, res) => {
  const before = await roleService.getRoleById(req.params.id);
  const role = await roleService.updateRole(req.params.id, req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    module: 'Role',
    entityId: role._id,
    description: `Updated role ${role.name}`,
    req,
    before,
    after: role,
  });

  return ApiResponse.ok(res, role, 'Role updated successfully');
});

const updateStatus = asyncHandler(async (req, res) => {
  const role = await roleService.setRoleStatus(req.params.id, req.body.isActive, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    module: 'Role',
    entityId: role._id,
    description: `Set status of role ${role.name} to ${req.body.isActive ? 'Active' : 'Inactive'}`,
    req,
  });

  return ApiResponse.ok(res, role, 'Role status updated successfully');
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await roleService.deleteRole(req.params.id);

  await recordAudit({
    action: AUDIT_ACTIONS.DELETE,
    module: 'Role',
    entityId: role._id,
    description: `Deleted role ${role.name}`,
    req,
    before: role,
  });

  return ApiResponse.ok(res, null, 'Role deleted successfully');
});

const assignPermissions = asyncHandler(async (req, res) => {
  const role = await roleService.assignPermissions(req.params.id, req.body.permissions, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    module: 'Role',
    entityId: role._id,
    description: `Updated permissions for role ${role.name}`,
    req,
    after: role,
  });

  return ApiResponse.ok(res, role, 'Permissions assigned successfully');
});

module.exports = {
  getRoles,
  getActiveRoles,
  getRoleById,
  createRole,
  updateRole,
  updateStatus,
  deleteRole,
  assignPermissions,
};
