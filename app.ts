import { client } from './discord/discord-client';
import { appConfig } from './app-config';
import { PingCommand, ScheduleRaidCommand } from './commands';
import { Command } from './commands/command';

const commands: Command[] = [
    new PingCommand(),
    new ScheduleRaidCommand()
]

client.on('ready', () => {
    console.log(`Logged in as ${ client.user?.tag }!`);
});

client.on('message', msg => {
    if (msg.content[0] === appConfig.prefix && !msg.author.bot) {
        for (var command of commands) {
            if (command.matches(msg.content)) {
                try {
                    command.execute(msg)
                } catch (e) {
                    console.error(e);
                }
                break;
            }
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (!user.bot && reaction.message.author.bot) {
        console.log(reaction.emoji.name, user);
    }
});

client.login(appConfig.token);