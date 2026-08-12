const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const settingsService = require('../services/settings.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.getSettings();
  return ApiResponse.ok(res, settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.UPDATE,
    module: 'Settings',
    description: 'Updated application settings',
    req,
    after: settings,
  });

  return ApiResponse.ok(res, settings, 'Settings updated successfully');
});

module.exports = { getSettings, updateSettings };
