import { SleepEntry } from '../types';

export class SleepDebtService {
  /**
   * Calculate daily deficit: goalHours - actualHours (can be negative for surplus)
   */
  static calculateDailyDeficit(actualHours: number, goalHours: number): number {
    return goalHours - actualHours;
  }

  /**
   * Running weekly debt = sum of last 7 days deficits
   */
  static calculateWeeklyDebt(entries: SleepEntry[], goalHours: number): number {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const last7Days = entries.filter(e => new Date(e.date) >= sevenDaysAgo);
    
    return last7Days.reduce((acc, entry) => {
      return acc + (goalHours - entry.durationHours);
    }, 0);
  }

  /**
   * Payback plan: suggest adding 30 min/night until debt cleared
   */
  static getPaybackPlan(debtHours: number): string {
    if (debtHours <= 0) return "You're all caught up on sleep!";
    const nights = Math.ceil(debtHours / 0.5);
    return `Add 30 min/night for ${nights} night${nights === 1 ? '' : 's'} to clear your debt.`;
  }
}
