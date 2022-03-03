import { InteractiveCommand } from './command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Raids } from '../models';
import { handleRaidCreate, handleRaidInteraction } from './schedule-event-handlers';

export const SCHEDULE_EVENT_COMMAND_NAME = 'schedule';

export const ScheduleEvent: InteractiveCommand = {
    data: new SlashCommandBuilder()
        .setName(SCHEDULE_EVENT_COMMAND_NAME)
        .setDescription('Schedules an event in this channel')
        .addSubcommand(subcommand =>
            subcommand.setName('raid')
                .setDescription('Schedule a raid event')
                .addStringOption(option => {
                    option.setName('raid-name')
                        .setDescription(`The name of the raid.`)
                        .setRequired(true)

                    Raids.forEach(raid => {
                        option.addChoice(raid.name, raid.shortName);
                    });

                    return option;
                })
                .addStringOption(option =>
                    option.setName('start-time')
                        .setDescription('The time the raid will start. Make sure to include the timezone!')
                )
                .addUserOption(option =>
                    option.setName('participant-1')
                        .setDescription('A participant you want to add to the raid.')
                )
                .addUserOption(option =>
                    option.setName('participant-2')
                        .setDescription('A participant you want to add to the raid.')
                )
                .addUserOption(option =>
                    option.setName('participant-3')
                        .setDescription('A participant you want to add to the raid.')
                )
                .addUserOption(option =>
                    option.setName('participant-4')
                        .setDescription('A participant you want to add to the raid.')
                )
                .addUserOption(option =>
                    option.setName('participant-5')
                        .setDescription('A participant you want to add to the raid.')
                )
        ),
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

