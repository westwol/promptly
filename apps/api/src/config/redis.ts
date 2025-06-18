import Redis, { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfig: RedisOptions = {
  host: (process.env.REDIS_HOST || 'localhost') + '?family=0',
  port: +(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

export const redis: Redis = new Redis(redisConfig);
