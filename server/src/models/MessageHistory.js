const mongoose = require('mongoose');
const { MESSAGE_TYPE, MESSAGE_STATUS } = require('../constants/roles');

const messageHistorySchema = new mongoose.Schema(
  {
    subscriber: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber', required: true, index: true },
    mobileNumber: { type: String, required: true },
    messageDate: { type: Date, required: true, default: Date.now },
    messageType: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      required: true,
    },
    messageContent: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.PENDING,
      index: true,
    },
    providerResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    provider: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null => system/cron
  },
  { timestamps: true }
);

messageHistorySchema.index({ messageDate: -1 });

module.exports = mongoose.model('MessageHistory', messageHistorySchema);
