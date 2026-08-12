const ApiError = require('../utilities/apiError');
const { MessageHistory } = require('../models');
const { sendWhatsAppMessage, buildMessage } = require('./whatsapp/whatsapp.service');
const { MESSAGE_STATUS } = require('../constants/roles');

async function listMessages({ page, limit, skip, sort }, { search, status, messageType } = {}) {
  const query = {};
  if (status) query.status = status;
  if (messageType) query.messageType = messageType;
  if (search) query.mobileNumber = new RegExp(search.trim(), 'i');

  const [items, total] = await Promise.all([
    MessageHistory.find(query)
      .populate('subscriber', 'subscriberId fullName mobileNumber platform')
      .populate('createdBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    MessageHistory.countDocuments(query),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Sends (or re-sends) a WhatsApp message for a subscriber and persists the outcome.
 */
async function sendAndLog({ subscriber, messageType, createdBy = null }) {
  const message = buildMessage(messageType, subscriber);
  const result = await sendWhatsAppMessage({ to: subscriber.mobileNumber, message });

  const record = await MessageHistory.create({
    subscriber: subscriber._id,
    mobileNumber: subscriber.mobileNumber,
    messageDate: new Date(),
    messageType,
    messageContent: message,
    status: result.success ? MESSAGE_STATUS.SENT : MESSAGE_STATUS.FAILED,
    providerResponse: result.raw || result.error || {},
    provider: result.provider || '',
    createdBy,
  });

  return record;
}

async function resendMessage(id, createdBy) {
  const record = await MessageHistory.findById(id).populate('subscriber');
  if (!record) throw ApiError.notFound('Message history entry not found');
  if (!record.subscriber) throw ApiError.badRequest('Original subscriber no longer exists');

  return sendAndLog({ subscriber: record.subscriber, messageType: record.messageType, createdBy });
}

module.exports = { listMessages, sendAndLog, resendMessage };
