/**
 * Wraps an async express handler and forwards rejected promises to next(err)
 * so the global error handler can process them, avoiding repetitive try/catch.
 * @param {Function} fn
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
