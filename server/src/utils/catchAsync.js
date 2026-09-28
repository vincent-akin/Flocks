/**
 * Wraps an async route/controller handler so thrown errors and rejected
 * promises are forwarded to Express's error-handling middleware instead of
 * crashing the process or hanging the request.
 */
module.exports = function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
