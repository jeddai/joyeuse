import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { AppConfig } from '../models';

export const client = process.env.DISCORD_ENABLED === 'true' ? new Client({
    shardCount: AppConfig.discord.shardCount,
    partials: [ Partials.Message, Partials.Channel, Partials.User ],
    intents: [ GatewayIntentBits.Guilds ]
}) : {} as Client;
