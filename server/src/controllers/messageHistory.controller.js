const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const { paginationMeta } = require('../utilities/query.util');
const messageHistoryService = require('../services/messageHistory.service');
const subscriberService = require('../services/subscriber.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getMessages = asyncHandler(async (req, res) => {
  const { search, status, messageType } = req.query;
  const result = await messageHistoryService.listMessages(req.pagination, { search, status, messageType });
  return ApiResponse.ok(res, result.items, 'Message history fetched successfully', paginationMeta(result));
});

const sendManualMessage = asyncHandler(async (req, res) => {
  const { subscriberId, messageType } = req.body;
  const subscriber = await subscriberService.getSubscriberById(subscriberId);
  const record = await messageHistoryService.sendAndLog({ subscriber, messageType, createdBy: req.user.id });

  await recordAudit({
    action: AUDIT_ACTIONS.CREATE,
    module: 'MessageHistory',
    entityId: record._id,
    description: `Manually sent ${messageType} message to ${subscriber.fullName}`,
    req,
  });

  return ApiResponse.created(res, record, 'Message sent');
});

const resendMessage = asyncHandler(async (req, res) => {
  const record = await messageHistoryService.resendMessage(req.params.id, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.CREATE,
    module: 'MessageHistory',
    entityId: record._id,
    description: `Resent message ${req.params.id}`,
    req,
  });

  return ApiResponse.ok(res, record, 'Message resent');
});

module.exports = { getMessages, sendManualMessage, resendMessage };
