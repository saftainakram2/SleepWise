import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from '../lib/db';
import { Share2, Download, Award, Moon, TrendingUp, Smile } from 'lucide-react';
import { cn, getScoreColor, getScoreBg } from '../lib/utils';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export function ScoreCardScreen() {
  const settings = useLiveQuery(() => getSettings());
  const entries = useLiveQuery(() => db.sleepEntries.toArray());

  if (!settings || !entries || entries.length < 3) {
      return (
          <div className="flex flex-col items-center justify-center p-10 bg-card-dark rounded-3xl border border-dashed border-border-dark text-center">
              <div className="w-16 h-16 bg-border-dark/30 rounded-full flex items-center justify-center mb-4">
                  <Award size={32} className="text-text-muted" />
              </div>
              <h2 className="text-xl font-bold mb-2">Insufficient Data</h2>
              <p className="text-text-muted text-sm">Log at least 3 nights of sleep to generate your weekly scorecard.</p>
          </div>
      )
  }

  const last7Days = entries.slice(-7);
  const avgScore = last7Days.reduce((a, b) => a + b.sleepScore, 0) / last7Days.length;
  const avgDuration = last7Days.reduce((a, b) => a + b.durationHours, 0) / last7Days.length;
  
  const getGrade = (score: number) => {
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      return 'D';
  };

  const grade = getGrade(avgScore);

  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-3xl font-extrabold mb-1">Scorecard</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Share Your Progress</p>
      </header>

      {/* The Actual Card to Share */}
      <div id="share-card" className="bg-card-dark aspect-[4/5] rounded-[2rem] border border-border-dark relative overflow-hidden p-8 shadow-2xl flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <Moon size={120} className="text-primary-accent" />
          </div>

          <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-accent mb-1">Weekly Report</p>
                <h3 className="text-2xl font-black">SleepWise</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-accent/10 flex items-center justify-center text-primary-accent">
                < Award size={24} />
              </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-10 z-10">
              <div className="text-9xl font-black bg-gradient-to-br from-white to-text-muted bg-clip-text text-transparent transform -skew-x-6">
                {grade}
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-text-muted mt-2">Overall Sleep Grade</p>
          </div>

          <div className="grid grid-cols-2 gap-4 z-10">
              <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-dark">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                      <Moon size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                  </div>
                  <p className="text-xl font-black">{avgDuration.toFixed(1)}h</p>
              </div>
              <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-dark">
                  <div className="flex items-center gap-2 text-text-muted mb-1">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Score</span>
                  </div>
                  <p className="text-xl font-black">{Math.round(avgScore)}</p>
              </div>
              <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-dark col-span-2 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-text-muted">
                      <Smile size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Consistency</span>
                  </div>
                  <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                          <div key={i} className={cn("w-2 h-2 rounded-full", i <= 4 ? "bg-primary-accent" : "bg-border-dark")} />
                      ))}
                  </div>
              </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border-dark/50 text-center z-10">
              <p className="text-[10px] font-black uppercase text-text-muted opacity-50 tracking-widest italic">sleepwise.app • improving rest since 2026</p>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button 
            className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-card-dark border border-border-dark font-extrabold hover:bg-card-dark/80 transition-all"
            onClick={() => alert('Card saved to gallery')}
          >
              <Download size={20} />
              Save Image
          </button>
          <button 
            className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary-accent text-white font-extrabold hover:scale-105 transition-all shadow-xl shadow-primary-accent/20"
            onClick={() => alert('Opening share sheet...')}
          >
              <Share2 size={20} />
              Share
          </button>
      </div>
    </div>
  );
}
