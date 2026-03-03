import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldOff,
  Settings,
  Plus,
  X,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertTriangle,
  Zap,
  Star,
  Coffee,
  BookOpen,
  Dumbbell,
  Music,
  Pencil,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AppBlockerSettings {
  duration: number; // minutes
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

// ─────────────────────────────────────────────
// Default config
// ─────────────────────────────────────────────

const DEFAULT_SETTINGS: AppBlockerSettings = {
  duration: 25,
  blockedApps: ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit"],
  suggestedActivities: ["Drink water 💧", "Stretch for 2 mins 🧘", "Write in journal ✍️"],
  alarmEnabled: true,
  taskRemindersEnabled: true,
};

const STORAGE_KEY = "appBlockerSettings";

// ─────────────────────────────────────────────
// Mascot messages per mood
// ─────────────────────────────────────────────

const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  idle: [
    "Ready to focus? Let's do this! 🌟",
    "I'll keep you on track~ ✨",
    "Focus mode is waiting for you!",
  ],
  encouraging: [
    "You're doing amazing! Keep going 💪",
    "Halfway there! Don't give up~",
    "I believe in you! Stay focused ⭐",
    "Great progress! You've got this!",
    "Every minute counts! You're killing it 🔥",
  ],
  warning: [
    "Hey! Come back! You were doing so well 😤",
    "No cheating! Back to work! 😠",
    "I see you trying to sneak away... 👀",
    "Don't give up now! You're so close!",
  ],
  celebrating: [
    "YOU DID IT!!! 🎉🎊✨",
    "Amazing focus session! I'm so proud~",
    "Incredible! You crushed it! 🏆",
  ],
  focused: [
    "Ssh... deep focus mode 🎯",
    "You're in the zone! Keep it up~",
    "Productivity level: over 9000! ⚡",
    "Look at you, being so productive! 💼",
  ],
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  water: <Coffee size={14} />,
  stretch: <Dumbbell size={14} />,
  journal: <Pencil size={14} />,
  read: <BookOpen size={14} />,
  music: <Music size={14} />,
  default: <Star size={14} />,
};

function getActivityIcon(activity: string) {
  const lower = activity.toLowerCase();
  if (lower.includes("water") || lower.includes("drink")) return ACTIVITY_ICONS.water;
  if (lower.includes("stretch") || lower.includes("exercise") || lower.includes("yoga")) return ACTIVITY_ICONS.stretch;
  if (lower.includes("journal") || lower.includes("write")) return ACTIVITY_ICONS.journal;
  if (lower.includes("read") || lower.includes("book")) return ACTIVITY_ICONS.read;
  if (lower.includes("music") || lower.includes("listen")) return ACTIVITY_ICONS.music;
  return ACTIVITY_ICONS.default;
}

// ─────────────────────────────────────────────
// Audio helpers
// ─────────────────────────────────────────────

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
  } catch (e) {
    // ignore
  }
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
  } catch (e) {
    // ignore
  }
}

// ─────────────────────────────────────────────
// Mascot SVG (Ako — simplified inline)
// ─────────────────────────────────────────────

