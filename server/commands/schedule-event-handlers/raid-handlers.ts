import {
    ActionRowBuilder, APIEmbedField, ButtonBuilder,
    ButtonStyle, ChatInputCommandInteraction,
    EmbedBuilder,
    EmbedField, HexColorString,
    Message,
    MessageComponentInteraction
} from 'discord.js';
import { MetricStore, RaidDetails, RaidStore } from '../../keyv';
import { AppConfig, getRaid } from '../../models';
import { randomInt } from 'crypto';
import _ from 'lodash';
import { client } from '../../discord/discord-client';
import { SCHEDULE_EVENT_COMMAND_NAME } from '../schedule-event';
import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import {
    getLocale,
    interpolate,
    InterpolationKeys,
    isValidLocale,
    mapLocaleValues,
    NON_ENGLISH_LOCALES
} from '../../locale/locale';
import { LocaleString } from 'discord-api-types/v10';

const isSlashCommandStringOption = (option: any): option is SlashCommandStringOption => (option as SlashCommandStringOption).addChoices !== undefined;

const OPTION_RAID_NAME = 'raid-name';
const OPTION_START_TIME = 'start-time';
const OPTION_CAN_TEACH = 'can-teach';
const OPTION_TEACHING_RUN = 'teaching-run';
const OPTION_DATE = 'date';
const OPTION_LOCALE = 'locale';
const OPTION_PARTICIPANT = (n: number) => {
    return `participant-${n}`;
}

const DEFAULT_LOCALE = getLocale();
const LOCALE_VALUES_PREFIX: any[] = ['commands', 'schedule', 'raid'];
const COMMAND_STRINGS = DEFAULT_LOCALE.commands.schedule.raid;

export const raidSubcommand = (subcommand: SlashCommandSubcommandBuilder) => {
    subcommand.setName(COMMAND_STRINGS.name)
        .setNameLocalizations(mapLocaleValues(NON_ENGLISH_LOCALES, ...LOCALE_VALUES_PREFIX, 'name'))
        .setDescription(COMMAND_STRINGS.description)
        .setDescriptionLocalizations(mapLocaleValues(NON_ENGLISH_LOCALES, ...LOCALE_VALUES_PREFIX, 'description'))

    getLocale().commands.schedule.raid.options.forEach((option, i) => {
        const createOption = (opt: any) => {
            opt.setName(option.name)
                .setNameLocalizations(mapLocaleValues(NON_ENGLISH_LOCALES, ...LOCALE_VALUES_PREFIX, 'options', i, 'name'))
                .setDescription(option.description)
                .setDescriptionLocalizations(mapLocaleValues(NON_ENGLISH_LOCALES, ...LOCALE_VALUES_PREFIX, 'options', i, 'description'))
                .setRequired(option.required || false)

            if (option.choices && isSlashCommandStringOption(opt)) {
                opt.addChoices(
                    ...option.choices.map((choice, j) => {
                        return {
                            name: choice.name,
                            name_localizations: mapLocaleValues(NON_ENGLISH_LOCALES, ...LOCALE_VALUES_PREFIX, 'options', i, 'choices', j, 'name'),
                            value: choice.value ?? ''
                        }
                    })
                )
            }

            return opt;
        }

        switch (option.type) {
            case 'string':
                subcommand.addStringOption(createOption);
                break;
            case 'boolean':
                subcommand.addBooleanOption(createOption);
                break;
            case 'user':
                subcommand.addUserOption(createOption);
                break;
        }
    });

    return subcommand;
}

