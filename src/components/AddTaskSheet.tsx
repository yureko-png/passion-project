import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Flag, Plus, X, Clock, ListChecks, Zap } from 'lucide-react';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface NewTaskData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  dueDate: string;
  timeEstimate: number;
  tags: string[];
  subtasks: SubTask[];
}

interface AddTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: NewTaskData) => void;
  columnTitle?: string;
}

const priorityOptions = [
  { value: 'high', label: 'High', color: 'bg-destructive/20 text-destructive', icon: '🔴' },
  { value: 'medium', label: 'Medium', color: 'bg-primary/20 text-primary', icon: '🟡' },
  { value: 'low', label: 'Low', color: 'bg-secondary text-muted-foreground', icon: '🟢' },
] as const;

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'bg-mint/20 text-mint', description: '< 30 min' },
  { value: 'medium', label: 'Medium', color: 'bg-primary/20 text-primary', description: '30-60 min' },
  { value: 'hard', label: 'Hard', color: 'bg-warm/20 text-warm', description: '1-2 hours' },
  { value: 'expert', label: 'Expert', color: 'bg-destructive/20 text-destructive', description: '2+ hours' },
] as const;

const AddTaskSheet = ({ open, onOpenChange, onSave, columnTitle }: AddTaskSheetProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { id: Date.now().toString(), title: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      priority,
      difficulty,
      dueDate,
      timeEstimate,
      tags,
      subtasks,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDifficulty('medium');
    setDueDate('');
    setTimeEstimate(30);
    setTags([]);
    setSubtasks([]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
            {columnTitle && (
              <span className="text-sm font-normal text-muted-foreground">
                to {columnTitle}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Task Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-secondary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="bg-secondary/50 min-h-[80px]"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Flag className="w-4 h-4" /> Priority
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    priority === opt.value
                      ? `${opt.color} border-current`
                      : 'bg-secondary/50 border-transparent hover:bg-secondary'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Zap className="w-4 h-4" /> Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`py-2 px-3 rounded-lg border text-sm transition-all text-left ${
                    difficulty === opt.value
                      ? `${opt.color} border-current`
                      : 'bg-secondary/50 border-transparent hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time (min)
              </label>
              <Input
                type="number"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                min={5}
                max={480}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="bg-secondary/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Subtasks / Checklist
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                >
                  <div className="w-4 h-4 rounded border border-border" />
                  <span className="flex-1 text-sm">{subtask.title}</span>
                  <button
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="bg-secondary/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <Button variant="outline" size="sm" onClick={handleAddSubtask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!title.trim()}>
              Create Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddTaskSheet;
