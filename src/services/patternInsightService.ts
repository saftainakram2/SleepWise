import { SleepEntry, LifestyleEntry, EnvironmentEntry } from '../types';
import { isWeekend, parseISO } from 'date-fns';

export interface Insight {
  icon: string;
  headline: string;
  explanation: string;
  type: 'weekend' | 'caffeine' | 'stress' | 'consistency' | 'trend' | 'temperature' | 'noise';
  impact?: number;
}

export class PatternInsightService {
  static detectPatterns(sleepEntries: SleepEntry[], lifestyleEntries: LifestyleEntry[], environmentEntries: EnvironmentEntry[] = []): Insight[] {
    const insights: Insight[] = [];
    if (sleepEntries.length < 7) return insights;

    // 1. Weekend Effect
    const weekendSleep = sleepEntries.filter(e => isWeekend(parseISO(e.date)));
    const weekdaySleep = sleepEntries.filter(e => !isWeekend(parseISO(e.date)));

    if (weekendSleep.length > 0 && weekdaySleep.length > 0) {
      const avgWeekend = weekendSleep.reduce((a, b) => a + b.durationHours, 0) / weekendSleep.length;
      const avgWeekday = weekdaySleep.reduce((a, b) => a + b.durationHours, 0) / weekdaySleep.length;
      const diff = avgWeekend - avgWeekday;
      if (Math.abs(diff) > 1) {
        insights.push({
          icon: 'Calendar',
          headline: 'Weekend Effect Detected',
          explanation: `You sleep ${Math.abs(diff).toFixed(1)}hrs ${diff > 0 ? 'longer' : 'shorter'} on weekends.`,
          type: 'weekend'
        });
      }
    }

    // 2. Caffeine Correlation
    const joinedData = sleepEntries.map(s => {
      const l = lifestyleEntries.find(le => le.date.split('T')[0] === s.date.split('T')[0]);
      const env = environmentEntries.find(ee => ee.date.split('T')[0] === s.date.split('T')[0]);
      return { sleep: s, lifestyle: l, env: env };
    }).filter(d => d.lifestyle || d.env);

    if (joinedData.length > 3) {
      const highCaffeine = joinedData.filter(d => (d.lifestyle?.caffeineCount || 0) > 3);
      const lowCaffeine = joinedData.filter(d => (d.lifestyle?.caffeineCount || 0) <= 2 && d.lifestyle);

      if (highCaffeine.length > 0 && lowCaffeine.length > 0) {
        const avgScoreHigh = highCaffeine.reduce((a, b) => a + b.sleep.sleepScore, 0) / highCaffeine.length;
        const avgScoreLow = lowCaffeine.reduce((a, b) => a + b.sleep.sleepScore, 0) / lowCaffeine.length;
        const diff = avgScoreLow - avgScoreHigh;
        if (diff > 5) {
          insights.push({
            icon: 'Coffee',
            headline: 'Caffeine Impact',
            explanation: `On high-caffeine days your sleep score drops by ${diff.toFixed(0)} points.`,
            type: 'caffeine',
            impact: diff
          });
        }
      }
      
      // Temperature correlation
      const hotDays = joinedData.filter(d => (d.env?.temperatureStart || 0) > 72);
      const coolDays = joinedData.filter(d => (d.env?.temperatureStart || 0) <= 68 && d.env);
      
      if (hotDays.length > 0 && coolDays.length > 0) {
          const avgScoreHot = hotDays.reduce((a, b) => a + b.sleep.sleepScore, 0) / hotDays.length;
          const avgScoreCool = coolDays.reduce((a, b) => a + b.sleep.sleepScore, 0) / coolDays.length;
          const diff = avgScoreCool - avgScoreHot;
          if (diff > 5) {
              insights.push({
                  icon: 'ThermometerSun',
                  headline: 'Cooler is Better',
                  explanation: `When your room is 68°F or cooler, your sleep score improves by ${diff.toFixed(0)} points.`,
                  type: 'temperature',
                  impact: diff
              });
          }
      }
      
      // Noise correlation
      const loudDays = joinedData.filter(d => (d.env?.noiseLevel === 'loud' || d.env?.noiseLevel === 'moderate'));
      const quietDays = joinedData.filter(d => d.env?.noiseLevel === 'quiet');
      
      if (loudDays.length > 0 && quietDays.length > 0) {
          const avgScoreLoud = loudDays.reduce((a, b) => a + b.sleep.sleepScore, 0) / loudDays.length;
          const avgScoreQuiet = quietDays.reduce((a, b) => a + b.sleep.sleepScore, 0) / quietDays.length;
          const diff = avgScoreQuiet - avgScoreLoud;
          if (diff > 5) {
              insights.push({
                  icon: 'VolumeX',
                  headline: 'Noise Sensitivity',
                  explanation: `Quiet environments boost your sleep score by ${diff.toFixed(0)} points compared to noisy nights.`,
                  type: 'noise',
                  impact: diff
              });
          }
      }
    }

    // 3. Stress Impact
    const highStress = joinedData.filter(d => (d.lifestyle?.stressLevel || 0) > 3);
    if (highStress.length > 2) {
      const avgHighStressScore = highStress.reduce((a, b) => a + b.sleep.sleepScore, 0) / highStress.length;
      const avgOverallScore = sleepEntries.reduce((a, b) => a + b.sleepScore, 0) / sleepEntries.length;
      const diff = avgOverallScore - avgHighStressScore;
      if (diff > 5) {
        insights.push({
          icon: 'Brain',
          headline: 'Stress Impact',
          explanation: `High stress days hurt your sleep score by ${diff.toFixed(0)} points avg.`,
          type: 'stress',
          impact: diff
        });
      }
    }

    // 4. Consistency Insight
    const bedtimes = sleepEntries.map(e => {
        const d = new Date(e.bedtime);
        return d.getHours() * 60 + d.getMinutes();
    });
    const maxBedtime = Math.max(...bedtimes);
    const minBedtime = Math.min(...bedtimes);
    if (maxBedtime - minBedtime > 90) {
        insights.push({
            icon: 'Clock',
            headline: 'Consistency Warning',
            explanation: `Your bedtime varies up to ${(maxBedtime - minBedtime) / 60}hrs — consistency boosts sleep.`,
            type: 'consistency'
        });
    }

    // 5. Improving Trend
    if (sleepEntries.length >= 14) {
        const last7 = sleepEntries.slice(-7);
        const prev7 = sleepEntries.slice(-14, -7);
        const avgLast7 = last7.reduce((a, b) => a + b.sleepScore, 0) / 7;
        const avgPrev7 = prev7.reduce((a, b) => a + b.sleepScore, 0) / 7;
        const improvement = avgLast7 - avgPrev7;
        if (improvement > 10) {
            insights.push({
                icon: 'TrendingUp',
                headline: 'Improving Trend!',
                explanation: `Your sleep improved ${improvement.toFixed(0)}% this week! Keep it up.`,
                type: 'trend'
            });
        }
    }

    return insights;
  }
}
