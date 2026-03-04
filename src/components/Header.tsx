import { motion } from 'framer-motion';
import { Menu, Bell, Settings, Moon, Sun, Sparkles, LogOut } from 'lucide-react';
import SettingsSheet from './SettingsSheet';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
  onOpenModomoro?: () => void;
}

const Header = ({ activeView = 'home', onNavigate, onOpenModomoro }: HeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings, updateSettings } = useSettingsStore();
  const { displayName, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const name = displayName || settings.displayName;

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
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>
          
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold spirit-gradient-text tracking-tight">Now is your time</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Command Center</p>
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
            {settings.darkMode ? (
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

          <div className="w-px h-6 bg-border mx-2" />
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-spirit-gradient flex items-center justify-center">
              <span className="text-sm font-bold text-white">{name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">{name}</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-destructive/10 transition-all group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
          </motion.button>
        </div>
      </motion.header>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SidebarMenu 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        activeView={activeView}
        onNavigate={onNavigate || (() => {})}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenModomoro={onOpenModomoro || (() => {})}
      />
    </>
  );
};

export default Header;
