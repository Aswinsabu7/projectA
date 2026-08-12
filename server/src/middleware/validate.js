const ApiError = require('../utilities/apiError');

/**
 * Generic Joi validation middleware.
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} property
 */
function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }

    req[property] = value;
    return next();
  };
}

module.exports = validate;
