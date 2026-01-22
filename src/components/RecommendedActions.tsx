import { motion } from 'framer-motion';
import { BookOpen, Dumbbell, Brain, Leaf, Music, Coffee, Play, Timer } from 'lucide-react';
import { useState } from 'react';

interface Action {
  id: string;
  title: string;
  duration: number; // in minutes
  icon: React.ReactNode;
  category: string;
  color: string;
}

interface RecommendedActionsProps {
  onStartTimer?: (duration: number, title: string) => void;
}

const RecommendedActions = ({ onStartTimer }: RecommendedActionsProps) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const actions: Action[] = [
    {
      id: '1',
      title: 'Read for 10 minutes',
      duration: 10,
      icon: <BookOpen className="w-5 h-5" />,
      category: 'Learning',
      color: 'from-spirit to-lavender',
    },
    {
      id: '2',
      title: 'Quick stretch break',
      duration: 5,
      icon: <Dumbbell className="w-5 h-5" />,
      category: 'Wellness',
      color: 'from-mint to-spirit',
    },
    {
      id: '3',
      title: 'Mindfulness meditation',
      duration: 10,
      icon: <Brain className="w-5 h-5" />,
      category: 'Mental',
      color: 'from-lavender to-coral',
    },
    {
      id: '4',
      title: 'Take a short walk',
      duration: 15,
      icon: <Leaf className="w-5 h-5" />,
      category: 'Health',
      color: 'from-mint to-warm',
    },
    {
      id: '5',
      title: 'Listen to focus music',
      duration: 25,
      icon: <Music className="w-5 h-5" />,
      category: 'Focus',
      color: 'from-spirit to-coral',
    },
    {
      id: '6',
      title: 'Hydration break',
      duration: 2,
      icon: <Coffee className="w-5 h-5" />,
      category: 'Health',
      color: 'from-warm to-coral',
    },
  ];

  const handleActionClick = (action: Action) => {
    setSelectedAction(action.id);
    onStartTimer?.(action.duration, action.title);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Recommended Actions
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">Click to start timer</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleActionClick(action)}
            className={`action-card relative overflow-hidden flex flex-col gap-3 p-4 rounded-xl border border-transparent hover:border-primary/20 text-left group
              ${selectedAction === action.id ? 'bg-primary/10 border-primary/30' : 'bg-secondary/40 hover:bg-secondary/60'}`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                {action.icon}
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              >
                <Play className="w-4 h-4 text-white ml-0.5" />
              </motion.div>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-semibold text-foreground leading-tight">{action.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-primary font-medium">{action.duration} min</span>
                <span className="text-xs text-muted-foreground">• {action.category}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default RecommendedActions;