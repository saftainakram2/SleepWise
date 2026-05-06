import { SleepEntry } from '../types';

export class SleepScoreService {
  /**
   * Calculates the sleep score based on duration, quality, and consistency.
   * @param entry The sleep entry to score
   * @param goalHours The user's sleep goal in hours
   * @param deviationMinutes Deviation from average bedtime in minutes
   */
  static calculateSleepScore(entry: SleepEntry, goalHours: number, deviationMinutes: number = 0): number {
    // Duration Score (40 points max)
    const durationRatio = entry.durationHours / goalHours;
    const durationScore = ((Math.max(0.5, Math.min(1.0, durationRatio)) - 0.5) / 0.5) * 40;

    // Quality Score (35 points max)
    const qualityScore = (entry.qualityRating / 10) * 35;

    // Consistency Score (25 points max)
    const consistencyScore = Math.max(0, Math.min(25, 25 - (deviationMinutes / 60)));

    return Math.round(Math.max(0, Math.min(100, durationScore + qualityScore + consistencyScore)));
  }
}
