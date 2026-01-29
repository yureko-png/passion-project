import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Check,
  Clock,
  Calendar,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

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

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  const repeatLabels = {
    none: '',
    daily: '🔄 Daily',
    weekly: '🔄 Weekly',
    monthly: '🔄 Monthly',
  };

  return (
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
          className="btn-glass px-3 py-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          Add
        </motion.button>
      </div>

      {/* Active Reminders */}
      <div className="space-y-2">
        {activeReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
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
  );
};

export default RemindersWidget;
