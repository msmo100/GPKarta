import path from 'path';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
} as const;
