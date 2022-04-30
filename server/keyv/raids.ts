import KeyV, { Store } from 'keyv';
import { extractValues, redis, redisUris } from './redis';
import { RaidName } from '../models';

const raids = new KeyV(redisUris[0], { namespace: 'raids' });

raids.on('error', err => console.error(`Keyv connection error for namespace raids:`, err));

const setRaid = async (raidId: string, value: RaidDetails): Promise<boolean> => raids.set(raidId, value, 604800000);

const getRaid = async (raidId: string): Promise<RaidDetails> => await raids.get(raidId);

const deleteRaid = async (raidId: string): Promise<boolean> => raids.delete(raidId);

const clearRaids = async (): Promise<void> => raids.clear();

const getRaidsForGuild = async (guildId: string): Promise<RaidDetails[]> => {
    const keys = await redis.keys(`raids:${guildId}*`);
    return await extractValues(keys);
};

interface DiscordStore extends Store<RaidDetails> {
    getForGuild(guildId: string): Promise<RaidDetails[]>
}

export const RaidStore: DiscordStore = {
    set: setRaid,
    get: getRaid,
    delete: deleteRaid,
    clear: clearRaids,
    getForGuild: getRaidsForGuild
}

export interface RaidDetails {
    canTeach?: boolean,
    channelId?: string,
    date?: string,
    guildId?: string,
    messageId: string,
    notified: boolean,
    raid: RaidName,
    participants: string[],
    standby: string[],
    startTime?: string,
    teachingRun?: boolean,
    locale: string
}

await migration();

async function migration() {
    let migrationKeys = await redis.keys(`raids:*`);
    migrationKeys = migrationKeys.filter(k => k.split(':').length === 2);
    const values = await extractValues<RaidDetails>(migrationKeys);
    for (const raid of values) {
        delete (raid as any)['key'];
        if (!!raid) {
            await RaidStore.set(`${raid.guildId}:${raid.messageId}`, raid);
            await RaidStore.delete(raid.messageId);
        }
    }
}