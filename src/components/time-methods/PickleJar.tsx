import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Play, Circle } from 'lucide-react';

interface JarItem {
  id: string;
  text: string;
  type: 'rock' | 'pebble' | 'sand';
  completed: boolean;
}

interface PickleJarProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const itemTypes = [
  {
    type: 'rock',
    name: 'Rocks',
    description: 'Major priorities & goals',
    color: 'bg-primary',
    containerColor: 'bg-primary/10 border-primary/30',
    size: 'w-8 h-8',
    duration: 60
  },
  {
    type: 'pebble',
    name: 'Pebbles',
    description: 'Important but not critical',
    color: 'bg-warm',
    containerColor: 'bg-warm/10 border-warm/30',
    size: 'w-5 h-5',
    duration: 30
  },
  {
    type: 'sand',
    name: 'Sand',
    description: 'Small tasks & distractions',
    color: 'bg-muted-foreground',
    containerColor: 'bg-muted border-border',
    size: 'w-3 h-3',
    duration: 15
  }
] as const;

const PickleJar = ({ onStartTimer }: PickleJarProps) => {
  const [items, setItems] = useState<JarItem[]>([
    { id: '1', text: 'Complete quarterly report', type: 'rock', completed: false },
    { id: '2', text: 'Prepare for team meeting', type: 'pebble', completed: false },
    { id: '3', text: 'Check social media', type: 'sand', completed: true },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ text: '', type: 'rock' as JarItem['type'] });

  const addItem = () => {
    if (!newItem.text.trim()) return;
    
    const item: JarItem = {
      id: Date.now().toString(),
      text: newItem.text,
      type: newItem.type,
      completed: false
    };
    
    setItems([...items, item]);
    setNewItem({ text: '', type: 'rock' });
    setIsAdding(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(i => 
      i.id === id ? { ...i, completed: !i.completed } : i
    ));
  };

  const startItem = (item: JarItem) => {
    const itemType = itemTypes.find(t => t.type === item.type);
    if (itemType && onStartTimer) {
      const emoji = item.type === 'rock' ? '🪨' : item.type === 'pebble' ? '🪨' : '⏱️';
      onStartTimer(itemType.duration, `${emoji} ${item.text}`);
    }
  };

  const getItemsByType = (type: string) => items.filter(i => i.type === type);

  // Calculate jar fill visualization
  const rocks = getItemsByType('rock');
  const pebbles = getItemsByType('pebble');
  const sand = getItemsByType('sand');
  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Fill your jar with <span className="font-bold text-primary">rocks</span> first, then <span className="font-bold text-warm">pebbles</span>, then <span className="font-bold">sand</span>.
        </p>
      </div>

      {/* Visual Jar */}
      <div className="relative mx-auto w-48 h-56 border-4 border-border rounded-b-3xl rounded-t-lg bg-background/50 overflow-hidden">
        {/* Jar Fill Layers */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          {/* Sand Layer */}
          {sand.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: sand.length * 15 }}
              className="bg-muted-foreground/30 w-full flex flex-wrap justify-center items-end p-1 gap-0.5"
            >
              {sand.map((s) => (
                <motion.div
                  key={s.id}
                  className={`w-2 h-2 rounded-full ${s.completed ? 'bg-primary' : 'bg-muted-foreground/50'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              ))}
            </motion.div>
          )}
          
          {/* Pebbles Layer */}
          {pebbles.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: pebbles.length * 25 }}
              className="bg-warm/20 w-full flex flex-wrap justify-center items-center p-1 gap-1"
            >
              {pebbles.map((p) => (
                <motion.div
                  key={p.id}
                  className={`w-4 h-4 rounded-full ${p.completed ? 'bg-primary' : 'bg-warm/60'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              ))}
            </motion.div>
          )}
          
          {/* Rocks Layer */}
          {rocks.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: Math.min(rocks.length * 40, 120) }}
              className="bg-primary/20 w-full flex flex-wrap justify-center items-center p-2 gap-1"
            >
              {rocks.map((r) => (
                <motion.div
                  key={r.id}
                  className={`w-8 h-8 rounded-lg ${r.completed ? 'bg-primary' : 'bg-primary/50'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            Add items to fill your jar
          </div>
        )}

        {/* Jar Label */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-[10px] font-medium">
          {completedItems}/{totalItems} done
        </div>
      </div>

      {/* Item Lists by Type */}
      <div className="space-y-3">
        {itemTypes.map((type) => (
          <div key={type.type} className={`rounded-xl border-2 ${type.containerColor} overflow-hidden`}>
            <div className="px-3 py-2 flex items-center gap-2">
              <div className={`${type.size} rounded-full ${type.color}`} />
              <div className="flex-1">
                <span className="text-sm font-semibold">{type.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{type.description}</span>
              </div>
              <span className="text-xs text-muted-foreground">{type.duration}min</span>
            </div>

            <div className="p-2 space-y-1">
              {getItemsByType(type.type).map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 p-2 rounded-lg bg-background/80 group ${
                    item.completed ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.completed 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {item.completed && <span className="text-[8px]">✓</span>}
                  </button>

                  <span className={`flex-1 text-xs ${item.completed ? 'line-through' : ''}`}>
                    {item.text}
                  </span>

                  {!item.completed && (
                    <button
                      onClick={() => startItem(item)}
                      className="p-1 rounded hover:bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}

              {getItemsByType(type.type).length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-1 opacity-60">
                  No {type.name.toLowerCase()} yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-secondary/50 space-y-3"
        >
          <input
            type="text"
            value={newItem.text}
            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="What's on your plate?"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          <div className="flex gap-2">
            <span className="text-xs text-muted-foreground self-center">Type:</span>
            {itemTypes.map((t) => (
              <button
                key={t.type}
                onClick={() => setNewItem({ ...newItem, type: t.type })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  newItem.type === t.type
                    ? `${t.color} text-white`
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                <div className={`${t.size} rounded-full ${newItem.type === t.type ? 'bg-white/30' : t.color}`} />
                {t.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add to Jar
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
          Add to Jar
        </button>
      )}
    </div>
  );
};

export default PickleJar;
