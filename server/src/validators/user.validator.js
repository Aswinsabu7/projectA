const Joi = require('joi');
const env = require('../config/env');
const objectId = require('./objectId');

const createUser = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string()
    .pattern(/^[0-9+\-\s]{7,15}$/)
    .required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(env.password.minLength).required(),
  role: objectId.required(),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
});

const updateUser = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  email: Joi.string().email(),
  mobile: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/),
  role: objectId,
  status: Joi.string().valid('Active', 'Inactive'),
}).min(1);

const updateStatus = Joi.object({
  status: Joi.string().valid('Active', 'Inactive').required(),
});

module.exports = { createUser, updateUser, updateStatus };
