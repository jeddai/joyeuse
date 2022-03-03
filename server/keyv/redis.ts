import { createClient } from 'redis';
import { AppConfig } from '../models';
import _ from 'lodash';

const password = AppConfig.redis.password || process.env.REDIS_PASSWORD;

export const redisUris = _.range(AppConfig.redis.dbCount - 1).map(db =>
    `redis://${AppConfig.redis.username}@${AppConfig.redis.url}?db=${db}${!!password ? `&password=${password}` : ''}`
);

export const redis = createClient({
    url: redisUris[0]
});
redis.on('error', err => console.error(`Redis Client Error`, err));
await redis.connect();
