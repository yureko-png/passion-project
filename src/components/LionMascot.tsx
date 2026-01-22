import { motion, AnimatePresence } from 'framer-motion';
import lionMascot from '@/assets/lion-mascot.png';

interface LionMascotProps {
  message: string;
  mood?: 'encouraging' | 'neutral' | 'firm';
  isTyping?: boolean;
}

const LionMascot = ({ message, mood = 'neutral', isTyping = false }: LionMascotProps) => {
  const getMoodColor = () => {
    switch (mood) {
      case 'encouraging':
        return 'border-primary/50';
      case 'firm':
        return 'border-destructive/50';
      default:
        return 'border-border';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`speech-bubble max-w-xs text-center ${getMoodColor()}`}
        >
          {isTyping ? (
            <div className="flex items-center justify-center gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </div>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed">{message}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lion Mascot */}
      <motion.div
        className="mascot-container mascot-breathing"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <img
            src={lionMascot}
            alt="Leo - Your Productivity Coach"
            className="w-32 h-32 object-contain relative z-10"
          />
        </div>
      </motion.div>
      
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Leo • Your Coach
      </p>
    </div>
  );
};

export default LionMascot;
