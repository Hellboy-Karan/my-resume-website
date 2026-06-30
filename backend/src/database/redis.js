import { createClient } from 'redis';
import { env } from '../config/env.js';

let client;

export async function connectRedis() {
  client = createClient({ url: env.redisUrl });
  client.on('error', (error) => console.warn('Redis unavailable:', error.message));
  await client.connect();
  return client;
}

export function getRedis() {
  return client;
}

