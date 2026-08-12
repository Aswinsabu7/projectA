const Joi = require('joi');

const createSubscriber = Joi.object({
  fullName: Joi.string().trim().required(),
  mobileNumber: Joi.string()
    .pattern(/^[0-9+\-\s]{7,15}$/)
    .required(),
  email: Joi.string().email().allow('').optional(),
  platform: Joi.string().valid('Instagram', 'YouTube').required(),
  subscriptionStartDate: Joi.date().required(),
  subscriptionEndDate: Joi.date().greater(Joi.ref('subscriptionStartDate')).required(),
  amountPaid: Joi.number().min(0).required(),
  remarks: Joi.string().allow('').max(500).optional(),
});

const updateSubscriber = Joi.object({
  fullName: Joi.string().trim(),
  mobileNumber: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/),
  email: Joi.string().email().allow(''),
  platform: Joi.string().valid('Instagram', 'YouTube'),
  subscriptionStartDate: Joi.date(),
  subscriptionEndDate: Joi.date(),
  amountPaid: Joi.number().min(0),
  remarks: Joi.string().allow('').max(500),
}).min(1);

const importPreview = Joi.object({
  rows: Joi.array().items(Joi.object()).required(),
});

module.exports = { createSubscriber, updateSubscriber, importPreview };
