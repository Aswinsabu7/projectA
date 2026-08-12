const Joi = require('joi');

const updateSettings = Joi.object({
  theme: Joi.object({
    defaultTheme: Joi.string().valid('light', 'dark'),
    allowUserToggle: Joi.boolean(),
  }),
  whatsapp: Joi.object({
    provider: Joi.string().valid('meta', 'twilio'),
    enabled: Joi.boolean(),
    metaToken: Joi.string().allow(''),
    metaPhoneNumberId: Joi.string().allow(''),
    twilioAccountSid: Joi.string().allow(''),
    twilioAuthToken: Joi.string().allow(''),
    twilioFrom: Joi.string().allow(''),
  }),
  smtp: Joi.object({
    host: Joi.string().allow(''),
    port: Joi.number(),
    secure: Joi.boolean(),
    user: Joi.string().allow(''),
    password: Joi.string().allow(''),
    from: Joi.string().allow(''),
  }),
  passwordPolicy: Joi.object({
    minLength: Joi.number().min(6).max(64),
    requireUppercase: Joi.boolean(),
    requireNumber: Joi.boolean(),
    requireSpecialChar: Joi.boolean(),
    expiryDays: Joi.number().min(0),
  }),
  tokenExpiry: Joi.object({
    accessTokenMinutes: Joi.number().min(1),
    refreshTokenDays: Joi.number().min(1),
  }),
  reminder: Joi.object({
    cronSchedule: Joi.string(),
    timezone: Joi.string(),
    daysBefore: Joi.array().items(Joi.number()),
  }),
}).min(1);

module.exports = { updateSettings };