function AkoMascot({ mood, size = 96 }: { mood: MascotMood; size?: number }) {
  const faceMap: Record<MascotMood, { eyes: string; mouth: string; blush: boolean }> = {
    idle: { eyes: "😊", mouth: "", blush: false },
    encouraging: { eyes: "😄", mouth: "", blush: true },
    warning: { eyes: "😤", mouth: "", blush: false },
    celebrating: { eyes: "🥳", mouth: "", blush: true },
    focused: { eyes: "😤", mouth: "", blush: false },
  };

  const colors: Record<MascotMood, string> = {
    idle: "from-indigo-400 to-purple-500",
    encouraging: "from-emerald-400 to-teal-500",
    warning: "from-red-400 to-orange-500",
    celebrating: "from-yellow-400 to-pink-500",
    focused: "from-blue-500 to-indigo-600",
  };

  const { eyes } = faceMap[mood];

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${colors[mood]} shadow-2xl`}
      style={{ width: size, height: size }}
    >
      {/* ears */}
      <div className="absolute -top-2 left-3 w-5 h-6 rounded-t-full bg-gradient-to-b from-pink-300 to-pink-400 border-2 border-white/30" />
      <div className="absolute -top-2 right-3 w-5 h-6 rounded-t-full bg-gradient-to-b from-pink-300 to-pink-400 border-2 border-white/30" />
      {/* face */}
      <span className="text-3xl select-none">{eyes}</span>
      {/* blush */}
      {faceMap[mood].blush && (
        <>
          <div className="absolute bottom-7 left-4 w-5 h-2 rounded-full bg-pink-300/60" />
          <div className="absolute bottom-7 right-4 w-5 h-2 rounded-full bg-pink-300/60" />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

interface AppBlockerProps {
  /** Optional task list from your task store */
  tasks?: Task[];
}

export default function AppBlocker({ tasks = [] }: AppBlockerProps) {
  // settings
  const [settings, setSettings] = useState<AppBlockerSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
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
  const idleAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTasks = tasks.filter((t) => !t.completed);
  const totalSeconds = settings.duration * 60;
  const progress = isBlocking ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // ── persist settings ──────────────────────────────────────────────────────

  const saveSettings = useCallback((s: AppBlockerSettings) => {
    setSettings(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {/* */}
  }, []);

  // ── mascot helpers ────────────────────────────────────────────────────────

  const setMascot = useCallback((mood: MascotMood) => {
    const msgs = MASCOT_MESSAGES[mood];
    setMascotMood(mood);
    setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  }, []);

  // ── focus loss detection ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isBlocking) return;

    const handleBlur = () => {
      if (!isBlocking) return;
      if (settings.alarmEnabled) playAlarmSound();
      setMascot("warning");
      setShowWarning(true);
      if (warningRef.current) clearTimeout(warningRef.current);
      warningRef.current = setTimeout(() => {
        setShowWarning(false);
        setMascot("focused");
      }, 5000);
    };

    const handleVisibility = () => {
      if (document.hidden && isBlocking) handleBlur();
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isBlocking, settings.alarmEnabled, setMascot]);

  // ── countdown ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isBlocking) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isBlocking]);

  // ── periodic messages ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isBlocking) return;

    messageRef.current = setInterval(() => {
      setMascot("encouraging");
      // rotate tasks
      if (activeTasks.length > 0) {
        setCurrentTaskIndex((i) => (i + 1) % activeTasks.length);
      }
    }, 120_000); // every 2 minutes

    return () => clearInterval(messageRef.current!);
  }, [isBlocking, activeTasks.length, setMascot]);

  // ── idle animations ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isBlocking) return;

    idleAnimRef.current = setInterval(() => {
      if (mascotMood === "focused" || mascotMood === "encouraging") {
        const r = Math.random();
        if (r < 0.4) setMascot("encouraging");
        else setMascot("focused");
      }
    }, 8000);

    return () => clearInterval(idleAnimRef.current!);
  }, [isBlocking, mascotMood, setMascot]);

  // ── complete ──────────────────────────────────────────────────────────────

  const handleComplete = useCallback(() => {
    clearInterval(timerRef.current!);
    clearInterval(messageRef.current!);
    clearInterval(idleAnimRef.current!);
    playSuccessSound();
    setMascot("celebrating");
    setIsBlocking(false);
    setSessionComplete(true);
    try {
      document.exitFullscreen?.();
    } catch {/* */}
    setTimeout(() => setSessionComplete(false), 6000);
  }, [setMascot]);

  // ── start blocking ────────────────────────────────────────────────────────

  const startBlocking = () => {
    setTimeLeft(settings.duration * 60);
    setCurrentTaskIndex(0);
    setSessionComplete(false);
    setShowWarning(false);
    setIsBlocking(true);
    setMascot("focused");
    try {
      document.documentElement.requestFullscreen?.();
    } catch {/* */}
  };

  const stopBlocking = () => {
    setShowStopConfirm(false);
    setIsBlocking(false);
    clearInterval(timerRef.current!);
    clearInterval(messageRef.current!);
    clearInterval(idleAnimRef.current!);
    setMascot("idle");
    try {
      document.exitFullscreen?.();
    } catch {/* */}
  };

  // ── format time ───────────────────────────────────────────────────────────

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // BLOCKING OVERLAY
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Main trigger card ────────────────────────────────── */}
      <AnimatePresence>
        {!isBlocking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 shadow-2xl p-6 max-w-md mx-auto"
          >
            {/* bg particles */}
            <div className="pointer-events-none absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-indigo-500/10"
                  style={{
                    width: 60 + i * 20,
                    height: 60 + i * 20,
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-5 text-center">
              {/* Mascot */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <AkoMascot mood={sessionComplete ? "celebrating" : "idle"} size={88} />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Focus Mode</h2>
                <p className="text-indigo-300 text-sm mt-1">
                  {sessionComplete ? "Great session! You're amazing 🎉" : "Block distractions, stay on track~"}
                </p>
              </div>

              {/* Duration badge */}
              <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium border border-indigo-500/30">
                <Clock size={14} />
                <span>{settings.duration} min session</span>
              </div>

              {/* Active tasks preview */}
              {settings.taskRemindersEnabled && activeTasks.length > 0 && (
                <div className="w-full bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-xs text-slate-400 mb-2 text-left">Today's focus:</p>
                  <div className="flex flex-col gap-1.5">
                    {activeTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-left">
                        <ChevronRight size={12} className="text-indigo-400 shrink-0" />
                        <span className="text-white/80 text-sm truncate">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocked apps preview */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {settings.blockedApps.slice(0, 4).map((app) => (
                  <span key={app} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2.5 py-0.5">
                    🚫 {app}
                  </span>
                ))}
                {settings.blockedApps.length > 4 && (
                  <span className="text-xs text-slate-400 py-0.5">+{settings.blockedApps.length - 4} more</span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startBlocking}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl py-3 shadow-lg shadow-indigo-500/30"
                >
                  <Shield size={18} />
                  Start Focus
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-2xl px-4 border border-white/10 transition-colors"
                >
                  <Settings size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BLOCKING OVERLAY ──────────────────────────────────── */}
      <AnimatePresence>
        {isBlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + (i % 5) * 3,
                    height: 4 + (i % 5) * 3,
                    left: `${(i * 17 + 5) % 100}%`,
                    top: `${(i * 13 + 10) % 100}%`,
                    background: i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#a78bfa" : "#f9a8d4",
                    opacity: 0.4,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    x: [-10, 10, -10],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-sm w-full text-center">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-indigo-400" />
                <span className="text-indigo-300 font-semibold text-sm tracking-widest uppercase">Focus Mode Active</span>
              </div>

              {/* Timer */}
              <div className="relative">
                <div className="text-8xl font-black text-white tracking-tighter font-mono tabular-nums drop-shadow-2xl">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-indigo-300 text-sm mt-1">{settings.duration} min session</div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Mascot */}
              <motion.div
                animate={
                  mascotMood === "celebrating"
                    ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }
                    : mascotMood === "warning"
                    ? { x: [-5, 5, -5, 5, 0], scale: [1, 1.05, 1] }
                    : { y: [0, -6, 0] }
                }
                transition={{ duration: mascotMood === "warning" ? 0.4 : 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <AkoMascot mood={mascotMood} size={100} />
              </motion.div>

              {/* Mascot speech bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mascotMessage}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-white text-sm font-medium shadow-lg max-w-xs"
                >
                  {mascotMessage}
                </motion.div>
              </AnimatePresence>

              {/* Warning banner */}
              <AnimatePresence>
                {showWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-2xl px-5 py-3 text-sm font-medium"
                  >
                    <AlertTriangle size={16} />
                    <span>Hey! Stay focused! Come back! 😤</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tasks + Activities */}
              <div className="w-full grid grid-cols-2 gap-3">
                {/* Active task */}
                {settings.taskRemindersEnabled && activeTasks.length > 0 && (
                  <div className="col-span-2 bg-white/8 border border-white/10 rounded-2xl p-4 text-left">
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">Current Task</p>
                    <p className="text-white font-medium truncate">
                      {activeTasks[currentTaskIndex % activeTasks.length]?.title}
                    </p>
                    {activeTasks.length > 1 && (
                      <p className="text-slate-500 text-xs mt-1">+{activeTasks.length - 1} more tasks pending</p>
                    )}
                  </div>
                )}

                {/* Suggested activities */}
                {settings.suggestedActivities.length > 0 && (
                  <div className="col-span-2 bg-white/8 border border-white/10 rounded-2xl p-4 text-left">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap size={12} className="text-yellow-400" />
                      <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">On break, try:</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {settings.suggestedActivities.slice(0, 3).map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                          <span className="text-yellow-400">{getActivityIcon(act)}</span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blocked apps note */}
              <p className="text-slate-500 text-xs">
                Resist: {settings.blockedApps.slice(0, 3).join(", ")}
                {settings.blockedApps.length > 3 ? `...` : ""}
              </p>

              {/* Stop button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowStopConfirm(true)}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm py-2"
              >
                <ShieldOff size={15} />
                End session early
              </motion.button>
            </div>

            {/* ── Stop confirmation ── */}
            <AnimatePresence>
              {showStopConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10 p-6"
                >
                  <motion.div
                    initial={{ scale: 0.85, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.85, y: 20 }}
                    className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                  >
                    <AkoMascot mood="warning" size={72} />
                    <h3 className="text-white text-xl font-bold mt-4">Give up already? 😤</h3>
                    <p className="text-slate-400 text-sm mt-2 mb-6">
                      You still have {formatTime(timeLeft)} left! Don't break your streak — Ako believes in you!
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowStopConfirm(false)}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl py-3 shadow-lg"
                      >
                        Keep going! 💪
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={stopBlocking}
                        className="bg-white/10 text-slate-300 hover:bg-red-500/20 hover:text-red-300 rounded-2xl px-4 transition-colors border border-white/10"
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

      {/* ── SETTINGS MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white text-lg font-bold">Focus Settings</h3>
                  <p className="text-slate-400 text-sm">Customize your blocking session</p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {/* Duration */}
                <section>
                  <label className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={12} />
                    Session Duration
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[15, 25, 30, 45, 60].map((d) => (
                      <motion.button
                        key={d}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveSettings({ ...settings, duration: d })}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          settings.duration === d
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-white/8 text-slate-300 hover:bg-white/15 border border-white/10"
                        }`}
                      >
                        {d}m
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Blocked apps */}
                <section>
                  <label className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldOff size={12} />
                    Apps to Avoid
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.blockedApps.map((app) => (
                      <span
                        key={app}
                        className="flex items-center gap-1.5 text-xs bg-red-500/15 text-red-300 border border-red-500/25 rounded-full px-3 py-1"
                      >
                        🚫 {app}
                        <button
                          onClick={() =>
                            saveSettings({
                              ...settings,
                              blockedApps: settings.blockedApps.filter((a) => a !== app),
                            })
                          }
                          className="text-red-400 hover:text-white ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newApp}
                      onChange={(e) => setNewApp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newApp.trim()) {
                          saveSettings({ ...settings, blockedApps: [...settings.blockedApps, newApp.trim()] });
                          setNewApp("");
                        }
                      }}
                      placeholder="Add app (press Enter)"
                      className="flex-1 bg-white/8 border border-white/15 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50"
                    />
                    <button
                      onClick={() => {
                        if (newApp.trim()) {
                          saveSettings({ ...settings, blockedApps: [...settings.blockedApps, newApp.trim()] });
                          setNewApp("");
                        }
                      }}
                      className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-xl px-3 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>

                {/* Suggested activities */}
                <section>
                  <label className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Zap size={12} />
                    Break Activities
                  </label>
                  <div className="flex flex-col gap-1.5 mb-3">
                    {settings.suggestedActivities.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                      >
                        <span className="text-sm text-slate-300 flex items-center gap-2">
                          <span className="text-yellow-400">{getActivityIcon(act)}</span>
                          {act}
                        </span>
                        <button
                          onClick={() =>
                            saveSettings({
                              ...settings,
                              suggestedActivities: settings.suggestedActivities.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newActivity.trim()) {
                          saveSettings({
                            ...settings,
                            suggestedActivities: [...settings.suggestedActivities, newActivity.trim()],
                          });
                          setNewActivity("");
                        }
                      }}
                      placeholder="Add activity (press Enter)"
                      className="flex-1 bg-white/8 border border-white/15 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500/50"
                    />
                    <button
                      onClick={() => {
                        if (newActivity.trim()) {
                          saveSettings({
                            ...settings,
                            suggestedActivities: [...settings.suggestedActivities, newActivity.trim()],
                          });
                          setNewActivity("");
                        }
                      }}
                      className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl px-3 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>

                {/* Toggles */}
                <section className="flex flex-col gap-3">
                  {[
                    {
                      label: "Task Reminders",
                      desc: "Show active tasks during focus",
                      icon: <CheckCircle size={15} />,
                      value: settings.taskRemindersEnabled,
                      key: "taskRemindersEnabled" as keyof AppBlockerSettings,
                      color: "indigo",
                    },
                    {
                      label: "Alarm Sound",
                      desc: "Play alert when you leave the app",
                      icon: settings.alarmEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />,
                      value: settings.alarmEnabled,
                      key: "alarmEnabled" as keyof AppBlockerSettings,
                      color: "purple",
                    },
                  ].map(({ label, desc, icon, value, key, color }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-${color}-400`}>{icon}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{label}</p>
                          <p className="text-slate-400 text-xs">{desc}</p>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => saveSettings({ ...settings, [key]: !value })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          value ? `bg-${color}-500` : "bg-white/20"
                        }`}
                      >
                        <motion.div
                          animate={{ x: value ? 20 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </motion.button>
                    </div>
                  ))}
                </section>

                {/* Save button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl py-3 shadow-lg shadow-indigo-500/20"
                >
                  Save Settings ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session complete celebration ─────────────────────── */}
      <AnimatePresence>
        {sessionComplete && !isBlocking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[700] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ["#818cf8", "#f9a8d4", "#fbbf24", "#34d399"][i % 4],
                    left: `${15 + (i * 7) % 70}%`,
                    top: `${10 + (i * 11) % 80}%`,
                  }}
                  animate={{ y: [-20, -60], opacity: [1, 0], scale: [1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              <AkoMascot mood="celebrating" size={100} />
              <h2 className="text-3xl font-black text-white mt-4">Session Complete!</h2>
              <p className="text-indigo-300 mt-2">You stayed focused for {settings.duration} minutes! 🎉</p>
              <div className="flex items-center justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star size={20} className="text-yellow-400 fill-yellow-400" />
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
