import express from 'express';
import metadata from './metadata';
import metrics  from './metrics';

export const routes: {
    [key: string]: express.Router
} = {
    'api/metadata': metadata,
    'api/metadata/metrics': metrics
}