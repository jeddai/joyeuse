import KeyV, { Store } from 'keyv';
import { redis, redisUris } from './redis';
import { RaidName } from '../models';

const raids = new KeyV(redisUris[0], { namespace: 'raids' });

raids.on('error', err => console.error(`Keyv connection error for namespace raids:`, err));

const setRaid = async (raidId: string, value: RaidDetails): Promise<boolean> => raids.set(raidId, value, 604800000);

const getRaid = async (raidId: string): Promise<RaidDetails> => await raids.get(raidId);

const deleteRaid = async (raidId: string): Promise<boolean> => raids.delete(raidId);

const clearRaids = async (): Promise<void> => raids.clear();

const getRaidsForGuild = async (guildId: string): Promise<RaidDetails[]> => {
    const keys = await redis.keys(`raids:${guildId}*`);
    const raids = [];
    for (let key of keys) {
        raids.push(await getRaid(key.substring(6)));
    }
    return raids;
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
    messageId: string,
    guildId?: string,
    raid: RaidName,
    participants: string[],
    standby: string[],
    notified: boolean
}