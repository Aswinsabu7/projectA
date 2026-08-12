const mongoose = require('mongoose');
const { PLATFORM, SUBSCRIBER_STATUS } = require('../constants/roles');

const subscriberSchema = new mongoose.Schema(
  {
    subscriberId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    platform: {
      type: String,
      enum: Object.values(PLATFORM),
      required: true,
    },
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, required: true, index: true },
    amountPaid: { type: Number, required: true, min: 0, default: 0 },
    remarks: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: Object.values(SUBSCRIBER_STATUS),
      default: SUBSCRIBER_STATUS.ACTIVE,
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

subscriberSchema.index({ fullName: 'text', mobileNumber: 'text', email: 'text' });
subscriberSchema.index({ subscriptionEndDate: 1, status: 1 });

/**
 * Recomputes the derived status field based on subscriptionEndDate.
 * Called before save and can be invoked by the daily cron job to bulk-refresh statuses.
 */
subscriberSchema.methods.computeStatus = function computeStatus(referenceDate = new Date()) {
  const end = new Date(this.subscriptionEndDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((end.setHours(23, 59, 59, 999) - referenceDate.getTime()) / msPerDay);

  if (daysLeft < 0) return SUBSCRIBER_STATUS.EXPIRED;
  if (daysLeft <= 3) return SUBSCRIBER_STATUS.RENEWAL_DUE;
  return SUBSCRIBER_STATUS.ACTIVE;
};

subscriberSchema.pre('save', function preSave(next) {
  this.status = this.computeStatus();
  next();
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
