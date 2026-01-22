import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  timeSaved: number; // in minutes
  bestStreak: number;
}

const StreakTracker = ({ currentStreak, timeSaved, bestStreak }: StreakTrackerProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card-hover p-5 text-center"
      >
        <div className="flex justify-center mb-3">
          <motion.div
            className="streak-flame"
            whileHover={{ scale: 1.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 streak-gradient rounded-full blur-lg opacity-50" />
              <div className="relative w-12 h-12 streak-gradient rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
        <motion.p
          className="text-3xl font-bold spirit-gradient-text mb-1"
          key={currentStreak}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {currentStreak}
        </motion.p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Day Streak
        </p>
      </motion.div>

      {/* Time Saved */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card-hover p-5 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground mb-1">
          {formatTime(timeSaved)}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Time Saved
        </p>
      </motion.div>

      {/* Best Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card-hover p-5 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground mb-1">
          {bestStreak}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Best Streak
        </p>
      </motion.div>
    </div>
  );
};

export default StreakTracker;
