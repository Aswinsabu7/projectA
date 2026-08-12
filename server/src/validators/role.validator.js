const Joi = require('joi');
const objectId = require('./objectId');

const createRole = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().allow('').max(250),
  permissions: Joi.array().items(objectId).default([]),
  isActive: Joi.boolean().default(true),
});

const updateRole = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  description: Joi.string().trim().allow('').max(250),
  permissions: Joi.array().items(objectId),
  isActive: Joi.boolean(),
}).min(1);

const updateStatus = Joi.object({
  isActive: Joi.boolean().required(),
});

const assignPermissions = Joi.object({
  permissions: Joi.array().items(objectId).required(),
});

module.exports = { createRole, updateRole, updateStatus, assignPermissions };
