import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Check, Trash2, GripVertical, Target } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TaskManagerProps {
  onTaskComplete?: (task: Task) => void;
}

const TaskManager = ({ onTaskComplete }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete project proposal', completed: false, priority: 'high' },
    { id: '2', title: 'Review documentation', completed: false, priority: 'medium' },
    { id: '3', title: 'Send follow-up emails', completed: true, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: 'medium',
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed };
          if (updatedTask.completed) {
            onTaskComplete?.(updatedTask);
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 border-destructive/50';
      case 'medium':
        return 'bg-primary/20 border-primary/50';
      case 'low':
        return 'bg-secondary border-secondary';
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Today's Objectives
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{tasks.length} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Add Task Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/50 focus:outline-none transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          className="btn-gold p-3"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Task List */}
      <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getPriorityColor(
                task.priority
              )} ${task.completed ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </motion.button>
              <span
                className={`flex-1 text-sm ${
                  task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {task.title}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteTask(task.id)}
                className="p-1 rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </motion.button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          No tasks yet. Add your first objective above!
        </p>
      )}
    </motion.div>
  );
};

export default TaskManager;
