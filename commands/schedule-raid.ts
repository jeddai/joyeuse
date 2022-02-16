import { Command, CommandName } from './command';
import { GuildEmoji, Message, MessageEmbed, MessageEmbedImage, PartialUser, ReactionEmoji, User } from 'discord.js';
import { EmojiStrings, trimIndent } from '../utils';
import { nGram } from 'n-gram';
import { removeStopwords } from 'stopword';
import { AppConfig, getRaid, Raid, raidKeys, RaidName } from '../models';
import { randomInt } from 'crypto';
import { RaidDetails, RaidStore } from '../keyv'

const participantFilledRegex = /^([1-6])\. (<@[0-9]+>)/;
const participantMatchRegex = /^([1-6])\.(?: )?(<@[0-9]+>)?/;
const standbyFilledRegex = /^([0-9]+)\. (<@[0-9]+>)/;
const standbyMatchRegex = /^([0-9]+)\.(?: )?(<@[0-9]+>)?/;

export class ScheduleRaidCommand extends Command {
    name = CommandName.SCHEDULE_RAID;

    async execute(msg: Message): Promise<void> {
        const args = this.args(msg);
        if (!args) {

        } else {
            const tokens = removeStopwords(args);
            const tokenGroups = [
                nGram(1)(tokens),
                nGram(2)(tokens),
                nGram(3)(tokens)
            ].flat();
            console.log(tokenGroups);

            const joinedTokenGroups = tokenGroups.map(tokens => tokens.join(' '));
            let raid: Raid | undefined = undefined;
            for (let tokenGroup of joinedTokenGroups) {
                let raidName = raidKeys[tokenGroup]
                if (!!raidName) {
                    raid = getRaid(raidName);
                    if (!!raid) {
                        break;
                    }
                }
            }

            console.log(raid);

            if (!raid) {
                console.log(`failed to find raid from`, tokenGroups);
                await msg.reply(`I was unable to find a raid that matched your message.`);
            } else if (raid.vaulted) {
                await msg.reply(`${raid.name} is currently in the Destiny Content Vault.`);
            } else {
                const details: RaidDetails = {
                    messageId: msg.id,
                    guildId: msg.guild?.id,
                    raid: raid.name,
                    participants: [msg.author.toString()],
                    standby: []
                }

                const embed = new MessageEmbed({
                    color: raid.color,
                    title: raid.name,
                    author: {
                        name: 'The Speaker',
                        iconURL: AppConfig.imageUrls.iconUrl
                    },
                    description: raid.description,
                    fields: [{
                        name: 'Participants',
                        value: trimIndent(`1. ${msg.author.toString()}
                        2.
                        3.
                        4.
                        5.
                        6.
                        `),
                        inline: true
                    }, {
                        name: 'Standby',
                        value: trimIndent(`-`),
                        inline: true
                    }],
                    image: !!raid.imageUrls ? {
                        url: raid.imageUrls[randomInt(0, raid.imageUrls.length - 1)]
                    } : undefined,
                    timestamp: Date.now(),
                    footer: {
                        text: raid.footer
                    }
                });

                await RaidStore.set(msg.id, details)

                const sentEmbed = await msg.channel.send(embed);
                await sentEmbed.react(EmojiStrings.RAISED_HAND);
                await sentEmbed.react(EmojiStrings.THINKING);
            }
        }
    }

    matches(msg: string): boolean {
        return msg.toLowerCase().substr(1, this.name.length) === this.name;
    }

    validMessageReaction(emoji: GuildEmoji | ReactionEmoji, msg: Message): boolean {
        let emojiMatch = emoji.name === EmojiStrings.RAISED_HAND || emoji.name === EmojiStrings.THINKING;
        let hasEmbed = msg.embeds.length === 1;
        let embedTitleIsRaidName = (<any>Object).values(RaidName).includes((msg.embeds[0].title || ''));
        console.log(`Are reaction/message valid for scheduling a raid: ${emojiMatch}, ${hasEmbed}, ${embedTitleIsRaidName}`);
        return emojiMatch && hasEmbed && embedTitleIsRaidName;
    }

    async reactionAdded(emoji: GuildEmoji | ReactionEmoji, msg: Message, user: User | PartialUser) {
        const embed = msg.embeds[0];

        const [participants, standby] = embed.fields;

        if (participants.value.includes(user.toString()) || standby.value.includes(user.toString())) return;

        const participantsTextArr = participants.value.split('\n');
        const emptyParticipantSlot = participantsTextArr.findIndex(line => !participantFilledRegex.test(line));

        if (emptyParticipantSlot !== -1) {
            console.log(`add user ${user.username}#${user.discriminator} to participants`);
            participantsTextArr[emptyParticipantSlot] = `${emptyParticipantSlot + 1}. ${user.toString()}`;
            participants.value = participantsTextArr.join('\n');
        } else {
            console.log(`add user ${user.username}#${user.discriminator} to standby`);
            if (standby.value === '-') {
                standby.value = `1. ${user.toString()}`;
            } else {
                const max = standby.value
                    .split('\n')
                    .map(line => (line.match(standbyFilledRegex) || ['',''])[1])
                    .filter(n => !!n)
                    .map(n => parseInt(n))
                    .sort((a,b) => a < b ? 1 : a > b ? -1 : 0)[0];

                standby.value = standby.value.concat(`\n${max + 1}. ${user.toString()}`);
            }
        }

        await msg.edit(embed);
    }

    async reactionRemoved(emoji: GuildEmoji | ReactionEmoji, msg: Message, user: User | PartialUser) {
        const embed = msg.embeds[0];
        const [participants, standby] = embed.fields;

        console.log(`attempting to remove user ${user.username}#${user.discriminator} from raid for bot message ${msg.id}`);

        if (participants.value.includes(user.toString()) || standby.value.includes(user.toString())) {
            const participantsLines = participants.value.split('\n');
            const standByLines = standby.value.split('\n');

            const participantIds = participantsLines.map(line => (line.match(participantMatchRegex) || [null,null,null])[2]).filter(p => !!p);
            const standbyIds = standByLines.map(line => (line.match(standbyMatchRegex) || [null,null,null])[2]).filter(p => !!p);

            const ids = participantIds.concat(standbyIds);
            console.log(`current ids: `, ids);
            const index = ids.findIndex(id => id === user.toString());
            if (index !== -1) {
                ids.splice(index, 1);
            }
            console.log(`new ids: `, ids);

            const newParticipants = ids.slice(0, 6);
            while (newParticipants.length < 6) {
                newParticipants.push('');
            }
            console.log(`updating participants to: `, newParticipants);
            participants.value = newParticipants.map((v, i) => (i+1) + `. ${v}`).join('\n');

            const newStandby = ids.slice(6);
            console.log(`updating standby to: `, newStandby);
            standby.value = newStandby.length === 0 ? '-' : newStandby.map((v, i) => (i+1) + `. ${v}`).join('\n');
        } else {
            console.error(`user ${user.username}#${user.discriminator} not found in message`);
        }

        await msg.edit(embed);
    }

    args(message: Message): string[] {
        return super.args(message).slice(2);
    }

}