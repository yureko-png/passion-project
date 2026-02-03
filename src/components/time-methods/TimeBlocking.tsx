import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Play, Clock, GripVertical } from 'lucide-react';

interface TimeBlock {
  id: string;
  title: string;
  duration: number;
  color: string;
  completed: boolean;
}

interface TimeBlockingProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const blockColors = [
  { name: 'Blue', value: 'bg-primary/20 border-primary/40' },
  { name: 'Coral', value: 'bg-coral/20 border-coral/40' },
  { name: 'Warm', value: 'bg-warm/20 border-warm/40' },
  { name: 'Accent', value: 'bg-accent/20 border-accent/40' },
  { name: 'Spirit', value: 'bg-spirit/20 border-spirit/40' },
];

const presetDurations = [15, 25, 30, 45, 60, 90];

const TimeBlocking = ({ onStartTimer }: TimeBlockingProps) => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([
    { id: '1', title: 'Deep Work', duration: 90, color: blockColors[0].value, completed: false },
    { id: '2', title: 'Email & Admin', duration: 30, color: blockColors[2].value, completed: false },
    { id: '3', title: 'Meeting Prep', duration: 15, color: blockColors[1].value, completed: false },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState({ title: '', duration: 25, color: blockColors[0].value });

  const addBlock = () => {
    if (!newBlock.title.trim()) return;
    
    const block: TimeBlock = {
      id: Date.now().toString(),
      title: newBlock.title,
      duration: newBlock.duration,
      color: newBlock.color,
      completed: false
    };
    
    setBlocks([...blocks, block]);
    setNewBlock({ title: '', duration: 25, color: blockColors[0].value });
    setIsAdding(false);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const toggleComplete = (id: string) => {
    setBlocks(blocks.map(b => 
      b.id === id ? { ...b, completed: !b.completed } : b
    ));
  };

  const startBlock = (block: TimeBlock) => {
    if (onStartTimer) {
      onStartTimer(block.duration, block.title);
    }
  };

  const totalMinutes = blocks.reduce((sum, b) => sum + b.duration, 0);
  const completedMinutes = blocks.filter(b => b.completed).reduce((sum, b) => sum + b.duration, 0);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Plan your day with dedicated time blocks. Drag to reorder or click to start.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedMinutes} min completed</span>
          <span>{totalMinutes} min total</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Time Blocks */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${block.color} ${
              block.completed ? 'opacity-50' : ''
            }`}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            
            <button
              onClick={() => toggleComplete(block.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                block.completed 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground hover:border-primary'
              }`}
            >
              {block.completed && <span className="text-xs">✓</span>}
            </button>

            <div className="flex-1">
              <p className={`text-sm font-medium ${block.completed ? 'line-through' : ''}`}>
                {block.title}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {block.duration}m
              </div>
              
              {!block.completed && (
                <button
                  onClick={() => startBlock(block)}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  title="Start timer"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => removeBlock(block.id)}
                className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Block Form */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-secondary/50 space-y-3"
        >
          <input
            type="text"
            value={newBlock.title}
            onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
            placeholder="Block title..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Duration:</span>
            {presetDurations.map((d) => (
              <button
                key={d}
                onClick={() => setNewBlock({ ...newBlock, duration: d })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  newBlock.duration === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Color:</span>
            {blockColors.map((c) => (
              <button
                key={c.name}
                onClick={() => setNewBlock({ ...newBlock, color: c.value })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${c.value} ${
                  newBlock.color === c.value ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addBlock}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Block
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
          Add Time Block
        </button>
      )}
    </div>
  );
};

export default TimeBlocking;
