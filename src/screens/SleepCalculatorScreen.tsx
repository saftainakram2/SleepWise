import React, { useState } from 'react';
import { Clock, Moon, Sun, Zap, Info, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addMinutes, subMinutes } from 'date-fns';

export function SleepCalculatorScreen() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
  const [time, setTime] = useState('07:00');

  const calculateCycles = () => {
    const baseTime = new Date();
    const [hours, mins] = time.split(':').map(Number);
    baseTime.setHours(hours, mins, 0, 0);

    const cycles = [];
    // A sleep cycle is roughly 90 minutes
    // We add 15 minutes for falling asleep
    for (let i = 1; i <= 6; i++) {
        if (mode === 'wake') {
            // "I want to wake up at..." -> calculated when to sleep
            const sleepTime = subMinutes(baseTime, (i * 90) + 15);
            cycles.push({
                time: format(sleepTime, 'HH:mm'),
                cycles: i,
                hours: (i * 1.5).toFixed(1)
            });
        } else {
            // "I'm going to sleep now..." -> calculated when to wake
            const wakeTime = addMinutes(baseTime, (i * 90) + 15);
            cycles.push({
                time: format(wakeTime, 'HH:mm'),
                cycles: i,
                hours: (i * 1.5).toFixed(1)
            });
        }
    }
    return cycles.reverse();
  };

  const results = calculateCycles();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black mb-1">Sleep Calculator</h1>
        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Optimize Your Waking</p>
      </header>

      <div className="bg-card-dark rounded-[40px] border border-border-dark p-8 shadow-pro">
        <div className="flex bg-bg-dark p-1 rounded-2xl mb-8">
            <button 
                onClick={() => setMode('wake')}
                className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", mode === 'wake' ? "bg-primary-accent text-white" : "text-text-muted")}
            >
                Wake Up Time
            </button>
            <button 
                onClick={() => setMode('sleep')}
                className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", mode === 'sleep' ? "bg-primary-accent text-white" : "text-text-muted")}
            >
                Sleep Time
            </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                {mode === 'wake' ? 'When do you want to wake up?' : 'When are you going to bed?'}
            </label>
            <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-5xl font-black bg-transparent border-none focus:outline-none text-center selection:bg-primary-accent/30"
            />
        </div>

        <div className="grid grid-cols-1 gap-3">
            {results.map((res, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "flex items-center justify-between p-5 rounded-3xl border transition-all",
                        res.cycles === '5' || res.cycles === '6' ? "bg-primary-accent/10 border-primary-accent/30" : "bg-bg-dark border-border-dark"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", res.cycles === '5' || res.cycles === '6' ? "bg-primary-accent text-white" : "bg-card-dark text-text-muted")}>
                            {mode === 'wake' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                            <p className="text-xl font-black">{res.time}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase">{res.hours}h of sleep</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn("text-xs font-black uppercase tracking-widest", res.cycles === '5' || res.cycles === '6' ? "text-primary-accent" : "text-text-muted")}>
                            {res.cycles} Cycles
                        </p>
                        {res.cycles === '5' && <p className="text-[9px] font-bold text-green-500 uppercase">Recommended</p>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="p-6 bg-primary-accent/5 border border-primary-accent/10 rounded-[32px] flex gap-4">
          <Info className="flex-shrink-0 text-primary-accent" />
          <div className="space-y-2">
            <p className="text-xs font-bold leading-relaxed text-text-primary/90">
                Waking up mid-cycle leaves you feeling groggy. 
            </p>
            <p className="text-[10px] font-bold leading-relaxed text-text-muted">
                Each cycle is ~90 mins. We allow 15 mins for falling asleep. Aim for 5-6 cycles for peak brain performance.
            </p>
          </div>
      </div>
    </div>
  );
}
