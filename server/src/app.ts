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

  // Scurity headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*.tile.openstreetmap.org', '*.basemaps.cartocdn.com', '*.tile.opentopomap.org', 'server.arcgisonline.com', '*.google.com', '*.googleapis.com', '*.gstatic.com'],
          connectSrc: ["'self'", '*.tile.openstreetmap.org', '*.basemaps.cartocdn.com'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    }),
  );

  // No auth = no need to restrict origins
  app.use(cors({ origin: '*' }));

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

  // Serve frontend in production
  if (config.nodeEnv === 'production') {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('/embed/*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'embed.html'));
    });
    app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Error handler must be last
  app.use(errorHandler);

  return app;
}
