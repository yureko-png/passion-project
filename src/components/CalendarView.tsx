import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  duration?: number;
  color: 'spirit' | 'coral' | 'mint' | 'lavender' | 'warm';
  type: 'task' | 'event' | 'reminder';
}

const eventColors = {
  spirit: 'bg-primary text-primary-foreground',
  coral: 'bg-accent text-accent-foreground',
  mint: 'bg-mint text-white',
  lavender: 'bg-lavender text-white',
  warm: 'bg-warm text-white',
};

const eventDotColors = {
  spirit: 'bg-primary',
  coral: 'bg-accent',
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  warm: 'bg-warm',
};

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team standup',
      date: new Date(2026, 0, 29),
      time: '09:00',
      duration: 30,
      color: 'spirit',
      type: 'event',
    },
    {
      id: '2',
      title: 'Project deadline',
      date: new Date(2026, 0, 31),
      time: '17:00',
      color: 'coral',
      type: 'task',
    },
    {
      id: '3',
      title: 'Review session',
      date: new Date(2026, 0, 29),
      time: '14:00',
      duration: 60,
      color: 'lavender',
      type: 'event',
    },
    {
      id: '4',
      title: 'Weekly planning',
      date: new Date(2026, 1, 3),
      time: '10:00',
      duration: 45,
      color: 'mint',
      type: 'event',
    },
    {
      id: '5',
      title: 'Meditation reminder',
      date: new Date(2026, 0, 30),
      time: '07:00',
      color: 'warm',
      type: 'reminder',
    },
  ]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-coral/20">
            <CalendarIcon className="w-5 h-5 text-coral" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-coral">Calendar</h3>
            <p className="text-xs text-muted-foreground">{events.length} upcoming events</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glass px-3 py-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          Add Event
        </motion.button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <h4 className="text-sm font-semibold">{format(currentMonth, 'MMMM yyyy')}</h4>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(day)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isCurrentDay
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'hover:bg-secondary'
              }`}
            >
              <span className="text-xs">{format(day, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-primary-foreground' : eventDotColors[event.color]
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t pt-4"
          >
            <h5 className="text-xs font-semibold text-muted-foreground mb-2">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h5>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg ${eventColors[event.color]} flex items-center gap-2`}
                  >
                    {event.time && (
                      <div className="flex items-center gap-1 text-xs opacity-90">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <span className="text-xs font-medium">{event.title}</span>
                    {event.duration && (
                      <span className="text-[10px] opacity-75 ml-auto">{event.duration}m</span>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events scheduled</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarView;
