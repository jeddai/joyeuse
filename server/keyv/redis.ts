import { createClient } from 'redis';
import { AppConfig } from '../models';
import _ from 'lodash';
import { Metric } from './metrics';
import { RaidDetails } from './raids';

const password = AppConfig.redis.password || process.env.REDIS_PASSWORD;

export const redisUris = _.range(AppConfig.redis.dbCount - 1).map(db =>
    `redis://${AppConfig.redis.username}${!!password ? `:${password}` : ''}@${AppConfig.redis.host || process.env.REDIS_HOST}?db=${db}`
);

export const redis = createClient({
    url: redisUris[0]
});
redis.on('error', err => console.error(`Redis Client Error`, err));
await redis.connect();

export const extractValues = async <T>(keys: string[]): Promise<T[]> => {
    if (keys.length === 0) return [];
    const values = await redis.mGet(keys);
    return values.map((v, index) => {
        try {
            return {
                key: keys[index],
                ...(JSON.parse(v || '').value)
            };
        } catch (err) {
            return null
        }
    }).filter(v => !!v) as T[];
}