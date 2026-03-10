import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldOff, Settings, Plus, X, Clock, Volume2, VolumeX,
  CheckCircle, AlertTriangle, Zap, Star, Coffee, BookOpen, Dumbbell,
  Music, Pencil, ChevronRight, Timer, Play, Pause, Lock, Unlock,
} from "lucide-react";
import bgShrine from '@/assets/bg-anime-shrine.jpg';

interface AppBlockerSettings {
  duration: number;
  blockedApps: string[];
  suggestedActivities: string[];
  alarmEnabled: boolean;
  taskRemindersEnabled: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
}

type MascotMood = "idle" | "encouraging" | "warning" | "celebrating" | "focused";

const DEFAULT_SETTINGS: AppBlockerSettings = {
  duration: 25,
  blockedApps: ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit"],
  suggestedActivities: ["Drink water 💧", "Stretch for 2 mins 🧘", "Write in journal ✍️"],
  alarmEnabled: true,
  taskRemindersEnabled: true,
};

const STORAGE_KEY = "appBlockerSettings";

const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  idle: ["Ready to focus? Let's do this! 🌟", "I'll keep you on track~ ✨", "Focus mode is waiting for you!"],
  encouraging: ["You're doing amazing! Keep going 💪", "Halfway there! Don't give up~", "I believe in you! Stay focused ⭐", "Great progress! You've got this!", "Every minute counts! 🔥"],
  warning: ["Hey! Come back! You were doing so well 😤", "No cheating! Back to work! 😠", "I see you trying to sneak away... 👀", "Don't give up now! You're so close!"],
  celebrating: ["YOU DID IT!!! 🎉🎊✨", "Amazing focus session! I'm so proud~", "Incredible! You crushed it! 🏆"],
  focused: ["Ssh... deep focus mode 🎯", "You're in the zone! Keep it up~", "Productivity level: over 9000! ⚡"],
};

function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {}
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [0, 0.15, 0.3].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = [523, 659, 784][i];
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    });
  } catch {}
}

interface AppBlockerProps {
  tasks?: Task[];
}

