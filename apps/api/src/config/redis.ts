import Redis, { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  family: 0,
};

export const redis: Redis = new Redis(redisConfig);
