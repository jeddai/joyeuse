import { Command, CommandName } from './command';
import { Message, MessageEmbed } from 'discord.js';
import { EmojiStrings, trimIndent } from '../utils';

export class ScheduleRaidCommand extends Command {
    name = CommandName.SCHEDULE_RAID;

    async execute(msg: Message): Promise<void> {
        // const args = this.args(msg);

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Some title')
            // .setURL('https://discord.js.org/')
            .setAuthor('The Speaker', 'https://jeddai.nyc3.digitaloceanspaces.com/the-speaker/speaker.png')
            .setDescription('Some description here')
            // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addField(
                'Participants',
                trimIndent(`1.
                2.
                3.
                4.
                5.
                6.
                `),
                false
            )
            .addField(
                'Standby',
                trimIndent(`-`),
                true
            )
            // .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here');

        const sentEmbed = await msg.channel.send(embed);
        await sentEmbed.react(EmojiStrings.RAISED_HAND);
    }

    matches(msg: string): boolean {
        return msg.substr(1, 'scheduleRaid'.length) === this.name;
    }

}