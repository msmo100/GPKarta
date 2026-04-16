import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving images cross-origin
    }),
  );

  // CORS: restrictive for the API, permissive for embed endpoint
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile apps, same-origin)
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  // The embed endpoint must be accessible cross-origin
  app.use('/api/embed', cors({ origin: '*' }));

  // Rate limit all API routes
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Auth rate limit (stricter)
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(config.uploadDir));

  // API routes
  app.use('/api', routes);

  // Error handler must be last
  app.use(errorHandler);

  return app;
}
