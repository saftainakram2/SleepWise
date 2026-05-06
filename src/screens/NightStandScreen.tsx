import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Volume2, VolumeX, BellRing, Play, Square, Settings2 } from 'lucide-react';
import { getSettings } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function NightStandScreen() {
    const settings = useLiveQuery(() => getSettings());
    const [time, setTime] = useState(new Date());
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
    const [isWindDownPlaying, setIsWindDownPlaying] = useState(false);
    
    type SoundType = 'brown' | 'rain' | 'waves' | 'forest';
    const [soundType, setSoundType] = useState<SoundType>('brown');
    const [volume, setVolume] = useState(50);
    const [showOptions, setShowOptions] = useState(false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeNodes = useRef<any[]>([]);
    const alarmInterval = useRef<any>(null);
    const mainGainNode = useRef<GainNode | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now);
            
            // Check Wake Alarm
            if (settings?.isAlarmEnabled && settings?.targetWakeTime) {
                const currentFormatted = format(now, 'HH:mm');
                if (currentFormatted === settings.targetWakeTime && now.getSeconds() === 0) {
                    triggerAlarm();
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [settings]);

    useEffect(() => {
        if (mainGainNode.current) {
            mainGainNode.current.gain.setTargetAtTime(volume / 100 * 0.5, audioCtxRef.current!.currentTime, 0.1);
        }
    }, [volume]);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const playWindDown = () => {
        initAudio();
        stopWindDown();
        if(!audioCtxRef.current) return;
        
        mainGainNode.current = audioCtxRef.current.createGain();
        mainGainNode.current.gain.value = volume / 100 * 0.5;
        mainGainNode.current.connect(audioCtxRef.current.destination);

        const ctx = audioCtxRef.current;
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;

        // Generate base noise (white)
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (soundType === 'brown' || soundType === 'waves') {
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            } else if (soundType === 'rain') {
                output[i] = (lastOut + (0.05 * white)) / 1.05;
                lastOut = output[i];
                output[i] *= 2.0; 
            } else if (soundType === 'forest') {
                output[i] = white * 0.5;
            }
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        if (soundType === 'waves') {
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 400;

            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // 10 seconds per wave

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 300; // Modulate freq by +/- 300Hz

            lfo.connect(lfoGain);
            lfoGain.connect(lowpass.frequency);
            
            noiseSrc.connect(lowpass);
            lowpass.connect(mainGainNode.current);
            lfo.start();
            noiseSrc.start();
            activeNodes.current.push(noiseSrc, lfo);

        } else if (soundType === 'rain') {
            const filter1 = ctx.createBiquadFilter();
            filter1.type = 'lowpass';
            filter1.frequency.value = 1000;
            
            const filter2 = ctx.createBiquadFilter();
            filter2.type = 'highpass';
            filter2.frequency.value = 400;

            noiseSrc.connect(filter1);
            filter1.connect(filter2);
            filter2.connect(mainGainNode.current);
            noiseSrc.start();
            activeNodes.current.push(noiseSrc);

        } else if (soundType === 'forest') {
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 800;
            noiseSrc.connect(lowpass);
            
            const forestGain = ctx.createGain();
            forestGain.gain.value = 0.1;
            lowpass.connect(forestGain);
            forestGain.connect(mainGainNode.current);
            noiseSrc.start();
            activeNodes.current.push(noiseSrc);
            
            // Random bird chirps
            const chirpInterval = setInterval(() => {
                if (!isWindDownPlaying) return;
                const osc = ctx.createOscillator();
                const chirpGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(3000 + Math.random() * 1000, ctx.currentTime + 0.1);
                
                chirpGain.gain.setValueAtTime(0, ctx.currentTime);
                chirpGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                
                osc.connect(chirpGain);
                chirpGain.connect(mainGainNode.current!);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
            }, 3000);
            activeNodes.current.push({ stop: () => clearInterval(chirpInterval) });

        } else {
            // Brown noise default
            noiseSrc.connect(mainGainNode.current);
            noiseSrc.start();
            activeNodes.current.push(noiseSrc);
        }

        setIsWindDownPlaying(true);
    };

    const stopWindDown = () => {
        activeNodes.current.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        activeNodes.current = [];
        setIsWindDownPlaying(false);
    };

    // Restart sound if settings change while playing
    useEffect(() => {
        if (isWindDownPlaying) {
            playWindDown();
        }
    }, [soundType]);

    const triggerAlarm = () => {
        initAudio();
        if(!audioCtxRef.current) return;
        setIsAlarmPlaying(true);
        stopWindDown();

        const playBeep = () => {
            if(!audioCtxRef.current) return;
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            
            osc.type = settings?.alarmSound === 'gentle' ? 'sine' : 'square';
            osc.frequency.setValueAtTime(settings?.alarmSound === 'gentle' ? 440 : 880, audioCtxRef.current.currentTime);
            
            gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, audioCtxRef.current.currentTime + 0.1);
            gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5);
            
            osc.start(audioCtxRef.current.currentTime);
            osc.stop(audioCtxRef.current.currentTime + 0.5);
        };

        playBeep();
        alarmInterval.current = setInterval(playBeep, 1000);
    };

    const stopAlarm = () => {
        if(alarmInterval.current) clearInterval(alarmInterval.current);
        setIsAlarmPlaying(false);
    };

    const sounds = [
        { id: 'brown', label: 'Brown Noise' },
        { id: 'rain', label: 'Rain' },
        { id: 'waves', label: 'Ocean Waves' },
        { id: 'forest', label: 'Forest' },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden animate-in fade-in duration-1000">
            {/* Ambient background glow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className={`w-[120vw] h-[120vw] rounded-full blur-[100px] transition-all duration-3000 ${isAlarmPlaying ? 'bg-orange-500 scale-110 animate-pulse' : 'bg-primary-accent'}`}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                <h2 className="text-text-muted font-bold tracking-[0.3em] uppercase text-xs mb-4">Night Stand Mode</h2>
                
                <div className="text-[100px] font-black leading-none tracking-tighter mb-2 tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {format(time, 'HH:mm')}
                </div>
                <p className="text-xl font-bold text-text-muted mb-16">{format(time, 'EEEE, MMMM d')}</p>

                {isAlarmPlaying ? (
                    <div className="animate-bounce">
                        <button 
                            onClick={stopAlarm}
                            className="bg-orange-500 text-white w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.5)] active:scale-95 transition-transform"
                        >
                            <BellRing size={48} className="mb-2 animate-pulse" />
                            <span className="font-black tracking-widest uppercase text-xs">Wake Up</span>
                        </button>
                    </div>
                ) : (
                    <div className="w-full bg-card-dark/40 backdrop-blur-md rounded-[40px] p-8 border border-white/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="text-primary-accent" />
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Wind Down Audio</p>
                                    <p className="font-black text-sm">{sounds.find(s => s.id === soundType)?.label}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowOptions(!showOptions)}
                                    className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", showOptions ? "bg-white/20" : "bg-white/10 hover:bg-white/20")}
                                >
                                    <Settings2 size={20} className="text-white" />
                                </button>
                                <button 
                                    onClick={isWindDownPlaying ? stopWindDown : playWindDown}
                                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    {isWindDownPlaying ? <Square size={20} className="fill-white" /> : <Play size={20} className="fill-white translate-x-0.5" />}
                                </button>
                            </div>
                        </div>

                        {showOptions && (
                            <div className="animate-in fade-in slide-in-from-top-2 pt-2 pb-4 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sound Type</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sounds.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSoundType(s.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                                                    soundType === s.id ? "bg-primary-accent text-white" : "bg-white/5 text-text-muted hover:bg-white/10"
                                                )}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Volume</p>
                                        <Volume2 size={12} className="text-text-muted" />
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={volume}
                                        onChange={(e) => setVolume(Number(e.target.value))}
                                        className="w-full accent-primary-accent"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="h-px w-full bg-white/10"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sun className="text-orange-400" />
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Wake Up Alarm</p>
                                    <p className="font-black text-sm">{settings?.targetWakeTime || '07:00'}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-text-muted">
                                {settings?.isAlarmEnabled ? 'ON' : 'OFF'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!isAlarmPlaying && (
                 <button 
                 onClick={() => window.history.back()}
                 className="absolute top-8 right-8 text-white/50 hover:text-white font-bold text-sm tracking-widest uppercase"
             >
                 Close
             </button>
            )}
        </div>
    );
}
