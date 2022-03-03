import { Command } from './command';
import { SlashCommandBuilder } from '@discordjs/builders';

export const Ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    execute: async interaction => {
        await interaction.reply({ content: 'Pong!', ephemeral: true });
    }
}