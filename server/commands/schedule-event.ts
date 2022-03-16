import { InteractiveCommand } from './command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { handleRaidCreate, handleRaidInteraction, raidSubcommand } from './schedule-event-handlers';

export const SCHEDULE_EVENT_COMMAND_NAME = 'schedule';

export const ScheduleEvent: InteractiveCommand = {
    data: new SlashCommandBuilder()
        .setName(SCHEDULE_EVENT_COMMAND_NAME)
        .setDescription('Schedules an event in this channel')
        .addSubcommand(raidSubcommand),
    execute: async interaction => {
        switch(interaction.options.getSubcommand()) {
            case 'raid': {
                await handleRaidCreate(interaction);
            }
        }
    },
    handleMessageComponentInteraction: async interaction => {
        const [ _, subCommand, ...params ] = interaction.customId.split(':');

        switch (subCommand) {
            case 'raid': {
                await handleRaidInteraction(interaction, params)
                break;
            }
            default: return;
        }
    }
}

