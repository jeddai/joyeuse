import express from 'express';
import { AppConfig } from '../models';

const router = express.Router();

router.get('', (req, res, next) => {
    return res.status(200).json({
        redirect_uri: `https://${AppConfig.fqdn}/auth`,
        clientId: AppConfig.discord.clientId
    });
});

export default router;