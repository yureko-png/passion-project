import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Check, ChevronDown, ChevronUp, Trash2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  color: 'spirit' | 'coral' | 'mint' | 'lavender' | 'warm';
  dueDate?: string;
}

interface GoalsTrackerProps {
  onGoalComplete?: (goal: Goal) => void;
}

const colorClasses = {
  spirit: 'bg-primary/20 border-primary/50 text-primary',
  coral: 'bg-accent/20 border-accent/50 text-accent',
  mint: 'bg-mint/20 border-mint/50 text-mint',
  lavender: 'bg-lavender/20 border-lavender/50 text-lavender',
  warm: 'bg-warm/20 border-warm/50 text-warm',
};

const progressColors = {
  spirit: 'bg-primary',
  coral: 'bg-accent',
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  warm: 'bg-warm',
};

const GoalsTracker = ({ onGoalComplete }: GoalsTrackerProps) => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete Focus Sessions',
      description: 'Finish 20 pomodoro sessions this week',
      target: 20,
      current: 14,
      unit: 'sessions',
      color: 'spirit',
      dueDate: '2026-02-05',
    },
    {
      id: '2',
      title: 'Read Books',
      description: 'Read 2 books this month',
      target: 2,
      current: 1,
      unit: 'books',
      color: 'lavender',
      dueDate: '2026-02-28',
    },
    {
      id: '3',
      title: 'Exercise Minutes',
      description: 'Exercise for 150 minutes this week',
      target: 150,
      current: 90,
      unit: 'minutes',
      color: 'coral',
      dueDate: '2026-02-05',
    },
  ]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 10,
    unit: 'tasks',
    color: 'spirit' as Goal['color'],
  });

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      current: 0,
    };
    setGoals([goal, ...goals]);
    setNewGoal({ title: '', description: '', target: 10, unit: 'tasks', color: 'spirit' });
    setShowAddForm(false);
  };

  const updateProgress = (id: string, increment: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const newCurrent = Math.min(goal.current + increment, goal.target);
          const updatedGoal = { ...goal, current: newCurrent };
          if (newCurrent >= goal.target && goal.current < goal.target) {
            onGoalComplete?.(updatedGoal);
          }
          return updatedGoal;
        }
        return goal;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + (g.current / g.target) * 100, 0) / goals.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Goals</h3>
            <p className="text-xs text-muted-foreground">{totalProgress}% overall progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(!showAddForm);
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Add Goal Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 rounded-xl bg-secondary/50 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Goal title..."
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-transparent focus:border-primary/50 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Target"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 rounded-lg bg-background text-sm border border-transparent focus:border-primary/50 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-background text-sm border border-transparent focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['spirit', 'coral', 'mint', 'lavender', 'warm'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGoal({ ...newGoal, color })}
                        className={`w-6 h-6 rounded-full ${progressColors[color]} ${
                          newGoal.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addGoal}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    >
                      Add Goal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Goals List */}
            <div className="mt-4 space-y-3">
              {goals.map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                const isComplete = progress >= 100;

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-xl border ${colorClasses[goal.color]} ${
                      isComplete ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${isComplete ? 'line-through' : ''}`}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isComplete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateProgress(goal.id, 1)}
                            className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${progressColors[goal.color]} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                    </div>

                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 mt-2 text-xs font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Goal completed!
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {goals.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No goals yet. Create your first goal above!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GoalsTracker;
