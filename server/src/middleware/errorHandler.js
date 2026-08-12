const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utilities/apiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message } = err;
  let errors = err.errors || [];

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      statusCode = 400;
      errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
      message = 'Validation failed';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0];
      message = `Duplicate value for field '${field}'`;
    }

    // Mongoose cast error (invalid ObjectId etc.)
    if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field '${err.path}'`;
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Invalid or expired token';
    }
  }

  statusCode = statusCode || 500;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}\n${err.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
