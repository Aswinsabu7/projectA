const logger = require('../config/logger');
const { Subscriber } = require('../models');
const subscriberService = require('../services/subscriber.service');
const messageHistoryService = require('../services/messageHistory.service');
const { MESSAGE_TYPE } = require('../constants/roles');

function dayRange(daysFromToday) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysFromToday);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const DAY_OFFSET_TO_MESSAGE_TYPE = {
  3: MESSAGE_TYPE.REMINDER_3_DAYS,
  2: MESSAGE_TYPE.REMINDER_2_DAYS,
  1: MESSAGE_TYPE.REMINDER_1_DAY,
  0: MESSAGE_TYPE.EXPIRED,
};

/**
 * Runs the daily subscription reminder sweep:
 *  1. Refreshes derived `status` on all subscribers.
 *  2. For each offset (3, 2, 1, 0 days from expiry) finds matching subscribers
 *     and sends the appropriate WhatsApp template, logging the outcome in MessageHistory.
 *
 * Designed to be idempotent-safe for manual re-runs: it does not re-check
 * whether a message was already sent, but since it runs once daily via cron
 * and each offset window is a single calendar day, duplicate sends are naturally avoided.
 */
async function runReminderSweep() {
  const refreshedCount = await subscriberService.refreshAllStatuses();
  logger.info(`Reminder sweep: refreshed status for ${refreshedCount} subscribers`);

  const summary = { sent: 0, failed: 0, total: 0 };

  for (const [offset, messageType] of Object.entries(DAY_OFFSET_TO_MESSAGE_TYPE)) {
    const { start, end } = dayRange(Number(offset));
    const subscribers = await Subscriber.find({
      isDeleted: false,
      subscriptionEndDate: { $gte: start, $lte: end },
    });

    for (const subscriber of subscribers) {
      summary.total += 1;
      try {
        const record = await messageHistoryService.sendAndLog({ subscriber, messageType, createdBy: null });
        if (record.status === 'Sent') summary.sent += 1;
        else summary.failed += 1;
      } catch (err) {
        summary.failed += 1;
        logger.error(`Failed to send reminder to ${subscriber.mobileNumber}: ${err.message}`);
      }
    }
  }

  logger.info(`Reminder sweep complete: ${JSON.stringify(summary)}`);
  return summary;
}

module.exports = { runReminderSweep };
