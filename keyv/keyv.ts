import { AppConfig } from '../models';

export const redisUri = `redis://${AppConfig.redis.username}:${AppConfig.redis.password || process.env.REDIS_PASSWORD}@${AppConfig.redis.url}`;
