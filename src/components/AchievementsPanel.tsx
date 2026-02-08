import { motion } from 'framer-motion';
import { Trophy, Star, Lock, Crown, Sparkles } from 'lucide-react';
import { useGamificationStore } from '@/hooks/useGamificationStore';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-indigo-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-yellow-500 to-orange-600',
};

const rarityBorders = {
  common: 'border-gray-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30 shadow-lg shadow-yellow-500/20',
};

const AchievementsPanel = ({ isOpen, onClose }: AchievementsPanelProps) => {
  const { getAchievements, stats } = useGamificationStore();
  const achievements = getAchievements();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Achievements</h2>
                <p className="text-sm text-muted-foreground">
                  {unlockedCount}/{totalCount} unlocked
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Level</p>
              <p className="text-2xl font-bold text-primary">{stats.level}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{stats.xp} XP</span>
              <span>{stats.xpToNextLevel} XP to next level</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 border-b border-border">
          <div className="text-center">
            <p className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p>
            <p className="text-xs text-muted-foreground">Focus Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalTasksCompleted}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}🔥</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white ${rarityBorders[achievement.rarity]}`
                    : 'bg-muted/50 border-border opacity-60'
                }`}
              >
                {/* Rarity Badge */}
                {achievement.rarity === 'legendary' && (
                  <Crown className="absolute top-2 right-2 w-4 h-4 text-yellow-300" />
                )}
                {achievement.rarity === 'epic' && (
                  <Sparkles className="absolute top-2 right-2 w-4 h-4 text-purple-300" />
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                    achievement.unlocked ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${
                      achievement.unlocked ? 'text-white' : 'text-foreground'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-xs mt-0.5 ${
                      achievement.unlocked ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {/* Progress */}
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{achievement.progress}</span>
                          <span>{achievement.requirement}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementsPanel;
