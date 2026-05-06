import React, { useState } from 'react';
import { 
  Lamp, Coffee, Brain, Smartphone, Dumbbell, Clock, 
  Search, Bookmark, ChevronRight, GraduationCap 
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useLocation } from 'react-router-dom';

const CATEGORIES = [
  { id: 'saved', label: 'Saved', icon: Bookmark, color: 'text-yellow-400 bg-yellow-400/10' },
  { id: 'env', label: 'Environment', icon: Lamp, color: 'text-blue-400 bg-blue-400/10' },
  { id: 'diet', label: 'Diet & Caffeine', icon: Coffee, color: 'text-orange-400 bg-orange-400/10' },
  { id: 'stress', label: 'Stress', icon: Brain, color: 'text-red-400 bg-red-400/10' },
  { id: 'tech', label: 'Technology', icon: Smartphone, color: 'text-purple-400 bg-purple-400/10' },
  { id: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-green-400 bg-green-400/10' },
  { id: 'routine', label: 'Routine', icon: Clock, color: 'text-pink-400 bg-pink-400/10' },
];

const TIPS = [
  {
    id: 'temp',
    cat: 'env',
    title: 'Optimal Temperature',
    text: 'Keep your room around 18°C. A cooler environment helps your core body temperature drop, which is essential for deep sleep.',
    source: 'Harvard Sleep Study'
  },
  {
    id: 'blue-light',
    cat: 'tech',
    title: 'Blue Light Buffer',
    text: 'Avoid screens 60 minutes before bed. Blue light suppresses melatonin production, making it harder to fall asleep.',
    source: 'National Sleep Foundation'
  },
  {
    id: 'caffeine',
    cat: 'diet',
    title: 'The Caffeine Half-Life',
    text: 'Caffeine can stay in your system for up to 8 hours. Try to stop intake by 2:00 PM for better rest.',
    source: 'Mayo Clinic'
  },
  {
    id: 'consistent',
    cat: 'routine',
    title: 'Consistent Bedtime',
    text: 'Going to bed at the same time every night (even on weekends) regulates your circadian rhythm for easier waking.',
    source: 'Sleep Medicine Journal'
  },
  {
    id: 'movement',
    cat: 'exercise',
    title: 'Morning Movement',
    text: 'Moderate aerobic exercise in the morning can lead to more deep sleep stages later that night.',
    source: 'Johns Hopkins'
  },
  {
    id: 'mindful',
    cat: 'stress',
    title: 'Mindful Unwinding',
    text: 'Just 5 minutes of mindful breathing before bed reduces cortisol levels and prepares the nervous system for rest.',
    source: 'Stanford Psychology'
  }
];

export function TipsLibraryScreen() {
  const location = useLocation();
  const [activeCat, setActiveCat] = useState(location.hash === '#/tips/saved' ? 'saved' : 'tech');
  const savedTips = useLiveQuery(() => db.favoriteTips.toArray()) || [];
  const savedIds = new Set(savedTips.map(s => s.id));

  const filteredTips = activeCat === 'saved' 
    ? TIPS.filter(t => savedIds.has(t.id))
    : TIPS.filter(t => t.cat === activeCat);

  const toggleFavorite = async (tipId: string) => {
    if (savedIds.has(tipId)) {
        await db.favoriteTips.delete(tipId);
    } else {
        await db.favoriteTips.add({ id: tipId, savedAt: new Date().toISOString() });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold mb-1">Sleep Tips</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Science-Backed Advice</p>
      </header>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <Search size={18} />
        </div>
        <input 
            type="text" 
            placeholder="Search for a topic..."
            className="w-full bg-card-dark border border-border-dark p-4 pl-12 rounded-2xl focus:border-primary-accent transition-colors text-sm font-medium"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map(c => {
            const Icon = c.icon;
            return (
                <button
                    key={c.id}
                    onClick={() => setActiveCat(c.id)}
                    className={cn(
                        "px-4 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all whitespace-nowrap",
                        activeCat === c.id ? "bg-primary-accent/10 border-primary-accent text-primary-accent" : "bg-card-dark border-transparent text-text-muted"
                    )}
                >
                    <Icon size={18} />
                    <span className="text-xs font-bold">{c.label}</span>
                </button>
            )
        })}
      </div>

      <div className="space-y-4">
        {filteredTips.length === 0 && activeCat === 'saved' && (
            <div className="text-center py-20 bg-card-dark rounded-3xl border border-border-dark border-dashed">
                <Bookmark size={40} className="mx-auto text-border-dark mb-4" />
                <p className="text-text-muted font-bold">No saved tips yet</p>
                <button onClick={() => setActiveCat('tech')} className="mt-4 text-primary-accent text-sm font-black uppercase tracking-widest">Explore Library</button>
            </div>
        )}
        {filteredTips.map((tip) => (
            <div key={tip.id} className="bg-card-dark rounded-3xl border border-border-dark p-6 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-extrabold pr-8 leading-tight">{tip.title}</h3>
                    <button 
                        onClick={() => toggleFavorite(tip.id)}
                        className={cn("transition-colors", savedIds.has(tip.id) ? "text-primary-accent" : "text-text-muted hover:text-primary-accent")}
                    >
                        <Bookmark size={20} fill={savedIds.has(tip.id) ? "currentColor" : "none"} />
                    </button>
                </div>
                <p className="text-text-primary/80 font-medium text-sm leading-relaxed mb-6">
                    {tip.text}
                </p>
                <div className="flex items-center gap-2 bg-bg-dark/50 self-start px-3 py-1.5 rounded-xl border border-border-dark">
                    <GraduationCap size={14} className="text-secondary-accent" />
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">{tip.source}</span>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary-accent to-[#5a48dd] p-6 rounded-3xl text-white flex justify-between items-center group cursor-pointer">
          <div>
            <h3 className="font-extrabold text-lg mb-1">Deep Dive Courses</h3>
            <p className="text-xs text-white/80 font-semibold">Unlock 10-day masterclasses for insomnia.</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ChevronRight size={20} />
          </div>
      </div>
    </div>
  );
}
