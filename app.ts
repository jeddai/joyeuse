import { client } from './discord/discord-client';
import { AppConfig } from './models';
import { PingCommand, ScheduleRaidCommand } from './commands';
import { Command } from './commands/command';

const commands: Command[] = [
    new PingCommand(),
    new ScheduleRaidCommand()
]

client.on('ready', () => {
    console.log(`Logged in as ${ client.user?.tag }!`);
    console.log(`App prefix set to '${AppConfig.prefix}'`)
});

client.on('message', async msg => {
    if (msg.content[0] === AppConfig.prefix && !msg.author.bot) {
        for (let command of commands) {
            if (command.matches(msg.content)) {
                try {
                    await command.execute(msg);
                } catch (e) {
                    console.error(e);
                }
                break;
            }
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            reaction = await reaction.fetch();
        } catch (ex) {
            console.warn(ex);
            return;
        }
    }

    if (user.partial) {
        try {
            user = await user.fetch();
        } catch (ex) {
            console.warn(ex);
            return;
        }
    }

    const { emoji, message } = reaction;
    if (!user.bot && message.author.id === client.user?.id) {
        console.log(`${user.username}#${user.discriminator} reacted with ${emoji.name} on bot message ${message.id}`);
        let commandRun = false;
        commands.forEach(command => {
            if (command.validMessageReaction(emoji, message)) {
                console.log(`reaction ${emoji.name} was found to be valid for command ${command.name} on bot message ${message.id}`);
                command.reactionAdded(emoji, message, user);
                commandRun = true;
            }
        });
        if (!commandRun) {
            console.log(`reaction ${emoji.name} was not valid for any command for bot message ${message.id}`);
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        try {
            reaction = await reaction.fetch();
        } catch (ex) {
            console.warn(ex);
            return;
        }
    }

    if (user.partial) {
        try {
            user = await user.fetch();
        } catch (ex) {
            console.warn(ex);
            return;
        }
    }

    const { emoji, message } = reaction;
    if (!user.bot && message.author.id === client.user?.id) {
        console.log(`${user.username}#${user.discriminator} removed reaction ${emoji.name} on bot message ${message.id}`);
        let commandRun = false;
        commands.forEach(command => {
            if (command.validMessageReaction(emoji, message)) {
                console.log(`removal of reaction ${emoji.name} was found to be valid for command ${command.name} on bot message ${message.id}`);
                command.reactionRemoved(emoji, message, user);
                commandRun = true;
            }
        });
        if (!commandRun) {
            console.log(`removal of reaction ${emoji.name} was not valid for any command for bot message ${message.id}`);
        }
    }
});

client.login(AppConfig.discord.token || process.env.DISCORD_TOKEN);

client.on('disconnect', () => {
    process.exit(1);
});