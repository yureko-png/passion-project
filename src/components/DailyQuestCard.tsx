import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, Star, Zap } from 'lucide-react';
import { useGamificationStore } from '@/hooks/useGamificationStore';

interface DailyQuestCardProps {
  compact?: boolean;
}

const DailyQuestCard = ({ compact = false }: DailyQuestCardProps) => {
  const { dailyQuest, questProgress, stats } = useGamificationStore();
  
  const progressPercent = Math.min((questProgress / dailyQuest.target) * 100, 100);
  const isComplete = questProgress >= dailyQuest.target;

  const questIcons = {
    focus_time: Clock,
    tasks_completed: CheckCircle,
    no_distraction: Target,
    early_bird: Star,
    streak: Zap,
  };
  
  const QuestIcon = questIcons[dailyQuest.type] || Target;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          isComplete
            ? 'bg-primary/10 border-primary/30'
            : 'bg-muted/50 border-border'
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {isComplete ? '✓' : <QuestIcon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{dailyQuest.title}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {questProgress}/{dailyQuest.target}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
        isComplete
          ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30'
          : 'bg-card border-border'
      }`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={isComplete ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0, repeatDelay: 2 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isComplete
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted'
              }`}
            >
              {isComplete ? (
                <span className="text-2xl">🎉</span>
              ) : (
                <QuestIcon className="w-6 h-6" />
              )}
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Quest</p>
              <h3 className="font-bold text-lg">{dailyQuest.title}</h3>
            </div>
          </div>
          
          {/* Reward Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span>+{dailyQuest.rewardAmount}</span>
            <span>{dailyQuest.reward === 'xp' ? 'XP' : dailyQuest.reward === 'rare_voice' ? '🎤' : '🏆'}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {dailyQuest.description}
        </p>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-medium ${isComplete ? 'text-primary' : ''}`}>
              {questProgress}/{dailyQuest.target}
              {dailyQuest.type === 'focus_time' && ' min'}
              {dailyQuest.type === 'tasks_completed' && ' tasks'}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isComplete
                  ? 'bg-gradient-to-r from-primary to-accent'
                  : 'bg-primary'
              }`}
            />
          </div>
        </div>

        {/* Complete State */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-primary/10 text-center"
          >
            <p className="text-sm font-medium text-primary">
              ✨ Quest Complete! Ako is proud of you, Sensei~!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyQuestCard;
