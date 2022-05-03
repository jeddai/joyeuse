import * as fs from 'fs';
import { load } from 'js-yaml';

export interface Config {
    fqdn: string
    imageUrls: {
        iconUrl: string
        raids: {
            [key: string]: string[]
        }
    }
    discord: {
        clientId: string
        guildId: string | undefined
        token: string | undefined
        shardCount: number
    }
    redis: {
        host?: string
        username: string
        dbCount: number
        password: string | undefined
    }
}

export const AppConfig: Config = load(fs.readFileSync(process.env.CONFIG_PATH + '', 'utf-8')) as Config;