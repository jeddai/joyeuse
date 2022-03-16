import {
    CommandInteraction, EmbedField,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed
} from 'discord.js';
import { MetricStore, RaidDetails, RaidStore } from '../../keyv';
import { AppConfig, getRaid, Raids } from '../../models';
import { randomInt } from 'crypto';
import _ from 'lodash';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { client } from '../../discord/discord-client';
import { SCHEDULE_EVENT_COMMAND_NAME } from '../schedule-event';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';

const RAID = 'raid';
const OPTION_RAID_NAME = 'raid-name';
const OPTION_START_TIME = 'start-time';
const OPTION_CAN_TEACH = 'can-teach';
const OPTION_TEACHING_RUN = 'teaching-run';
const OPTION_DATE = 'date';
const OPTION_PARTICIPANT = (n: number) => {
    return `participant-${n}`;
}

export const raidSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
    subcommand.setName(RAID)
        .setDescription('Schedule a raid event')
        .addStringOption(option => {
            option.setName(OPTION_RAID_NAME)
                .setDescription(`The name of the raid.`)
                .setRequired(true)

            Raids.forEach(raid => {
                option.addChoice(raid.name, raid.shortName);
            });

            return option;
        })
        .addStringOption(option =>
            option.setName(OPTION_DATE)
                .setDescription(`The date the raid will take place. If not set, it will be set to today. Example: ${new Date().toDateString().substring(4, 10)}`)
        )
        .addStringOption(option =>
            option.setName(OPTION_START_TIME)
                .setDescription('The time the raid will start. Make sure to include the timezone!')
        )
        .addBooleanOption(option =>
            option.setName(OPTION_CAN_TEACH)
                .setDescription('Do you have time to teach this raid? If you want to leave it ambiguous, do not set a value for this.')
        )
        .addBooleanOption(option =>
            option.setName(OPTION_TEACHING_RUN)
                .setDescription('This run will include people who are learning the raid.')
        )
        .addUserOption(option =>
            option.setName(OPTION_PARTICIPANT(1))
                .setDescription('A participant you want to add to the raid.')
        )
        .addUserOption(option =>
            option.setName(OPTION_PARTICIPANT(2))
                .setDescription('A participant you want to add to the raid.')
        )
        .addUserOption(option =>
            option.setName(OPTION_PARTICIPANT(3))
                .setDescription('A participant you want to add to the raid.')
        )
        .addUserOption(option =>
            option.setName(OPTION_PARTICIPANT(4))
                .setDescription('A participant you want to add to the raid.')
        )
        .addUserOption(option =>
            option.setName(OPTION_PARTICIPANT(5))
                .setDescription('A participant you want to add to the raid.')
        )

