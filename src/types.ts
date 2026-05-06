export interface SleepEntry {
  id?: number;
  date: string; // ISO Date string
  bedtime: string; // ISO Date string
  wakeTime: string; // ISO Date string
  durationHours: number;
  qualityRating: number; // 1-10
  moodOnWaking: number; // 1-5
  disturbances: number;
  sleepScore: number;
  notes?: string;
}

export interface LifestyleEntry {
  id?: number;
  date: string; // ISO Date string
  caffeineCount: number;
  lastCaffeineTime: string; // "14:30"
  exercisedToday: boolean;
  exerciseIntensity: number; // 1-3
  screenTimeMinutes: number;
  stressLevel: number; // 1-5
  alcoholConsumed: boolean;
}

export interface EnvironmentEntry {
  id?: number;
  date: string; // ISO Date string
  temperatureStart: number;
  temperatureEnd?: number;
  noiseLevel: 'quiet' | 'moderate' | 'loud';
  lightLevel: 'dark' | 'dim' | 'bright';
}

export interface UserSettings {
  id?: number;
  name?: string;
  avatar?: string;
  greeting?: string;
  sleepGoalHours: number;
  targetWakeTime: string; // "07:00"
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  morningNudgeEnabled: boolean;
  isAlarmEnabled?: boolean;
  alarmSound?: string;
  theme: 'dark' | 'light' | 'auto';
  onboarded: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}
