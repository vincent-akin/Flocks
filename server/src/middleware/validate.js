const ApiError = require('../utils/ApiError');

/**
 * Runs a validator function (from src/validators) against req.body (or
 * another part of the request) and throws a 400 ApiError listing all
 * problems if it fails. Validators are plain functions returning either
 * `{ value }` on success or `{ errors: [...] }` on failure, keeping this
 * project free of an extra schema-validation dependency for the MVP.
 */
function validate(validatorFn, source = 'body') {
  return function validateMiddleware(req, res, next) {
    const result = validatorFn(req[source] || {});
    if (result.errors && result.errors.length) {
      return next(ApiError.badRequest('Validation failed', result.errors));
    }
    req[source] = result.value;
    next();
  };
}

module.exports = validate;
