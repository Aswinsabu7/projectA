const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const { Subscriber } = require('../models');

/**
 * Atomically generates the next sequential subscriberId (e.g. SUB-000001)
 * using a lightweight counters collection (avoids race conditions on concurrent inserts).
 */
async function nextSubscriberId() {
  const result = await mongoose.connection.collection('counters').findOneAndUpdate(
    { _id: 'subscriberId' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  const seq = result?.seq ?? result?.value?.seq ?? 1;
  return `SUB-${String(seq).padStart(6, '0')}`;
}

function buildSearchFilter(search) {
  if (!search) return {};
  const regex = new RegExp(search.trim(), 'i');
  return {
    $or: [{ fullName: regex }, { mobileNumber: regex }, { email: regex }, { subscriberId: regex }],
  };
}

async function listSubscribers({ page, limit, skip, sort }, { search, platform, status } = {}) {
  const query = { isDeleted: false, ...buildSearchFilter(search) };
  if (platform) query.platform = platform;
  if (status) query.status = status;

  const [items, total] = await Promise.all([
    Subscriber.find(query).sort(sort).skip(skip).limit(limit),
    Subscriber.countDocuments(query),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getSubscriberById(id) {
  const subscriber = await Subscriber.findOne({ _id: id, isDeleted: false });
  if (!subscriber) throw ApiError.notFound('Subscriber not found');
  return subscriber;
}

async function createSubscriber(payload, createdBy) {
  const subscriberId = await nextSubscriberId();
  return Subscriber.create({ ...payload, subscriberId, createdBy });
}

async function updateSubscriber(id, payload, updatedBy) {
  const subscriber = await getSubscriberById(id);
  Object.assign(subscriber, payload, { updatedBy });
  await subscriber.save();
  return subscriber;
}

async function deleteSubscriber(id) {
  const subscriber = await getSubscriberById(id);
  subscriber.isDeleted = true;
  await subscriber.save();
  return subscriber;
}

/**
 * Recomputes status for every non-deleted subscriber. Called by the daily cron job
 * before evaluating reminders, keeping the `status` field always accurate even if
 * no create/update event triggered a recalculation.
 */
async function refreshAllStatuses() {
  const subscribers = await Subscriber.find({ isDeleted: false });
  const bulkOps = subscribers.map((s) => ({
    updateOne: {
      filter: { _id: s._id },
      update: { $set: { status: s.computeStatus() } },
    },
  }));
  if (bulkOps.length) await Subscriber.bulkWrite(bulkOps);
  return bulkOps.length;
}

module.exports = {
  nextSubscriberId,
  listSubscribers,
  getSubscriberById,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  refreshAllStatuses,
};
