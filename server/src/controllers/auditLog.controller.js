const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const { AuditLog } = require('../models');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { search, action, module: moduleName, from, to } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (moduleName) filter.module = moduleName;
  if (search) filter.performedByUsername = new RegExp(search.trim(), 'i');
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const { page, limit, skip, sort } = req.pagination;
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, items, 'Audit logs fetched successfully', {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

module.exports = { getAuditLogs };
