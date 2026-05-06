import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { ProGateWidget } from '../widgets/ProGateWidget';
import { cn } from '../lib/utils';

export function AnalyticsScreen() {
  const [range, setRange] = useState<'week' | 'month' | 'threeMonths'>('week');
  const daysLimit = range === 'week' ? 7 : range === 'month' ? 30 : 90;

  const entries = useLiveQuery(() => 
    db.sleepEntries.orderBy('date').reverse().limit(daysLimit).toArray()
  , [daysLimit]);

  if (!entries) return null;

  const chartData = entries.slice().reverse().map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    duration: e.durationHours,
    score: e.sleepScore
  }));

  const avgDuration = entries.length ? entries.reduce((a, b) => a + b.durationHours, 0) / entries.length : 0;
  const avgScore = entries.length ? entries.reduce((a, b) => a + b.sleepScore, 0) / entries.length : 0;
  const bestNight = entries.length ? Math.max(...entries.map(e => e.sleepScore)) : 0;

  const qualityStats = [
    { name: 'Good', value: entries.filter(e => e.sleepScore >= 70).length },
    { name: 'Fair', value: entries.filter(e => e.sleepScore >= 50 && e.sleepScore < 70).length },
    { name: 'Poor', value: entries.filter(e => e.sleepScore < 50).length },
  ];

  const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold mb-1">Analytics</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Sleep Trends & Stats</p>
      </header>

      <div className="flex bg-card-dark p-1 rounded-2xl border border-border-dark">
        {(['week', 'month', 'threeMonths'] as const).map(r => (
            <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${range === r ? 'bg-primary-accent text-white' : 'text-text-muted'}`}
            >
                {r === 'week' ? 'Week' : r === 'month' ? 'Month' : '3 Months'}
            </button>
        ))}
      </div>

      <ProGateWidget title={range === 'week' ? 'Basic Stats' : 'Advanced Analytics'}>
        <div className={cn("space-y-8 transition-all", range !== 'week' && "mt-4")}>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card-dark p-6 rounded-[32px] border border-border-dark shadow-sm">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Avg Duration</p>
                <p className="text-3xl font-black text-primary-accent">{avgDuration.toFixed(1)}h</p>
            </div>
            <div className="bg-card-dark p-6 rounded-[32px] border border-border-dark shadow-sm">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Avg Score</p>
                <p className="text-3xl font-black text-secondary-accent">{Math.round(avgScore)}</p>
            </div>
          </div>

          <div className="bg-card-dark p-8 rounded-[32px] border border-border-dark">
            <h3 className="text-lg font-black mb-10">Duration Trend</h3>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: '16px' }}
                            itemStyle={{ color: '#7c6bff' }}
                        />
                        <Line type="monotone" dataKey="duration" stroke="#7c6bff" strokeWidth={5} dot={false} animationDuration={1500} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
            <h3 className="font-bold mb-6">Sleep Score Breakdown</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.score >= 70 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-dark p-6 rounded-3xl border border-border-dark flex items-center justify-between">
            <div>
                <h3 className="font-bold mb-1">Quality Distribution</h3>
                <div className="space-y-1 mt-4">
                    {qualityStats.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span className="text-xs font-bold text-text-muted">{s.name}: {s.value} nights</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={qualityStats} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                            {qualityStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ProGateWidget>
    </div>
  );
}
