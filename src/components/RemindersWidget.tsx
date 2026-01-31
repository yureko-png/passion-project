import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Check,
  Clock,
  Calendar,
  Trash2,
  Volume2,
  VolumeX,
  Upload,
  Download,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  sound: boolean;
  completed: boolean;
}

const RemindersWidget = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Daily standup',
      time: '09:00',
      date: '2026-01-29',
      repeat: 'daily',
      sound: true,
      completed: false,
    },
    {
      id: '2',
      title: 'Take a stretch break',
      time: '14:00',
      date: '2026-01-29',
      repeat: 'daily',
      sound: true,
      completed: false,
    },
    {
      id: '3',
      title: 'Review weekly goals',
      time: '17:00',
      date: '2026-01-31',
      repeat: 'weekly',
      sound: false,
      completed: true,
    },
  ]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newDate, setNewDate] = useState('');
  const [newRepeat, setNewRepeat] = useState<Reminder['repeat']>('none');
  const [newSound, setNewSound] = useState(true);
  
  // Audio state
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  const toggleComplete = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const toggleSound = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, sound: !r.sound } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const openAddReminder = () => {
    setNewTitle('');
    setNewTime('09:00');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewRepeat('none');
    setNewSound(true);
    setIsSheetOpen(true);
  };

  const saveReminder = () => {
    if (!newTitle.trim()) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      date: newDate,
      repeat: newRepeat,
      sound: newSound,
      completed: false,
    };

    setReminders([reminder, ...reminders]);
    setIsSheetOpen(false);
  };

  const handleAudioImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioName(file.name);
      localStorage.setItem('reminderAudioName', file.name);
      
      // Convert to base64 for persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem('reminderAudioData', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioExport = () => {
    const audioData = localStorage.getItem('reminderAudioData');
    const audioName = localStorage.getItem('reminderAudioName') || 'reminder-sound.mp3';
    
    if (audioData) {
      const link = document.createElement('a');
      link.href = audioData;
      link.download = audioName;
      link.click();
    }
  };

  const clearCustomAudio = () => {
    setCustomAudioUrl(null);
    setCustomAudioName('');
    localStorage.removeItem('reminderAudioData');
    localStorage.removeItem('reminderAudioName');
  };

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  const repeatLabels = {
    none: '',
    daily: '🔄 Daily',
    weekly: '🔄 Weekly',
    monthly: '🔄 Monthly',
  };

  const repeatOptions = [
    { value: 'none', label: 'No repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ] as const;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warm/20">
              <Bell className="w-5 h-5 text-warm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-warm">
                Reminders
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeReminders.length} upcoming
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddReminder}
            className="btn-glass px-3 py-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 inline" />
            Add
          </motion.button>
        </div>

        {/* Active Reminders */}
        <div className="space-y-2">
          <AnimatePresence>
            {activeReminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleComplete(reminder.id)}
                  className="w-5 h-5 rounded-full border-2 border-warm/50 flex items-center justify-center hover:border-warm transition-colors"
                >
                  {reminder.completed && <Check className="w-3 h-3 text-warm" />}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{reminder.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{reminder.time}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(reminder.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {reminder.repeat !== 'none' && (
                      <span className="text-warm">{repeatLabels[reminder.repeat]}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleSound(reminder.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {reminder.sound ? (
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activeReminders.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No upcoming reminders
            </p>
          )}
        </div>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Completed
            </p>
            <div className="space-y-1">
              {completedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-60"
                >
                  <Check className="w-3 h-3" />
                  <span className="truncate">{reminder.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Reminder Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Add Reminder
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-6">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Reminder Title *</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What do you need to remember?"
                className="bg-secondary/50"
              />
            </div>

            {/* Time & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Time
                </label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date
                </label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Repeat */}
            <div>
              <label className="text-sm font-medium mb-2 block">Repeat</label>
              <div className="flex gap-2 flex-wrap">
                {repeatOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewRepeat(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      newRepeat === opt.value
                        ? 'bg-warm/20 text-warm border border-warm/30'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Play sound</span>
              </div>
              <button
                onClick={() => setNewSound(!newSound)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  newSound ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow"
                  animate={{ x: newSound ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Custom Audio Section */}
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                🔊 Custom Notification Sound
              </label>
              
              {customAudioName ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                  <span className="text-sm flex-1 truncate">{customAudioName}</span>
                  <button
                    onClick={handleAudioExport}
                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                    title="Export audio"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearCustomAudio}
                    className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                    title="Remove audio"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Using default notification sound
                </p>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Audio
                </Button>
                {customAudioUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAudioExport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
              
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioImport}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveReminder}
                disabled={!newTitle.trim()}
              >
                Create Reminder
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default RemindersWidget;
