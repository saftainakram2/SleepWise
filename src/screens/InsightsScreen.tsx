import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { PatternInsightService } from '../services/patternInsightService';
import { Lightbulb, Coffee, Brain, Clock, TrendingUp, Info, ThermometerSun, VolumeX } from 'lucide-react';
import { ProGateWidget } from '../widgets/ProGateWidget';
import { cn } from '../lib/utils';

export function InsightsScreen() {
  const sleepEntries = useLiveQuery(() => db.sleepEntries.toArray());
  const lifestyleEntries = useLiveQuery(() => db.lifestyleEntries.toArray());
  const environmentEntries = useLiveQuery(() => db.environmentEntries ? db.environmentEntries.toArray() : Promise.resolve([]));

  const insights = sleepEntries && lifestyleEntries ? PatternInsightService.detectPatterns(sleepEntries, lifestyleEntries, environmentEntries || []) : [];

  return (
    <ProGateWidget title="AI Sleep Insights">
      <div className="space-y-8">
         <header>
          <h1 className="text-3xl font-extrabold mb-1">Insights</h1>
          <p className="text-text-muted font-bold uppercase text-xs tracking-widest">AI Pattern Detection</p>
        </header>

      {insights.length === 0 ? (
        <div className="bg-card-dark p-8 rounded-3xl border border-border-dark text-center space-y-4">
             <div className="w-16 h-16 bg-border-dark/30 rounded-full flex items-center justify-center mx-auto text-text-muted">
                <Info size={32} />
             </div>
             <h2 className="text-xl font-bold">More data needed</h2>
             <p className="text-text-muted font-medium">Log at least 7 nights of sleep and lifestyle data to unlock your personalized insights.</p>
             <div className="pt-4 flex justify-center gap-1">
                {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i <= (sleepEntries?.length || 0) ? 'bg-primary-accent' : 'bg-border-dark'}`} />
                ))}
             </div>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="bg-primary-accent p-6 rounded-3xl text-white shadow-xl shadow-primary-accent/20">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Weekly Highlight</h3>
                <p className="text-xl font-extrabold leading-tight">{insights[0].headline}</p>
                <p className="mt-2 text-white/90 font-medium">{insights[0].explanation}</p>
            </div>

            {insights.slice(1).map((insight, idx) => {
                const getIcon = (type: string) => {
                    switch (type) {
                        case 'caffeine': return <Coffee size={24} />;
                        case 'stress': return <Brain size={24} />;
                        case 'consistency': return <Clock size={24} />;
                        case 'trend': return <TrendingUp size={24} />;
                        case 'temperature': return <ThermometerSun size={24} />;
                        case 'noise': return <VolumeX size={24} />;
                        default: return <Lightbulb size={24} />;
                    }
                };
                const getTheme = (type: string) => {
                    switch (type) {
                        case 'caffeine': return 'text-[#3de8c8] bg-[#3de8c8]/10 border-[#3de8c8]/20';
                        case 'stress': return 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20';
                        case 'trend': return 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20';
                        case 'temperature': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                        case 'noise': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                        default: return 'text-[#7c6bff] bg-[#7c6bff]/10 border-[#7c6bff]/20';
                    }
                };
                return (
                    <div key={idx} className={cn("p-6 rounded-3xl border flex gap-4 items-start", getTheme(insight.type))}>
                        <div className="p-3 rounded-2xl bg-white/10 shrink-0">
                            {getIcon(insight.type)}
                        </div>
                        <div>
                            <h4 className="font-extrabold text-lg mb-1">{insight.headline}</h4>
                            <p className="text-sm font-medium opacity-90">{insight.explanation}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      )}

      {sleepEntries && sleepEntries.length >= 14 && (
        <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
            <h3 className="font-bold mb-4">Correlation Factors</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-bg-dark/50 p-4 rounded-2xl">
                    <span className="text-sm font-bold">Caffeine vs Quality</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-orange-500/20 text-orange-500">Strong</span>
                </div>
                <div className="flex justify-between items-center bg-bg-dark/50 p-4 rounded-2xl">
                    <span className="text-sm font-bold">Stress vs Duration</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-500/20 text-red-500">Critical</span>
                </div>
                <div className="flex justify-between items-center bg-bg-dark/50 p-4 rounded-2xl">
                    <span className="text-sm font-bold">Exercise vs Deep Sleep</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-500/20 text-green-500">Positive</span>
                </div>
            </div>
        </div>
      )}
      </div>
    </ProGateWidget>
  );
}

