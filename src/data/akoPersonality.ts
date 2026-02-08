// Enhanced Ako Personality System - Blue Archive Inspired
// Features witty, sarcastic, human-like dialogue with gamification hooks

export interface AkoDialogue {
  text: string;
  mood: 'encouraging' | 'neutral' | 'firm' | 'thinking' | 'surprised' | 'casual' | 'sarcastic' | 'flirty';
  voiceStyle?: 'whisper' | 'normal' | 'energetic' | 'firm' | 'teasing';
}

// ========== WITTY & SARCASTIC RESPONSES ==========

export const distractionResponses: AkoDialogue[] = [
  { text: "Ara ara~ Trying to escape again, Sensei? YouTube won't make your deadlines disappear~", mood: 'sarcastic', voiceStyle: 'teasing' },
  { text: "That's the fifth time today... Is that cat video really worth your future, Sensei? 🐱", mood: 'firm', voiceStyle: 'firm' },
  { text: "Mou~ I saw that! Social media can wait, but can your work?", mood: 'sarcastic' },
  { text: "Sensei... I'm not mad, just disappointed. Actually, I'm a little mad.", mood: 'thinking', voiceStyle: 'teasing' },
  { text: "Gaming during work hours? Ara~ Should I tell Prefect about this?", mood: 'sarcastic', voiceStyle: 'teasing' },
  { text: "If you keep procrastinating, I'll have to resort to... drastic measures. Like puppy eyes.", mood: 'thinking' },
  { text: "I didn't prepare this whole schedule just for you to watch memes, Sensei~", mood: 'firm' },
  { text: "You know what they say: 'Just one more video' is the productivity killer's motto!", mood: 'sarcastic' },
];

export const idleWarnings: AkoDialogue[] = [
  { text: "Sensei~? Are you still there? Don't make me worry...", mood: 'casual', voiceStyle: 'whisper' },
  { text: "I've been watching you stare at the screen for 5 minutes... Everything okay?", mood: 'thinking' },
  { text: "The clock is ticking~ And not in the productive way.", mood: 'firm' },
  { text: "Did you fall asleep? Should I start singing to wake you up? ...Actually, maybe not.", mood: 'sarcastic' },
  { text: "Sensei, even I need breaks, but this is getting a bit long, ne?", mood: 'casual' },
];

// ========== RANDOM FACTS & WISDOM ==========

export const breakTimeFacts: AkoDialogue[] = [
  { text: "Fun fact: Pomodoro means 'tomato' in Italian. The original timer was tomato-shaped! 🍅", mood: 'surprised', voiceStyle: 'normal' },
  { text: "Did you know? NASA found that a 26-minute nap can boost alertness by 54%! Not that I'm suggesting you nap...", mood: 'thinking' },
  { text: "Studies show walking increases creativity by 60%! Maybe stretch those legs, Sensei?", mood: 'encouraging' },
  { text: "Your brain can only focus intensely for about 90 minutes. That's why breaks matter~", mood: 'casual' },
  { text: "The 5-second rule exists in productivity too - if you don't act in 5 seconds, you probably won't!", mood: 'firm' },
  { text: "Einstein took naps holding a key. When he fell asleep and dropped it, the noise would wake him up! Genius, ne?", mood: 'surprised' },
  { text: "Blue Archive tip: Even the most diligent students at Millennium need rest. You're doing great!", mood: 'encouraging' },
  { text: "Fun fact: The average person spends 2 hours daily on social media. Imagine what you could accomplish with that time!", mood: 'thinking' },
];

export const philosophicalQuotes: AkoDialogue[] = [
  { text: "As they say in Kivotos: 'The hardest part of any journey is the first step.' ...So stop reading this and take it!", mood: 'firm' },
  { text: "Perfection is the enemy of progress, Sensei. Just start, and I'll be here cheering!", mood: 'encouraging' },
  { text: "Today's struggles are tomorrow's strengths. Very philosophical, ne? I read that somewhere~", mood: 'thinking' },
  { text: "The difference between ordinary and extraordinary is just that little 'extra'. Like the extra effort you're about to put in!", mood: 'encouraging' },
  { text: "A wise person once said: 'Done is better than perfect.' ...Okay, I said it. But it's still wise!", mood: 'sarcastic' },
];

