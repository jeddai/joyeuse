import KeyV, { Store } from 'keyv';
import { redis, redisUris, extractValues } from './redis';

export interface Metric {
    count: number,
}

const defaultMetric: Metric = {
    count: 0
}

const metrics = new KeyV(redisUris[0], { namespace: 'metrics' });

metrics.on('error', err => console.error(`Keyv connection error for namespace metrics:`, err));

const setMetric = async (id: string, value: Metric): Promise<boolean> => metrics.set(id, value);

const getMetric = async (id: string): Promise<Metric> => await metrics.get(id);

const deleteMetric = async (id: string): Promise<boolean> => metrics.delete(id);

const clearMetrics = async (): Promise<void> => metrics.clear();

const getAll = async (): Promise<Metric[]> => {
    const keys = await redis.keys(`metrics:*`);
    return await extractValues(keys);
}

const getForActivity = async (activity: string): Promise<Metric[]> => {
  const keys = await redis.keys(`metrics:*${activity}*`);
  return await extractValues(keys);
};

const getForGuild = async (guildId: string): Promise<Metric[]> => {
    const keys = await redis.keys(`metrics:*${guildId}*`);
    return await extractValues(keys);
};

const getForActivityAndGuild = async (activity: string, guildId: string): Promise<Metric[]> => {
    const keys = await redis.keys(`metrics:*${activity}*${guildId}*`);
    return await extractValues(keys);
}

const perform = async (id: string, fn: (metric: Metric) => void): Promise<boolean> => {
    let metric = await getMetric(id);
    if (!metric) {
        metric = { ...defaultMetric };
    }
    fn(metric);
    return await setMetric(id, metric);
}

interface IMetricStore extends Store<Metric> {
    getAll(): Promise<Metric[]>
    getForActivity(activity: string): Promise<Metric[]>
    getForGuild(guildId: string): Promise<Metric[]>
    getForActivityAndGuild(activity: string, guildId: string): Promise<Metric[]>
    perform(id: string, fn: (metric: Metric) => void): Promise<boolean>
}

export const MetricStore: IMetricStore = {
    set: setMetric,
    get: getMetric,
    delete: deleteMetric,
    clear: clearMetrics,
    getAll,
    getForActivity,
    getForGuild,
    getForActivityAndGuild,
    perform
}