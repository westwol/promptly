import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +(process.env.REDIS_PORT || '6379'),
};

export const redis: Redis = new Redis(redisConfig);
