import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: (err as any).errors,
    });
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: config.isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  });
}
