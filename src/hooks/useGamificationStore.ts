import { useState, useEffect, useCallback } from 'react';
import { achievements, Achievement, DailyQuest, getDailyQuest, rareVoiceLines, AkoDialogue } from '@/data/akoPersonality';

export interface GamificationStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalFocusMinutes: number;
  totalTasksCompleted: number;
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
  unlockedAchievements: string[];
  unlockedRareVoices: number[];
  lastActiveDate: string;
}

const defaultStats: GamificationStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalFocusMinutes: 0,
  totalTasksCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalSessions: 0,
  unlockedAchievements: [],
  unlockedRareVoices: [],
  lastActiveDate: '',
};

const STORAGE_KEY = 'ako-gamification-stats';

const calculateXpToNextLevel = (level: number): number => {
  // Exponential growth: each level requires more XP
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

const loadStats = (): GamificationStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultStats, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load gamification stats:', e);
  }
  return defaultStats;
};

const saveStats = (stats: GamificationStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save gamification stats:', e);
  }
};

// Global state
let globalStats = loadStats();
const listeners = new Set<() => void>();

export const useGamificationStore = () => {
  const [stats, setLocalStats] = useState<GamificationStats>(globalStats);
  const [dailyQuest, setDailyQuest] = useState<DailyQuest>(getDailyQuest());
  const [questProgress, setQuestProgress] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [levelUpTriggered, setLevelUpTriggered] = useState(false);

  useEffect(() => {
    const listener = () => {
      globalStats = loadStats();
      setLocalStats(globalStats);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Check and update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (globalStats.lastActiveDate !== today) {
      if (globalStats.lastActiveDate === yesterday) {
        // Continue streak
      } else if (globalStats.lastActiveDate !== '') {
        // Streak broken
        globalStats = { ...globalStats, currentStreak: 0 };
        saveStats(globalStats);
        setLocalStats(globalStats);
      }
    }
  }, []);

  const addXp = useCallback((amount: number): { leveledUp: boolean; newLevel?: number } => {
    let newXp = globalStats.xp + amount;
    let newLevel = globalStats.level;
    let xpToNext = globalStats.xpToNextLevel;
    let leveledUp = false;
    
    // Check for level up(s)
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = calculateXpToNextLevel(newLevel);
      leveledUp = true;
    }
    
    globalStats = {
      ...globalStats,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
    };
    saveStats(globalStats);
    setLocalStats(globalStats);
    listeners.forEach(l => l());
    
    if (leveledUp) {
      setLevelUpTriggered(true);
      setTimeout(() => setLevelUpTriggered(false), 3000);
      checkAchievements();
    }
    
    return { leveledUp, newLevel: leveledUp ? newLevel : undefined };
  }, []);

  const addFocusTime = useCallback((minutes: number) => {
    const today = new Date().toDateString();
    let newStreak = globalStats.currentStreak;
    
    if (globalStats.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (globalStats.lastActiveDate === yesterday || globalStats.lastActiveDate === '') {
        newStreak = globalStats.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }
    
    globalStats = {
      ...globalStats,
      totalFocusMinutes: globalStats.totalFocusMinutes + minutes,
      totalSessions: globalStats.totalSessions + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(globalStats.bestStreak, newStreak),
      lastActiveDate: today,
    };
    saveStats(globalStats);
    setLocalStats(globalStats);
    
    // Add XP for focus time
    addXp(Math.floor(minutes * 2));
    checkAchievements();
    updateQuestProgress();
  }, [addXp]);

  const addTaskCompleted = useCallback(() => {
    globalStats = {
      ...globalStats,
      totalTasksCompleted: globalStats.totalTasksCompleted + 1,
    };
    saveStats(globalStats);
    setLocalStats(globalStats);
    
    addXp(15);
    checkAchievements();
    updateQuestProgress();
  }, [addXp]);

  const checkAchievements = useCallback(() => {
    const newUnlocked: Achievement[] = [];
    
    achievements.forEach(achievement => {
      if (globalStats.unlockedAchievements.includes(achievement.id)) return;
      
      let progress = 0;
      switch (achievement.type) {
        case 'focus_hours':
          progress = globalStats.totalFocusMinutes;
          break;
        case 'tasks_completed':
          progress = globalStats.totalTasksCompleted;
          break;
        case 'streak':
          progress = globalStats.currentStreak;
          break;
        case 'level':
          progress = globalStats.level;
          break;
        case 'sessions':
          progress = globalStats.totalSessions;
          break;
      }
      
      if (progress >= achievement.requirement) {
        newUnlocked.push(achievement);
      }
    });
    
    if (newUnlocked.length > 0) {
      globalStats = {
        ...globalStats,
        unlockedAchievements: [...globalStats.unlockedAchievements, ...newUnlocked.map(a => a.id)],
      };
      saveStats(globalStats);
      setLocalStats(globalStats);
      
      // Show first new achievement
      setNewAchievement(newUnlocked[0]);
      setTimeout(() => setNewAchievement(null), 5000);
    }
  }, []);

  const updateQuestProgress = useCallback(() => {
    const quest = getDailyQuest();
    let progress = 0;
    
    switch (quest.type) {
      case 'focus_time':
        const todaysFocusKey = `focus_today_${new Date().toDateString()}`;
        const todaysFocus = parseInt(localStorage.getItem(todaysFocusKey) || '0');
        progress = todaysFocus;
        break;
      case 'tasks_completed':
        const todaysTasksKey = `tasks_today_${new Date().toDateString()}`;
        const todaysTasks = parseInt(localStorage.getItem(todaysTasksKey) || '0');
        progress = todaysTasks;
        break;
      case 'streak':
        progress = globalStats.currentStreak;
        break;
    }
    
    setQuestProgress(Math.min(progress, quest.target));
  }, []);

  const unlockRareVoice = useCallback((): AkoDialogue | null => {
    const availableIndices = rareVoiceLines
      .map((_, i) => i)
      .filter(i => !globalStats.unlockedRareVoices.includes(i));
    
    if (availableIndices.length === 0) return null;
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    globalStats = {
      ...globalStats,
      unlockedRareVoices: [...globalStats.unlockedRareVoices, randomIndex],
    };
    saveStats(globalStats);
    setLocalStats(globalStats);
    
    return rareVoiceLines[randomIndex];
  }, []);

  const getRandomRareVoice = useCallback((): AkoDialogue | null => {
    if (globalStats.unlockedRareVoices.length === 0) return null;
    const randomIndex = globalStats.unlockedRareVoices[
      Math.floor(Math.random() * globalStats.unlockedRareVoices.length)
    ];
    return rareVoiceLines[randomIndex];
  }, []);

  const getAchievements = useCallback(() => {
    return achievements.map(a => ({
      ...a,
      unlocked: globalStats.unlockedAchievements.includes(a.id),
      progress: (() => {
        switch (a.type) {
          case 'focus_hours': return globalStats.totalFocusMinutes;
          case 'tasks_completed': return globalStats.totalTasksCompleted;
          case 'streak': return globalStats.currentStreak;
          case 'level': return globalStats.level;
          case 'sessions': return globalStats.totalSessions;
          default: return 0;
        }
      })(),
    }));
  }, [stats]);

  return {
    stats,
    dailyQuest,
    questProgress,
    newAchievement,
    levelUpTriggered,
    addXp,
    addFocusTime,
    addTaskCompleted,
    unlockRareVoice,
    getRandomRareVoice,
    getAchievements,
    updateQuestProgress,
  };
};
