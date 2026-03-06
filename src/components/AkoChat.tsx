import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, X, Loader2, Trash2, 
  Trophy, Target, Music, Sparkles, Crown,
  BookOpen, Zap, ListChecks, Search, GraduationCap,
  Lightbulb, ChevronDown
} from 'lucide-react';
import { useAkoChat, KnowledgeMode } from '@/hooks/useAkoChat';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { useTasksStore } from '@/hooks/useTasksStore';
import Mascot from './Mascot';
import DailyQuestCard from './DailyQuestCard';
import AmbientSoundPanel from './AmbientSoundPanel';
import AchievementsPanel from './AchievementsPanel';
import type { MascotMood } from './Mascot';

interface AkoChatProps {
  timerState?: 'working' | 'break' | 'idle';
  timeRemaining?: string;
  currentTask?: string;
  completedTasks?: number;
}

const getMoodFromMessage = (message: string): MascotMood => {
  const lower = message.toLowerCase();
  if (lower.includes('ara') || lower.includes('mou') || lower.includes('sarcas')) return 'surprised';
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('amazing') || lower.includes('sugoi')) return 'encouraging';
  if (lower.includes('focus') || lower.includes('concentrate') || lower.includes('procrastin')) return 'firm';
  if (lower.includes('think') || lower.includes('hmm') || lower.includes('consider')) return 'thinking';
  if (lower.includes('break') || lower.includes('relax') || lower.includes('rest')) return 'casual';
  return 'neutral';
};

type TabType = 'chat' | 'quest' | 'sounds' | 'stats';

const KNOWLEDGE_MODES: { id: KnowledgeMode; label: string; icon: typeof BookOpen; desc: string }[] = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, desc: 'Casual conversation' },
  { id: 'study', label: 'Study Mode', icon: GraduationCap, desc: 'Deep learning & tutoring' },
  { id: 'quick', label: 'Quick Answer', icon: Zap, desc: 'Fast, direct answers' },
  { id: 'stepbystep', label: 'Step by Step', icon: ListChecks, desc: 'Detailed walkthrough' },
  { id: 'research', label: 'Research', icon: Search, desc: 'Comprehensive analysis' },
];

const QUICK_PROMPTS: Record<KnowledgeMode, string[]> = {
  chat: ['Help me focus', 'Give me motivation', 'What should I do?'],
  study: ['Teach me about...', 'Quiz me on...', 'Explain the concept of...'],
  quick: ['What is...', 'How to...', 'Define...'],
  stepbystep: ['How to solve...', 'Guide me through...', 'Steps to...'],
  research: ['Summarize research on...', 'Compare approaches to...', 'Analyze the topic of...'],
};

