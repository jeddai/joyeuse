import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import {
    ChatInputCommandInteraction,
    MessageComponentInteraction
} from 'discord.js';

export abstract class Command {
    abstract data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

    abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export abstract class InteractiveCommand extends Command {
    abstract handleMessageComponentInteraction(interaction: MessageComponentInteraction): Promise<void>
}
