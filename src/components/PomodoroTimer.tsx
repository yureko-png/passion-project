import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Target, Settings } from 'lucide-react';

type TimerMode = 'focus' | 'break';

interface PomodoroTimerProps {
  onComplete?: (mode: TimerMode) => void;
  onModeChange?: (mode: TimerMode) => void;
}

const PomodoroTimer = ({ onComplete, onModeChange }: PomodoroTimerProps) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const totalTime = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeSwitch = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setIsRunning(false);
    onModeChange?.(newMode);
  }, [focusDuration, breakDuration, onModeChange]);

  const handleReset = () => {
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete?.(mode);
      if (mode === 'focus') {
        setCompletedPomodoros((prev) => prev + 1);
        handleModeSwitch('break');
      } else {
        handleModeSwitch('focus');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, onComplete, handleModeSwitch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {mode === 'focus' ? (
            <Target className="w-5 h-5 text-primary" />
          ) : (
            <Coffee className="w-5 h-5 text-primary" />
          )}
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedPomodoros} sessions today
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
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
            className="mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Focus (min)</label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm"
                  min={1}
                  max={60}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Break (min)</label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm"
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            className="timer-ring-bg"
            strokeWidth="8"
          />
          <motion.circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            className={`timer-ring ${isRunning ? 'focus-mode-active' : ''}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold text-foreground tracking-tight"
            key={timeLeft}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-sm text-muted-foreground mt-2">
            {mode === 'focus' ? 'Stay focused!' : 'Take a breather'}
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeSwitch('focus')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'focus'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Focus
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeSwitch('break')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'break'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
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
          className="btn-glass p-3"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning(!isRunning)}
          className="btn-gold px-8 py-4 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PomodoroTimer;
