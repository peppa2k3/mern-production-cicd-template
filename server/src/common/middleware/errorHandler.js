const logger = require('../../config/logger');
const env = require('../../config/env');

// Catches async errors thrown in controllers without needing try/catch
// everywhere. Wrap controller functions with this.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for unmatched routes - placed after all route registrations.
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler. Distinguishes operational (expected) errors from
// programming errors and never leaks stack traces outside development.
const errorHandler = (err, req, res, _next) => {
  let { statusCode, message, details, isOperational } = err;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    isOperational = true;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field + ' ' : ''}already exists`;
    isOperational = true;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  statusCode = statusCode || 500;
  message = message || 'Internal server error';

  if (!isOperational) {
    logger.error(err.stack || err.message);
  } else if (statusCode >= 500) {
    logger.error(message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: details || undefined,
    stack: env.nodeEnv === 'development' && !isOperational ? err.stack : undefined,
  });
};

module.exports = { catchAsync, notFoundHandler, errorHandler };