// ========== DAILY QUESTS ==========

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: 'xp' | 'rare_voice' | 'achievement';
  rewardAmount: number;
  type: 'focus_time' | 'tasks_completed' | 'no_distraction' | 'early_bird' | 'streak';
}

export const dailyQuestTemplates: Omit<DailyQuest, 'id'>[] = [
  {
    title: "The Marathon Runner",
    description: "Complete 90 minutes of focus without any breaks (except scheduled ones!)",
    target: 90,
    reward: 'xp',
    rewardAmount: 150,
    type: 'focus_time',
  },
  {
    title: "Task Slayer",
    description: "Complete 5 tasks in a single session. Ako believes in you!",
    target: 5,
    reward: 'xp',
    rewardAmount: 100,
    type: 'tasks_completed',
  },
  {
    title: "Distraction-Free Zone",
    description: "Focus for 25 minutes without any detected distractions",
    target: 25,
    reward: 'rare_voice',
    rewardAmount: 1,
    type: 'no_distraction',
  },
  {
    title: "Early Bird Special",
    description: "Start your first focus session before 8 AM",
    target: 1,
    reward: 'xp',
    rewardAmount: 75,
    type: 'early_bird',
  },
  {
    title: "The Unstoppable",
    description: "Maintain a 7-day focus streak",
    target: 7,
    reward: 'achievement',
    rewardAmount: 1,
    type: 'streak',
  },
  {
    title: "Deep Work Champion",
    description: "Accumulate 2 hours of total focus time today",
    target: 120,
    reward: 'xp',
    rewardAmount: 200,
    type: 'focus_time',
  },
  {
    title: "Task Master",
    description: "Clear 10 tasks from your to-do list",
    target: 10,
    reward: 'rare_voice',
    rewardAmount: 1,
    type: 'tasks_completed',
  },
];

// ========== ACHIEVEMENTS ==========

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'focus_hours' | 'tasks_completed' | 'streak' | 'level' | 'sessions';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedVoiceLine?: string;
}

