const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const { Permission } = require('../models');

const getPermissions = asyncHandler(async (req, res) => {
  const { group } = req.query;
  const filter = { isActive: true };
  if (group) filter.group = group;

  const permissions = await Permission.find(filter).sort({ group: 1, key: 1 });
  return ApiResponse.ok(res, permissions);
});

const getPermissionGroups = asyncHandler(async (_req, res) => {
  const permissions = await Permission.find({ isActive: true }).sort({ group: 1, key: 1 });
  const grouped = permissions.reduce((acc, p) => {
    acc[p.group] = acc[p.group] || [];
    acc[p.group].push(p);
    return acc;
  }, {});
  return ApiResponse.ok(res, grouped);
});

module.exports = { getPermissions, getPermissionGroups };
