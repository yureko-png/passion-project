import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import LionMascot from '@/components/LionMascot';
import MotivationalQuote from '@/components/MotivationalQuote';
import StreakTracker from '@/components/StreakTracker';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskManager from '@/components/TaskManager';
import RecommendedActions from '@/components/RecommendedActions';

const mascotMessages = [
  "Ready to make today count? Let's focus on what matters most!",
  "Remember, small consistent steps lead to massive results.",
  "I believe in you! Let's tackle those goals together.",
  "Every minute you invest in focus pays dividends in success.",
  "You're building an unstoppable streak. Keep going!",
  "Time to turn intentions into actions. What's your priority?",
];

const Index = () => {
  const [mascotMessage, setMascotMessage] = useState(mascotMessages[0]);
  const [mascotMood, setMascotMood] = useState<'encouraging' | 'neutral' | 'firm'>('encouraging');
  const [streak, setStreak] = useState(7);
  const [timeSaved, setTimeSaved] = useState(342);
  const [bestStreak, setBestStreak] = useState(14);

  useEffect(() => {
    // Rotate mascot messages periodically
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * mascotMessages.length);
      setMascotMessage(mascotMessages[randomIndex]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleTimerComplete = (mode: 'focus' | 'break') => {
    if (mode === 'focus') {
      setTimeSaved((prev) => prev + 25);
      setMascotMessage("Excellent focus session! You've earned a break. Take a moment to recharge.");
      setMascotMood('encouraging');
    } else {
      setMascotMessage("Break's over! Ready to dive back into deep work?");
      setMascotMood('neutral');
    }
  };

  const handleTaskComplete = () => {
    setMascotMessage("Great job completing that task! You're making real progress today.");
    setMascotMood('encouraging');
  };

  return (
    <div className="min-h-screen pb-8">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Motivational Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <MotivationalQuote />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <StreakTracker currentStreak={streak} timeSaved={timeSaved} bestStreak={bestStreak} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Timer & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <PomodoroTimer onComplete={handleTimerComplete} />
            <TaskManager onTaskComplete={handleTaskComplete} />
          </div>

          {/* Right Column - Mascot & Recommendations */}
          <div className="space-y-6">
            {/* Mascot Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-6"
            >
              <LionMascot message={mascotMessage} mood={mascotMood} />
            </motion.div>

            {/* Recommended Actions */}
            <RecommendedActions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
