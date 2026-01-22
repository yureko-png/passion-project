import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import quotesData from '@/data/quotes.json';

const MotivationalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(quotesData.motivationalCatalysts[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getRandomQuote = () => {
    const quotes = quotesData.motivationalCatalysts;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const refreshQuote = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    // Auto-rotate quotes every 30 seconds
    const interval = setInterval(() => {
      refreshQuote();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Motivational Catalyst
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={refreshQuote}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 10 : 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <blockquote className="text-lg font-medium text-foreground mb-2 leading-relaxed">
              "{currentQuote.quote}"
            </blockquote>
            <cite className="text-sm text-muted-foreground not-italic">
              — {currentQuote.author}
            </cite>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MotivationalQuote;