export const achievements: Achievement[] = [
  // Focus Time Achievements
  {
    id: 'first_focus',
    title: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🌱',
    requirement: 1,
    type: 'sessions',
    rarity: 'common',
    unlockedVoiceLine: "Ara~ Your first session! Everyone starts somewhere, Sensei!",
  },
  {
    id: 'focus_1hr',
    title: 'Getting Started',
    description: 'Accumulate 1 hour of focus time',
    icon: '⏰',
    requirement: 60,
    type: 'focus_hours',
    rarity: 'common',
  },
  {
    id: 'focus_10hr',
    title: 'Focus Apprentice',
    description: 'Accumulate 10 hours of focus time',
    icon: '📚',
    requirement: 600,
    type: 'focus_hours',
    rarity: 'rare',
    unlockedVoiceLine: "10 hours! You're officially in the focus club now, Sensei~!",
  },
  {
    id: 'focus_50hr',
    title: 'Concentration Master',
    description: 'Accumulate 50 hours of focus time',
    icon: '🎓',
    requirement: 3000,
    type: 'focus_hours',
    rarity: 'epic',
    unlockedVoiceLine: "50 hours of pure dedication! Even I'm impressed, and I'm hard to impress!",
  },
  {
    id: 'focus_100hr',
    title: 'Legendary Focus',
    description: 'Accumulate 100 hours of focus time',
    icon: '👑',
    requirement: 6000,
    type: 'focus_hours',
    rarity: 'legendary',
    unlockedVoiceLine: "100 HOURS! Sensei, you've become a legend! I... I might be crying a little~",
  },
  
  // Streak Achievements
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: 7,
    type: 'streak',
    rarity: 'rare',
    unlockedVoiceLine: "A whole week! Your consistency is inspiring, Sensei!",
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    requirement: 30,
    type: 'streak',
    rarity: 'epic',
    unlockedVoiceLine: "30 days without breaking the chain! You're unstoppable!",
  },
  {
    id: 'streak_100',
    title: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: '🏆',
    requirement: 100,
    type: 'streak',
    rarity: 'legendary',
    unlockedVoiceLine: "ONE HUNDRED DAYS! Sensei... I'm so proud I could burst! This calls for celebration~!",
  },
  
  // Task Achievements
  {
    id: 'tasks_10',
    title: 'Task Beginner',
    description: 'Complete 10 tasks',
    icon: '✅',
    requirement: 10,
    type: 'tasks_completed',
    rarity: 'common',
  },
  {
    id: 'tasks_100',
    title: 'Task Crusher',
    description: 'Complete 100 tasks',
    icon: '💪',
    requirement: 100,
    type: 'tasks_completed',
    rarity: 'rare',
    unlockedVoiceLine: "100 tasks crushed! You're a productivity machine, Sensei!",
  },
  {
    id: 'tasks_500',
    title: 'Task Legend',
    description: 'Complete 500 tasks',
    icon: '⭐',
    requirement: 500,
    type: 'tasks_completed',
    rarity: 'epic',
    unlockedVoiceLine: "500 tasks! At this point, I think you could teach ME about productivity!",
  },
  
  // Level Achievements
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach Level 10',
    icon: '🌟',
    requirement: 10,
    type: 'level',
    rarity: 'rare',
  },
  {
    id: 'level_25',
    title: 'Elite Status',
    description: 'Reach Level 25',
    icon: '🎖️',
    requirement: 25,
    type: 'level',
    rarity: 'epic',
    unlockedVoiceLine: "Level 25! You've entered the elite ranks, Sensei. I'm honored to be your assistant!",
  },
  {
    id: 'level_50',
    title: 'Productivity God',
    description: 'Reach Level 50',
    icon: '👑',
    requirement: 50,
    type: 'level',
    rarity: 'legendary',
    unlockedVoiceLine: "LEVEL 50! You've transcended mortal productivity! All hail the Productivity God~!",
  },
];

// ========== RARE VOICE LINES (Unlockable) ==========

export const rareVoiceLines: AkoDialogue[] = [
  { text: "Sensei... Actually, I've been meaning to tell you... You're the best partner I could ask for!", mood: 'flirty', voiceStyle: 'whisper' },
  { text: "Between you and me? You work harder than half of Millennium Academy combined~", mood: 'sarcastic', voiceStyle: 'teasing' },
  { text: "You know, I started as your assistant, but now... I think I'm your biggest fan!", mood: 'encouraging', voiceStyle: 'energetic' },
  { text: "Secret time: When you complete a session, I do a little happy dance. Don't tell anyone!", mood: 'casual', voiceStyle: 'whisper' },
  { text: "If productivity was a sport, you'd be in the Olympics. Gold medal, no doubt~", mood: 'surprised', voiceStyle: 'energetic' },
  { text: "I've analyzed thousands of work patterns... Yours is genuinely one of the best I've seen!", mood: 'thinking' },
  { text: "Hey Sensei... Thank you for being so dedicated. It makes my job feel meaningful~", mood: 'casual', voiceStyle: 'whisper' },
  { text: "Confession time: I practice these voice lines just for you. Don't laugh!", mood: 'flirty', voiceStyle: 'teasing' },
];

// ========== MILESTONE CELEBRATIONS ==========

