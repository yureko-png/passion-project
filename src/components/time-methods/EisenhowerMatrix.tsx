import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Play, AlertTriangle, Clock, Trash2, Calendar } from 'lucide-react';

interface MatrixTask {
  id: string;
  text: string;
  quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
}

interface EisenhowerMatrixProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const quadrants = [
  {
    id: 'do',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    color: 'bg-destructive/10 border-destructive/30',
    headerColor: 'bg-destructive text-destructive-foreground',
    icon: <AlertTriangle className="w-4 h-4" />,
    defaultDuration: 25
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    color: 'bg-primary/10 border-primary/30',
    headerColor: 'bg-primary text-primary-foreground',
    icon: <Calendar className="w-4 h-4" />,
    defaultDuration: 45
  },
  {
    id: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent & Not Important',
    color: 'bg-warm/10 border-warm/30',
    headerColor: 'bg-warm text-white',
    icon: <Clock className="w-4 h-4" />,
    defaultDuration: 15
  },
  {
    id: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    color: 'bg-muted border-border',
    headerColor: 'bg-muted-foreground text-background',
    icon: <Trash2 className="w-4 h-4" />,
    defaultDuration: 0
  }
] as const;

const EisenhowerMatrix = ({ onStartTimer }: EisenhowerMatrixProps) => {
  const [tasks, setTasks] = useState<MatrixTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [activeQuadrant, setActiveQuadrant] = useState<typeof quadrants[number]['id'] | null>(null);

  const addTask = (quadrant: MatrixTask['quadrant']) => {
    if (!newTaskText.trim()) return;
    
    const newTask: MatrixTask = {
      id: Date.now().toString(),
      text: newTaskText,
      quadrant
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setActiveQuadrant(null);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const startTaskTimer = (task: MatrixTask) => {
    const quadrant = quadrants.find(q => q.id === task.quadrant);
    if (quadrant && quadrant.defaultDuration > 0 && onStartTimer) {
      onStartTimer(quadrant.defaultDuration, task.text);
    }
  };

  const getQuadrantTasks = (quadrantId: string) => {
    return tasks.filter(t => t.quadrant === quadrantId);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Prioritize tasks by urgency and importance. Click <span className="font-semibold text-primary">▶</span> to start a focused session.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((quadrant) => (
          <motion.div
            key={quadrant.id}
            whileHover={{ scale: 1.01 }}
            className={`rounded-xl border-2 ${quadrant.color} overflow-hidden`}
          >
            {/* Quadrant Header */}
            <div className={`px-3 py-2 ${quadrant.headerColor} flex items-center gap-2`}>
              {quadrant.icon}
              <div>
                <p className="text-sm font-bold">{quadrant.title}</p>
                <p className="text-[10px] opacity-80">{quadrant.subtitle}</p>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-2 min-h-[100px] space-y-1.5">
              {getQuadrantTasks(quadrant.id).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-background/80 group"
                >
                  <span className="flex-1 text-xs text-foreground truncate">{task.text}</span>
                  {quadrant.defaultDuration > 0 && (
                    <button
                      onClick={() => startTaskTimer(task)}
                      className="p-1 rounded hover:bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Start timer"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}

              {/* Add Task Input */}
              {activeQuadrant === quadrant.id ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask(quadrant.id)}
                    placeholder="Enter task..."
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    onClick={() => addTask(quadrant.id)}
                    className="p-1.5 rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setActiveQuadrant(null)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveQuadrant(quadrant.id)}
                  className="w-full flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add task
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-2 text-[10px] text-muted-foreground">
        <span>↑ Important</span>
        <span>→ Urgent</span>
        <span>Top-left = Highest priority</span>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
