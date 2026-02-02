import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Check,
  Trash2,
  GripVertical,
  Target,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Zap,
} from 'lucide-react';
import AddTaskSheet, { NewTaskData } from './AddTaskSheet';
import { useTasksStore, Task } from '@/hooks/useTasksStore';

interface TaskManagerProps {
  onTaskComplete?: (task: Task) => void;
}

const priorityColors = {
  high: 'bg-destructive/20 border-destructive/30',
  medium: 'bg-primary/20 border-primary/30',
  low: 'bg-secondary border-border',
};

const priorityBadges = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-primary/20 text-primary',
  low: 'bg-muted text-muted-foreground',
};

const difficultyBadges = {
  easy: 'bg-mint/20 text-mint',
  medium: 'bg-primary/20 text-primary',
  hard: 'bg-warm/20 text-warm',
  expert: 'bg-destructive/20 text-destructive',
};

const TaskManager = ({ onTaskComplete }: TaskManagerProps) => {
  const { tasks, setTasks, addTask: addTaskToStore, deleteTask, toggleTask, toggleSubtask, addSubtask, deleteSubtask } = useTasksStore();
  const [newTask, setNewTask] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<string[]>(['1']);
  const [newSubtask, setNewSubtask] = useState<{ taskId: string; title: string } | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const handleAddTask = (taskData: NewTaskData) => {
    const task: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      timeEstimate: taskData.timeEstimate,
      subtasks: taskData.subtasks,
      tags: taskData.tags,
    };
    addTaskToStore(task);
    if (taskData.subtasks.length > 0) {
      setExpandedTasks([...expandedTasks, task.id]);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: 'medium',
      subtasks: [],
      tags: [],
    };
    addTaskToStore(task);
    setNewTask('');
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      onTaskComplete?.({ ...task, completed: true });
    }
    toggleTask(id);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtask(taskId, subtaskId);
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    addSubtask(taskId, title);
    setNewSubtask(null);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    deleteSubtask(taskId, subtaskId);
  };

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const getSubtaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((st) => st.completed).length;
    return { completed, total: task.subtasks.length };
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
          placeholder="Quick add task (or click + for more options)..."
          className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/50 focus:outline-none transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddSheetOpen(true)}
          className="btn-spirit p-3"
          title="Add task with options"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Add Task Sheet */}
      <AddTaskSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSave={handleAddTask}
      />

      {/* Task List */}
      <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => {
            const isExpanded = expandedTasks.includes(task.id);
            const subtaskProgress = getSubtaskProgress(task);

            return (
              <Reorder.Item
                key={task.id}
                value={task}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-xl border ${priorityColors[task.priority]} ${
                  task.completed ? 'opacity-50' : ''
                } cursor-grab active:cursor-grabbing overflow-hidden`}
              >
                {/* Main Task Row */}
                <div className="flex items-center gap-3 p-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                  {/* Expand/Collapse */}
                  {task.subtasks.length > 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleExpand(task.id)}
                      className="p-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </motion.button>
                  ) : (
                    <div className="w-5" />
                  )}

                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      task.completed
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </motion.button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityBadges[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.difficulty && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${difficultyBadges[task.difficulty]}`}>
                          <Zap className="w-2.5 h-2.5" />
                          {task.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {task.timeEstimate && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{task.timeEstimate}m</span>
                        </div>
                      )}
                      {subtaskProgress && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <Check className="w-3 h-3" />
                          <span>
                            {subtaskProgress.completed}/{subtaskProgress.total}
                          </span>
                        </div>
                      )}
                      {task.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded-lg hover:bg-destructive/20 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </motion.button>
                </div>

                {/* Subtasks */}
                <AnimatePresence>
                  {isExpanded && task.subtasks.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t bg-background/30"
                    >
                      <div className="p-3 pl-14 space-y-1.5">
                        {task.subtasks.map((subtask) => (
                          <motion.div
                            key={subtask.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 group"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleToggleSubtask(task.id, subtask.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                subtask.completed
                                  ? 'bg-primary/80 border-primary/80'
                                  : 'border-muted-foreground hover:border-primary'
                              }`}
                            >
                              {subtask.completed && (
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              )}
                            </motion.button>
                            <span
                              className={`text-xs flex-1 ${
                                subtask.completed
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </motion.div>
                        ))}

                        {/* Add Subtask */}
                        {newSubtask?.taskId === task.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-dashed border-muted-foreground" />
                            <input
                              type="text"
                              value={newSubtask.title}
                              onChange={(e) =>
                                setNewSubtask({ ...newSubtask, title: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddSubtask(task.id, newSubtask.title);
                                } else if (e.key === 'Escape') {
                                  setNewSubtask(null);
                                }
                              }}
                              onBlur={() => {
                                if (newSubtask.title.trim()) {
                                  handleAddSubtask(task.id, newSubtask.title);
                                } else {
                                  setNewSubtask(null);
                                }
                              }}
                              placeholder="Add subtask..."
                              className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewSubtask({ taskId: task.id, title: '' })}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add subtask
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
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
