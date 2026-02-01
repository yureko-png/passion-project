import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  ListTodo,
  StickyNote,
  ImageIcon,
  Video,
  Upload,
  Trash2,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import timerCompleteSound from '@/assets/timer-complete.mp3';

interface ModomoroModeProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUI, setShowUI] = useState(true);

  // Background state
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>(() => {
    const saved = localStorage.getItem('modomoro-backgrounds');
    return saved ? [...DEFAULT_BACKGROUNDS, ...JSON.parse(saved)] : DEFAULT_BACKGROUNDS;
  });
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const currentBg = backgrounds[currentBgIndex] || DEFAULT_BACKGROUNDS[0];

  // Todo state
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('modomoro-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodoText, setNewTodoText] = useState('');

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('modomoro-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize audio
  useEffect(() => {
    const savedAudio = localStorage.getItem('timerAudioData');
    audioRef.current = new Audio(savedAudio || timerCompleteSound);
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  // Save todos
  useEffect(() => {
    localStorage.setItem('modomoro-todos', JSON.stringify(todos));
  }, [todos]);

  // Save notes
  useEffect(() => {
    localStorage.setItem('modomoro-notes', JSON.stringify(notes));
  }, [notes]);

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
            // Level up every 25 minutes of focus
            if (newTime % (25 * 60) === 0) {
              setLevel((l) => {
                const newLevel = l + 1;
                localStorage.setItem('modomoro-level', newLevel.toString());
                return newLevel;
              });
            }
            return newTime;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      if (isBreak) {
        // End of break
        if (currentLoop < loopCount) {
          setCurrentLoop((prev) => prev + 1);
          setIsBreak(false);
          setTimeLeft(workDuration * 60);
        } else {
          // All loops completed
          setIsRunning(false);
          setCurrentLoop(1);
          setIsBreak(false);
          setTimeLeft(workDuration * 60);
        }
      } else {
        // End of work session
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration, loopCount, currentLoop, soundEnabled]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current date/time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset timer
  const handleReset = () => {
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsRunning(false);
  };

  // Background upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const type: BackgroundType = file.type.startsWith('video') ? 'video' : 'image';
        const newBg: BackgroundOption = {
          id: `custom-${Date.now()}`,
          type,
          url,
          name: file.name,
        };
        setBackgrounds((prev) => [...prev, newBg]);
        setCurrentBgIndex(backgrounds.length);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete custom background
  const deleteBackground = (id: string) => {
    if (DEFAULT_BACKGROUNDS.find(bg => bg.id === id)) return;
    setBackgrounds((prev) => prev.filter(bg => bg.id !== id));
    if (currentBgIndex >= backgrounds.length - 1) {
      setCurrentBgIndex(Math.max(0, currentBgIndex - 1));
    }
  };

  // Todo functions
  const addTodo = () => {
    if (!newTodoText.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: `todo-${Date.now()}`, text: newTodoText, completed: false },
    ]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Notes functions
  const addNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New page',
      content: '',
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    setNoteContent('');
  };

  const updateNoteContent = (content: string) => {
    setNoteContent(content);
    if (selectedNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id ? { ...n, content } : n
        )
      );
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setNoteContent('');
    }
  };

  // Progress calculation
  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* Background */}
        <div className="absolute inset-0">
          {currentBg.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentBg.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentBg.url}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Toggle UI Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowUI(!showUI)}
          className="absolute bottom-4 left-4 z-50 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
        >
          {showUI ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Top Left - Date & Time */}
              <div className="absolute top-6 left-6 text-white">
                <p className="text-sm opacity-80">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })}
                </p>
                <p className="text-5xl font-bold tracking-tight">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>

              {/* Top Right - Level & Timer */}
              <div className="absolute top-6 right-6 flex items-start gap-4">
                {/* Level Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <span className="text-xs text-white/60">Level</span>
                  </div>
                  <span className="text-2xl font-bold text-white mt-1">{level}</span>
                </div>

                {/* Timer Circle */}
                <div className="relative">
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    {/* Loop Counter */}
                    <div className="absolute -top-3 right-4 flex items-center gap-2 text-white text-sm">
                      <span className="opacity-60">Loop</span>
                      <button onClick={() => setCurrentLoop(Math.max(1, currentLoop - 1))} className="hover:text-primary">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-bold">{currentLoop}</span>
                      <button onClick={() => setCurrentLoop(currentLoop + 1)} className="hover:text-primary">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Work/Break Labels */}
                    <div className="flex items-center gap-4 mb-3 mt-2">
                      <div className="text-center">
                        <span className="text-xs text-white/60">Work</span>
                        <p className="text-2xl font-bold text-white">{workDuration}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-white/60">Break</span>
                        <p className="text-2xl font-bold text-white">{breakDuration}</p>
                      </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="6"
                        />
                        <motion.circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={isBreak ? '#10b981' : '#6366f1'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-xs opacity-60 mb-1">
                          {isBreak ? 'Break' : 'Working'}
                        </span>
                        <span className="text-4xl font-bold tracking-tight">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={handleReset}
                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                      >
                        {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsBreak(!isBreak);
                          setTimeLeft(isBreak ? workDuration * 60 : breakDuration * 60);
                        }}
                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTodoPanel(!showTodoPanel)}
                  className={`p-3 rounded-full backdrop-blur-sm border transition-colors ${
                    showTodoPanel ? 'bg-white/30 border-white/40' : 'bg-black/40 border-white/10 hover:bg-white/20'
                  }`}
                >
                  <ListTodo className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                  className={`p-3 rounded-full backdrop-blur-sm border transition-colors ${
                    showNotesPanel ? 'bg-white/30 border-white/40' : 'bg-black/40 border-white/10 hover:bg-white/20'
                  }`}
                >
                  <StickyNote className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-3 rounded-full backdrop-blur-sm border transition-colors ${
                    showSettings ? 'bg-white/30 border-white/40' : 'bg-black/40 border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Settings className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                {/* Background Navigation */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <button
                    onClick={() => setCurrentBgIndex((prev) => (prev - 1 + backgrounds.length) % backgrounds.length)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 min-w-[120px] justify-center">
                    {currentBg.type === 'video' ? (
                      <Video className="w-4 h-4 text-white/60" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-white/60" />
                    )}
                    <span className="text-sm text-white truncate max-w-[100px]">{currentBg.name}</span>
                  </div>
                  <button
                    onClick={() => setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 rounded-full backdrop-blur-sm border transition-colors ${
                    soundEnabled ? 'bg-white/20 border-white/30' : 'bg-black/40 border-white/10'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-6 right-6 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors z-50"
                style={{ right: 'auto', left: 'unset', marginTop: '100px' }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Todo Panel */}
              <AnimatePresence>
                {showTodoPanel && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-1/2 -translate-y-1/2 left-6 w-80 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">To-Do List</h3>
                        <button onClick={() => setShowTodoPanel(false)} className="text-white/60 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {todos.filter(t => t.completed).length}/{todos.length} completed
                      </p>
                    </div>
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      {/* Add Todo */}
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="text"
                          value={newTodoText}
                          onChange={(e) => setNewTodoText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                          placeholder="Enter Task"
                          className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                        <button
                          onClick={addTodo}
                          className="p-2 bg-primary/80 hover:bg-primary rounded-lg text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Todo Items */}
                      <div className="space-y-2">
                        {todos.map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 group"
                          >
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                todo.completed
                                  ? 'bg-primary border-primary'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {todo.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span
                              className={`flex-1 text-sm ${
                                todo.completed ? 'text-white/40 line-through' : 'text-white'
                              }`}
                            >
                              {todo.text}
                            </span>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {todos.length === 0 && (
                          <p className="text-center text-white/40 text-sm py-4">No tasks yet</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes Panel */}
              <AnimatePresence>
                {showNotesPanel && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-1/2 -translate-y-1/2 left-[340px] flex gap-2"
                  >
                    {/* Notes List */}
                    <div className="w-48 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-white font-semibold text-sm">Notes</h3>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={addNote}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-primary/60 hover:bg-primary rounded-lg text-white text-sm mb-2"
                        >
                          <Plus className="w-4 h-4" />
                          New Page
                        </button>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {notes.map((note) => (
                            <div
                              key={note.id}
                              onClick={() => {
                                setSelectedNote(note);
                                setNoteContent(note.content);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group ${
                                selectedNote?.id === note.id
                                  ? 'bg-white/20'
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              <span className="flex-1 text-sm text-white truncate">{note.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Note Editor */}
                    {selectedNote && (
                      <div className="w-64 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/10">
                          <input
                            type="text"
                            value={selectedNote.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setSelectedNote({ ...selectedNote, title: newTitle });
                              setNotes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNote.id ? { ...n, title: newTitle } : n
                                )
                              );
                            }}
                            className="w-full bg-transparent text-white font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="p-3">
                          <textarea
                            value={noteContent}
                            onChange={(e) => updateNoteContent(e.target.value)}
                            placeholder="Enter text here..."
                            className="w-full h-48 bg-transparent text-white/80 text-sm resize-none focus:outline-none placeholder:text-white/30"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-white font-semibold">Settings</h3>
                      <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Timer Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/60 block mb-1">Work (min)</label>
                          <input
                            type="number"
                            value={workDuration}
                            onChange={(e) => setWorkDuration(Number(e.target.value))}
                            min={1}
                            max={120}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 block mb-1">Break (min)</label>
                          <input
                            type="number"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(Number(e.target.value))}
                            min={1}
                            max={60}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Loop Count</label>
                        <input
                          type="number"
                          value={loopCount}
                          onChange={(e) => setLoopCount(Number(e.target.value))}
                          min={1}
                          max={10}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                      </div>

                      {/* Background Settings */}
                      <div className="pt-3 border-t border-white/10">
                        <label className="text-xs text-white/60 block mb-2">Background</label>
                        <div className="space-y-2 max-h-[120px] overflow-y-auto">
                          {backgrounds.map((bg, index) => (
                            <div
                              key={bg.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group ${
                                currentBgIndex === index ? 'bg-white/20' : 'hover:bg-white/10'
                              }`}
                              onClick={() => setCurrentBgIndex(index)}
                            >
                              {bg.type === 'video' ? (
                                <Video className="w-4 h-4 text-white/60" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-white/60" />
                              )}
                              <span className="flex-1 text-sm text-white truncate">{bg.name}</span>
                              {!DEFAULT_BACKGROUNDS.find(d => d.id === bg.id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBackground(bg.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image/Video
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleBackgroundUpload}
                          className="hidden"
                        />
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
