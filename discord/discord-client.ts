import Discord from 'discord.js';
import { AppConfig } from '../models';

export const client = new Discord.Client({
    shardCount: AppConfig.discord.shardCount,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']
});
