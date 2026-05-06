import React from 'react';
import { Zap, Clock, ChevronRight, Activity, FlaskConical, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LabsScreen() {
  const tools = [
    {
      id: 'caffeine',
      title: 'Caffeine Metabolism',
      desc: 'Track how caffeine levels impact your bedtime.',
      icon: Zap,
      color: 'bg-orange-500',
      to: '/caffeine'
    },
    {
      id: 'calculator',
      title: 'Cycle Calculator',
      desc: 'Find the perfect time to wake up refreshed.',
      icon: Clock,
      color: 'bg-blue-500',
      to: '/calculator'
    },
    {
      id: 'nightstand',
      title: 'Night Stand Mode',
      desc: 'Ambient wind-down audio and wake-up alarm.',
      icon: Moon,
      color: 'bg-purple-500',
      to: '/night-stand'
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black mb-1 text-primary-accent flex items-center gap-3">
            <FlaskConical size={32} />
            Sleep Labs
        </h1>
        <p className="text-text-muted font-bold text-xs uppercase tracking-widest pl-1">Experimental Analysis Tools</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {tools.map(tool => (
            <Link 
                key={tool.id} 
                to={tool.to}
                className="bg-card-dark border border-border-dark p-6 rounded-[32px] flex items-center justify-between group hover:border-primary-accent/30 transition-all hover:translate-x-1"
            >
                <div className="flex items-center gap-5">
                    <div className={`${tool.color} p-4 rounded-2xl text-white shadow-lg`}>
                        <tool.icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg">{tool.title}</h3>
                        <p className="text-xs text-text-muted font-medium line-clamp-1">{tool.desc}</p>
                    </div>
                </div>
                <ChevronRight className="text-text-muted group-hover:text-primary-accent transition-colors" />
            </Link>
        ))}
      </div>

      <div className="bg-card-dark/50 border border-border-dark border-dashed rounded-[40px] p-10 flex flex-col items-center text-center">
          <Activity className="text-border-dark mb-4" size={40} />
          <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">More coming soon</h3>
          <p className="text-[10px] text-text-muted/60 font-bold px-6 leading-relaxed">
              We are working on Wearable Sync and Environmental Audio Analysis for future updates.
          </p>
      </div>
    </div>
  );
}
