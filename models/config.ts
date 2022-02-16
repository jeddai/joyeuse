import * as fs from 'fs';
import { load } from 'js-yaml';

export interface Config {
    prefix: string
    imageUrls: {
        iconUrl: string
        raids: {
            [key: string]: string[]
        }
    }
    discord: {
        token: string | undefined
        shardCount: number
    }
    redis: {
        url: string
        username: string
        password: string | undefined
    }
}

export const AppConfig: Config = load(fs.readFileSync(process.env.CONFIG_PATH + '', 'utf-8')) as Config;