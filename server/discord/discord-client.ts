import { REST } from '@discordjs/rest';
import axios from 'axios';
import { Routes } from 'discord-api-types/v10';
import { Client, Intents } from 'discord.js';
import { NextFunction, Request, Response } from 'express';
import { AppConfig } from '../models';

export const client = process.env.DISCORD_ENABLED === 'true' ? new Client({
    shardCount: AppConfig.discord.shardCount,
    partials: [ 'MESSAGE', 'CHANNEL', 'USER' ],
    intents: [ Intents.FLAGS.GUILDS ]
}) : {} as Client;

export const api = (route: string): string => {
  return `https://discord.com/api${route}`;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const headers = {
      authorization: req.headers.authorization as string
  };
  const oauth = axios.create({ headers });
  const resp = await oauth.get(api(Routes.oauth2CurrentAuthorization()))
    .catch(err => {
        next(err);
    });
  if (!resp) return;
  (req as any).oauth = oauth;
  (req as any).user = resp.data.user;
  next();
}