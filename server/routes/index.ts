import express from 'express';
import auth from './auth';
import config from './config';
import guilds from './guilds';
import metadata from './metadata';
import metrics  from './metrics';

export const routes: {
    [key: string]: express.Router
} = {
    'api/auth': auth,
    'api/config': config,
    'api/guilds': guilds,
    'api/metadata': metadata,
    'api/metadata/metrics': metrics
}