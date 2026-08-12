const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Twilio WhatsApp API provider.
 * Docs: https://www.twilio.com/docs/whatsapp/api
 */
async function sendMessage({ to, message }) {
  const { accountSid, authToken, from } = env.whatsapp.twilio;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio WhatsApp credentials are not configured');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: from,
    Body: message,
  });

  try {
    const response = await axios.post(url, params, {
      auth: { username: accountSid, password: authToken },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return { success: true, providerMessageId: response.data?.sid, raw: response.data };
  } catch (err) {
    logger.error(`Twilio WhatsApp send failed: ${err.message}`);
    return { success: false, error: err.response?.data || err.message };
  }
}

module.exports = { sendMessage };