export const handleRaidCreate = async (interaction: CommandInteraction) => {
    const raidName = interaction.options.getString(OPTION_RAID_NAME);
    const { name, shortName, description, color, vaulted, imageUrls } = getRaid(raidName);

    if (!name) {
        return await interaction.reply({ content: `Unable to find the selected raid`, ephemeral: true });
    }

    if (vaulted) {
        return await interaction.reply({ content: `${name} is currently in the Destiny Content Vault.`, ephemeral: true });
    }

    let users = _.range(1, 6).map(u => {
        const user = interaction.options.getUser(OPTION_PARTICIPANT(u));
        return user?.id
    }).filter(u => !!u);

    const date = interaction.options.getString(OPTION_DATE) || new Date().toDateString().substring(4, 10);
    const startTime = interaction.options.getString(OPTION_START_TIME) || undefined;
    const canTeach = interaction.options.getBoolean(OPTION_CAN_TEACH) !== null ?
        interaction.options.getBoolean(OPTION_CAN_TEACH) as boolean : undefined;
    const teachingRun = interaction.options.getBoolean(OPTION_TEACHING_RUN) !== null ?
        interaction.options.getBoolean(OPTION_TEACHING_RUN) as boolean : undefined;

    const participants = _.uniq([ interaction.user.id, ...users ]) as string[];
    const participantsText = [ ...participants, ...(_.range(6 - participants.length).map(_ => '')) ]
        .map((p, i) => `${i + 1}. ${!!p ? `<@${p}>` : ''}`).join('\n');
    const standbyText = '-';

    const embed = new MessageEmbed({
        color,
        title: name,
        description: description,
        fields: [
            {
                name: 'Date',
                value: date,
                inline: false
            },
            !!startTime ? {
                name: 'Start Time',
                value: startTime,
                inline: false
            } : null,
            canTeach !== undefined ? {
                name: 'Can Teach',
                value: canTeach ? 'Yes' : 'No',
                inline: false
            } : null,
            teachingRun !== undefined ? {
                name: 'Teaching Run',
                value: teachingRun ? 'Yes' : 'No',
                inline: false
            } : null,
            {
                name: 'Participants',
                value: participantsText,
                inline: true
            },
            {
                name: 'Standby',
                value: standbyText,
                inline: true
            }
        ].filter(f => !!f) as EmbedField[],
        image: !!imageUrls ? {
            url: imageUrls[randomInt(0, imageUrls.length - 1)]
        } : undefined,
        timestamp: Date.now(),
        footer: {
            text: `via joyeuse.app`,
            iconURL: AppConfig.imageUrls.iconUrl
        }
    });

    const sentEmbed = await interaction.reply({
        embeds: [ embed ],
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:join`)
                        .setLabel('Join')
                        .setStyle(MessageButtonStyles.SUCCESS),
                    new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:standby`)
                        .setLabel('Standby')
                        .setStyle(MessageButtonStyles.PRIMARY),
                    new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:notify`)
                        .setLabel('Notify')
                        .setStyle(MessageButtonStyles.SECONDARY),
                    new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:destroy`)
                        .setLabel('Destroy')
                        .setStyle(MessageButtonStyles.DANGER)
                )
        ],
        fetchReply: true
    });

    const details: RaidDetails = {
        messageId: sentEmbed.id,
        channelId: interaction.channel?.id,
        guildId: interaction.guild?.id,
        raid: name,
        participants,
        standby: [],
        notified: false,
        startTime,
        canTeach,
        teachingRun,
        date
    }
    const store = await RaidStore.set(`${interaction.guild?.id}:${sentEmbed.id}`, details);
    if (!store) {
        await interaction.followUp({ content: `The server was unable to store your raid information. Please destroy the raid and try again.`, ephemeral: true });
    }

    await MetricStore.perform(`raid:${shortName}:${interaction.guild?.id}`, metric => {
        metric.count = (metric.count || 0) + 1;
    });
}

