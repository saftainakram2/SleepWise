import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function getScoreColor(score: number) {
  if (score >= 70) return 'text-sleep-good';
  if (score >= 50) return 'text-sleep-fair';
  return 'text-sleep-poor';
}

export function getScoreBg(score: number) {
  if (score >= 70) return 'bg-sleep-good';
  if (score >= 50) return 'bg-sleep-fair';
  return 'bg-sleep-poor';
}