export const handleRaidCreate = async (interaction: ChatInputCommandInteraction) => {
    let raidName = interaction.options.getString(OPTION_RAID_NAME);
    const { name, shortName, description, color, vaulted, imageUrls } = getRaid(raidName);

    const localeString = (isValidLocale(interaction.options.getString(OPTION_LOCALE)) || interaction.locale) as LocaleString
    const locale = getLocale(localeString);
    const { responses, content, actions } = locale.commands.schedule.raid;
    const localizedName = locale.raids[shortName]?.name;
    const localizedDescription = locale.raids[shortName]?.description;

    if (!name) {
        return await interaction.reply({ content: responses.raidNotFound, ephemeral: true });
    }

    if (vaulted) {
        return await interaction.reply({
            content: interpolate(
                [{ key: InterpolationKeys.RAID_NAME, value: name.toString() }],
                responses.vaulted
            ),
            ephemeral: true
        });
    }

    let users = _.range(1, 6).map(u => {
        const user = interaction.options.getUser(OPTION_PARTICIPANT(u));
        return user?.id
    }).filter(u => !!u);

    const date = interaction.options.getString(OPTION_DATE) || undefined;
    const startTime = interaction.options.getString(OPTION_START_TIME) || undefined;
    const canTeach = interaction.options.getBoolean(OPTION_CAN_TEACH) !== null ?
        interaction.options.getBoolean(OPTION_CAN_TEACH) as boolean : undefined;
    const teachingRun = interaction.options.getBoolean(OPTION_TEACHING_RUN) !== null ?
        interaction.options.getBoolean(OPTION_TEACHING_RUN) as boolean : undefined;

    const participants = _.uniq([ interaction.user.id, ...users ]) as string[];
    const participantsText = [ ...participants, ...(_.range(6 - participants.length).map(_ => '')) ]
        .map((p, i) => `${i + 1}. ${!!p ? `<@${p}>` : ''}`).join('\n');
    const standbyText = '-';

    const embed = new EmbedBuilder()
        .setColor(color as HexColorString)
        .setTitle(localizedName || name.toString())
        .setDescription(localizedDescription || description)
        .setImage(imageUrls ? imageUrls[imageUrls.length === 1 ? 0 : randomInt(0, imageUrls.length - 1)] : null)
        .setTimestamp(Date.now())
        .setFooter({
            text: `via joyeuse.app`,
            iconURL: AppConfig.imageUrls.iconUrl
        })
        .setFields(
            [
                !!date ? {
                    name: content.date,
                    value: date,
                    inline: false
                } : null,
                !!startTime ? {
                    name: content.startTime,
                    value: startTime,
                    inline: false
                } : null,
                canTeach !== undefined ? {
                    name: content.canTeach,
                    value: canTeach ? 'Yes' : 'No',
                    inline: false
                } : null,
                teachingRun !== undefined ? {
                    name: content.teachingRun,
                    value: teachingRun ? 'Yes' : 'No',
                    inline: false
                } : null,
                {
                    name: content.participants,
                    value: participantsText,
                    inline: true
                },
                {
                    name: content.standby,
                    value: standbyText,
                    inline: true,
                }
            ].filter(f => !!f) as EmbedField[]
        )

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:join`)
                .setLabel(actions.join)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:standby`)
                .setLabel(actions.standby)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:notify`)
                .setLabel(actions.notify)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:destroy`)
                .setLabel(actions.destroy)
                .setStyle(ButtonStyle.Danger)
        )

    const sentEmbed = await interaction.reply({
        embeds: [ embed ],
        components: [ buttonRow ] as any[],
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
        date,
        locale: localeString
    }
    const store = await RaidStore.set(`${interaction.guild?.id}:${sentEmbed.id}`, details);
    if (!store) {
        await interaction.followUp({ content: responses.storageFailure, ephemeral: true });
    }

    await MetricStore.perform(`raid:${shortName}:${interaction.guild?.id}`, metric => {
        metric.count = (metric.count || 0) + 1;
    });
}

