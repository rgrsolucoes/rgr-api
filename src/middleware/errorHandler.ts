import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { createErrorResponse } from '../utils/response';

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: string[] = [];

  // Log error details
  logger.error(`Error ${statusCode}: ${message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = [err.message];
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    errors = [err.message];
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    errors = ['Invalid or malformed token'];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
    errors = ['Token has expired'];
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Data Format';
    errors = ['Invalid data provided'];
  } else if (err.message.includes('ER_DUP_ENTRY')) {
    statusCode = 409;
    message = 'Duplicate Entry';
    errors = ['Resource already exists'];
  } else if (err.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Database Connection Error';
    errors = ['Unable to connect to database'];
  }

  // Don't leak error details in production
  if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    errors = ['An unexpected error occurred'];
  } else if (errors.length === 0) {
    errors = [message];
  }

  res.status(statusCode).json(createErrorResponse(message, errors));
};

export default errorHandler;
