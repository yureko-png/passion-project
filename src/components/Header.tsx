import { motion } from 'framer-motion';
import { Menu, Bell, Settings, Moon, Sun, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import mascotDefault from '@/assets/mascot-default.webp';
import SettingsSheet from './SettingsSheet';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenMore?: () => void;
}

const Header = ({ onOpenSettings, onOpenMore }: HeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card px-6 py-4 flex items-center justify-between sticky top-4 z-50 mx-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl hover:bg-secondary/80 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={mascotDefault} 
                alt="Time to Changing" 
                className="w-12 h-12 object-contain" 
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold spirit-gradient-text">Time to Changing</h1>
              <p className="text-xs text-muted-foreground font-medium">Command Center</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all relative group"
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-coral rounded-full animate-pulse" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all group"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-muted-foreground group-hover:text-warm transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all group"
          >
            <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenMore}
            className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all group"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>

          <div className="w-px h-6 bg-border mx-2" />
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-spirit-gradient flex items-center justify-center">
              <span className="text-sm font-bold text-white">U</span>
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">User</span>
          </motion.div>
        </div>
      </motion.header>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

export default Header;