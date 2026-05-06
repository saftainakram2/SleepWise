import Dexie, { Table } from 'dexie';
import { SleepEntry, LifestyleEntry, UserSettings, EnvironmentEntry } from '../types';

export class SleepWiseDB extends Dexie {
  sleepEntries!: Table<SleepEntry>;
  lifestyleEntries!: Table<LifestyleEntry>;
  environmentEntries!: Table<EnvironmentEntry>;
  userSettings!: Table<UserSettings>;
  favoriteTips!: Table<{ id: string; savedAt: string }>;

  constructor() {
    super('SleepWiseDB');
    this.version(3).stores({
      sleepEntries: '++id, date',
      lifestyleEntries: '++id, date',
      environmentEntries: '++id, date',
      userSettings: '++id',
      favoriteTips: 'id'
    });
  }
}

export const db = new SleepWiseDB();

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  sleepGoalHours: 8.0,
  targetWakeTime: '07:00',
  reminderEnabled: true,
  reminderMinutesBefore: 30,
  morningNudgeEnabled: true,
  theme: 'dark',
  onboarded: false
};

export async function getSettings(): Promise<UserSettings | undefined> {
  return await db.userSettings.toCollection().first();
}

export async function initializeSettings() {
  const count = await db.userSettings.count();
  if (count === 0) {
    await db.userSettings.add(DEFAULT_SETTINGS);
  }
}

export async function updateSettings(updates: Partial<UserSettings>) {
  let settings = await getSettings();
  if (!settings) {
    await initializeSettings();
    settings = await getSettings();
  }
  
  if (settings?.id) {
    await db.userSettings.update(settings.id, updates);
  }
}
