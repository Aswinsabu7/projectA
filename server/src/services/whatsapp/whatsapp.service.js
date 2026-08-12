const env = require('../../config/env');
const logger = require('../../config/logger');
const metaProvider = require('./meta.provider');
const twilioProvider = require('./twilio.provider');
const { Settings } = require('../../models');

const PROVIDERS = {
  meta: metaProvider,
  twilio: twilioProvider,
};

/**
 * Resolves whether WhatsApp sending is enabled and which provider to use.
 * Settings collection (DB, editable at runtime via Settings module) takes
 * precedence over environment variables so the creator can reconfigure
 * credentials without redeploying.
 */
async function resolveConfig() {
  const settings = await Settings.findOne({ key: 'app_settings' }).lean();
  const enabled = settings?.whatsapp?.enabled ?? env.whatsapp.enabled;
  const provider = settings?.whatsapp?.provider || env.whatsapp.provider;
  return { enabled, provider };
}

const TEMPLATES = {
  REMINDER_3_DAYS: (sub) =>
    `Hi ${sub.fullName}, your ${sub.platform} subscription will expire in 3 days on ${formatDate(
      sub.subscriptionEndDate
    )}. Please renew to continue enjoying uninterrupted access.`,
  REMINDER_2_DAYS: (sub) =>
    `Hi ${sub.fullName}, your ${sub.platform} subscription will expire in 2 days on ${formatDate(
      sub.subscriptionEndDate
    )}. Please renew soon.`,
  REMINDER_1_DAY: (sub) =>
    `Hi ${sub.fullName}, your ${sub.platform} subscription expires tomorrow (${formatDate(
      sub.subscriptionEndDate
    )}). Renew now to avoid interruption.`,
  EXPIRED: (sub) =>
    `Hi ${sub.fullName}, your ${sub.platform} subscription expired on ${formatDate(
      sub.subscriptionEndDate
    )}. Please renew to regain access.`,
};

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildMessage(messageType, subscriber) {
  const builder = TEMPLATES[messageType];
  if (!builder) throw new Error(`Unknown message template: ${messageType}`);
  return builder(subscriber);
}

/**
 * Sends a WhatsApp message via the configured provider (meta|twilio).
 * When WhatsApp sending is disabled (dev/testing), the message is simulated
 * and marked accordingly in the response so callers can still log history.
 */
async function sendWhatsAppMessage({ to, message }) {
  const { enabled, provider } = await resolveConfig();

  if (!enabled) {
    logger.info(`[WhatsApp:disabled] Would send to ${to}: ${message}`);
    return { success: true, simulated: true, provider, raw: { note: 'WhatsApp sending disabled' } };
  }

  const impl = PROVIDERS[provider];
  if (!impl) throw new Error(`Unsupported WhatsApp provider: ${provider}`);

  const result = await impl.sendMessage({ to, message });
  return { ...result, provider };
}

module.exports = { sendWhatsAppMessage, buildMessage, resolveConfig };
