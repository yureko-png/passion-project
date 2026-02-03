import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Play, TrendingUp, Zap } from 'lucide-react';

interface ParetoTask {
  id: string;
  text: string;
  impact: number; // 1-10
  effort: number; // 1-10
  completed: boolean;
}

interface ParetoAnalysisProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const ParetoAnalysis = ({ onStartTimer }: ParetoAnalysisProps) => {
  const [tasks, setTasks] = useState<ParetoTask[]>([
    { id: '1', text: 'Complete main project deliverable', impact: 9, effort: 7, completed: false },
    { id: '2', text: 'Reply to client emails', impact: 6, effort: 3, completed: false },
    { id: '3', text: 'Update documentation', impact: 4, effort: 5, completed: false },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ text: '', impact: 5, effort: 5 });

  // Calculate Pareto score (impact/effort ratio - higher is better)
  const getParetoScore = (task: ParetoTask) => {
    return task.effort > 0 ? (task.impact / task.effort) * 10 : 0;
  };

  // Sort tasks by Pareto score (highest first)
  const sortedTasks = [...tasks].sort((a, b) => getParetoScore(b) - getParetoScore(a));
  
  // Top 20% tasks (the vital few)
  const vitalFewCount = Math.max(1, Math.ceil(tasks.length * 0.2));
  const vitalFew = sortedTasks.slice(0, vitalFewCount);
  const trivialMany = sortedTasks.slice(vitalFewCount);

  const addTask = () => {
    if (!newTask.text.trim()) return;
    
    const task: ParetoTask = {
      id: Date.now().toString(),
      text: newTask.text,
      impact: newTask.impact,
      effort: newTask.effort,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask({ text: '', impact: 5, effort: 5 });
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

  const startTask = (task: ParetoTask) => {
    if (onStartTimer) {
      // Higher impact tasks get longer focus sessions
      const duration = task.impact >= 7 ? 45 : task.impact >= 4 ? 30 : 15;
      onStartTimer(duration, `🎯 ${task.text}`);
    }
  };

  const renderTaskCard = (task: ParetoTask, isVital: boolean) => (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        isVital 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-secondary/30 border-border'
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      <button
        onClick={() => toggleComplete(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          task.completed 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-muted-foreground hover:border-primary'
        }`}
      >
        {task.completed && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`}>
          {task.text}
        </p>
        <div className="flex gap-3 mt-1">
          <span className="text-[10px] text-muted-foreground">
            Impact: <span className="font-semibold text-primary">{task.impact}/10</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            Effort: <span className="font-semibold">{task.effort}/10</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            Score: <span className="font-semibold text-accent">{getParetoScore(task).toFixed(1)}</span>
          </span>
        </div>
      </div>

      {!task.completed && (
        <button
          onClick={() => startTask(task)}
          className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => removeTask(task.id)}
        className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Focus on the <span className="font-bold text-primary">20%</span> of tasks that produce <span className="font-bold text-primary">80%</span> of results.
        </p>
      </div>

      {/* Vital Few (Top 20%) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Zap className="w-4 h-4" />
          <span>Vital Few (Top 20%)</span>
          <span className="text-xs font-normal text-muted-foreground">— Focus here first</span>
        </div>
        <div className="space-y-2">
          {vitalFew.map(task => renderTaskCard(task, true))}
          {vitalFew.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Add tasks to see your vital few
            </p>
          )}
        </div>
      </div>

      {/* Trivial Many */}
      {trivialMany.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Trivial Many (80%)</span>
            <span className="text-xs font-normal">— Delegate or defer</span>
          </div>
          <div className="space-y-2">
            {trivialMany.map(task => renderTaskCard(task, false))}
          </div>
        </div>
      )}

      {/* Add Task */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-secondary/50 space-y-3"
        >
          <input
            type="text"
            value={newTask.text}
            onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
            placeholder="Task description..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Impact (1-10): <span className="font-bold text-primary">{newTask.impact}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={newTask.impact}
                onChange={(e) => setNewTask({ ...newTask, impact: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Effort (1-10): <span className="font-bold">{newTask.effort}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={newTask.effort}
                onChange={(e) => setNewTask({ ...newTask, effort: Number(e.target.value) })}
                className="w-full accent-muted-foreground"
              />
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Pareto Score: <span className="font-bold text-accent">{(newTask.impact / newTask.effort * 10).toFixed(1)}</span>
            <span className="ml-2 opacity-60">(Higher = More valuable)</span>
          </p>

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
          Add Task with Impact Analysis
        </button>
      )}
    </div>
  );
};

export default ParetoAnalysis;