export const handleRaidInteraction = async (interaction: MessageComponentInteraction, params: string[]): Promise<void> => {
    const [ primary, secondary, tertiary ] = params;

    let raid = await RaidStore.get(`${interaction.guild?.id}:${interaction.message.id}`);

    let raidLocale = getLocale(raid?.locale as LocaleString).commands.schedule.raid;
    const { content, responses, actions } = getLocale(interaction.locale as LocaleString).commands.schedule.raid;

    const isFireteamLeader = (raid?.participants?.length ?? 0) > 0 && raid?.participants[0] === interaction.user.id;
    const canManageMessages = interaction.memberPermissions?.has('ManageMessages');

    const update = async (message?: Message) => {
        if (!raid) return;
        raidLocale = getLocale(raid.locale as LocaleString).commands.schedule.raid;

        let embed: any = (message || interaction.message).embeds[0];
        if (!embed) {
            const { name, description, color, imageUrls } = getRaid(raid.raid);
            embed = new EmbedBuilder()
                .setColor(color as HexColorString)
                .setTitle(name)
                .setDescription(description)
                .setImage(!!imageUrls ? imageUrls[randomInt(0, imageUrls.length - 1)] : null)
                .setTimestamp(Date.now())
                .setFooter({
                    text: `via joyeuse.app`,
                    iconURL: AppConfig.imageUrls.iconUrl
                })
                .setFields(
                    [{
                        name: raidLocale.content.participants,
                        value: '-',
                        inline: true
                    }, {
                        name: raidLocale.content.standby,
                        value: '-',
                        inline: true
                    }].filter(f => !!f) as APIEmbedField[]
                )
                .data
        }

        const participants = (embed.fields || []).find((f: APIEmbedField) => f.name === raidLocale.content.participants);
        const standby = (embed.fields || []).find((f: APIEmbedField) => f.name === raidLocale.content.standby);
        if (participants)
            participants.value = [ ...raid.participants, ...(_.range(6 - raid.participants.length).map(_ => '')) ]
                .map((p, i) => `${i + 1}. ${!!p ? `<@${p}>` : ''}`).join('\n');
        if (standby)
            standby.value = raid.standby.map((s, i) => `${i + 1}. <@${s}>`).join('\n') || '-';

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
                await interaction.reply({ content: responses.expired, ephemeral: true });
                return;
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
                    content: content.joinConfirmation,
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                    .setLabel(actions.agree)
                                    .setStyle(ButtonStyle.Success)
                            )
                    ] as any[]
                });

                return;
            }

            await update();

            break;
        }
        case 'notify': {
            if (!raid) {
                await interaction.reply({ content: responses.expired, ephemeral: true });
                return
            }

            if (raid.participants.length > 0 && raid.participants[0] === interaction.user.id) {
                if (raid.notified) {
                    await interaction.reply({ content: responses.notifyAttemptFailed, ephemeral: true });
                    return;
                } else {
                    await interaction.reply({
                        content: content.notifyConfirmation,
                        ephemeral: true,
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                        .setLabel('Yes')
                                        .setStyle(ButtonStyle.Primary)
                                )
                        ] as any[]
                    });
                    return;
                }
            } else {
                await interaction.reply({ content: responses.notifyUnauthorized, ephemeral: true });
                return;
            }
        }
        case 'destroy': {
            if (!raid) {
                await interaction.channel?.messages.delete(interaction.message.id);
                await interaction.reply({content: responses.destroyComplete, ephemeral: true});
                return;
            }

            if (isFireteamLeader || canManageMessages) {
                await interaction.reply({
                    content: content.destroyConfirmation,
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId(`${SCHEDULE_EVENT_COMMAND_NAME}:raid:response:${primary}:${interaction.message.id}`)
                                    .setLabel('Yes')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ] as any[]
                });
            } else {
                await interaction.reply({ content: responses.destroyUnauthorized, ephemeral: true });
            }
            return;
        }
        case 'response': {
            if (!raid) {
                raid = await RaidStore.get(`${interaction.guild?.id}:${tertiary}`);
                if (!raid) {
                    await interaction.reply({ content: responses.expired, ephemeral: true });
                    return;
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
                        await interaction.reply({ content: responses.notifyAttemptFailed, ephemeral: true });
                    } else {
                        raid.notified = true;

                        let channel = await client.channels.fetch(interaction.channelId);
                        for (const p of raid.participants) {
                            const user = await channel?.client.users.fetch(p);
                            if (user) await user.send(interpolate(
                                [{ key: InterpolationKeys.RAID_NAME, value: raid.raid }],
                                content.notification
                            ));
                        }

                        await interaction.reply({ content: responses.notifyComplete, ephemeral: true });
                        await RaidStore.set(`${interaction.guild?.id}:${raid.messageId}`, raid);
                    }
                } else {
                    await interaction.reply({ content: responses.notifyUnauthorized, ephemeral: true });
                }
                return;
            } else if (secondary === 'destroy') {
                if (isFireteamLeader || canManageMessages) {
                    await interaction.channel?.messages.delete(raid.messageId);
                    await RaidStore.delete(raid.messageId);
                    await interaction.reply({ content: responses.destroyComplete, ephemeral: true });
                } else {
                    await interaction.reply({ content: responses.destroyUnauthorized, ephemeral: true });
                }
                return;
            }

            await update(message);
            await interaction.reply({ content: responses.joinComplete, ephemeral: true });

            break;
        }
    }
}