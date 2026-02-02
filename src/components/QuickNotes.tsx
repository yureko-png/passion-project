import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  Search,
  ChevronDown,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotesStore, Note } from '@/hooks/useNotesStore';

const noteColors = {
  default: 'bg-card border-border',
  coral: 'bg-accent/10 border-accent/30',
  mint: 'bg-mint/10 border-mint/30',
  lavender: 'bg-lavender/10 border-lavender/30',
  warm: 'bg-warm/10 border-warm/30',
};

const colorOptions: { value: Note['color']; label: string; bg: string }[] = [
  { value: 'default', label: 'Default', bg: 'bg-card' },
  { value: 'coral', label: 'Coral', bg: 'bg-accent/30' },
  { value: 'mint', label: 'Mint', bg: 'bg-mint/30' },
  { value: 'lavender', label: 'Lavender', bg: 'bg-lavender/30' },
  { value: 'warm', label: 'Warm', bg: 'bg-warm/30' },
];

const QuickNotes = () => {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // New note form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<Note['color']>('default');
  const [newPinned, setNewPinned] = useState(false);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(id);
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setNewColor('default');
    setNewPinned(false);
    setIsSheetOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewColor(note.color);
    setNewPinned(note.pinned);
    setIsSheetOpen(true);
  };

  const saveNote = () => {
    if (!newTitle.trim() && !newContent.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: newTitle || 'Untitled',
        content: newContent,
        color: newColor,
        pinned: newPinned,
      });
    } else {
      addNote({
        title: newTitle || 'Untitled',
        content: newContent,
        color: newColor,
        pinned: newPinned,
      });
    }

    setIsSheetOpen(false);
  };

  // Rich text formatting helpers
  const applyFormat = (format: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newContent.substring(start, end);

    let formattedText = '';
    let prefix = '';
    let suffix = '';

    switch (format) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        break;
      case 'italic':
        prefix = '_';
        suffix = '_';
        break;
      case 'underline':
        prefix = '__';
        suffix = '__';
        break;
      case 'highlight':
        prefix = '==';
        suffix = '==';
        break;
      case 'bullet':
        prefix = '• ';
        break;
      case 'number':
        prefix = '1. ';
        break;
    }

    if (selectedText) {
      formattedText = prefix + selectedText + suffix;
    } else {
      formattedText = prefix + suffix;
    }

    const newText = newContent.substring(0, start) + formattedText + newContent.substring(end);
    setNewContent(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
    <>
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
            onClick={openNewNote}
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
                onClick={() => openEditNote(note)}
                className={`p-3 rounded-xl border ${noteColors[note.color]} group cursor-pointer hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate flex-1">{note.title}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note.id);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        note.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
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

      {/* Note Editor Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingNote ? 'Edit Note' : 'New Note'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Title Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
                className="bg-secondary/50"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
              <button
                onClick={() => applyFormat('bold')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('italic')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('underline')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('highlight')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => applyFormat('bullet')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Bullet list"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('number')}
                className="p-2 rounded hover:bg-background transition-colors"
                title="Numbered list"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                id="note-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full min-h-[200px] p-3 rounded-lg bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewColor(color.value)}
                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                      newColor === color.value ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pin note</label>
              <button
                onClick={() => setNewPinned(!newPinned)}
                className={`p-2 rounded-lg transition-colors ${
                  newPinned ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveNote}
              >
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default QuickNotes;
