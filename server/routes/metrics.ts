import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { MetricStore } from '../keyv';

const router = express.Router();

router.get('', expressAsyncHandler(async (req, res, next) => {
    const { activity, guild } = req.query;
    let metrics: any = [];
    if (activity && guild) {
        metrics = await MetricStore.getForActivityAndGuild(activity as string, guild as string);
    } else if (activity) {
        metrics = await MetricStore.getForActivity(activity as string);
    } else if (guild) {
        metrics = await MetricStore.getForGuild(guild as string);
    } else {
        metrics = await MetricStore.getAll();
    }

    metrics = metrics.reduce((previous: any, current: any) => {
        const obj = previous;
        const { key, count } = current;
        const [ _, activity, detail ] = key.split(':');

        obj['total'] = (obj['total'] || 0) + count;
        if (!obj[activity]) obj[activity] = {};
        obj[activity]['total'] = (obj[activity]['total'] || 0) + count;
        if (!obj[activity][detail]) obj[activity][detail] = {};
        obj[activity][detail] = {
            count: (obj[activity][detail].count || 0) + count
        };

        return obj;
    }, {});

    res.type('json').status(200).send(metrics);
}));

export default router;
