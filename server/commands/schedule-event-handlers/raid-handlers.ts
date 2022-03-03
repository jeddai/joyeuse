import {
    CommandInteraction, EmbedField,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed
} from 'discord.js';
import { RaidDetails, RaidStore } from '../../keyv';
import { AppConfig, getRaid } from '../../models';
import { randomInt } from 'crypto';
import _ from 'lodash';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { client } from '../../discord/discord-client';
import { SCHEDULE_EVENT_COMMAND_NAME } from '../schedule-event';

export const handleRaidCreate = async (interaction: CommandInteraction) => {
    const raidName = interaction.options.getString('raid-name');
    const { name, description, color, vaulted, imageUrls } = getRaid(raidName);

    if (!name) {
        return await interaction.reply({ content: `Unable to find the selected raid`, ephemeral: true });
    }

    if (vaulted) {
        return await interaction.reply({ content: `${name} is currently in the Destiny Content Vault.`, ephemeral: true });
    }

    let users = _.range(1, 6).map(u => {
        const user = interaction.options.getUser(`participant-${u}`);
        return user?.id
    }).filter(u => !!u);

    const startTime = interaction.options.getString('start-time');

    const participants = _.uniq([ interaction.user.id, ...users ]) as string[];
    const participantsText = [ ...participants, ...(_.range(6 - participants.length).map(_ => '')) ]
        .map((p, i) => `${i + 1}. ${!!p ? `<@${p}>` : ''}`).join('\n');
    const standbyText = '-';

    const embed = new MessageEmbed({
        color,
        title: name,
        description: description,
        fields: [!!startTime ? {
            name: 'Start Time',
            value: startTime,
            inline: false
        } : null,
            {
                name: 'Participants',
                value: participantsText,
                inline: true
            }, {
                name: 'Standby',
                value: standbyText,
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
        guildId: interaction.guild?.id,
        raid: name,
        participants,
        standby: [],
        notified: false
    }
    await RaidStore.set(sentEmbed.id, details);
}

export const handleRaidInteraction = async (interaction: MessageComponentInteraction, params: string[]): Promise<void> => {
    const [ primary, secondary, tertiary ] = params;

    let raid = await RaidStore.get(interaction.message.id);

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
        await RaidStore.set(raid.messageId, raid);
    }

    switch (primary) {
        case 'join':
        case 'standby': {
            if (!raid) {
                return await interaction.reply({ content: `This raid has expired.` });
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
                raid = await RaidStore.get(tertiary);
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
                        await RaidStore.set(raid.messageId, raid);
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