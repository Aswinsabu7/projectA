const Joi = require('joi');

/** Joi custom validator for a 24-char hex Mongo ObjectId */
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('must be a valid id');

module.exports = objectId;
