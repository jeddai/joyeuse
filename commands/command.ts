import { GuildEmoji, Message, PartialUser, ReactionEmoji, User } from 'discord.js';
import { AppConfig } from '../models';

export abstract class Command {
    abstract name: CommandName

    abstract matches(message: string): boolean

    abstract execute(msg: Message): Promise<void>

    validMessageReaction(emoji: GuildEmoji | ReactionEmoji, msg: Message): boolean {
        return false
    }

    reactionAdded(emoji: GuildEmoji | ReactionEmoji, msg: Message, user: User | PartialUser) {}

    reactionRemoved(emoji: GuildEmoji | ReactionEmoji, msg: Message, user: User | PartialUser) {}

    args(message: Message): string[] {
        return message.content.toLowerCase().slice(AppConfig.prefix.length).trim().split(/ +/);
    }
}

export enum CommandName {
    PING = 'ping',
    SCHEDULE_RAID = 'schedule raid'
}