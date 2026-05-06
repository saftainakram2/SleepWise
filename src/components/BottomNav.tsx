import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, BarChart2, Lightbulb, Zap, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const leftItems = [
    { to: '/', icon: Home, label: 'HOME' },
    { to: '/analytics', icon: BarChart2, label: 'STATS' },
  ];

  const rightItems = [
    { to: '/tips', icon: Lightbulb, label: 'TIPS' },
    { to: '/labs', icon: Zap, label: 'LABS' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-dark border-t border-border-dark h-24 px-4 pb-safe z-50">
      <div className="max-w-md mx-auto h-full flex justify-between items-center relative">
        {/* Left Side */}
        <div className="flex flex-1 justify-around items-center">
          {leftItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 transition-all duration-200',
                  isActive ? 'text-primary-accent' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <Icon size={24} />
              <span className="text-[10px] font-black tracking-widest">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Elevated Center Button */}
        <div className="relative -top-8 px-4">
          <Link
            to="/log"
            className="w-16 h-16 bg-primary-accent rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(124,107,255,0.4)] border-4 border-bg-dark hover:scale-110 active:scale-95 transition-all text-white"
          >
            <Plus size={32} strokeWidth={3} />
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 justify-around items-center">
          {rightItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 transition-all duration-200',
                  isActive ? 'text-primary-accent' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <Icon size={24} />
              <span className="text-[10px] font-black tracking-widest">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
