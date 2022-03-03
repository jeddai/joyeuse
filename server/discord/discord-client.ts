import { Client, Intents } from 'discord.js';
import { AppConfig } from '../models';

export const client = new Client({
    shardCount: AppConfig.discord.shardCount,
    partials: [ 'MESSAGE', 'CHANNEL', 'USER' ],
    intents: [ Intents.FLAGS.GUILDS ]
});
