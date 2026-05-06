import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Bell, ArrowRight } from 'lucide-react';
import { updateSettings } from '../lib/db';

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(8);
  const [wakeTime, setWakeTime] = useState('07:00');

  const handleFinish = async () => {
    await updateSettings({
      name,
      sleepGoalHours: goal,
      targetWakeTime: wakeTime,
      onboarded: true
    });
    navigate('/');
  };

  const steps = [
    {
      id: 'welcome',
      icon: <Moon size={80} className="text-primary-accent" />,
      title: 'Welcome to SleepWise',
      desc: 'Track your sleep without any wearable device. Just 30 seconds each morning.',
    },
    {
      id: 'personalize',
      icon: <Star size={80} className="text-secondary-accent" />,
      title: 'Set Your Goal',
      desc: 'Let us know your daily sleep goal and your name.',
      content: (
        <div className="space-y-6 w-full mt-8">
          <input 
            type="text" 
            placeholder="Your First Name"
            className="w-full bg-card-dark border border-border-dark p-4 rounded-2xl focus:border-primary-accent transition-colors"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="bg-card-dark border border-border-dark p-6 rounded-2xl text-center">
            <p className="text-sm font-bold text-text-muted mb-4 uppercase tracking-widest">Daily Sleep Goal</p>
            <div className="text-5xl font-extrabold mb-6 text-primary-accent">{goal}h</div>
            <input 
              type="range" min="5" max="12" step="0.5" value={goal} 
              onChange={e => setGoal(parseFloat(e.target.value))}
              className="w-full h-2 bg-border-dark rounded-full appearance-none accent-primary-accent"
            />
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      icon: <Bell size={80} className="text-yellow-400" />,
      title: 'Never Miss a Log',
      desc: 'We\'ll nudge you each morning to log your sleep. Consistency is key to better rest.',
      content: (
        <div className="w-full mt-8 space-y-6">
           <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold">Wake Time</p>
                <p className="text-xs text-text-muted">Used for reminders</p>
              </div>
              <input 
                type="time" 
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="bg-transparent text-xl font-bold text-primary-accent"
              />
           </div>
           <div className="bg-primary-accent/10 p-6 rounded-2xl border border-primary-accent/20">
              <p className="text-sm font-medium leading-relaxed">
                By enabling notifications, SleepWise can calculate your ideal bedtime and remind you to wind down.
              </p>
           </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-bg-dark z-[100] flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-md w-full flex flex-col items-center text-center"
        >
          <div className="mb-12 p-8 bg-card-dark rounded-[32px] shadow-pro border border-border-dark relative group">
            <div className="absolute inset-0 bg-primary-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {currentStep.icon}
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight leading-tight">{currentStep.title}</h1>
          <p className="text-text-muted font-bold leading-relaxed px-4 text-sm tracking-wide">{currentStep.desc}</p>
          {currentStep.content}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 w-full max-w-md px-8 flex flex-col items-center gap-8">
         <div className="flex gap-2.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-12 bg-primary-accent shadow-[0_0_10px_rgba(124,107,255,0.5)]' : 'w-4 bg-border-dark'}`} />
            ))}
         </div>
         <button 
           onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleFinish()}
           className="w-full py-5 rounded-[24px] bg-primary-accent text-white font-black flex items-center justify-center gap-4 text-xl shadow-pro hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
         >
           {step === steps.length - 1 ? "Start Analysis" : "Continue"}
           <ArrowRight size={24} strokeWidth={3} />
         </button>
      </div>
    </div>
  );
}