const AkoChat = ({ timerState, timeRemaining, currentTask, completedTasks }: AkoChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    knowledgeMode,
    setKnowledgeMode,
    sendMessage,
    clearMessages,
  } = useAkoChat();

  const { tasks } = useTasksStore();
  const { stats, newAchievement, levelUpTriggered, dailyQuest, questProgress } = useGamificationStore();

  const todayTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') inputRef.current?.focus();
  }, [isOpen, activeTab]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message, {
      timerState,
      timeRemaining,
      currentTask,
      completedTasks: completedToday,
      level: stats.level,
      streak: stats.currentStreak,
      focusMinutes: stats.totalFocusMinutes,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const currentMood = lastAssistantMessage ? getMoodFromMessage(lastAssistantMessage.content) : 'neutral';

  const currentModeInfo = KNOWLEDGE_MODES.find(m => m.id === knowledgeMode) || KNOWLEDGE_MODES[0];

  const tabs: { id: TabType; icon: typeof MessageCircle; label: string }[] = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'quest', icon: Target, label: 'Quest' },
    { id: 'sounds', icon: Music, label: 'Sounds' },
    { id: 'stats', icon: Trophy, label: 'Stats' },
  ];

  return (
    <>
      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[300] bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{newAchievement.icon}</span>
              <div>
                <p className="text-xs opacity-80">Achievement Unlocked!</p>
                <p className="font-bold">{newAchievement.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Notification */}
      <AnimatePresence>
        {levelUpTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[250] flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 3 }} className="text-8xl mb-4">👑</motion.div>
              <p className="text-4xl font-bold text-primary drop-shadow-lg">Level Up!</p>
              <p className="text-xl text-foreground mt-2">You reached Level {stats.level}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AchievementsPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />

      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {questProgress < dailyQuest.target && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-lg">🎀</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-card">
                      {stats.level}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-1">
                      Ako {stats.level >= 10 && <Crown className="w-4 h-4 text-yellow-500" />}
                    </h3>
                    <p className="text-xs text-muted-foreground">Level {stats.level} • {stats.currentStreak}🔥 streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowAchievements(true)} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors" title="Achievements">
                    <Trophy className="w-4 h-4" />
                  </button>
                  <button onClick={clearMessages} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors" title="Clear chat">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Knowledge Mode Selector (for chat tab) */}
            {activeTab === 'chat' && (
              <div className="px-4 pt-3 pb-1">
                <button
                  onClick={() => setShowModeSelector(!showModeSelector)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-sm transition-colors w-full"
                >
                  <currentModeInfo.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{currentModeInfo.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">{currentModeInfo.desc}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-auto text-muted-foreground transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showModeSelector && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-1.5 pt-2">
                        {KNOWLEDGE_MODES.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => { setKnowledgeMode(mode.id); setShowModeSelector(false); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                              knowledgeMode === mode.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <mode.icon className="w-3.5 h-3.5" />
                            <div className="text-left">
                              <p className="font-medium">{mode.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mascot Preview */}
            <div className="p-3 bg-gradient-to-b from-primary/5 to-transparent flex justify-center border-b border-border/50">
              <Mascot 
                message={lastAssistantMessage?.content || "Hai, Sensei~! I'm Ako, your productivity coach! 🎀"}
                mood={currentMood}
                size="small"
                isTyping={isLoading}
              />
            </div>

            {/* Tab Content */}
            <div className="h-64 overflow-y-auto">
              {activeTab === 'chat' && (
                <div className="p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      <Lightbulb className="w-8 h-8 mx-auto mb-2 text-primary/40" />
                      <p className="mb-3 font-medium">
                        {knowledgeMode === 'study' ? 'Study Mode — Ask me anything!' :
                         knowledgeMode === 'quick' ? 'Quick Answer — Fast & direct' :
                         knowledgeMode === 'stepbystep' ? 'Step by Step — Detailed guide' :
                         knowledgeMode === 'research' ? 'Research Mode — Deep analysis' :
                         'Chat with Ako! 🎀'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {(QUICK_PROMPTS[knowledgeMode] || QUICK_PROMPTS.chat).map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setInput(suggestion)}
                            className="px-3 py-1.5 bg-muted rounded-full text-xs hover:bg-primary/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>

                      {/* Today's Tasks Summary */}
                      {todayTasks.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-xl text-left">
                          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Today's Focus ({todayTasks.length} tasks)
                          </p>
                          {todayTasks.slice(0, 3).map(t => (
                            <p key={t.id} className="text-xs text-muted-foreground truncate">• {t.title}</p>
                          ))}
                          {todayTasks.length > 3 && <p className="text-xs text-primary">+{todayTasks.length - 3} more</p>}
                          <button
                            onClick={() => setInput(`Help me plan my tasks: ${todayTasks.slice(0, 5).map(t => t.title).join(', ')}`)}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            Ask Ako to plan these →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {knowledgeMode === 'research' ? 'Researching...' :
                             knowledgeMode === 'study' ? 'Preparing lesson...' :
                             'Ako is thinking...'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}

              {activeTab === 'quest' && <div className="p-4"><DailyQuestCard /></div>}
              {activeTab === 'sounds' && <div className="p-4"><AmbientSoundPanel /></div>}
              {activeTab === 'stats' && (
                <div className="p-4 space-y-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Level {stats.level}</span>
                      <span className="text-xs text-muted-foreground">{stats.xp}/{stats.xpToNextLevel} XP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }} className="h-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p>
                      <p className="text-xs text-muted-foreground">Focus Time</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{stats.totalTasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">Tasks Done</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}🔥</p>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{stats.bestStreak}</p>
                      <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAchievements(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" /> View All Achievements
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            {activeTab === 'chat' && (
              <div className="p-4 border-t border-border bg-background/50">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      knowledgeMode === 'study' ? 'Ask Ako to teach you...' :
                      knowledgeMode === 'quick' ? 'Quick question...' :
                      knowledgeMode === 'research' ? 'Research topic...' :
                      'Chat with Ako...'
                    }
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AkoChat;
