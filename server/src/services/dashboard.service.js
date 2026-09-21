const { Subscriber } = require('../models');
const { dayRange } = require('../utilities/date.util');
const { SUBSCRIBER_STATUS, PLATFORM } = require('../constants/roles');

async function getWidgets() {
  const baseFilter = { isDeleted: false };

  const [
    total,
    active,
    expired,
    renewalDue,
    expiringIn3,
    expiringIn2,
    expiringIn1,
    revenueAgg,
  ] = await Promise.all([
    Subscriber.countDocuments(baseFilter),
    Subscriber.countDocuments({ ...baseFilter, status: SUBSCRIBER_STATUS.ACTIVE }),
    Subscriber.countDocuments({ ...baseFilter, status: SUBSCRIBER_STATUS.EXPIRED }),
    Subscriber.countDocuments({ ...baseFilter, status: SUBSCRIBER_STATUS.RENEWAL_DUE }),
    countExpiringInDays(3),
    countExpiringInDays(2),
    countExpiringInDays(1),
    Subscriber.aggregate([{ $match: baseFilter }, { $group: { _id: null, total: { $sum: '$amountPaid' } } }]),
  ]);

  return {
    totalSubscribers: total,
    activeSubscribers: active,
    expiredSubscribers: expired,
    renewalDue,
    expiringIn3Days: expiringIn3,
    expiringIn2Days: expiringIn2,
    expiringIn1Day: expiringIn1,
    revenueCollected: revenueAgg[0]?.total || 0,
  };
}

async function countExpiringInDays(days) {
  const { start, end } = dayRange(days);
  return Subscriber.countDocuments({
    isDeleted: false,
    subscriptionEndDate: { $gte: start, $lte: end },
  });
}

async function getMonthlyGrowth(months = 6) {
  const from = new Date();
  from.setMonth(from.getMonth() - (months - 1));
  from.setDate(1);
  from.setHours(0, 0, 0, 0);

  const result = await Subscriber.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: from } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return result.map((r) => ({
    label: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
    count: r.count,
  }));
}

async function getSubscribersByPlatform() {
  const result = await Subscriber.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$platform', count: { $sum: 1 } } },
  ]);

  const map = Object.fromEntries(result.map((r) => [r._id, r.count]));
  return Object.values(PLATFORM).map((platform) => ({ platform, count: map[platform] || 0 }));
}

async function getRevenueTrend(months = 6) {
  const from = new Date();
  from.setMonth(from.getMonth() - (months - 1));
  from.setDate(1);
  from.setHours(0, 0, 0, 0);

  const result = await Subscriber.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: from } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amountPaid' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return result.map((r) => ({
    label: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
    revenue: r.revenue,
  }));
}

module.exports = { getWidgets, getMonthlyGrowth, getSubscribersByPlatform, getRevenueTrend };
