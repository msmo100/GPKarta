import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { AppError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('No token provided'));
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
