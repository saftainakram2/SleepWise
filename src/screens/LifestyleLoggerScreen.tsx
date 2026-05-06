import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Coffee, Brain, Dumbbell, Smartphone, Wine, Save, ThermometerSun, Volume2 } from 'lucide-react';
import { db } from '../lib/db';
import { cn } from '../lib/utils';
import { startOfDay } from 'date-fns';

const STRESS_LEVELS = [
    { emoji: '😌', label: 'Very Low', val: 1 },
    { emoji: '🙂', label: 'Low', val: 2 },
    { emoji: '😐', label: 'Moderate', val: 3 },
    { emoji: '😓', label: 'High', val: 4 },
    { emoji: '😫', label: 'Very High', val: 5 },
];

export function LifestyleLoggerScreen() {
  const navigate = useNavigate();
  const [caffeine, setCaffeine] = useState(0);
  const [lastCaffeine, setLastCaffeine] = useState('14:00');
  const [exercised, setExercised] = useState(false);
  const [intensity, setIntensity] = useState(2);
  const [screenTime, setScreenTime] = useState(60);
  const [stress, setStress] = useState(3);
  const [alcohol, setAlcohol] = useState(false);
  
  const [temperature, setTemperature] = useState(68);
  const [noiseLevel, setNoiseLevel] = useState<'quiet' | 'moderate' | 'loud'>('quiet');

  const handleSave = async () => {
    const today = startOfDay(new Date()).toISOString();
    
    await db.lifestyleEntries.add({
      date: today,
      caffeineCount: caffeine,
      lastCaffeineTime: lastCaffeine,
      exercisedToday: exercised,
      exerciseIntensity: intensity,
      screenTimeMinutes: screenTime,
      stressLevel: stress,
      alcoholConsumed: alcohol
    });
    
    await db.environmentEntries.add({
      date: today,
      temperatureStart: temperature,
      noiseLevel: noiseLevel,
      lightLevel: 'dark' // Default for now
    });

    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-bg-dark z-50 overflow-y-auto pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
            <X size={28} />
          </button>
          <h1 className="text-xl font-extrabold">Log Factors</h1>
          <div className="w-10 text-primary-accent" onClick={handleSave}>
            <Save size={24} />
          </div>
        </header>

        <div className="space-y-8">
            {/* Environment Section */}
            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-1 mb-2">Environment</h3>
                
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><ThermometerSun size={20} /></div>
                        <h3 className="font-bold">Room Temperature</h3>
                    </div>
                    <div className="flex justify-between font-bold mb-4">
                        <span className="text-text-muted text-sm uppercase tracking-widest">At bedtime</span>
                        <span className="text-primary-accent">{temperature}°F</span>
                    </div>
                    <input 
                        type="range" min="50" max="90" step="1" value={temperature} 
                        onChange={e => setTemperature(parseInt(e.target.value))}
                        className="w-full h-2 bg-bg-dark rounded-full appearance-none accent-primary-accent"
                    />
                </div>

                <div className="h-px bg-border-dark" />

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl"><Volume2 size={20} /></div>
                        <h3 className="font-bold">Ambient Noise</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(['quiet', 'moderate', 'loud'] as const).map(level => (
                            <button 
                                key={level}
                                onClick={() => setNoiseLevel(level)}
                                className={cn(
                                    "py-3 rounded-2xl text-xs font-extrabold transition-all border-2 capitalize",
                                    noiseLevel === level ? "bg-primary-accent/20 border-primary-accent text-primary-accent" : "bg-bg-dark border-transparent text-text-muted hover:border-border-dark"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-1 pt-4">Habits</h3>
            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl"><Coffee size={20} /></div>
                    <h3 className="font-bold">Caffeine</h3>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold">Cups today</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCaffeine(Math.max(0, caffeine-1))} className="w-10 h-10 rounded-xl bg-border-dark flex items-center justify-center font-bold text-xl">-</button>
                        <span className="w-4 text-center font-extrabold text-2xl">{caffeine}</span>
                        <button onClick={() => setCaffeine(caffeine+1)} className="w-10 h-10 rounded-xl bg-border-dark flex items-center justify-center font-bold text-xl">+</button>
                    </div>
                </div>
                {caffeine > 0 && (
                    <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-bold text-text-muted">Last cup at</span>
                        <input type="time" value={lastCaffeine} onChange={e => setLastCaffeine(e.target.value)} className="bg-bg-dark px-3 py-1 rounded-lg text-primary-accent font-bold" />
                    </div>
                )}
            </section>

            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/10 text-green-500 rounded-xl"><Dumbbell size={20} /></div>
                    <h3 className="font-bold">Exercise</h3>
                    <div className="ml-auto">
                        <button 
                            onClick={() => setExercised(!exercised)}
                            className={cn("w-12 h-6 rounded-full transition-colors relative", exercised ? "bg-primary-accent" : "bg-border-dark")}
                        >
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", exercised ? "left-7" : "left-1")} />
                        </button>
                    </div>
                </div>
                {exercised && (
                     <div className="flex justify-between gap-2">
                        {[1, 2, 3].map(v => (
                            <button 
                                key={v}
                                onClick={() => setIntensity(v)}
                                className={cn(
                                    "flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all border-2",
                                    intensity === v ? "bg-primary-accent/20 border-primary-accent text-primary-accent" : "bg-bg-dark border-transparent text-text-muted hover:border-border-dark"
                                )}
                            >
                                {v === 1 ? 'LIGHT' : v === 2 ? 'MODERATE' : 'INTENSE'}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Smartphone size={20} /></div>
                    <h3 className="font-bold">Screen Time</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between font-bold">
                        <span className="text-text-muted text-sm uppercase tracking-widest">Minutes before bed</span>
                        <span className="text-primary-accent">{screenTime} min</span>
                    </div>
                    <input 
                        type="range" min="0" max="180" step="15" value={screenTime} 
                        onChange={e => setScreenTime(parseInt(e.target.value))}
                        className="w-full h-2 bg-bg-dark rounded-full appearance-none accent-primary-accent"
                    />
                </div>
            </section>

            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><Brain size={20} /></div>
                    <h3 className="font-bold">Stress Level</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {STRESS_LEVELS.map(s => (
                        <button
                            key={s.val}
                            onClick={() => setStress(s.val)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all",
                                stress === s.val ? "bg-primary-accent/10 border-primary-accent" : "bg-bg-dark border-transparent hover:border-border-dark"
                            )}
                        >
                            <span className="text-2xl">{s.emoji}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="bg-card-dark p-6 rounded-3xl border border-border-dark flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Wine size={20} /></div>
                    <h3 className="font-bold">Alcohol Consumed</h3>
                </div>
                <button 
                    onClick={() => setAlcohol(!alcohol)}
                    className={cn("w-12 h-6 rounded-full transition-colors relative", alcohol ? "bg-primary-accent" : "bg-border-dark")}
                >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", alcohol ? "left-7" : "left-1")} />
                </button>
            </section>
        </div>

        <button 
            onClick={handleSave}
            className="mt-10 w-full py-5 rounded-3xl bg-primary-accent text-white font-extrabold shadow-xl shadow-primary-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
            Save Log
        </button>
      </div>
    </div>
  );
}
