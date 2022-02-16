import KeyV, { Store } from 'keyv';
import { redisUri } from './keyv';
import { RaidName } from '../models';

const raids = new KeyV(redisUri, { namespace: 'raids' });

raids.on('error', err => console.error(`Keyv connection error for namespace raids:`, err));

const setRaid = async (raidId: string, value: RaidDetails): Promise<boolean> => raids.set(raidId, JSON.stringify(value), 604800000);

const getRaid = async (raidId: string): Promise<RaidDetails> => JSON.parse(await raids.get(raidId));

const deleteRaid = async (raidId: string): Promise<boolean> => raids.delete(raidId)

const clearRaids = async (): Promise<void> => raids.clear()

export const RaidStore: Store<RaidDetails> = {
    set: setRaid,
    get: getRaid,
    delete: deleteRaid,
    clear: clearRaids
}

export interface RaidDetails {
    messageId: string,
    guildId?: string,
    raid: RaidName,
    participants: string[],
    standby: string[]
}