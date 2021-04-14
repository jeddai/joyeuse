import { Command, CommandName } from './command';
import { Message } from 'discord.js';

export class PingCommand extends Command {
    name = CommandName.PING;

    async execute(msg: Message): Promise<void> {
        await msg.reply('pong!');
    }

    matches(msg: string): boolean {
        return msg.substr(1) === this.name;
    }

}