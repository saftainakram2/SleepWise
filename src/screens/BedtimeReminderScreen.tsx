import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings, updateSettings } from '../lib/db';
import { Clock, Bell, Wind, Sun, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, parse, addHours, subHours } from 'date-fns';

export function BedtimeReminderScreen() {
  const settings = useLiveQuery(() => getSettings());
  const [sleepCycle, setSleepCycle] = useState(5); // 5 cycles = 7.5 hours

  if (!settings) return null;

  const wakeDate = parse(settings.targetWakeTime, 'HH:mm', new Date());
  const sleepHours = sleepCycle * 1.5;
  const bedtimeDate = subHours(wakeDate, sleepHours);
  const formattedBedtime = format(bedtimeDate, 'hh:mm a');

  const cycles = [
    { name: 'Power Nap', cycles: 1, hours: 1.5, desc: 'Quick recovery' },
    { name: 'Core Sleep', cycles: 4, hours: 6, desc: 'Bare minimum' },
    { name: 'Standard', cycles: 5, hours: 7.5, desc: 'Recommended' },
    { name: 'Optimal', cycles: 6, hours: 9, desc: 'Maximum recovery' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-extrabold mb-1">Reminders</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Optimized Sleep Schedule</p>
      </header>

      <div className="bg-card-dark p-8 rounded-[2rem] border border-border-dark text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 text-center">Ideal Bedtime</p>
          <div className="text-6xl font-black text-primary-accent mb-6 animate-pulse">
              {formattedBedtime}
          </div>
          <div className="px-6 py-2 bg-primary-accent/10 rounded-2xl inline-flex items-center gap-2 text-primary-accent font-bold text-sm">
            <Clock size={16} />
            Based on {sleepHours} hours of sleep
          </div>
      </div>

      <section>
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mb-4 flex items-center gap-2">
            <Sun size={14} /> Set Wake Time
          </h3>
          <div className="bg-card-dark p-6 rounded-3xl border border-border-dark flex justify-between items-center mb-10">
              <input 
                type="time" 
                value={settings.targetWakeTime}
                onChange={async (e) => await updateSettings({ targetWakeTime: e.target.value })}
                className="bg-transparent text-4xl font-extrabold text-white w-full focus:outline-none"
              />
          </div>

          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mb-4">Select Sleep Length</h3>
          <div className="grid grid-cols-1 gap-3">
              {cycles.map(c => (
                  <button
                    key={c.cycles}
                    onClick={() => setSleepCycle(c.cycles)}
                    className={cn(
                        "p-5 rounded-3xl border-2 flex items-center justify-between text-left transition-all",
                        sleepCycle === c.cycles ? "bg-primary-accent/10 border-primary-accent" : "bg-card-dark border-transparent opacity-60"
                    )}
                  >
                      <div className="flex gap-4 items-center">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black", sleepCycle === c.cycles ? "bg-primary-accent text-white" : "bg-bg-dark text-text-muted")}>
                            {c.hours}h
                        </div>
                        <div>
                            <p className="font-extrabold">{c.name}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{c.desc}</p>
                        </div>
                      </div>
                      {sleepCycle === c.cycles && <div className="w-6 h-6 bg-primary-accent rounded-full flex items-center justify-center text-white"><ChevronRight size={16} /></div>}
                  </button>
              ))}
          </div>

          <div className="mt-10 space-y-4">
               <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mb-4">Automation</h3>
               <div className="bg-card-dark p-5 rounded-3xl border border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-500 rounded-xl text-white"><Wind size={20} /></div>
                        <div>
                            <p className="font-bold">Wind-Down Phase</p>
                            <p className="text-xs text-text-muted">Nudge 30 min before bed</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })}
                        className={cn("w-12 h-6 rounded-full transition-colors relative", settings.reminderEnabled ? "bg-primary-accent" : "bg-border-dark")}
                    >
                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", settings.reminderEnabled ? "left-7" : "left-1")} />
                    </button>
               </div>
          </div>
      </section>
    </div>
  );
}
