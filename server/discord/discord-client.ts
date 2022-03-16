import { Client, Intents } from 'discord.js';
import { AppConfig } from '../models';

export const client = process.env.DISCORD_ENABLED === 'true' ? new Client({
    shardCount: AppConfig.discord.shardCount,
    partials: [ 'MESSAGE', 'CHANNEL', 'USER' ],
    intents: [ Intents.FLAGS.GUILDS ]
}) : {} as Client;
