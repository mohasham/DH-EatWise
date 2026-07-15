import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import AppError from '../utils/AppError';

const handleCastError = (err: mongoose.Error.CastError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleDuplicateKeyError = (err: MongoServerError): AppError => {
  const field = Object.keys(err.keyValue ?? {}).join(', ');
  return new AppError(`Duplicate field value for: ${field}. Please use a different value.`, 409);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired. Please log in again.', 401);

// Minimal type for MongoDB duplicate key error
interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  // Only send operational errors to the client in production
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Leak as little detail as possible for programming/unknown errors
    console.error('[ERROR]', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err as AppError;

  // Ensure statusCode/status exist
  if (!(error instanceof AppError)) {
    error = Object.assign(new AppError(err.message || 'Internal Server Error', 500), err);
  }

  // Transform well-known error types into AppError instances
  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);
  if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);
  if ((err as MongoServerError).code === 11000) error = handleDuplicateKeyError(err as MongoServerError);
  if (err instanceof JsonWebTokenError) error = handleJWTError();
  if (err instanceof TokenExpiredError) error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
