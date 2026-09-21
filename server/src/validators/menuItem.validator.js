const Joi = require('joi');

const createMenuItem = Joi.object({
  key: Joi.string().trim().required(),
  label: Joi.string().trim().required(),
  icon: Joi.string().trim().allow('').default(''),
  route: Joi.string().trim().required(),
  permission: Joi.string().trim().allow('').default(''),
  order: Joi.number().integer().min(0).default(0),
  parentKey: Joi.string().trim().allow(null, '').default(null),
  isActive: Joi.boolean().default(true),
});

const updateMenuItem = Joi.object({
  key: Joi.string().trim(),
  label: Joi.string().trim(),
  icon: Joi.string().trim().allow(''),
  route: Joi.string().trim(),
  permission: Joi.string().trim().allow(''),
  order: Joi.number().integer().min(0),
  parentKey: Joi.string().trim().allow(null, ''),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createMenuItem, updateMenuItem };
