import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SleepScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function SleepScoreRing({ score, size = 160, strokeWidth = 12 }: SleepScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#22c55e';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-border-dark)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-extrabold"
        >
          {score}
        </motion.span>
        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}
