import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { redis } from '../keyv';

const router = express.Router();

router.get('', expressAsyncHandler(async (req, res, next) => {
    res.type('json').status(200).send({
        counts: {
            servers: parseInt(await redis.get('metadata:guildCount') || '0')
        }
    });
}));

export default router;
