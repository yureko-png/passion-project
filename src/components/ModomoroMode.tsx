import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, RotateCcw, Settings, Volume2, VolumeX,
  ListTodo, StickyNote, ImageIcon, Video, Upload, Trash2,
  Check, Plus, ChevronLeft, ChevronRight, Clock, Eye, EyeOff,
  Music, Trophy, Target, Disc3,
} from 'lucide-react';
import { useTasksStore, Task } from '@/hooks/useTasksStore';
import { useNotesStore, Note } from '@/hooks/useNotesStore';
import { useSoundStore } from '@/hooks/useSoundStore';
import { getRandomAkoLine, AkoLine } from '@/data/akoConversations';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import Mascot from './Mascot';
import AmbientSoundPanel from './AmbientSoundPanel';
import DailyQuestCard from './DailyQuestCard';
import MusicPlayer from './MusicPlayer';
import type { MascotMood } from './Mascot';

interface ModomoroModeProps {
  isOpen: boolean;
  onClose: () => void;
}

type BackgroundType = 'image' | 'video';

interface BackgroundOption {
  id: string;
  type: BackgroundType;
  url: string;
  name: string;
}

const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  { id: 'default-video', type: 'video', url: '/videos/modomoro-bg.mp4', name: 'Anime Study Room' },
];

