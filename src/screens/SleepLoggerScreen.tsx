import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { db, getSettings } from '../lib/db';
import { SleepScoreService } from '../services/sleepScoreService';
import confetti from 'canvas-confetti';
import { format, differenceInMinutes, parse, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';

const MOODS = [
  { emoji: '😩', val: 1 },
  { emoji: '😕', val: 2 },
  { emoji: '😐', val: 3 },
  { emoji: '🙂', val: 4 },
  { emoji: '😄', val: 5 },
];

export function SleepLoggerScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(7);
  const [mood, setMood] = useState(3);
  const [disturbances, setDisturbances] = useState(0);
  const [notes, setNotes] = useState('');

  const calculateDuration = () => {
    const today = new Date();
    const b = parse(bedtime, 'HH:mm', today);
    let w = parse(wakeTime, 'HH:mm', today);
    if (w < b) w = new Date(w.getTime() + 24 * 60 * 60 * 1000);
    return differenceInMinutes(w, b) / 60;
  };

  const handleSave = async () => {
    const duration = calculateDuration();
    const settings = await getSettings();
    const score = SleepScoreService.calculateSleepScore(
      { bedtime, wakeTime, durationHours: duration, qualityRating: quality, date: new Date().toISOString() } as any,
      settings.sleepGoalHours
    );

    await db.sleepEntries.add({
      date: startOfDay(new Date()).toISOString(),
      bedtime: new Date(parse(bedtime, 'HH:mm', new Date())).toISOString(),
      wakeTime: new Date(parse(wakeTime, 'HH:mm', new Date())).toISOString(),
      durationHours: duration,
      qualityRating: quality,
      moodOnWaking: mood,
      disturbances,
      sleepScore: score,
      notes
    });

    if (score >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-bg-dark z-50 overflow-y-auto px-6 py-8">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
            <X size={28} />
          </button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary-accent' : 'bg-border-dark'}`} />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-extrabold mb-2">When did you sleep?</h2>
                  <p className="text-text-muted font-semibold">Tweak your bedtime and wake up time.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-4">Bedtime</label>
                    <input 
                      type="time" 
                      value={bedtime} 
                      onChange={e => setBedtime(e.target.value)}
                      className="text-5xl font-extrabold bg-transparent w-full focus:outline-none text-primary-accent"
                    />
                  </div>
                  <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-4">Wake Up Time</label>
                    <input 
                      type="time" 
                      value={wakeTime} 
                      onChange={e => setWakeTime(e.target.value)}
                      className="text-5xl font-extrabold bg-transparent w-full focus:outline-none text-secondary-accent"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-text-muted font-bold text-sm uppercase mb-1">Total Duration</p>
                  <p className="text-3xl font-extrabold">{calculateDuration().toFixed(1)} hrs</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-3xl font-extrabold mb-2">Sleep Quality</h2>
                  <p className="text-text-muted font-semibold">How deep was your sleep last night?</p>
                </div>

                <div className="bg-card-dark p-10 rounded-3xl border border-border-dark text-center">
                  <div className="text-7xl mb-8">
                    {quality <= 3 ? '😴' : quality <= 7 ? '🙂' : '🌟'}
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={quality} 
                    onChange={e => setQuality(parseInt(e.target.value))}
                    className="w-full h-3 bg-border-dark rounded-full appearance-none cursor-pointer accent-primary-accent"
                  />
                  <div className="flex justify-between mt-4 text-sm font-bold text-text-muted">
                    <span>1</span>
                    <span className="text-2xl text-text-primary">{quality}</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="bg-card-dark p-6 rounded-3xl border border-border-dark space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-bold">Disturbances</label>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setDisturbances(Math.max(0, disturbances-1))} className="w-10 h-10 rounded-xl bg-border-dark flex items-center justify-center font-bold text-xl">-</button>
                        <span className="w-4 text-center font-extrabold">{disturbances}</span>
                        <button onClick={() => setDisturbances(disturbances+1)} className="w-10 h-10 rounded-xl bg-border-dark flex items-center justify-center font-bold text-xl">+</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-3xl font-extrabold mb-2">Morning Mood</h2>
                  <p className="text-text-muted font-semibold">How do you feel right now?</p>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {MOODS.map(m => (
                    <button
                      key={m.val}
                      onClick={() => setMood(m.val)}
                      className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-200 border-2",
                        mood === m.val ? "bg-primary-accent/20 border-primary-accent scale-110 shadow-lg" : "bg-card-dark border-transparent scale-100"
                      )}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>

                <div className="bg-card-dark p-6 rounded-3xl border border-border-dark">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Optional Notes</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="E.g. Drank coffee late, noisy street..."
                    className="w-full bg-transparent focus:outline-none min-h-[100px] resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-8 flex gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="p-5 rounded-2xl bg-card-dark border border-border-dark text-text-primary"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleSave()}
            className="flex-1 p-5 rounded-2xl bg-primary-accent text-white font-extrabold flex items-center justify-center gap-2"
          >
            {step < 3 ? (
              <>Next <ChevronRight size={24} /></>
            ) : (
              <><Save size={24} /> Save Log</>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
