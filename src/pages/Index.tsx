import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Mascot, { MascotMood } from '@/components/Mascot';
import MotivationalQuote from '@/components/MotivationalQuote';
import StreakTracker from '@/components/StreakTracker';
import PomodoroTimer, { PomodoroTimerRef } from '@/components/PomodoroTimer';
import TaskManager from '@/components/TaskManager';
import RecommendedActions from '@/components/RecommendedActions';
import GoalsTracker from '@/components/GoalsTracker';
import KanbanBoard from '@/components/KanbanBoard';
import CalendarView from '@/components/CalendarView';
import Dashboard from '@/components/Dashboard';
import CommandBar from '@/components/CommandBar';
import RemindersWidget from '@/components/RemindersWidget';
import QuickNotes from '@/components/QuickNotes';
import TimeManagementMethods from '@/components/TimeManagementMethods';
import AppBlocker from '@/components/AppBlocker';
import { useTasksStore } from '@/hooks/useTasksStore';
import {
  LayoutDashboard,
  Target,
  LayoutGrid,
  Calendar,
  BarChart3,
  Home,
  Sparkles,
  Shield,
} from 'lucide-react';
import ModomoroMode from '@/components/ModomoroMode';
import AkoChat from '@/components/AkoChat';

const mascotMessages: Record<MascotMood, string[]> = {
  encouraging: [
    "You're doing amazing! Keep that momentum going! 💪",
    "Every step forward counts. I'm proud of your progress!",
    "You've got this! Let's make today count! ✨",
  ],
  neutral: [
    "Ready to make today productive? I'm here to help!",
    "What would you like to focus on today?",
    "Let's plan your next productive session together.",
  ],
  firm: [
    "Time to get back on track. You can do this!",
    "Remember your goals. Let's refocus and push forward.",
    "A small setback is just a setup for a comeback!",
  ],
  thinking: [
    "Hmm, let me analyze your productivity patterns...",
    "I'm thinking about the best strategy for you...",
    "Processing... Finding the optimal approach!",
  ],
  surprised: [
    "Wow! That was an incredible focus session! 🎉",
    "Amazing progress! You've exceeded my expectations!",
    "I didn't expect that level of dedication! Fantastic!",
  ],
  casual: [
    "Hey there! Ready for another productive day?",
    "Taking it easy? That's okay, rest is important too!",
    "How are you feeling today? Let's check in together.",
  ],
};

type ViewType = 'home' | 'tasks' | 'kanban' | 'calendar' | 'goals' | 'dashboard' | 'focus';

const viewTabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: LayoutDashboard },
  { id: 'focus', label: 'Focus', icon: Shield },
  { id: 'kanban', label: 'Board', icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

const Index = () => {
  const { tasks } = useTasksStore();
  const [mascotMessage, setMascotMessage] = useState(mascotMessages.neutral[0]);
  const [mascotMood, setMascotMood] = useState<MascotMood>('casual');
  const [streak, setStreak] = useState(7);
  const [timeSaved, setTimeSaved] = useState(342);
  const [bestStreak, setBestStreak] = useState(14);
  const [isTyping, setIsTyping] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isModomoroOpen, setIsModomoroOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const timerRef = useRef<PomodoroTimerRef>(null);

  const changeMascotState = (mood: MascotMood, customMessage?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMascotMood(mood);
      const messages = mascotMessages[mood];
      setMascotMessage(customMessage || messages[Math.floor(Math.random() * messages.length)]);
      setIsTyping(false);
    }, 800);
  };

  // Keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Initial greeting
    setTimeout(() => {
      changeMascotState('casual', "Welcome back! Ready to crush your goals today? 🌟");
    }, 1000);

    // Rotate mascot messages periodically
    const interval = setInterval(() => {
      const moods: MascotMood[] = ['encouraging', 'neutral', 'casual'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      changeMascotState(randomMood);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTimerComplete = (mode: 'focus' | 'break') => {
    if (mode === 'focus') {
      setTimeSaved((prev) => prev + 25);
      changeMascotState('surprised', "Excellent focus session! You've earned a well-deserved break! 🎉");
    } else {
      changeMascotState('encouraging', "Break's over! Ready to dive back into deep work? Let's go! 💪");
    }
  };

  const handleTaskComplete = () => {
    changeMascotState('encouraging', "Great job completing that task! You're making real progress today! ⭐");
  };

  const handleGoalComplete = () => {
    changeMascotState('surprised', "🎯 Goal achieved! You're absolutely crushing it today!");
  };

  const handleStartTimer = useCallback((duration: number, title: string) => {
    timerRef.current?.startWithDuration(duration, title);
    changeMascotState('thinking', `Starting ${duration}-minute timer for "${title}". Let's focus! 🎯`);
  }, []);

  const handleNavigate = useCallback((view: string) => {
    const validViews: ViewType[] = ['home', 'tasks', 'kanban', 'calendar', 'goals', 'dashboard', 'focus'];
    if (validViews.includes(view as ViewType)) {
      setActiveView(view as ViewType);
    }
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'focus':
        return <AppBlocker tasks={tasks.filter(t => !t.completed).map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority }))} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'goals':
        return <GoalsTracker onGoalComplete={handleGoalComplete} />;
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManager onTaskComplete={handleTaskComplete} />;
      case 'home':
      default:
        return (
          <div className="space-y-6">
            {/* Motivational Quote Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <MotivationalQuote />
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <StreakTracker currentStreak={streak} timeSaved={timeSaved} bestStreak={bestStreak} />
            </motion.div>

            {/* Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <PomodoroTimer ref={timerRef} onComplete={handleTimerComplete} />
            </motion.div>

            {/* Time Management Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <TimeManagementMethods onStartTimer={handleStartTimer} />
            </motion.div>

            {/* Task Manager */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <TaskManager onTaskComplete={handleTaskComplete} />
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Header activeView={activeView} onNavigate={handleNavigate} onOpenModomoro={() => setIsPomodoroOpen(true)} />

      {/* Pomodoro Mode */}
      <ModomoroMode isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />

      {/* Command Bar */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onNavigate={handleNavigate}
        onStartTimer={handleStartTimer}
      />

      {/* View Tabs */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {viewTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ViewType)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeView === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}

            {/* Pomodoro Mode Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPomodoroOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Pomodoro</span>
            </motion.button>

            {/* Command Bar Trigger */}
            <button
              onClick={() => setIsCommandBarOpen(true)}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <span>Search</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
       {/* Ako AI Chat */}
       <AkoChat
         timerState="idle"
         completedTasks={0}
       />
 
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Mascot & Widgets */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mascot Section - Hero Size */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-6 lg:sticky lg:top-28"
            >
              <Mascot
                message={mascotMessage}
                mood={mascotMood}
                isTyping={isTyping}
                size="hero"
                showSpeechBubble={true}
              />
            </motion.div>

            {/* Recommended Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <RecommendedActions onStartTimer={handleStartTimer} />
            </motion.div>

            {/* Reminders Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <RemindersWidget />
            </motion.div>

            {/* Quick Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <QuickNotes />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
