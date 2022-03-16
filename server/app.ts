import { client } from './discord/discord-client';
import { AppConfig } from './models';
import express, { json, static as staticFolder, urlencoded } from 'express';
import { Collection } from 'discord.js';
import { Command, CommandsList, InteractiveCommand } from './commands';
import { routes } from './routes';
import { redis } from './keyv';

// App

const app = express();
app.use(json());

app.get('/healthz', (req, res) => {
    res.type('json').send(`{ "status": "ok" }`);
});

if (process.env.APP_ENABLED === 'true') {
    app.use(urlencoded({extended: true}));

    app.use('/', staticFolder(`${process.cwd()}/static`));

    for (const route of Object.keys(routes)) {
        app.use(`/${route}`, routes[route]);
        console.log(`/${route} enabled`)
    }
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Discord

if (process.env.DISCORD_ENABLED === 'true') {
    client.once('ready', async () => {
        console.log(`Logged in as ${ client.user?.tag }!`);
        console.log(`Proudly serving ${client.guilds?.cache.size} servers`);

        await redis.set('metadata:guildCount', client.guilds?.cache.size);
    });

    await client.login(AppConfig.discord.token || process.env.DISCORD_TOKEN);

    const commands = new Collection<string, Command | InteractiveCommand>();
    CommandsList.forEach(command => {
        commands.set(command.data.name, command);
    });

    client.on('guildCreate', async _ => {
        const guildCount = parseInt(await redis.get('metadata:guildCount') || '0');
        await redis.set('metadata:guildCount', guildCount + 1);
    });

    client.on('guildDelete', async _ => {
        const guildCount = parseInt(await redis.get('metadata:guildCount') || '1');
        await redis.set('metadata:guildCount', guildCount - 1);
    });

    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            const command = commands.get(interaction.commandName) as Command;

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(err);
                try {
                    await interaction.reply({ content: `There was an error while executing this command!`, ephemeral: true });
                } catch (err) {
                    console.error(err);
                }
            }
        } else if (interaction.isMessageComponent()) {
            const [ commandName ] = interaction.customId.split(':');
            const command = commands.get(commandName) as InteractiveCommand;
            if (command.hasOwnProperty('handleMessageComponentInteraction')) {
                try {
                    await command.handleMessageComponentInteraction(interaction);
                } catch (err) {
                    console.error(err);
                    try {
                        await interaction.reply({ content: `There was an error while executing this command!`, ephemeral: true });
                    } catch (err) {
                        console.error(err);
                    }
                }
            } else {
                await interaction.reply({ content: `Command ${commandName} is not interactive. Not quite sure how this happened.`, ephemeral: true });
            }
        }
    });

    client.on('disconnect', () => {
        process.exit(1);
    });
}
