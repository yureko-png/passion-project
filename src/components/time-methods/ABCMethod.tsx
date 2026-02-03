import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Play, Star, Circle, Minus } from 'lucide-react';

interface ABCTask {
  id: string;
  text: string;
  priority: 'A' | 'B' | 'C';
  completed: boolean;
}

interface ABCMethodProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const priorities = [
  {
    level: 'A',
    name: 'Must Do',
    description: 'Critical tasks with serious consequences',
    color: 'bg-destructive/10 border-destructive/30 text-destructive',
    badgeColor: 'bg-destructive text-destructive-foreground',
    icon: <Star className="w-4 h-4 fill-current" />,
    duration: 45
  },
  {
    level: 'B',
    name: 'Should Do',
    description: 'Important but less urgent tasks',
    color: 'bg-warm/10 border-warm/30 text-warm',
    badgeColor: 'bg-warm text-white',
    icon: <Circle className="w-4 h-4 fill-current" />,
    duration: 30
  },
  {
    level: 'C',
    name: 'Nice to Do',
    description: 'Low priority, minimal consequences',
    color: 'bg-muted border-border text-muted-foreground',
    badgeColor: 'bg-muted-foreground text-background',
    icon: <Minus className="w-4 h-4" />,
    duration: 15
  }
] as const;

const ABCMethod = ({ onStartTimer }: ABCMethodProps) => {
  const [tasks, setTasks] = useState<ABCTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'A' | 'B' | 'C'>('A');
  const [isAdding, setIsAdding] = useState(false);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const task: ABCTask = {
      id: Date.now().toString(),
      text: newTaskText,
      priority: selectedPriority,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTaskText('');
    setIsAdding(false);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const startTask = (task: ABCTask) => {
    const priority = priorities.find(p => p.level === task.priority);
    if (priority && onStartTimer) {
      onStartTimer(priority.duration, `[${task.priority}] ${task.text}`);
    }
  };

  const getTasksByPriority = (level: string) => {
    return tasks.filter(t => t.priority === level);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Categorize tasks by importance. Complete <span className="font-bold text-destructive">A</span> tasks before moving to <span className="font-bold text-warm">B</span> or <span className="font-bold">C</span>.
        </p>
      </div>

      {/* Priority Sections */}
      <div className="space-y-3">
        {priorities.map((priority) => (
          <div key={priority.level} className={`rounded-xl border-2 ${priority.color} overflow-hidden`}>
            <div className={`px-4 py-2 ${priority.badgeColor} flex items-center gap-2`}>
              {priority.icon}
              <div className="flex-1">
                <span className="font-bold">{priority.level}</span>
                <span className="mx-2">—</span>
                <span className="font-medium">{priority.name}</span>
              </div>
              <span className="text-xs opacity-80">{priority.description}</span>
            </div>

            <div className="p-3 space-y-2">
              {getTasksByPriority(priority.level).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-2 rounded-lg bg-background/80 group ${
                    task.completed ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {task.completed && <span className="text-xs">✓</span>}
                  </button>

                  <span className={`flex-1 text-sm ${task.completed ? 'line-through' : ''}`}>
                    {task.text}
                  </span>

                  {!task.completed && (
                    <button
                      onClick={() => startTask(task)}
                      className="p-1.5 rounded hover:bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Start ${priority.duration}min timer`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {getTasksByPriority(priority.level).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2 opacity-60">
                  No {priority.level} tasks yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-secondary/50 space-y-3"
        >
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          <div className="flex gap-2">
            <span className="text-xs text-muted-foreground self-center">Priority:</span>
            {priorities.map((p) => (
              <button
                key={p.level}
                onClick={() => setSelectedPriority(p.level)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedPriority === p.level
                    ? p.badgeColor
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                {p.level}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      )}
    </div>
  );
};

export default ABCMethod;