export default function AppBlocker({ tasks = [] }: AppBlockerProps) {
  const [settings, setSettings] = useState<AppBlockerSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mascotMood, setMascotMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState(MASCOT_MESSAGES.idle[0]);
  const [showWarning, setShowWarning] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [newApp, setNewApp] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTasks = tasks.filter((t) => !t.completed);
  const totalSeconds = settings.duration * 60;
  const progress = isBlocking ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const saveSettings = useCallback((s: AppBlockerSettings) => {
    setSettings(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, []);

  const setMascot = useCallback((mood: MascotMood) => {
    const msgs = MASCOT_MESSAGES[mood];
    setMascotMood(mood);
    setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  }, []);

  // Focus loss detection
  useEffect(() => {
    if (!isBlocking) return;
    const handleBlur = () => {
      if (!isBlocking) return;
      if (settings.alarmEnabled) playAlarmSound();
      setMascot("warning");
      setShowWarning(true);
      if (warningRef.current) clearTimeout(warningRef.current);
      warningRef.current = setTimeout(() => { setShowWarning(false); setMascot("focused"); }, 5000);
    };
    const handleVisibility = () => { if (document.hidden && isBlocking) handleBlur(); };
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { window.removeEventListener("blur", handleBlur); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [isBlocking, settings.alarmEnabled, setMascot]);

  // Countdown
  useEffect(() => {
    if (!isBlocking) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isBlocking]);

  // Periodic messages
  useEffect(() => {
    if (!isBlocking) return;
    messageRef.current = setInterval(() => {
      setMascot("encouraging");
      if (activeTasks.length > 0) setCurrentTaskIndex((i) => (i + 1) % activeTasks.length);
    }, 120_000);
    return () => clearInterval(messageRef.current!);
  }, [isBlocking, activeTasks.length, setMascot]);

  const handleComplete = useCallback(() => {
    clearInterval(timerRef.current!);
    clearInterval(messageRef.current!);
    playSuccessSound();
    setMascot("celebrating");
    setIsBlocking(false);
    setSessionComplete(true);
    try { document.exitFullscreen?.(); } catch {}
    setTimeout(() => setSessionComplete(false), 6000);
  }, [setMascot]);

  const startBlocking = () => {
    setTimeLeft(settings.duration * 60);
    setCurrentTaskIndex(0);
    setSessionComplete(false);
    setShowWarning(false);
    setIsBlocking(true);
    setMascot("focused");
    try { document.documentElement.requestFullscreen?.(); } catch {}
  };

  const stopBlocking = () => {
    setShowStopConfirm(false);
    setIsBlocking(false);
    clearInterval(timerRef.current!);
    clearInterval(messageRef.current!);
    setMascot("idle");
    try { document.exitFullscreen?.(); } catch {}
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Main Card - Modern Focus Mode UI */}
      <AnimatePresence>
        {!isBlocking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Hero Card */}
            <div className="relative rounded-3xl overflow-hidden">
              <img src={bgShrine} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">Focus Mode</h2>
                </div>
                <p className="text-white/60 text-sm mb-6 max-w-md">
                  Block distractions and stay focused on your tasks. The AI mascot will keep you accountable!
                </p>

                {/* Duration Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[15, 25, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => saveSettings({ ...settings, duration: d })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        settings.duration === d
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>

                {/* Tasks Preview */}
                {activeTasks.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Focus Tasks</p>
                    <div className="space-y-2">
                      {activeTasks.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-white/80 text-sm truncate">{t.title}</span>
                        </div>
                      ))}
                      {activeTasks.length > 3 && (
                        <p className="text-white/40 text-xs">+{activeTasks.length - 3} more tasks</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Blocked Apps */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {settings.blockedApps.map((app) => (
                    <span key={app} className="text-xs bg-red-500/20 text-red-300 border border-red-500/20 rounded-full px-2.5 py-1">
                      🚫 {app}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startBlocking}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl py-3.5 shadow-lg shadow-primary/30 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Start Focus ({settings.duration}m)
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(true)}
                    className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-2xl px-4 border border-white/10 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Break Activities Card */}
            {settings.suggestedActivities.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-warm" />
                  <h3 className="text-sm font-semibold text-foreground">Break Activities</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {settings.suggestedActivities.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 text-sm text-foreground">
                      <Star className="w-3.5 h-3.5 text-warm flex-shrink-0" />
                      <span className="truncate">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BLOCKING OVERLAY */}
      <AnimatePresence>
        {isBlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background */}
            <img src={bgShrine} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 3 + (i % 4) * 2,
                    height: 3 + (i % 4) * 2,
                    left: `${(i * 17 + 5) % 100}%`,
                    top: `${(i * 13 + 10) % 100}%`,
                    background: i % 2 === 0 ? "hsl(210, 90%, 60%)" : "hsl(270, 50%, 65%)",
                    opacity: 0.5,
                  }}
                  animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center gap-5 px-8 max-w-sm w-full text-center">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-primary font-semibold text-sm tracking-widest uppercase">Focus Active</span>
              </div>

              {/* Timer Circle */}
              <div className="relative w-52 h-52">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <motion.circle
                    cx="100" cy="100" r="90" fill="none"
                    stroke="hsl(210, 90%, 60%)"
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transition={{ duration: 0.5 }}
                    style={{ filter: 'drop-shadow(0 0 8px hsl(210, 90%, 60% / 0.5))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-xs opacity-60 mb-1">Remaining</span>
                  <span className="text-5xl font-bold tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
                  <span className="text-xs opacity-40 mt-1">{settings.duration}m session</span>
                </div>
              </div>

              {/* Mascot Message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mascotMessage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-white text-sm font-medium max-w-xs"
                >
                  {mascotMessage}
                </motion.div>
              </AnimatePresence>

              {/* Warning */}
              <AnimatePresence>
                {showWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-2xl px-5 py-3 text-sm font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hey! Stay focused! Come back! 😤</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Task */}
              {settings.taskRemindersEnabled && activeTasks.length > 0 && (
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Current Task</p>
                  <p className="text-white font-medium truncate">{activeTasks[currentTaskIndex % activeTasks.length]?.title}</p>
                  {activeTasks.length > 1 && <p className="text-white/30 text-xs mt-1">+{activeTasks.length - 1} more</p>}
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-lavender"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Blocked apps */}
              <p className="text-white/30 text-xs">
                Blocking: {settings.blockedApps.slice(0, 3).join(", ")}{settings.blockedApps.length > 3 ? "..." : ""}
              </p>

              {/* Stop button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowStopConfirm(true)}
                className="flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors text-sm py-2"
              >
                <Unlock className="w-4 h-4" />
                End session early
              </motion.button>
            </div>

            {/* Stop Confirm */}
            <AnimatePresence>
              {showStopConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10 p-6"
                >
                  <motion.div
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.85 }}
                    className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                  >
                    <h3 className="text-foreground text-xl font-bold mt-2">Give up already? 😤</h3>
                    <p className="text-muted-foreground text-sm mt-2 mb-6">
                      You still have {formatTime(timeLeft)} left! Don't break your streak!
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowStopConfirm(false)}
                        className="flex-1 bg-primary text-primary-foreground font-semibold rounded-2xl py-3"
                      >
                        Keep going! 💪
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={stopBlocking}
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-2xl px-4 transition-colors border border-destructive/20"
                      >
                        Stop
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-foreground text-lg font-bold">Focus Settings</h3>
                  <p className="text-muted-foreground text-sm">Customize your session</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {/* Duration */}
                <section>
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={12} /> Session Duration
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[15, 25, 30, 45, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => saveSettings({ ...settings, duration: d })}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          settings.duration === d
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </section>

                {/* Blocked apps */}
                <section>
                  <label className="text-xs text-destructive font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldOff size={12} /> Apps to Avoid
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.blockedApps.map((app) => (
                      <span key={app} className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1">
                        🚫 {app}
                        <button onClick={() => saveSettings({ ...settings, blockedApps: settings.blockedApps.filter((a) => a !== app) })} className="hover:text-foreground ml-0.5">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newApp}
                      onChange={(e) => setNewApp(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newApp.trim()) { saveSettings({ ...settings, blockedApps: [...settings.blockedApps, newApp.trim()] }); setNewApp(""); } }}
                      placeholder="Add app (press Enter)"
                      className="flex-1 bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => { if (newApp.trim()) { saveSettings({ ...settings, blockedApps: [...settings.blockedApps, newApp.trim()] }); setNewApp(""); } }}
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-xl px-3 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>

                {/* Activities */}
                <section>
                  <label className="text-xs text-warm font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Zap size={12} /> Break Activities
                  </label>
                  <div className="flex flex-col gap-1.5 mb-3">
                    {settings.suggestedActivities.map((act, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary/50 border border-border rounded-xl px-3 py-2">
                        <span className="text-sm text-foreground flex items-center gap-2">
                          <Star size={12} className="text-warm" />{act}
                        </span>
                        <button onClick={() => saveSettings({ ...settings, suggestedActivities: settings.suggestedActivities.filter((_, idx) => idx !== i) })} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newActivity.trim()) { saveSettings({ ...settings, suggestedActivities: [...settings.suggestedActivities, newActivity.trim()] }); setNewActivity(""); } }}
                      placeholder="Add activity (press Enter)"
                      className="flex-1 bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => { if (newActivity.trim()) { saveSettings({ ...settings, suggestedActivities: [...settings.suggestedActivities, newActivity.trim()] }); setNewActivity(""); } }}
                      className="bg-warm/10 text-warm hover:bg-warm/20 border border-warm/20 rounded-xl px-3 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>

                {/* Toggles */}
                <section className="flex flex-col gap-3">
                  {[
                    { label: "Task Reminders", desc: "Show active tasks during focus", value: settings.taskRemindersEnabled, key: "taskRemindersEnabled" as const },
                    { label: "Alarm Sound", desc: "Alert when you leave the app", value: settings.alarmEnabled, key: "alarmEnabled" as const },
                  ].map(({ label, desc, value, key }) => (
                    <div key={key} className="flex items-center justify-between bg-secondary/50 border border-border rounded-2xl px-4 py-3">
                      <div>
                        <p className="text-foreground text-sm font-medium">{label}</p>
                        <p className="text-muted-foreground text-xs">{desc}</p>
                      </div>
                      <button
                        onClick={() => saveSettings({ ...settings, [key]: !value })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
                      >
                        <motion.div animate={{ x: value ? 20 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  ))}
                </section>

                <button onClick={() => setShowSettings(false)} className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-3 shadow-lg">
                  Save Settings ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Complete */}
      <AnimatePresence>
        {sessionComplete && !isBlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              className="bg-card border border-border rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <h2 className="text-3xl font-black text-foreground mt-4">Session Complete! 🎉</h2>
              <p className="text-primary mt-2">You stayed focused for {settings.duration} minutes!</p>
              <div className="flex items-center justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Star className="w-5 h-5 text-warm fill-warm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
