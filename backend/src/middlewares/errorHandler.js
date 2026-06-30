import { validationResult } from 'express-validator';
import { HttpError } from '../common/httpError.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(422, 'Validation failed', errors.array()));
  }
  return next();
}

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Internal server error' : error.message,
    details: error.details || undefined
  });
}

