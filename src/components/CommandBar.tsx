import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Timer,
  Target,
  Calendar,
  LayoutGrid,
  Settings,
  BarChart3,
  Clock,
  Zap,
  FileText,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'actions' | 'navigation' | 'quick';
  action: () => void;
  keywords: string[];
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  onStartTimer?: (duration: number, title: string) => void;
}

const CommandBar = ({ isOpen, onClose, onNavigate, onStartTimer }: CommandBarProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task',
      icon: Plus,
      category: 'quick',
      action: () => {
        onClose();
        // Could open task creation modal
      },
      keywords: ['add', 'create', 'task', 'new', 'todo'],
    },
    {
      id: 'start-pomodoro',
      title: 'Start Focus Session',
      description: 'Start a 25-minute pomodoro',
      icon: Timer,
      category: 'quick',
      action: () => {
        onStartTimer?.(25, 'Focus Session');
        onClose();
      },
      keywords: ['focus', 'pomodoro', 'timer', 'start', 'work'],
    },
    {
      id: 'quick-break',
      title: 'Take a Break',
      description: 'Start a 5-minute break',
      icon: Clock,
      category: 'quick',
      action: () => {
        onStartTimer?.(5, 'Quick Break');
        onClose();
      },
      keywords: ['break', 'rest', 'pause', '5 minutes'],
    },
    {
      id: 'deep-work',
      title: 'Deep Work Session',
      description: 'Start a 90-minute deep work block',
      icon: Zap,
      category: 'quick',
      action: () => {
        onStartTimer?.(90, 'Deep Work');
        onClose();
      },
      keywords: ['deep', 'work', 'long', '90', 'focus'],
    },

    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      description: 'View your productivity analytics',
      icon: BarChart3,
      category: 'navigation',
      action: () => {
        onNavigate?.('dashboard');
        onClose();
      },
      keywords: ['dashboard', 'stats', 'analytics', 'charts'],
    },
    {
      id: 'nav-kanban',
      title: 'Go to Kanban Board',
      description: 'View tasks in board view',
      icon: LayoutGrid,
      category: 'navigation',
      action: () => {
        onNavigate?.('kanban');
        onClose();
      },
      keywords: ['kanban', 'board', 'cards', 'columns'],
    },
    {
      id: 'nav-calendar',
      title: 'Go to Calendar',
      description: 'View your scheduled events',
      icon: Calendar,
      category: 'navigation',
      action: () => {
        onNavigate?.('calendar');
        onClose();
      },
      keywords: ['calendar', 'schedule', 'events', 'dates'],
    },
    {
      id: 'nav-goals',
      title: 'Go to Goals',
      description: 'Track your goals and targets',
      icon: Target,
      category: 'navigation',
      action: () => {
        onNavigate?.('goals');
        onClose();
      },
      keywords: ['goals', 'targets', 'objectives', 'okr'],
    },
    {
      id: 'nav-settings',
      title: 'Open Settings',
      description: 'Configure your preferences',
      icon: Settings,
      category: 'navigation',
      action: () => {
        onNavigate?.('settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'config', 'options'],
    },

    // Actions
    {
      id: 'add-note',
      title: 'Add Quick Note',
      description: 'Create a quick note or idea',
      icon: FileText,
      category: 'actions',
      action: () => {
        onClose();
      },
      keywords: ['note', 'idea', 'write', 'memo'],
    },
    {
      id: 'add-tag',
      title: 'Manage Tags',
      description: 'Create and organize tags',
      icon: Tag,
      category: 'actions',
      action: () => {
        onClose();
      },
      keywords: ['tag', 'label', 'organize', 'category'],
    },
  ];

  const filteredCommands = search
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(search.toLowerCase()) ||
          cmd.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
    : commands;

  const groupedCommands = {
    quick: filteredCommands.filter((c) => c.category === 'quick'),
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
  };

  const flatCommands = [...groupedCommands.quick, ...groupedCommands.navigation, ...groupedCommands.actions];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatCommands.length) % flatCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          flatCommands[selectedIndex]?.action();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, flatCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card overflow-hidden shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(groupedCommands).map(
                  ([category, items]) =>
                    items.length > 0 && (
                      <div key={category} className="mb-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                          {category === 'quick' ? 'Quick Actions' : category === 'navigation' ? 'Navigation' : 'Actions'}
                        </p>
                        {items.map((cmd) => {
                          const globalIndex = flatCommands.findIndex((c) => c.id === cmd.id);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <motion.button
                              key={cmd.id}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isSelected ? 'bg-primary/20' : 'bg-secondary'
                                }`}
                              >
                                <cmd.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{cmd.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </p>
                              </div>
                              {isSelected && (
                                <ArrowRight className="w-4 h-4 text-primary" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )
                )}

                {flatCommands.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No commands found for "{search}"
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 p-3 border-t bg-secondary/30 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted">↑</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-muted">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted">↵</kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">⌘</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-muted">K</kbd>
                  to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
