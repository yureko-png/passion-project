import { useState, useEffect, useCallback } from 'react';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  timeEstimate?: number;
  subtasks: Subtask[];
  notes?: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

const STORAGE_KEY = 'app-tasks';

// Default tasks for initial state
const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and submit the Q1 project proposal document',
    completed: false,
    priority: 'high',
    dueDate: '2026-01-30',
    timeEstimate: 60,
    subtasks: [
      { id: '1-1', title: 'Draft outline', completed: true },
      { id: '1-2', title: 'Write introduction', completed: true },
      { id: '1-3', title: 'Add budget section', completed: false },
      { id: '1-4', title: 'Review and finalize', completed: false },
    ],
    tags: ['work', 'urgent'],
  },
  {
    id: '2',
    title: 'Review documentation',
    completed: false,
    priority: 'medium',
    dueDate: '2026-02-01',
    timeEstimate: 30,
    subtasks: [
      { id: '2-1', title: 'Check API docs', completed: false },
      { id: '2-2', title: 'Update README', completed: false },
    ],
    tags: ['docs'],
  },
  {
    id: '3',
    title: 'Send follow-up emails',
    completed: true,
    priority: 'low',
    subtasks: [],
    tags: ['communication'],
  },
];

// Event emitter for cross-component sync
const listeners = new Set<() => void>();

const getStoredTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTasks;
  } catch {
    return defaultTasks;
  }
};

const setStoredTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  // Notify all listeners
  listeners.forEach((listener) => listener());
};

export const useTasksStore = () => {
  const [tasks, setTasksState] = useState<Task[]>(getStoredTasks);

  // Subscribe to changes from other components
  useEffect(() => {
    const handleChange = () => {
      setTasksState(getStoredTasks());
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const setTasks = useCallback((newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    setTasksState((prev) => {
      const updated = typeof newTasks === 'function' ? newTasks(prev) : newTasks;
      setStoredTasks(updated);
      return updated;
    });
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, [setTasks]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, [setTasks]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      })
    );
  }, [setTasks]);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [
              ...task.subtasks,
              { id: `${taskId}-${Date.now()}`, title, completed: false },
            ],
          };
        }
        return task;
      })
    );
  }, [setTasks]);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
  }, [setTasks]);

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  };
};