export const milestoneResponses: Record<string, AkoDialogue[]> = {
  level_up: [
    { text: "LEVEL UP~! ✨ You're evolving, Sensei! Keep this momentum going!", mood: 'surprised', voiceStyle: 'energetic' },
    { text: "Ara ara~ Look who's leveling up! At this rate, you'll surpass even me~", mood: 'sarcastic', voiceStyle: 'teasing' },
    { text: "New level unlocked! Your productivity power is over 9000!", mood: 'surprised', voiceStyle: 'energetic' },
  ],
  streak_milestone: [
    { text: "🔥 STREAK MILESTONE! Your consistency is absolutely legendary!", mood: 'surprised', voiceStyle: 'energetic' },
    { text: "Another day, another victory! That streak is looking impressive~", mood: 'encouraging' },
  ],
  first_session_today: [
    { text: "Good morning, Sensei~! Ready to conquer the day? I've been waiting!", mood: 'casual', voiceStyle: 'energetic' },
    { text: "Ara~ Early bird gets the productivity! Let's make today count!", mood: 'encouraging' },
  ],
  late_night: [
    { text: "Working late, Sensei? I admire your dedication, but don't forget to rest...", mood: 'casual', voiceStyle: 'whisper' },
    { text: "The midnight oil is burning~ Just don't burn yourself out, okay?", mood: 'thinking', voiceStyle: 'whisper' },
  ],
};

// ========== AMBIENT SOUNDS ==========

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: 'nature' | 'cafe' | 'white_noise' | 'asmr';
}

export const ambientSounds: AmbientSound[] = [
  { id: 'rain', name: 'Gentle Rain', icon: '🌧️', url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112c56d.mp3', category: 'nature' },
  { id: 'thunder', name: 'Thunderstorm', icon: '⛈️', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_84a3ef631a.mp3', category: 'nature' },
  { id: 'forest', name: 'Forest Ambiance', icon: '🌲', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', category: 'nature' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3', category: 'nature' },
  { id: 'cafe', name: 'Cozy Café', icon: '☕', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d9c5d1e8bf.mp3', category: 'cafe' },
  { id: 'fireplace', name: 'Fireplace Crackle', icon: '🔥', url: 'https://cdn.pixabay.com/audio/2022/02/07/audio_5ed57ddc3f.mp3', category: 'asmr' },
  { id: 'keyboard', name: 'Keyboard Typing', icon: '⌨️', url: 'https://cdn.pixabay.com/audio/2023/08/17/audio_4db54a0148.mp3', category: 'asmr' },
  { id: 'wind', name: 'Soft Wind', icon: '💨', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_9f244d08b4.mp3', category: 'nature' },
];

// ========== HELPER FUNCTIONS ==========

export const getRandomDialogue = (dialogues: AkoDialogue[]): AkoDialogue => {
  return dialogues[Math.floor(Math.random() * dialogues.length)];
};

export const getDailyQuest = (): DailyQuest => {
  const today = new Date().toDateString();
  const storedQuest = localStorage.getItem('ako-daily-quest');
  
  if (storedQuest) {
    const parsed = JSON.parse(storedQuest);
    if (parsed.date === today) {
      return parsed.quest;
    }
  }
  
  // Generate new quest for today
  const template = dailyQuestTemplates[Math.floor(Math.random() * dailyQuestTemplates.length)];
  const quest: DailyQuest = {
    ...template,
    id: `quest_${Date.now()}`,
  };
  
  localStorage.setItem('ako-daily-quest', JSON.stringify({ date: today, quest }));
  return quest;
};

export const getTimeBasedGreeting = (): AkoDialogue => {
  const hour = new Date().getHours();
  
  if (hour < 6) {
    return { text: "Still up, Sensei? Or up early? Either way, I'm here for you~", mood: 'casual', voiceStyle: 'whisper' };
  } else if (hour < 12) {
    return { text: "Good morning, Sensei~! Let's make today productive!", mood: 'encouraging', voiceStyle: 'energetic' };
  } else if (hour < 17) {
    return { text: "Afternoon, Sensei! Time for that midday productivity boost!", mood: 'casual' };
  } else if (hour < 21) {
    return { text: "Evening already? Let's finish strong before rest time~", mood: 'encouraging' };
  } else {
    return { text: "Working late, Sensei? I admire your dedication, but don't overdo it~", mood: 'casual', voiceStyle: 'whisper' };
  }
};
