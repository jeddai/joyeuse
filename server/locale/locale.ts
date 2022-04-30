import { load } from 'js-yaml';
import fs from 'fs';
import { LocaleString, LocalizationMap } from 'discord-api-types/v10';

export enum InterpolationKeys {
    RAID_NAME = '<raid_name>'
}

interface RaidLocale {
    name: string
    description: string
}

interface CommandOption {
    name: string
    description: string
    type?: 'string' | 'boolean' | 'user'
    required?: boolean
    choices?: [{
        name: string,
        value?: string
    }],
}

export interface Locale {
    genericError: string
    nonInteractiveError: string
    raids: {
        [key: string]: RaidLocale
    }
    commands: {
        schedule: {
            raid: {
                name: string
                description: string
                options: CommandOption[]
                responses: {
                    raidNotFound: string
                    vaulted: string
                    storageFailure: string
                    expired: string
                    joinComplete: string
                    notifyAttemptFailed: string
                    notifyUnauthorized: string
                    notifyComplete: string
                    destroyUnauthorized: string
                    destroyComplete: string
                }
                content: {
                    date: string
                    startTime: string
                    canTeach: string
                    teachingRun: string
                    participants: string
                    standby: string
                    joinConfirmation: string
                    notifyConfirmation: string
                    notification: string
                    destroyConfirmation: string
                }
                actions: {
                    join: string
                    standby: string
                    notify: string
                    destroy: string
                    agree: string
                }
            }
        }
    }
}

export const NON_ENGLISH_LOCALES: LocaleString[] = ['fr'];

export const locales: { [key: string]: Locale } = {
    'en-US': load(fs.readFileSync(process.cwd() + '/locale/en-US.yaml', 'utf-8')) as Locale,
    'fr': load(fs.readFileSync(process.cwd() + '/locale/fr.yaml', 'utf-8')) as Locale
};

export function getLocale(locale: LocaleString = 'en-US'): Locale {
    return locales[locale] || locales['en-US'];
}

export function isValidLocale(locale: string | null): LocaleString | undefined {
    return !!locale && ['en-US', 'fr'].includes(locale) ? locale as LocaleString : undefined;
}

export function interpolate(values: { key: InterpolationKeys, value: string }[], content: string) {
    let result = content;
    values.forEach(({key, value}) => {
        result = result.replace(new RegExp(`${key}`, 'g'), value);
    });
    return result;
}

export function mapLocaleValues(localesList: LocaleString[], ...values: any[]): LocalizationMap {
    return Object.keys(locales)
        .filter(locale => localesList.includes(locale as LocaleString))
        .reduce((prev, curr) => {
            prev[curr] = [curr, ...values].reduce((p, c) => p[c], locales as any);
            return prev;
        }, {} as any);
}