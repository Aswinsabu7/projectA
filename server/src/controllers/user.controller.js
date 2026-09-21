const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const { searchRegex, paginationMeta } = require('../utilities/query.util');
const userService = require('../services/user.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    const regex = searchRegex(search);
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { username: regex }];
  }

  const result = await userService.listUsers(req.pagination, filter);
  return ApiResponse.ok(res, result.items, 'Users fetched successfully', paginationMeta(result));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.ok(res, user);
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.USER_CHANGE,
    module: 'User',
    entityId: user._id,
    description: `Created user ${user.username}`,
    req,
    after: user,
  });

  return ApiResponse.created(res, user);
});

const updateUser = asyncHandler(async (req, res) => {
  const before = await userService.getUserById(req.params.id);
  const user = await userService.updateUser(req.params.id, req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.USER_CHANGE,
    module: 'User',
    entityId: user._id,
    description: `Updated user ${user.username}`,
    req,
    before,
    after: user,
  });

  return ApiResponse.ok(res, user, 'User updated successfully');
});

const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, req.body.status, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.USER_CHANGE,
    module: 'User',
    entityId: user._id,
    description: `Set status of ${user.username} to ${req.body.status}`,
    req,
  });

  return ApiResponse.ok(res, user, 'User status updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id);

  await recordAudit({
    action: AUDIT_ACTIONS.DELETE,
    module: 'User',
    entityId: user._id,
    description: `Deleted user ${user.username}`,
    req,
    before: user,
  });

  return ApiResponse.ok(res, null, 'User deleted successfully');
});

module.exports = { getUsers, getUserById, createUser, updateUser, updateStatus, deleteUser };
