import { motion } from 'framer-motion';
import { Menu, Bell, Settings, Moon } from 'lucide-react';
import lionMascot from '@/assets/lion-mascot.png';

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card px-6 py-4 flex items-center justify-between sticky top-4 z-50 mx-4"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </motion.button>
        
        <div className="flex items-center gap-3">
          <img src={lionMascot} alt="Time to Changing" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold gold-gradient-text">Time to Changing</h1>
            <p className="text-xs text-muted-foreground">Command Center</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <Moon className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <div className="w-px h-6 bg-border mx-2" />
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">U</span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">User</span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
