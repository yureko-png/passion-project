import { motion } from 'framer-motion';
import { BookOpen, Dumbbell, Brain, Leaf, Music, Coffee } from 'lucide-react';

interface Action {
  id: string;
  title: string;
  duration: string;
  icon: React.ReactNode;
  category: string;
}

const RecommendedActions = () => {
  const actions: Action[] = [
    {
      id: '1',
      title: 'Read for 10 minutes',
      duration: '10 min',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'Learning',
    },
    {
      id: '2',
      title: 'Quick stretch break',
      duration: '5 min',
      icon: <Dumbbell className="w-5 h-5" />,
      category: 'Wellness',
    },
    {
      id: '3',
      title: 'Mindfulness meditation',
      duration: '10 min',
      icon: <Brain className="w-5 h-5" />,
      category: 'Mental',
    },
    {
      id: '4',
      title: 'Take a short walk',
      duration: '15 min',
      icon: <Leaf className="w-5 h-5" />,
      category: 'Health',
    },
    {
      id: '5',
      title: 'Listen to focus music',
      duration: '25 min',
      icon: <Music className="w-5 h-5" />,
      category: 'Focus',
    },
    {
      id: '6',
      title: 'Hydration break',
      duration: '2 min',
      icon: <Coffee className="w-5 h-5" />,
      category: 'Health',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          Recommended Actions
        </span>
        <span className="text-xs text-muted-foreground">Curated for you</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.duration}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default RecommendedActions;
