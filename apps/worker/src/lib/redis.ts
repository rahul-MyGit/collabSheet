import { createClient, RedisClientType } from 'redis';

export const redis :RedisClientType = createClient();

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export async function initializeRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log('Redis connected in worker');
  }
}
