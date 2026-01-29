import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  Search,
  ChevronDown,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  color: 'default' | 'coral' | 'mint' | 'lavender' | 'warm';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteColors = {
  default: 'bg-card border-border',
  coral: 'bg-accent/10 border-accent/30',
  mint: 'bg-mint/10 border-mint/30',
  lavender: 'bg-lavender/10 border-lavender/30',
  warm: 'bg-warm/10 border-warm/30',
};

const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([
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
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const togglePin = (id: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);
  const displayNotes = showAll ? [...pinnedNotes, ...unpinnedNotes] : [...pinnedNotes, ...unpinnedNotes].slice(0, 3);

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
            <FileText className="w-5 h-5 text-lavender" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-lavender">
              Quick Notes
            </h3>
            <p className="text-xs text-muted-foreground">{notes.length} notes</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glass px-3 py-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          New
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Notes Grid */}
      <div className="space-y-2">
        <AnimatePresence>
          {displayNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3 rounded-xl border ${noteColors[note.color]} group cursor-pointer hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium truncate flex-1">{note.title}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      note.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                {note.content}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {note.updatedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less */}
      {filteredNotes.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors"
        >
          <span>{showAll ? 'Show less' : `Show ${filteredNotes.length - 3} more`}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}

      {filteredNotes.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          {searchQuery ? 'No notes found' : 'No notes yet'}
        </p>
      )}
    </motion.div>
  );
};

export default QuickNotes;
