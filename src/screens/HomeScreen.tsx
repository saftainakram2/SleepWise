import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from '../lib/db';
import { SleepScoreRing } from '../components/SleepScoreRing';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChevronRight, AlertCircle, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { SleepDebtService } from '../services/sleepDebtService';
import { BadgeService } from '../services/badgeService';
import { cn } from '../lib/utils';

export function HomeScreen() {
  const sleepEntries = useLiveQuery(() => db.sleepEntries.orderBy('date').reverse().limit(7).toArray());
  const settings = useLiveQuery(() => getSettings());
  const allEntries = useLiveQuery(() => db.sleepEntries.toArray());

  const lastEntry = sleepEntries?.[0];
  const chartData = sleepEntries?.slice().reverse().map(e => ({
    day: format(new Date(e.date), 'EEE').toUpperCase(),
    duration: e.durationHours,
    score: e.sleepScore
  })) || [];

  const debt = allEntries && settings ? SleepDebtService.calculateWeeklyDebt(allEntries, settings.sleepGoalHours) : 0;
  const badges = allEntries ? BadgeService.checkBadges(allEntries, debt) : [];

  const calculateStreak = () => {
      if (!allEntries || allEntries.length === 0) return 0;
      let streak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const sortedDates = [...new Set(allEntries.map(e => {
          const d = new Date(e.date);
          d.setHours(0,0,0,0);
          return d.getTime();
      }))].sort((a,b) => b-a);

      let currentCheck = today.getTime();
      
      // If today is logged or yesterday is logged
      if (sortedDates[0] === currentCheck || sortedDates[0] === currentCheck - 86400000) {
          let testDate = sortedDates[0];
          for (let ms of sortedDates) {
              if (ms === testDate) {
                  streak++;
                  testDate -= 86400000;
              } else {
                  break;
              }
          }
      }
      return streak;
  };
  const streak = calculateStreak();

  return (
    <div className="space-y-8">
      {/* Design-inspired Nav Header */}
      <nav className="flex justify-between items-start pt-4">
        <div>
          <h2 className="text-text-muted text-xs font-bold tracking-widest uppercase mb-1">{format(new Date(), 'EEEE, MMMM do').toUpperCase()}</h2>
          <h1 className="text-3xl font-black tracking-tight leading-none">{settings?.greeting || 'Good morning'}, {settings?.name || 'Dreamer'}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-card-dark border border-border-dark px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-orange-500">🔥 {streak} Streak</span>
            </div>
            <Link to="/settings" className="w-10 h-10 rounded-full bg-card-dark border border-border-dark overflow-hidden flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
              {settings?.avatar ? (
                  <img src={settings?.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <User size={20} />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Score Card */}
      <div className="bg-card-dark rounded-[32px] p-8 border border-border-dark flex flex-col items-center shadow-xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-accent/5 blur-3xl group-hover:bg-primary-accent/10 transition-colors"></div>
        <SleepScoreRing score={lastEntry?.sleepScore || 0} size={192} strokeWidth={14} />
        
        <div className="mt-8 flex items-center gap-2 text-sleep-good font-bold bg-sleep-good/10 px-4 py-1.5 rounded-full text-sm">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>
           <span>{lastEntry?.sleepScore && lastEntry.sleepScore > 70 ? 'Optimal recovery' : 'Room for improvement'}</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Duration</p>
          <p className="text-2xl font-black">
             {lastEntry ? `${Math.floor(lastEntry.durationHours)}h ${Math.round((lastEntry.durationHours % 1) * 60)}m` : '--'}
          </p>
          <div className="mt-4 w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary-accent h-full rounded-full transition-all duration-1000" 
              style={{ width: lastEntry ? `${Math.min(100, (lastEntry.durationHours / (settings?.sleepGoalHours || 8)) * 100)}%` : '0%' }}
            />
          </div>
        </div>

        <Link to="/debt" className="bg-card-dark border border-border-dark rounded-2xl p-6 group hover:border-sleep-poor/30 transition-colors">
          <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Sleep Debt</p>
          <p className={cn("text-2xl font-black", debt > 0 ? "text-sleep-poor" : "text-sleep-good")}>
            {debt > 0 ? `-${debt.toFixed(1)}h` : `+${Math.abs(debt).toFixed(1)}h`}
          </p>
          <p className="text-[10px] font-bold text-text-muted mt-4 group-hover:text-text-primary flex items-center gap-1 transition-colors">
             PAYBACK PLAN <ChevronRight size={12} />
          </p>
        </Link>
      </div>

      {/* Chart Section - Refined */}
      <div className="bg-card-dark rounded-[32px] p-8 border border-border-dark relative">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-lg font-black">Duration Trends</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary-accent rounded-full text-[10px] font-black text-white tracking-widest">WEEK</span>
            <Link to="/analytics" className="px-3 py-1 bg-border-dark rounded-full text-[10px] font-black text-text-muted tracking-widest hover:text-text-primary transition-colors">MONTH</Link>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 800 }} 
                dy={12}
              />
              <Bar dataKey="duration" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === chartData.length - 1 ? 'var(--color-primary-accent)' : 'var(--color-border-dark)'} 
                    className={index === chartData.length - 1 ? 'shadow-[0_0_20px_rgba(124,107,255,0.3)]' : ''}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges Row - Cleaned up */}
      {badges.length > 0 && (
        <section>
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 ml-1">Latest Achievements</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {badges.map(badge => (
              <div key={badge.id} className="flex-shrink-0 bg-card-dark border border-border-dark p-4 rounded-3xl flex items-center gap-4 min-w-[160px]">
                <div className="w-12 h-12 bg-bg-dark rounded-2xl flex items-center justify-center text-2xl border border-border-dark">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs font-black whitespace-nowrap tracking-tight">{badge.name}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">EARNED</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
