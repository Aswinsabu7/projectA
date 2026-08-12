const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'app_settings' },

    theme: {
      defaultTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
      allowUserToggle: { type: Boolean, default: true },
    },

    whatsapp: {
      provider: { type: String, enum: ['meta', 'twilio'], default: 'meta' },
      enabled: { type: Boolean, default: false },
      metaToken: { type: String, default: '' },
      metaPhoneNumberId: { type: String, default: '' },
      twilioAccountSid: { type: String, default: '' },
      twilioAuthToken: { type: String, default: '' },
      twilioFrom: { type: String, default: '' },
    },

    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
      from: { type: String, default: '' },
    },

    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireNumber: { type: Boolean, default: true },
      requireSpecialChar: { type: Boolean, default: true },
      expiryDays: { type: Number, default: 90 },
    },

    tokenExpiry: {
      accessTokenMinutes: { type: Number, default: 15 },
      refreshTokenDays: { type: Number, default: 7 },
    },

    reminder: {
      cronSchedule: { type: String, default: '0 9 * * *' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      daysBefore: { type: [Number], default: [3, 2, 1] },
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
