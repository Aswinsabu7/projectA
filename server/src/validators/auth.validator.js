const Joi = require('joi');
const env = require('../config/env');

const login = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().optional(), // optional because it may arrive via httpOnly cookie
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(env.password.minLength).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'confirmPassword must match newPassword',
  }),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(env.password.minLength).required(),
});

module.exports = { login, refreshToken, changePassword, forgotPassword, resetPassword };
