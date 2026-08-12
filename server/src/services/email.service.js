const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');
const { Settings } = require('../models');

async function getTransportConfig() {
  const settings = await Settings.findOne({ key: 'app_settings' }).lean();
  const smtp = settings?.smtp?.host ? settings.smtp : env.smtp;
  return smtp;
}

/**
 * Sends an email using the configured SMTP settings (DB settings override env defaults).
 * Used for password reset links / notifications.
 */
async function sendEmail({ to, subject, html, text }) {
  const smtp = await getTransportConfig();

  if (!smtp.host) {
    logger.warn(`SMTP not configured - skipping email to ${to}: ${subject}`);
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });

  return transporter.sendMail({ from: smtp.from, to, subject, html, text });
}

module.exports = { sendEmail };