export const handleRaidInteraction = async (interaction: MessageComponentInteraction, params: string[]): Promise<void> => {
    const [ primary, secondary, tertiary, quaternary ] = params;

    let raid = await RaidStore.get(`${interaction.guild?.id}:${interaction.message.id}`);

    const update = async (message?: Message) => {
        if (!raid) return;

        let embed = (message || interaction.message).embeds[0];
        if (!embed) {
            const { name, description, color, imageUrls } = getRaid(raid.raid);
            embed = new MessageEmbed({
                color,
                title: name,
                description: description,
                fields: [{
                        name: 'Participants',
                        value: '-',
                        inline: true
                    }, {
                        name: 'Standby',
                        value: '-',
                        inline: true
                    }].filter(f => !!f) as EmbedField[],
                image: !!imageUrls ? {
                    url: imageUrls[randomInt(0, imageUrls.length - 1)]
                } : undefined,
                timestamp: Date.now(),
                footer: {
                    text: `via joyeuse.app`,
                    iconURL: AppConfig.imageUrls.iconUrl
                }
            })
        }

        const participants = (embed.fields || []).find(f => f.name === 'Participants');
        const standby = (embed.fields || []).find(f => f.name === 'Standby');
        if (participants)
            participants.value = [ ...raid.participants, ...(_.range(6 - raid.participants.length).map(_ => '')) ]
                .map((p, i) => `${i + 1}. ${!!p ? `<@${p}>` : ''}`).join('\n');
        if (standby)
            standby.value = raid.standby.map((s, i) => `${i + 1}. <@${s}>`).join('\n') || '-';
        embed.timestamp = Date.now();

        if (message) {
            await message.edit({ embeds: [embed] });
        } else {
            await interaction.update({ embeds: [embed] });
        }
        await RaidStore.set(`${interaction.guild?.id}:${raid.messageId}`, raid);
    }

    switch (primary) {
        case 'join':
        case 'standby': {
            if (!raid) {
                return await interaction.reply({ content: `This raid has expired.`, ephemeral: true });
            }

            const participating = raid.participants.find(p => p === interaction.user.id);
            const onStandby = raid.standby.find(s => s === interaction.user.id);

            if (primary === 'join' && onStandby) {
                if (raid.participants.length < 6) {
                    raid.participants = [ ...raid.participants, interaction.user.id ];
                    raid.standby = raid.standby.filter(s => s !== interaction.user.id);
                }
            } else if (primary === 'standby' && participating) {
                raid.participants = raid.participants.filter(p => p !== interaction.user.id);
                raid.standby = [ ...raid.standby, interaction.user.id ];
            } else if (participating || onStandby) {
                raid.participants = raid.participants.filter(p => p !== interaction.user.id);
                raid.standby = raid.standby.filter(s => s !== interaction.user.id);
            } else {
                await interaction.reply({
                    content: `By signing up for this raid, I assent that I will be kind, patient, and respectful of others' time.  If I am learning, I will be attentive and ask appropriate questions.`,
                    ephemeral: true,
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                    .setLabel('I agree')
                                    .setStyle(MessageButtonStyles.SUCCESS)
                            )
                    ]
                });

                return;
            }

            await update();

            break;
        }
        case 'notify': {
            if (!raid) {
                return await interaction.reply({ content: 'This raid has expired', ephemeral: true });
            }

            if (raid.participants.length > 0 && raid.participants[0] === interaction.user.id) {
                if (raid.notified) {
                    return await interaction.reply({ content: `This raid's participants have already been notified and cannot be notified again`, ephemeral: true });
                } else {
                    return await interaction.reply({
                        content: `Notify will send direct messages to the participants on this raid to let them know it is starting. **This can only be performed once per raid instance.**\nAre you sure you want to do this?`,
                        ephemeral: true,
                        components: [
                            new MessageActionRow()
                                .addComponents(
                                    new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                        .setLabel('Yes')
                                        .setStyle(MessageButtonStyles.PRIMARY)
                                )
                        ]
                    });
                }
            } else {
                return await interaction.reply({ content: 'You are not authorized to notify users that this raid is starting', ephemeral: true });
            }
        }
        case 'destroy': {
            if (!raid) {
                await interaction.channel?.messages.delete(interaction.message.id);
                return await interaction.reply({ content: 'The raid has been deleted', ephemeral: true });
            }

            if (raid.participants.length > 0 && raid.participants[0] === interaction.user.id) {
                return await interaction.reply({
                    content: `Destroying this raid will delete any remaining references to it in Malhayati, and remove it from this channel.\nAre you sure you want to do this?`,
                    ephemeral: true,
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                    .setLabel('Yes')
                                    .setStyle(MessageButtonStyles.DANGER)
                            )
                    ]
                });
            } else {
                return await interaction.reply({ content: 'You are not authorized to delete this raid', ephemeral: true });
            }
        }
        case 'response': {
            if (!raid) {
                raid = await RaidStore.get(`${interaction.guild?.id}:${tertiary}`);
                if (!raid) {
                    return await interaction.reply({ content: `This raid has expired.`, ephemeral: true });
                }
            }

            const message = await interaction.channel?.messages.fetch(raid.messageId) as Message;

            if (secondary === 'join') {
                if (raid.participants.length < 6) {
                    raid.participants = _.uniq([ ...raid.participants, interaction.user.id ]);
                } else {
                    raid.standby = _.uniq([ ...raid.standby, interaction.user.id ]);
                }
            } else if (secondary === 'standby') {
                raid.standby = _.uniq([ ...raid.standby, interaction.user.id ]);
            } else if (secondary === 'notify') {
                if (raid.participants.length > 0 && raid.participants[0] === interaction.user.id) {
                    if (raid.notified) {
                        await interaction.reply({ content: `This raid's participants have already been notified and cannot be notified again`, ephemeral: true });
                    } else {
                        raid.notified = true;

                        let channel = await client.channels.fetch(interaction.channelId);
                        for (const p of raid.participants) {
                            const user = await channel?.client.users.fetch(p);
                            if (user) await user.send(`Your run of ${raid.raid} is ready to start!`);
                        }

                        await interaction.reply({ content: `Raid participants have been notified`, ephemeral: true });
                        await RaidStore.set(`${interaction.guild?.id}:${raid.messageId}`, raid);
                    }
                } else {
                    return await interaction.reply({ content: 'You are not authorized to notify users that this raid is starting', ephemeral: true });
                }
                return;
            } else if (secondary === 'destroy') {
                if (raid.participants.length > 0 && raid.participants[0] === interaction.user.id) {
                    await interaction.channel?.messages.delete(raid.messageId);
                    await RaidStore.delete(raid.messageId);
                    return await interaction.reply({ content: 'The raid has been deleted', ephemeral: true });
                } else {
                    return await interaction.reply({ content: 'You are not authorized to delete this raid', ephemeral: true });
                }
            }

            await update(message);
            await interaction.reply({ content: `You have been added to the raid!`, ephemeral: true });

            break;
        }
    }
}