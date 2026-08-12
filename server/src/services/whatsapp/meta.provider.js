const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../config/logger');

/**
 * WhatsApp Cloud API (Meta) provider.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
async function sendMessage({ to, message }) {
  const { token, phoneNumberId, apiVersion } = env.whatsapp.meta;

  if (!token || !phoneNumberId) {
    throw new Error('Meta WhatsApp credentials are not configured');
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return { success: true, providerMessageId: response.data?.messages?.[0]?.id, raw: response.data };
  } catch (err) {
    logger.error(`Meta WhatsApp send failed: ${err.message}`);
    return { success: false, error: err.response?.data || err.message };
  }
}

module.exports = { sendMessage };
