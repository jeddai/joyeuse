import { Message } from 'discord.js';
import { appConfig } from '../app-config';

export abstract class Command {
    abstract name: CommandName

    abstract matches(message: string): boolean

    abstract execute(msg: Message): Promise<void>

    args(message: Message): string[] {
        return message.content.slice(appConfig.prefix.length).trim().split(/ +/);
    }
}

export enum CommandName {
    PING = 'ping',
    SCHEDULE_RAID = 'scheduleRaid'
}