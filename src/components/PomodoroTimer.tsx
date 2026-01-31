import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Target, Settings, Sparkles, Volume2, VolumeX, Upload, Download, X } from 'lucide-react';
import timerCompleteSound from '@/assets/timer-complete.mp3';

type TimerMode = 'focus' | 'break';

export interface PomodoroTimerRef {
  startWithDuration: (minutes: number, label?: string) => void;
}

interface PomodoroTimerProps {
  onComplete?: (mode: TimerMode) => void;
  onModeChange?: (mode: TimerMode) => void;
}

const PomodoroTimer = forwardRef<PomodoroTimerRef, PomodoroTimerProps>(
  ({ onComplete, onModeChange }, ref) => {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [showSettings, setShowSettings] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [currentLabel, setCurrentLabel] = useState<string>('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
    const [customAudioName, setCustomAudioName] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // Initialize audio
    useEffect(() => {
      // Check for saved custom audio
      const savedAudioData = localStorage.getItem('timerAudioData');
      const savedAudioName = localStorage.getItem('timerAudioName');
      
      if (savedAudioData) {
        setCustomAudioUrl(savedAudioData);
        setCustomAudioName(savedAudioName || 'Custom sound');
        audioRef.current = new Audio(savedAudioData);
      } else {
        audioRef.current = new Audio(timerCompleteSound);
      }
      audioRef.current.volume = 0.7;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    const handleAudioImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setCustomAudioUrl(base64);
          setCustomAudioName(file.name);
          localStorage.setItem('timerAudioData', base64);
          localStorage.setItem('timerAudioName', file.name);
          
          // Update audio reference
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = new Audio(base64);
          audioRef.current.volume = 0.7;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleAudioExport = () => {
      const audioData = localStorage.getItem('timerAudioData');
      const audioName = localStorage.getItem('timerAudioName') || 'timer-sound.mp3';
      
      if (audioData) {
        const link = document.createElement('a');
        link.href = audioData;
        link.download = audioName;
        link.click();
      }
    };

    const clearCustomAudio = () => {
      setCustomAudioUrl(null);
      setCustomAudioName('');
      localStorage.removeItem('timerAudioData');
      localStorage.removeItem('timerAudioName');
      
      // Reset to default
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(timerCompleteSound);
      audioRef.current.volume = 0.7;
    };

    const playSound = useCallback(() => {
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }, [soundEnabled]);

    const totalTime = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      startWithDuration: (minutes: number, label?: string) => {
        setFocusDuration(minutes);
        setTimeLeft(minutes * 60);
        setMode('focus');
        setCurrentLabel(label || '');
        setIsRunning(true);
      }
    }));

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleModeSwitch = useCallback((newMode: TimerMode) => {
      setMode(newMode);
      setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
      setIsRunning(false);
      setCurrentLabel('');
      onModeChange?.(newMode);
    }, [focusDuration, breakDuration, onModeChange]);

    const handleReset = () => {
      setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
      setIsRunning(false);
      setCurrentLabel('');
    };

    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (isRunning && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        playSound();
        onComplete?.(mode);
        if (mode === 'focus') {
          setCompletedPomodoros((prev) => prev + 1);
          handleModeSwitch('break');
        } else {
          handleModeSwitch('focus');
        }
      }

      return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode, onComplete, handleModeSwitch, playSound]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            >
              {mode === 'focus' ? (
                <Target className="w-5 h-5 text-primary" />
              ) : (
                <Coffee className="w-5 h-5 text-coral" />
              )}
            </motion.div>
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
              </span>
              {currentLabel && (
                <p className="text-xs text-muted-foreground mt-0.5">{currentLabel}</p>
              )}
            </div>
          </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
              <Sparkles className="w-3.5 h-3.5 text-warm" />
              <span className="text-xs font-semibold text-foreground">
                {completedPomodoros} sessions
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition-colors ${soundEnabled ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/80 text-muted-foreground'}`}
              title={soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 rounded-xl hover:bg-secondary/80 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 overflow-hidden"
            >
              <div className="space-y-4 p-4 rounded-xl bg-secondary/40">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-2">Focus (min)</label>
                    <input
                      type="number"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      min={1}
                      max={60}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-2">Break (min)</label>
                    <input
                      type="number"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      min={1}
                      max={30}
                    />
                  </div>
                </div>

                {/* Audio Import/Export */}
                <div className="pt-3 border-t border-border/50">
                  <label className="text-xs text-muted-foreground font-medium block mb-2">
                    🔊 Timer Completion Sound
                  </label>
                  
                  {customAudioName ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background mb-2">
                      <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{customAudioName}</span>
                      <button
                        onClick={handleAudioExport}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Export audio"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={clearCustomAudio}
                        className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                        title="Use default sound"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-2">
                      Using default completion sound
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-sm hover:bg-secondary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Import Sound
                    </button>
                    {customAudioUrl && (
                      <button
                        onClick={handleAudioExport}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-sm hover:bg-secondary transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    )}
                  </div>
                  
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioImport}
                    className="hidden"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Circle */}
        <div className="relative w-72 h-72 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              className="timer-ring-bg"
              strokeWidth="10"
            />
            <motion.circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              className={`timer-ring ${isRunning ? 'focus-mode-active' : ''}`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-6xl font-bold text-foreground tracking-tight"
              key={timeLeft}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {formatTime(timeLeft)}
            </motion.span>
            <span className="text-sm text-muted-foreground mt-3 font-medium">
              {mode === 'focus' ? '✨ Stay focused!' : '☕ Take a breather'}
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleModeSwitch('focus')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'focus'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            Focus
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleModeSwitch('break')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'break'
                ? 'bg-coral text-white shadow-lg shadow-coral/25'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            Break
          </motion.button>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="btn-glass p-4 rounded-xl"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className="btn-spirit px-10 py-4 flex items-center gap-3 rounded-xl"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span className="font-semibold">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span className="font-semibold">Start</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  }
);

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer;