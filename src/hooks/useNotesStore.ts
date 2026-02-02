import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: 'default' | 'coral' | 'mint' | 'lavender' | 'warm';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'app-notes';

// Default notes for initial state
const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Project Ideas',
    content: '- AI-powered task prioritization\n- Voice commands for timer\n- Team collaboration features',
    color: 'lavender',
    pinned: true,
    createdAt: new Date(2026, 0, 28),
    updatedAt: new Date(2026, 0, 29),
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Discussed Q1 goals and timeline. Follow up with design team by Friday.',
    color: 'mint',
    pinned: false,
    createdAt: new Date(2026, 0, 29),
    updatedAt: new Date(2026, 0, 29),
  },
  {
    id: '3',
    title: 'Quick Reminders',
    content: '• Update documentation\n• Review PR #42\n• Send weekly report',
    color: 'warm',
    pinned: false,
    createdAt: new Date(2026, 0, 29),
    updatedAt: new Date(2026, 0, 29),
  },
];

// Event emitter for cross-component sync
const listeners = new Set<() => void>();

const parseNote = (note: any): Note => ({
  ...note,
  createdAt: new Date(note.createdAt),
  updatedAt: new Date(note.updatedAt),
});

const getStoredNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map(parseNote);
    }
    return defaultNotes;
  } catch {
    return defaultNotes;
  }
};

const setStoredNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  // Notify all listeners
  listeners.forEach((listener) => listener());
};

export const useNotesStore = () => {
  const [notes, setNotesState] = useState<Note[]>(getStoredNotes);

  // Subscribe to changes from other components
  useEffect(() => {
    const handleChange = () => {
      setNotesState(getStoredNotes());
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const setNotes = useCallback((newNotes: Note[] | ((prev: Note[]) => Note[])) => {
    setNotesState((prev) => {
      const updated = typeof newNotes === 'function' ? newNotes(prev) : newNotes;
      setStoredNotes(updated);
      return updated;
    });
  }, []);

  const addNote = useCallback((note: Partial<Note> & { title: string }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content || '',
      color: note.color || 'default',
      pinned: note.pinned || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, [setNotes]);

  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date() } : note
      )
    );
  }, [setNotes]);

  return {
    notes,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
  };
};
