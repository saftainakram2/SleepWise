import { Badge } from '../types';

export class BadgeService {
  static BADGES: Badge[] = [
    { id: 'first_night', name: 'First Night', description: 'Log your first sleep entry', icon: '🌱' },
    { id: 'week_warrior', name: 'Week Warrior', description: '7-day logging streak', icon: '🔥' },
    { id: 'month_master', name: 'Month Master', description: '30-day logging streak', icon: '💎' },
    { id: 'sleep_champion', name: 'Sleep Champion', description: 'Score 90+ for 3 nights in a row', icon: '⭐' },
    { id: 'consistent_sleeper', name: 'Consistent Sleeper', description: 'Bedtime within 30 min for 7 days', icon: '🛏️' },
    { id: 'debt_free', name: 'Debt Free', description: 'Sleep debt reaches zero', icon: '💚' },
    { id: 'improver', name: 'Improver', description: 'Sleep score improved 20% over a month', icon: '📈' },
  ];

  static checkBadges(sleepEntries: any[], debtHours: number): Badge[] {
    const earned: Badge[] = [];
    const now = new Date().toISOString();

    if (sleepEntries.length > 0) {
      earned.push({ ...this.BADGES.find(b => b.id === 'first_night')!, earnedAt: now });
    }

    // Simple checks for others (in a real app we'd track these better)
    if (sleepEntries.length >= 7) earned.push({ ...this.BADGES.find(b => b.id === 'week_warrior')!, earnedAt: now });
    if (debtHours <= 0 && sleepEntries.length > 3) earned.push({ ...this.BADGES.find(b => b.id === 'debt_free')!, earnedAt: now });

    return earned;
  }
}
