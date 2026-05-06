import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Coffee, Brain } from 'lucide-react';
import { cn, getScoreBg, formatDuration } from '../lib/utils';

export function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const sleepEntries = useLiveQuery(() => 
    db.sleepEntries.where('date').between(startDate.toISOString(), endDate.toISOString(), true).toArray()
  , [currentMonth]);

  const selectedEntry = selectedDay ? sleepEntries?.find(e => isSameDay(new Date(e.date), selectedDay)) : null;

  return (
    <div className="space-y-6">
       <header className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold">Calendar</h1>
            <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-card-dark rounded-xl border border-border-dark"><ChevronLeft size={20}/></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-card-dark rounded-xl border border-border-dark"><ChevronRight size={20}/></button>
            </div>
      </header>

      <div className="bg-card-dark rounded-3xl border border-border-dark p-4 shadow-xl">
        <div className="text-center font-bold text-lg mb-6">{format(currentMonth, 'MMMM yyyy')}</div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-text-muted py-2">{d}</div>
            ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
                const entry = sleepEntries?.find(e => isSameDay(new Date(e.date), day));
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentMonth = format(day, 'M') === format(monthStart, 'M');

                return (
                    <button
                        key={i}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                            "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200",
                            !isCurrentMonth && "opacity-20",
                            isSelected && "ring-2 ring-primary-accent ring-offset-2 ring-offset-bg-dark z-10"
                        )}
                    >
                        {entry ? (
                            <div className={cn("w-full h-full rounded-2xl flex items-center justify-center text-xs font-black text-white", getScoreBg(entry.sleepScore))}>
                                {format(day, 'd')}
                            </div>
                        ) : (
                            <div className={cn("w-full h-full rounded-2xl flex items-center justify-center text-xs font-bold text-text-muted bg-bg-dark/30", isToday(day) && "border border-primary-accent text-primary-accent")}>
                                {format(day, 'd')}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {selectedDay && (
          <div className="bg-card-dark p-6 rounded-3xl border border-border-dark animate-in fade-in slide-in-from-bottom-4 animate-duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold">{format(selectedDay, 'EEEE, MMM do')}</h3>
                {selectedEntry && <span className={cn("px-4 py-1 rounded-full text-xs font-black text-white", getScoreBg(selectedEntry.sleepScore))}>{selectedEntry.sleepScore} pts</span>}
              </div>

              {selectedEntry ? (
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-dark flex items-center gap-3">
                              <Moon className="text-primary-accent" size={20} />
                              <div>
                                  <p className="text-[10px] font-black uppercase text-text-muted">Duration</p>
                                  <p className="font-bold">{formatDuration(selectedEntry.durationHours)}</p>
                              </div>
                          </div>
                          <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-dark flex items-center gap-3">
                              <Coffee className="text-orange-400" size={20} />
                              <div>
                                  <p className="text-[10px] font-black uppercase text-text-muted">Quality</p>
                                  <p className="font-bold">{selectedEntry.qualityRating}/10</p>
                              </div>
                          </div>
                      </div>
                      {selectedEntry.notes && (
                          <div className="p-4 bg-primary-accent/5 rounded-2xl border border-primary-accent/10">
                              <p className="text-sm font-medium italic opacity-80">"{selectedEntry.notes}"</p>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="py-8 text-center bg-bg-dark/50 rounded-2xl border border-dashed border-border-dark">
                      <p className="text-text-muted font-bold text-sm">No sleep logs recorded for this day.</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
}
