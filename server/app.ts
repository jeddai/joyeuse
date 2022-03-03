import { client } from './discord/discord-client';
import { AppConfig } from './models';
import express, { json, static as staticFolder, urlencoded } from 'express';
import { Collection } from 'discord.js';
import { Command, CommandsList, InteractiveCommand } from './commands';

// App

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/healthz', (req, res) => {
    res.header('Content-Type', 'application/json').send(`{ "status": "ok" }`);
});

app.use('/', staticFolder(`${process.cwd()}/static`));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Discord

client.once('ready', () => {
    console.log(`Logged in as ${ client.user?.tag }!`);
});

await client.login(AppConfig.discord.token || process.env.DISCORD_TOKEN);

const commands = new Collection<string, Command | InteractiveCommand>();
CommandsList.forEach(command => {
    commands.set(command.data.name, command);
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