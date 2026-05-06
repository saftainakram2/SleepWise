import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings, updateSettings } from '../lib/db';
import { SleepDebtService } from '../services/sleepDebtService';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, TrendingDown, Target, Save } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '../lib/utils';

export function SleepDebtScreen() {
  const settings = useLiveQuery(() => getSettings());
  const allEntries = useLiveQuery(() => db.sleepEntries.toArray());

  if (!settings || !allEntries) return null;

  const debt = SleepDebtService.calculateWeeklyDebt(allEntries, settings.sleepGoalHours);
  const paybackPlan = SleepDebtService.getPaybackPlan(debt);

  const debtData = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(new Date(), i);
    const dateStr = d.toISOString().split('T')[0];
    const historicalEntries = allEntries.filter(e => new Date(e.date) <= d);
    return {
        date: format(d, 'MMM d'),
        debt: SleepDebtService.calculateWeeklyDebt(historicalEntries, settings.sleepGoalHours)
    };
  }).reverse();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold mb-1">Sleep Debt</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Recovery & Persistence</p>
      </header>

      <div className="bg-card-dark p-8 rounded-3xl border border-border-dark text-center relative overflow-hidden">
        <div className={cn(
            "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20",
            debt > 0 ? "bg-red-500" : "bg-green-500"
        )} />
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Current Weekly Balance</p>
        <h2 className={cn("text-6xl font-black mb-4", debt > 0 ? "text-sleep-poor" : "text-sleep-good")}>
            {debt > 0 ? `-${debt.toFixed(1)}` : `+${Math.abs(debt).toFixed(1)}`}
            <span className="text-2xl ml-1">hrs</span>
        </h2>
        <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm",
            debt > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
        )}>
            {debt > 0 ? <AlertCircle size={16} /> : <TrendingDown size={16} />}
            {debt > 0 ? 'Action Recommended' : 'Excellent Recovery'}
        </div>
      </div>

      <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
        <h3 className="font-bold mb-6">30-Day Debt Trend</h3>
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={debtData}>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: '12px' }}
                        itemStyle={{ color: '#7c6bff' }}
                    />
                    <Line type="stepAfter" dataKey="debt" stroke={debt > 0 ? "#ef4444" : "#22c55e"} strokeWidth={3} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-primary-accent/10 border border-primary-accent/20 p-6 rounded-3xl">
        <h3 className="font-bold text-primary-accent mb-2 flex items-center gap-2">
            <TrendingDown size={20} /> Recovery Plan
        </h3>
        <p className="font-medium text-text-primary/90">{paybackPlan}</p>
      </div>

      <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
        <h3 className="font-bold mb-6 flex items-center gap-2"><Target size={20} /> Adjust Sleep Goal</h3>
        <div className="flex items-center gap-6">
            <input 
                type="range" min="6" max="10" step="0.5" value={settings.sleepGoalHours} 
                onChange={async (e) => {
                    await updateSettings({ sleepGoalHours: parseFloat(e.target.value) });
                }}
                className="flex-1 h-3 bg-bg-dark rounded-full appearance-none accent-primary-accent"
            />
            <span className="text-3xl font-extrabold text-primary-accent min-w-[80px] text-right">{settings.sleepGoalHours}h</span>
        </div>
        <p className="text-xs text-text-muted mt-4 font-semibold italic">Changing this goal will recalculate your historical debt.</p>
      </div>
    </div>
  );
}
