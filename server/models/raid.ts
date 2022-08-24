import { AppConfig } from './config';

export enum RaidName {
    COS = 'Crown of Sorrow',
    DSC = 'Deep Stone Crypt',
    EOW = 'Eater of Worlds',
    GOS = 'Garden of Salvation',
    KF = `King's Fall`,
    LEV = 'Leviathan',
    LW = 'Last Wish',
    SOS = 'Spire of Stars',
    SOTP = 'Scourge of the Past',
    VOG = 'Vault of Glass',
    VOW = 'Vow of the Disciple'
}

enum Color {
    SICKLY_GREEN = '#6ab300',
    TEAL = '#22e7f3',
    GRAY = '#7a7a7a',
    FOREST_GREEN = '#167c00',
    GOLD = '#f9df41',
    BLACK = '#000000',
    PURPLE = '#8126e8',
    RED = '#da0a0a',
    SILVER = '#b8b8b8',
    CRIMSON = '#990000'
}

export class Raid {

    constructor(name: RaidName, vaulted: boolean = false, color: Color, description: string = '') {
        this.name = name;
        this.description = description;
        this.vaulted = vaulted;
        this.color = color;
    }

    name: RaidName;
    color: Color;
    description: string;
    vaulted: boolean;

    get shortName(): string {
        switch (this.name) {
            case RaidName.COS: return 'crownOfSorrow';
            case RaidName.DSC: return 'deepStoneCrypt';
            case RaidName.EOW: return 'eaterOfWorlds';
            case RaidName.GOS: return 'gardenOfSalvation';
            case RaidName.KF: return 'kingsFall';
            case RaidName.LEV: return 'leviathan';
            case RaidName.LW: return 'lastWish';
            case RaidName.SOS: return 'spireOfStars';
            case RaidName.SOTP: return 'scourgeOfThePast';
            case RaidName.VOG: return 'vaultOfGlass';
            case RaidName.VOW: return 'vowOfTheDisciple';
            default: return '';
        }
    }

    get imageUrls(): string[] | undefined {
        return AppConfig.imageUrls.raids[this.shortName];
    }
}

export const Raids: Raid[] = [
    new Raid(RaidName.COS, true, Color.SICKLY_GREEN),
    new Raid(RaidName.DSC, false, Color.TEAL, `Purge the House of Salvation from the Deep Stone Crypt. Crash the Morning Star into Europa.`),
    new Raid(RaidName.EOW, true, Color.GRAY),
    new Raid(RaidName.GOS, false, Color.FOREST_GREEN, `Track the source of the Unknown Artifact's signal into the Black Garden.`),
    new Raid(RaidName.KF, false, Color.CRIMSON, `Assassinate Oryx, the Taken King, and end the Taken War.`),
    new Raid(RaidName.LEV, true, Color.GOLD),
    new Raid(RaidName.LW, false, Color.BLACK, `Put an end to the Taken curse within the Dreaming City through killing Riven of a Thousand Voices, an Ahamkara taken by Oryx.`),
    new Raid(RaidName.SOS, true, Color.PURPLE),
    new Raid(RaidName.SOTP, true, Color.RED),
    new Raid(RaidName.VOG, false, Color.SILVER, `The time lost Raid returns. Stored away, deep in the Vault of Glass on Venus is Atheon, Time's Conflux. No one knows what this Vex is. Guardians must access the Vault, navigate the fractures in space and time, and terminate Atheon before it can become an unstoppable threat.`),
    new Raid(RaidName.VOW, false, Color.BLACK, `Among the swamps of Savathûn's Throne World lies a sunken Pyramid. Guardians will gather their fireteam and confront the ancient danger that lies within.`)
]

export const getRaid = (raidName: string | null | undefined): Raid => {
    return Raids.find(raid => raid.shortName === raidName || raid.name === raidName) || {} as Raid;
}

export const raidKeys: { [key: string]: RaidName } = {
    'cos': RaidName.COS,
    'crown': RaidName.COS,
    'crown sorrow': RaidName.COS,
    'dsc': RaidName.DSC,
    'deep stone': RaidName.DSC,
    'deep stone crypt': RaidName.DSC,
    'disciple': RaidName.VOW,
    'eow': RaidName.EOW,
    'eater': RaidName.EOW,
    'eater worlds': RaidName.EOW,
    'gos': RaidName.GOS,
    'garden': RaidName.GOS,
    'garden salvation': RaidName.GOS,
    'lev': RaidName.LEV,
    'leviathan': RaidName.LEV,
    'lw': RaidName.LW,
    'last wish': RaidName.LW,
    'riven': RaidName.LW,
    'sos': RaidName.SOS,
    'spire': RaidName.SOS,
    'spire stars': RaidName.SOS,
    'sotp': RaidName.SOTP,
    'scourge': RaidName.SOTP,
    'scourge past': RaidName.SOTP,
    'vog': RaidName.VOG,
    'vault': RaidName.VOG,
    'vault glass': RaidName.VOG,
    'vow': RaidName.VOW
};
