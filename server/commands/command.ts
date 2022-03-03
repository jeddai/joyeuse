import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';

export abstract class Command {
    abstract data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

    abstract execute(interaction: CommandInteraction): Promise<void>;
}

export abstract class InteractiveCommand extends Command {
    abstract handleMessageComponentInteraction(interaction: MessageComponentInteraction): Promise<void>
}