const ModomoroMode = ({ isOpen, onClose }: ModomoroModeProps) => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const { settings, playSound, updateSettings } = useSoundStore();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [loopCount, setLoopCount] = useState(1);
  const [currentLoop, setCurrentLoop] = useState(1);
  const [level, setLevel] = useState(1);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  // UI state
  const [showTodoPanel, setShowTodoPanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUI, setShowUI] = useState(true);

  // Background state
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>(() => {
    const saved = localStorage.getItem('modomoro-backgrounds');
    return saved ? [...DEFAULT_BACKGROUNDS, ...JSON.parse(saved)] : DEFAULT_BACKGROUNDS;
  });
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const currentBg = backgrounds[currentBgIndex] || DEFAULT_BACKGROUNDS[0];

  // Local form state
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Ako character state (text only, no voice)
  const [akoLine, setAkoLine] = useState<AkoLine>(getRandomAkoLine('idle'));
  const [showAkoPanel, setShowAkoPanel] = useState(false);
  const [showAmbientPanel, setShowAmbientPanel] = useState(false);
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const { addFocusTime, stats } = useGamificationStore();
  const { activeSound, isPlaying: isAmbientPlaying } = useAmbientSound();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const triggerAkoMessage = (context: AkoLine['context']) => {
    setAkoLine(getRandomAkoLine(context));
  };

  useEffect(() => {
    if (isOpen) triggerAkoMessage('idle');
  }, [isOpen]);

  // Load saved level
  useEffect(() => {
    const savedLevel = localStorage.getItem('modomoro-level');
    const savedFocusTime = localStorage.getItem('modomoro-focus-time');
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedFocusTime) setTotalFocusTime(parseInt(savedFocusTime));
  }, []);

  // Save backgrounds
  useEffect(() => {
    const customBgs = backgrounds.filter(bg => !DEFAULT_BACKGROUNDS.find(d => d.id === bg.id));
    localStorage.setItem('modomoro-backgrounds', JSON.stringify(customBgs));
  }, [backgrounds]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (!isBreak) {
          setTotalFocusTime((prev) => {
            const newTime = prev + 1;
            localStorage.setItem('modomoro-focus-time', newTime.toString());
            if (newTime % (25 * 60) === 0) {
              setLevel((l) => { const nl = l + 1; localStorage.setItem('modomoro-level', nl.toString()); return nl; });
            }
            return newTime;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      playSound('timer');
      if (isBreak) {
        triggerAkoMessage('break_end');
        if (currentLoop < loopCount) {
          setCurrentLoop((prev) => prev + 1);
          setIsBreak(false);
          setTimeLeft(workDuration * 60);
        } else {
          setIsRunning(false);
          setCurrentLoop(1);
          setIsBreak(false);
          setTimeLeft(workDuration * 60);
        }
      } else {
        triggerAkoMessage('work_end');
        addFocusTime(workDuration);
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration, loopCount, currentLoop, playSound]);

  const handleStartWork = () => {
    setIsRunning(true);
    triggerAkoMessage(!isBreak ? 'work_start' : 'break_start');
  };

  useEffect(() => {
    if (isRunning && !isBreak && timeLeft > 0) {
      const progressPoint = Math.floor((workDuration * 60 - timeLeft) / (workDuration * 60) * 100);
      if (progressPoint === 50) triggerAkoMessage('work_progress');
    }
  }, [timeLeft, isRunning, isBreak, workDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsRunning(false);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const type: BackgroundType = file.type.startsWith('video') ? 'video' : 'image';
        const newBg: BackgroundOption = { id: `custom-${Date.now()}`, type, url, name: file.name };
        setBackgrounds((prev) => [...prev, newBg]);
        setCurrentBgIndex(backgrounds.length);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteBackground = (id: string) => {
    if (DEFAULT_BACKGROUNDS.find(bg => bg.id === id)) return;
    setBackgrounds((prev) => prev.filter(bg => bg.id !== id));
    if (currentBgIndex >= backgrounds.length - 1) setCurrentBgIndex(Math.max(0, currentBgIndex - 1));
  };

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const task: Task = { id: Date.now().toString(), title: newTodoText, completed: false, priority: 'medium', subtasks: [], tags: ['pomodoro'] };
    addTask(task);
    setNewTodoText('');
  };

  const handleAddNote = () => {
    const newNote = addNote({ title: 'New page', content: '', color: 'default', pinned: false });
    setSelectedNote(newNote);
    setNoteContent('');
  };

  const handleUpdateNoteContent = (content: string) => {
    setNoteContent(content);
    if (selectedNote) updateNote(selectedNote.id, { content });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (selectedNote?.id === id) { setSelectedNote(null); setNoteContent(''); }
  };

  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 10);
  const completedCount = tasks.filter(t => t.completed).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black">
        {/* Background */}
        <div className="absolute inset-0">
          {currentBg.type === 'video' ? (
            <video ref={videoRef} src={currentBg.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={currentBg.url} alt="Background" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Toggle UI */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowUI(!showUI)} className="absolute bottom-4 left-4 z-50 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors">
          {showUI ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {showUI && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              {/* Top Left - Date & Time */}
              <div className="absolute top-6 left-6 text-white">
                <p className="text-sm opacity-80">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })}</p>
                <p className="text-5xl font-bold tracking-tight">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>

              {/* Top Right - Level & Timer */}
              <div className="absolute top-6 right-6 flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <span className="text-xs text-white/60">Level</span>
                  </div>
                  <span className="text-2xl font-bold text-white mt-1">{level}</span>
                </div>

                <div className="relative">
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="absolute -top-3 right-4 flex items-center gap-2 text-white text-sm">
                      <span className="opacity-60">Loop</span>
                      <button onClick={() => setCurrentLoop(Math.max(1, currentLoop - 1))} className="hover:text-primary"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="font-bold">{currentLoop}</span>
                      <button onClick={() => setCurrentLoop(currentLoop + 1)} className="hover:text-primary"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-4 mb-3 mt-2">
                      <div className="text-center"><span className="text-xs text-white/60">Work</span><p className="text-2xl font-bold text-white">{workDuration}</p></div>
                      <div className="text-center"><span className="text-xs text-white/60">Break</span><p className="text-2xl font-bold text-white">{breakDuration}</p></div>
                    </div>
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <motion.circle cx="80" cy="80" r="70" fill="none" stroke={isBreak ? '#10b981' : '#6366f1'} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transition={{ duration: 0.5 }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-xs opacity-60 mb-1">{isBreak ? 'Break' : 'Working'}</span>
                        <span className="text-4xl font-bold tracking-tight">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button onClick={handleReset} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors" title="Reset"><RotateCcw className="w-5 h-5" /></button>
                      <button onClick={() => { if (!isRunning) handleStartWork(); else setIsRunning(false); }} className="w-14 h-14 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center text-white transition-colors shadow-lg">
                        {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                      </button>
                      <button onClick={() => { setIsBreak(!isBreak); setTimeLeft(isBreak ? workDuration * 60 : breakDuration * 60); }} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors" title="Switch mode">
                        <Clock className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/30 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowTodoPanel(!showTodoPanel); setShowNotesPanel(false); setShowSettings(false); }} className={`p-3 rounded-xl transition-colors ${showTodoPanel ? 'bg-primary text-white' : 'hover:bg-white/10 text-white/80'}`} title="To-Do List"><ListTodo className="w-5 h-5" /></motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowNotesPanel(!showNotesPanel); setShowTodoPanel(false); setShowSettings(false); }} className={`p-3 rounded-xl transition-colors ${showNotesPanel ? 'bg-primary text-white' : 'hover:bg-white/10 text-white/80'}`} title="Notes"><StickyNote className="w-5 h-5" /></motion.button>
                <div className="w-full h-px bg-white/10 my-1" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowSettings(!showSettings); setShowTodoPanel(false); setShowNotesPanel(false); }} className={`p-3 rounded-xl transition-colors ${showSettings ? 'bg-primary text-white' : 'hover:bg-white/10 text-white/80'}`} title="Settings"><Settings className="w-5 h-5" /></motion.button>
              </div>

              {/* Ako Character */}
              <div className="absolute bottom-24 left-6">
                <div className="cursor-pointer" onClick={() => setShowAkoPanel(!showAkoPanel)}>
                  <Mascot message={akoLine.text} mood={akoLine.mood as MascotMood} size="medium" showSpeechBubble={showAkoPanel} />
                </div>
              </div>

              {/* Quest & Ambient & Music Panels */}
              <div className="absolute bottom-24 right-6 flex flex-col gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowQuestPanel(!showQuestPanel); setShowAmbientPanel(false); }} className={`p-3 rounded-xl backdrop-blur-sm transition-colors ${showQuestPanel ? 'bg-primary text-white' : 'bg-black/40 hover:bg-white/10 text-white/80'}`} title="Daily Quest"><Target className="w-5 h-5" /></motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowAmbientPanel(!showAmbientPanel); setShowQuestPanel(false); }} className={`p-3 rounded-xl backdrop-blur-sm transition-colors ${showAmbientPanel ? 'bg-primary text-white' : isAmbientPlaying ? 'bg-primary/50 text-white' : 'bg-black/40 hover:bg-white/10 text-white/80'}`} title="Ambient Sounds"><Music className="w-5 h-5" /></motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowMusicPanel(!showMusicPanel); setShowQuestPanel(false); setShowAmbientPanel(false); }} className={`p-3 rounded-xl backdrop-blur-sm transition-colors ${showMusicPanel ? 'bg-primary text-white' : 'bg-black/40 hover:bg-white/10 text-white/80'}`} title="Music Player"><Disc3 className="w-5 h-5" /></motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open('#achievements', '_self')} className="p-3 rounded-xl backdrop-blur-sm bg-black/40 hover:bg-white/10 text-white/80 transition-colors" title="Achievements"><Trophy className="w-5 h-5" /></motion.button>
              </div>

              {/* Floating Panels */}
              <AnimatePresence>
                {showQuestPanel && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute bottom-24 right-24 w-80"><DailyQuestCard /></motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showAmbientPanel && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute bottom-24 right-24 w-72 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4"><AmbientSoundPanel /></motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showMusicPanel && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute bottom-24 right-24 w-80"><MusicPlayer /></motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10">
                  <button onClick={() => setCurrentBgIndex((prev) => (prev - 1 + backgrounds.length) % backgrounds.length)} className="p-1 text-white/60 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <div className="flex items-center gap-2 min-w-[100px] justify-center">
                    {currentBg.type === 'video' ? <Video className="w-4 h-4 text-white/60" /> : <ImageIcon className="w-4 h-4 text-white/60" />}
                    <span className="text-sm text-white truncate max-w-[80px]">{currentBg.name}</span>
                  </div>
                  <button onClick={() => setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)} className="p-1 text-white/60 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
                {activeSound && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10">
                    <span className="text-sm">{activeSound.icon}</span>
                    <span className="text-xs text-white/80">{activeSound.name}</span>
                  </div>
                )}
                <button onClick={() => updateSettings({ timerSoundEnabled: !settings.timerSoundEnabled })} className={`p-3 rounded-full backdrop-blur-sm border transition-colors ${settings.timerSoundEnabled ? 'bg-white/20 border-white/30 text-white' : 'bg-black/40 border-white/10 text-white/60'}`}>
                  {settings.timerSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* Close Button */}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="absolute top-6 left-6 mt-24 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors z-50"><X className="w-5 h-5" /></motion.button>

              {/* Todo Panel */}
              <AnimatePresence>
                {showTodoPanel && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-1/2 -translate-y-1/2 left-6 w-80 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">To-Do List</h3>
                        <button onClick={() => setShowTodoPanel(false)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      <p className="text-xs text-white/50 mt-1">{completedCount}/{tasks.length} completed • Synced</p>
                    </div>
                    <div className="p-4 max-h-[350px] overflow-y-auto">
                      <div className="flex items-center gap-2 mb-4">
                        <input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()} placeholder="Add new task..." className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                        <button onClick={handleAddTodo} className="p-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-2">
                        {incompleteTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 group transition-colors">
                            <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary' : 'border-white/30 hover:border-white/50'}`}>
                              {task.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>{task.title}</span>
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        {incompleteTasks.length === 0 && <p className="text-center text-white/40 text-sm py-6">All tasks completed! 🎉</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes Panel */}
              <AnimatePresence>
                {showNotesPanel && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-1/2 -translate-y-1/2 left-6 flex gap-2">
                    <div className="w-52 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-3 border-b border-white/10">
                        <div className="flex items-center justify-between"><h3 className="text-white font-semibold text-sm">Notes</h3><span className="text-xs text-white/50">Synced</span></div>
                      </div>
                      <div className="p-2">
                        <button onClick={handleAddNote} className="w-full flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm mb-2 transition-colors"><Plus className="w-4 h-4" /> New Page</button>
                        <div className="space-y-1 max-h-[250px] overflow-y-auto">
                          {notes.map((note) => (
                            <div key={note.id} onClick={() => { setSelectedNote(note); setNoteContent(note.content); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${selectedNote?.id === note.id ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                              <span className="flex-1 text-sm text-white truncate">{note.title}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedNote && (
                      <div className="w-72 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/10"><h3 className="text-white font-semibold text-sm">{selectedNote.title}</h3></div>
                        <textarea value={noteContent} onChange={(e) => handleUpdateNoteContent(e.target.value)} className="w-full h-60 p-4 bg-transparent text-white text-sm resize-none focus:outline-none" placeholder="Write your notes..." />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-1/2 -translate-y-1/2 right-20 w-72 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between"><h3 className="text-white font-semibold">Settings</h3><button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button></div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-xs text-white/60 block mb-2">Work Duration (min)</label>
                        <input type="range" min="5" max="90" value={workDuration} onChange={(e) => { setWorkDuration(Number(e.target.value)); if (!isRunning && !isBreak) setTimeLeft(Number(e.target.value) * 60); }} className="w-full accent-primary" />
                        <span className="text-white text-sm">{workDuration} min</span>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-2">Break Duration (min)</label>
                        <input type="range" min="1" max="30" value={breakDuration} onChange={(e) => { setBreakDuration(Number(e.target.value)); if (!isRunning && isBreak) setTimeLeft(Number(e.target.value) * 60); }} className="w-full accent-primary" />
                        <span className="text-white text-sm">{breakDuration} min</span>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-2">Loop Count</label>
                        <input type="range" min="1" max="10" value={loopCount} onChange={(e) => setLoopCount(Number(e.target.value))} className="w-full accent-primary" />
                        <span className="text-white text-sm">{loopCount} loops</span>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <label className="text-xs text-white/60 block mb-2">Background</label>
                        <div className="space-y-2">
                          {backgrounds.map((bg, i) => (
                            <div key={bg.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${i === currentBgIndex ? 'bg-white/20' : 'hover:bg-white/10'}`} onClick={() => setCurrentBgIndex(i)}>
                              {bg.type === 'video' ? <Video className="w-4 h-4 text-white/60" /> : <ImageIcon className="w-4 h-4 text-white/60" />}
                              <span className="text-sm text-white truncate flex-1">{bg.name}</span>
                              {!DEFAULT_BACKGROUNDS.find(d => d.id === bg.id) && (
                                <button onClick={(e) => { e.stopPropagation(); deleteBackground(bg.id); }} className="text-white/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"><Upload className="w-4 h-4" /> Upload</button>
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleBackgroundUpload} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModomoroMode;
