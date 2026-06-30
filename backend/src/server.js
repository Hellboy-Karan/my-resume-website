import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './database/mongo.js';
import { connectRedis } from './database/redis.js';
import { ensureMysqlSchema } from './database/mysql.js';

async function start() {
  await ensureMysqlSchema();
  await connectMongo();
  await connectRedis();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`${env.appName} API running on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});

