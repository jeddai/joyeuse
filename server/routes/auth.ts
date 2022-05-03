import { Routes } from 'discord-api-types/v10';
import { Guild, User } from 'discord.js';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { api, auth, client } from '../discord/discord-client';

const router = express.Router();

router.use(expressAsyncHandler(auth));

router.get('/user', (req, res, next) => {
  return res.status(200).json((req as any).user as User);
});

router.get('/guilds', expressAsyncHandler(async (req, res, next) => {
  const userGuilds = (await (req as any).oauth.get(api(Routes.userGuilds()))).data as Guild[];
  const botGuilds = (await client.guilds.fetch()).map(g => g.id);

  const finalGuilds = userGuilds.filter(guild => botGuilds.includes(guild.id));

  res.status(200).json(finalGuilds);
}));

export default router;