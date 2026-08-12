const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { runReminderSweep } = require('./reminder.job');

let scheduledTask = null;

/**
 * Registers the daily subscription-reminder cron job.
 * Schedule & timezone are configurable via REMINDER_CRON_SCHEDULE / REMINDER_TIMEZONE env vars.
 */
function initCronJobs() {
  if (scheduledTask) return scheduledTask;

  scheduledTask = cron.schedule(
    env.reminder.cronSchedule,
    async () => {
      logger.info('Running scheduled WhatsApp reminder sweep...');
      try {
        await runReminderSweep();
      } catch (err) {
        logger.error(`Reminder cron job failed: ${err.message}`);
      }
    },
    { timezone: env.reminder.timezone, noOverlap: true, name: 'subscription-reminder-sweep' }
  );

  logger.info(
    `Reminder cron job scheduled: "${env.reminder.cronSchedule}" (${env.reminder.timezone})`
  );

  return scheduledTask;
}

module.exports = { initCronJobs };
