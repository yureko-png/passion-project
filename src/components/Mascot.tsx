import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Import all mascot poses
import mascotDefault from '@/assets/mascot-default.webp';
import mascotEncouraging from '@/assets/mascot-encouraging.webp';
import mascotThinking from '@/assets/mascot-thinking.png';
import mascotFirm from '@/assets/mascot-firm.png';
import mascotSurprised from '@/assets/mascot-surprised.png';
import mascotCasual from '@/assets/mascot-casual.png';

export type MascotMood = 'encouraging' | 'neutral' | 'firm' | 'thinking' | 'surprised' | 'casual';

interface MascotProps {
  message: string;
  mood?: MascotMood;
  isTyping?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  showSpeechBubble?: boolean;
}

const mascotPoses: Record<MascotMood, string> = {
  encouraging: mascotEncouraging,
  neutral: mascotDefault,
  firm: mascotFirm,
  thinking: mascotThinking,
  surprised: mascotSurprised,
  casual: mascotCasual,
};

const mascotSizes = {
  small: 'h-24',
  medium: 'h-40',
  large: 'h-56',
  hero: 'h-[400px]',
};

const Mascot = ({ 
  message, 
  mood = 'neutral', 
  isTyping = false, 
  size = 'large',
  showSpeechBubble = true 
}: MascotProps) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (isTyping || !message) {
      setDisplayedMessage('');
      return;
    }

    setIsAnimating(true);
    setDisplayedMessage('');
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedMessage(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsAnimating(false);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [message, isTyping]);

  const getMoodColor = () => {
    switch (mood) {
      case 'encouraging':
        return 'border-mint/50 bg-mint/5';
      case 'firm':
        return 'border-coral/50 bg-coral/5';
      case 'thinking':
        return 'border-lavender/50 bg-lavender/5';
      case 'surprised':
        return 'border-warm/50 bg-warm/5';
      case 'casual':
        return 'border-spirit/30 bg-spirit/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`speech-bubble max-w-sm text-center ${getMoodColor()}`}
          >
            {isTyping ? (
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                {displayedMessage}
                {isAnimating && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                  />
                )}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Mascot Image */}
      <motion.div
        className="mascot-container mascot-float"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10 blur-3xl"
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Mascot image with pose transition */}
          <AnimatePresence mode="wait">
            <motion.img
              key={mood}
              src={mascotPoses[mood]}
              alt="Ako - Your Productivity Coach"
              className={`${mascotSizes[size]} object-contain relative z-10`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
        </div>
      </motion.div>
      
      <motion.p 
        className="text-xs text-muted-foreground font-semibold uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Ako • Your Coach
      </motion.p>
    </div>
  );
};

export default Mascot;