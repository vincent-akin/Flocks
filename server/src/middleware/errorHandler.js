const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => e.message);
      error = ApiError.badRequest('Validation failed', details);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {}).join(', ');
      error = ApiError.conflict(`Duplicate value for field(s): ${field}`);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else {
      error = ApiError.internal(process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message);
    }
  }

  if (process.env.NODE_ENV !== 'production' && error.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    details: error.details,
    ...(process.env.NODE_ENV !== 'production' && error.statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
