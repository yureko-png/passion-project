import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Plus, MoreHorizontal, Calendar, Flag, MessageSquare, Paperclip, Clock } from 'lucide-react';

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags: string[];
  comments: number;
  attachments: number;
  timeEstimate?: number;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

const priorityColors = {
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  low: 'bg-secondary text-muted-foreground border-border',
};

const priorityIcons = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: 'bg-secondary',
      tasks: [
        {
          id: '1',
          title: 'Research competitor apps',
          description: 'Analyze top 5 productivity apps',
          priority: 'low',
          tags: ['research'],
          comments: 2,
          attachments: 0,
          timeEstimate: 60,
        },
      ],
    },
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-primary/20',
      tasks: [
        {
          id: '2',
          title: 'Design new dashboard',
          description: 'Create wireframes for analytics view',
          priority: 'high',
          dueDate: '2026-02-01',
          tags: ['design', 'urgent'],
          comments: 5,
          attachments: 3,
          timeEstimate: 120,
        },
        {
          id: '3',
          title: 'Write documentation',
          priority: 'medium',
          tags: ['docs'],
          comments: 0,
          attachments: 1,
          timeEstimate: 45,
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: 'bg-lavender/20',
      tasks: [
        {
          id: '4',
          title: 'Implement time tracking',
          description: 'Add start/stop timer per task',
          priority: 'high',
          dueDate: '2026-01-30',
          tags: ['feature', 'development'],
          comments: 8,
          attachments: 2,
          timeEstimate: 180,
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-warm/20',
      tasks: [
        {
          id: '5',
          title: 'Code review: auth flow',
          priority: 'medium',
          tags: ['review'],
          comments: 3,
          attachments: 0,
          timeEstimate: 30,
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-mint/20',
      tasks: [
        {
          id: '6',
          title: 'Setup project structure',
          priority: 'high',
          tags: ['setup'],
          comments: 1,
          attachments: 0,
          timeEstimate: 60,
        },
      ],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== draggedTask.id),
      }));

      return newColumns.map((col) => {
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, draggedTask] };
        }
        return col;
      });
    });

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const completedTasks = columns.find((c) => c.id === 'done')?.tasks.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lavender/20">
            <LayoutGrid className="w-5 h-5 text-lavender" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-lavender">
              Kanban Board
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedTasks}/{totalTasks} tasks completed
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glass px-3 py-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          Add Task
        </motion.button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            className={`flex-shrink-0 w-56 rounded-xl p-3 ${column.color} transition-all duration-200 ${
              dragOverColumn === column.id ? 'ring-2 ring-primary scale-[1.02]' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={() => handleDrop(column.id)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {column.title}
                </span>
                <span className="text-xs bg-background/50 px-1.5 py-0.5 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
              <button className="p-1 rounded hover:bg-background/30 transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 min-h-[100px]">
              <AnimatePresence>
                {column.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={() => {
                      setDraggedTask(null);
                      setDragOverColumn(null);
                    }}
                    className={`bg-card p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Priority & Tags */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className="text-xs">{priorityIcons[task.priority]}</span>
                      {task.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium mb-1 line-clamp-2">{task.title}</h4>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {task.dueDate && (
                        <div className="flex items-center gap-0.5 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                      {task.timeEstimate && (
                        <div className="flex items-center gap-0.5 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{task.timeEstimate}m</span>
                        </div>
                      )}
                      {task.comments > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px]">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default KanbanBoard;
