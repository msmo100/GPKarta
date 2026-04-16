import 'dotenv/config';
import { createApp } from './app';
import { config } from './config';
import { db } from './db';

async function main() {
  // Verify DB connection
  await db.$connect();
  console.log('✓ Database connected');

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`✓ Server running on http://localhost:${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
