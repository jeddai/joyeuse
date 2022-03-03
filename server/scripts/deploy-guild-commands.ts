import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandsList } from '../commands';
import { AppConfig } from '../models';
const { clientId, guildId, token } = AppConfig.discord;

const commands = CommandsList.map(command => command.data.toJSON());

const rest = new REST({ version: '9' }).setToken(token || '');

rest.put(Routes.applicationGuildCommands(clientId, guildId || ''), { body: commands })
    .then(() => {
        console.log('Successfully registered application commands.');
        process.exit(0);
    })
    .catch(console.error);