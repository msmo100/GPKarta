import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import { signToken } from '../utils/token';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw AppError.conflict(
        existing.email === email ? 'Email already in use' : 'Username already taken',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ data: { token, user } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw AppError.unauthorized('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    const token = signToken({ sub: user.id, email: user.email });
    res.json({
      data: {
        token,
        user: { id: user.id, email: user.email, username: user.username },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, username: true, createdAt: true },
    });
    if (!user) throw AppError.notFound('User not found');
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
