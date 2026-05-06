import React, { useState, useEffect } from 'react';
import { Coffee, Zap, TrendingDown, Info, Clock, Trash2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addHours, isAfter, subHours } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CaffeineDose {
  id: string;
  time: Date;
  mg: number;
}

export function CaffeineTrackerScreen() {
  const [doses, setDoses] = useState<CaffeineDose[]>([]);
  const [mgInput, setMgInput] = useState('80');

  // Half-life of caffeine is roughly 5 hours
  const calculateLevels = () => {
    const data = [];
    const now = new Date();
    const startTime = subHours(now, 4);
    const endTime = addHours(now, 20);

    for (let h = 0; h <= 24; h++) {
      const time = addHours(startTime, h);
      let totalMg = 0;
      
      doses.forEach(dose => {
        if (isAfter(time, dose.time)) {
          const hoursPassed = (time.getTime() - dose.time.getTime()) / (1000 * 60 * 60);
          totalMg += dose.mg * Math.pow(0.5, hoursPassed / 5);
        }
      });

      data.push({
        time: format(time, 'HH:mm'),
        mg: Math.round(totalMg),
        fullTime: time
      });
    }
    return data;
  };

  const chartData = calculateLevels();
  const currentMg = Math.round(doses.reduce((acc, dose) => {
      const hoursPassed = (new Date().getTime() - dose.time.getTime()) / (1000 * 60 * 60);
      if (hoursPassed < 0) return acc;
      return acc + (dose.mg * Math.pow(0.5, hoursPassed / 5));
  }, 0));

  const clearTime = chartData.find(d => d.mg <= 5 && isAfter(d.fullTime, new Date()))?.time || 'Cleared';

  const addDose = () => {
    const mg = parseInt(mgInput);
    if (!isNaN(mg)) {
      setDoses([...doses, { id: Math.random().toString(), time: new Date(), mg }]);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black mb-1">Caffeine Tracker</h1>
        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Sleep Predictor</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card-dark p-6 rounded-[32px] border border-border-dark shadow-pro">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">In System</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-400">{currentMg}</span>
            <span className="text-sm font-bold text-text-muted">mg</span>
          </div>
        </div>
        <div className="bg-card-dark p-6 rounded-[32px] border border-border-dark shadow-pro">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Clear Time</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-secondary-accent">{clearTime}</span>
          </div>
        </div>
      </div>

      <div className="bg-card-dark p-8 rounded-[40px] border border-border-dark">
        <h3 className="text-lg font-black mb-8 flex items-center gap-3">
          <TrendingDown className="text-orange-400" />
          Metabolism Curve
        </h3>
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: '16px' }}
              />
              <Area type="monotone" dataKey="mg" stroke="#fb923c" strokeWidth={4} fillOpacity={1} fill="url(#colorMg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest px-2">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
        </div>
      </div>

      <div className="bg-card-dark rounded-[40px] border border-border-dark p-8">
          <h3 className="text-lg font-black mb-6">Log Intake</h3>
          <div className="flex gap-4 mb-8">
            <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Amount (mg)</label>
               <input 
                type="number"
                value={mgInput}
                onChange={e => setMgInput(e.target.value)}
                className="w-full bg-bg-dark border border-border-dark p-4 rounded-2xl font-bold focus:border-orange-400 transition-colors"
               />
            </div>
            <button 
                onClick={addDose}
                className="self-end bg-orange-400 text-white p-4 rounded-2xl shadow-lg shadow-orange-400/20 hover:scale-105 transition-transform"
            >
                <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {[
                  { label: 'Espresso', mg: 64 },
                  { label: 'Coffee', mg: 95 },
                  { label: 'Black Tea', mg: 47 },
                  { label: 'Energy Drink', mg: 160 },
              ].map(item => (
                  <button 
                    key={item.label}
                    onClick={() => setMgInput(item.mg.toString())}
                    className="px-4 py-2 bg-bg-dark border border-border-dark rounded-xl text-xs font-bold whitespace-nowrap hover:border-orange-400 transition-colors"
                  >
                      {item.label}
                  </button>
              ))}
          </div>

          <div className="space-y-3">
              {doses.map(dose => (
                  <div key={dose.id} className="flex items-center justify-between p-4 bg-bg-dark/50 rounded-2xl border border-border-dark">
                      <div className="flex items-center gap-4">
                          <Coffee className="text-orange-400" size={20} />
                          <div>
                              <p className="font-bold">{dose.mg}mg</p>
                              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{format(dose.time, 'HH:mm')}</p>
                          </div>
                      </div>
                      <button onClick={() => setDoses(doses.filter(d => d.id !== dose.id))} className="text-text-muted hover:text-red-500">
                          <Trash2 size={18} />
                      </button>
                  </div>
              ))}
          </div>
      </div>

      <div className="p-6 bg-orange-400/10 border border-orange-400/20 rounded-3xl flex gap-4">
          <Info className="flex-shrink-0 text-orange-400" />
          <p className="text-xs font-bold leading-relaxed text-orange-400">
             Caffeine has a half-life of 5 hours. We recommend having less than 20mg in your system at bedtime for optimal sleep quality.
          </p>
      </div>
    </div>
  );
}
