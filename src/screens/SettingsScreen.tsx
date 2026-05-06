import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings, updateSettings } from '../lib/db';
import { 
  Bell, Moon, Sun, Monitor, ShieldCheck, Download, Trash2, 
  ChevronRight, Bookmark, MessageSquare, Info, User, Camera
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsScreen() {
  const settings = useLiveQuery(() => getSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  if (!settings) return null;

  const handleClearData = async () => {
      await db.sleepEntries.clear();
      await db.lifestyleEntries.clear();
      await db.favoriteTips.clear();
      await db.userSettings.clear();
      window.location.reload();
  };

  const SettingRow = ({ icon: Icon, label, value, onClick, color = 'bg-border-dark', type = 'link' }: any) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 bg-card-dark rounded-2xl border border-border-dark mb-3 cursor-pointer hover:bg-card-dark/70 transition-colors"
    >
        <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-xl text-white", color)}>
                <Icon size={20} />
            </div>
            <span className="font-bold">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {type === 'toggle' ? (
                <div className={cn("w-10 h-5 rounded-full relative transition-colors", value ? "bg-primary-accent" : "bg-border-dark")}>
                    <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", value ? "left-6" : "left-1")} />
                </div>
            ) : (
                <span className="text-text-muted text-sm font-semibold">{value}</span>
            )}
            {type === 'link' && <ChevronRight size={18} className="text-text-muted" />}
        </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-extrabold mb-1">Settings</h1>
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">User Profile</p>
      </header>

      <section>
        <div className="bg-card-dark rounded-3xl p-6 border border-border-dark mb-6 text-center shadow-lg relative overflow-hidden">
            <div className="flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-bg-dark border-4 border-border-dark overflow-hidden flex items-center justify-center text-4xl font-black text-text-muted">
                        {settings.avatar ? (
                            <img src={settings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            settings.name ? settings.name.charAt(0).toUpperCase() : <User size={40} />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-accent rounded-full border-2 border-bg-dark flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera size={14} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    if (event.target?.result as string) {
                                        const img = new Image();
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            const MAX_WIDTH = 256;
                                            const MAX_HEIGHT = 256;
                                            let width = img.width;
                                            let height = img.height;
                                            if (width > height) {
                                                if (width > MAX_WIDTH) {
                                                    height *= MAX_WIDTH / width;
                                                    width = MAX_WIDTH;
                                                }
                                            } else {
                                                if (height > MAX_HEIGHT) {
                                                    width *= MAX_HEIGHT / height;
                                                    height = MAX_HEIGHT;
                                                }
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext('2d');
                                            ctx?.drawImage(img, 0, 0, width, height);
                                            updateSettings({ avatar: canvas.toDataURL('image/jpeg', 0.8) });
                                        };
                                        img.src = event.target?.result as string;
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }} />
                    </label>
                </div>
                
                <input 
                    type="text" 
                    placeholder="Your Name"
                    value={settings.name || ''}
                    onChange={(e) => updateSettings({ name: e.target.value })}
                    className="bg-transparent border-b border-border-dark text-xl font-bold text-center text-text-primary focus:outline-none focus:border-primary-accent mb-2 px-2 pb-1"
                />
                <input 
                    type="text" 
                    placeholder="Custom Greeting (e.g. Ready to sleep?)"
                    value={settings.greeting || ''}
                    onChange={(e) => updateSettings({ greeting: e.target.value })}
                    className="bg-transparent text-sm text-center text-text-muted font-medium focus:outline-none focus:text-text-primary w-full max-w-xs"
                />
            </div>
        </div>

        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mb-4">Alarms & Notifications</h3>
        <SettingRow 
            icon={Bell} 
            label="In-App Alarm" 
            value={settings.isAlarmEnabled} 
            color="bg-orange-500"
            type="toggle"
            onClick={() => updateSettings({ isAlarmEnabled: !settings.isAlarmEnabled })}
        />
        <SettingRow 
            icon={Moon} 
            label="Bedtime Reminder" 
            value={settings.reminderEnabled} 
            color="bg-blue-500"
            type="toggle"
            onClick={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })}
        />
        <SettingRow 
            icon={MessageSquare} 
            label="Morning Nudge" 
            value={settings.morningNudgeEnabled} 
            color="bg-green-500"
            type="toggle"
            onClick={() => updateSettings({ morningNudgeEnabled: !settings.morningNudgeEnabled })}
        />

        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mt-8 mb-4">Appearance</h3>
        <div className="flex gap-2">
            {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'auto', icon: Monitor, label: 'System' },
            ].map(t => (
                <button 
                    key={t.id}
                    onClick={() => updateSettings({ theme: t.id as any })}
                    className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        settings.theme === t.id ? "bg-primary-accent/10 border-primary-accent text-primary-accent" : "bg-card-dark border-transparent text-text-muted"
                    )}
                >
                    <t.icon size={20} />
                    <span className="text-xs font-bold">{t.label}</span>
                </button>
            ))}
        </div>

        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mt-8 mb-4">Data & Privacy</h3>
        <SettingRow 
            icon={Download} 
            label="Export Data (CSV)" 
            color="bg-purple-500"
            onClick={async () => {
                const entries = await db.sleepEntries.toArray();
                if (entries.length === 0) {
                    alert('No data to export yet!');
                    return;
                }
                const headers = ['Date', 'Duration (h)', 'Score', 'Mood'];
                const rows = entries.map(e => [e.date, e.durationHours, e.sleepScore, e.moodOnWaking]);
                const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'sleepwise_data.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }}
        />
        <SettingRow 
            icon={Trash2} 
            label="Clear All Data" 
            color="bg-red-500"
            onClick={() => setShowClearConfirm(true)}
        />

        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mt-8 mb-4">Support</h3>
        <SettingRow 
            icon={Bookmark} 
            label="Saved Tips" 
            onClick={() => window.location.hash = '#/tips/saved'} 
        />
        <SettingRow icon={Info} label="About SleepWise" value="v1.0.0" />
      </section>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card-dark border border-border-dark w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                
                <h2 className="text-2xl font-black mb-2">Clear All Data</h2>
                <p className="text-text-muted font-bold text-sm mb-6 leading-relaxed">
                    Are you sure you want to delete all entries, settings, and saved tips? This action cannot be undone.
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={handleClearData}
                        className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        Yes, Delete Everything
                    </button>
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="w-full py-4 bg-bg-dark text-text-primary font-black rounded-2xl transition-colors hover:bg-bg-dark/70"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
