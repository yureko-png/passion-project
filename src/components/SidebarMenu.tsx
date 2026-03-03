import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, LayoutDashboard, LayoutGrid, Calendar, Target, BarChart3,
  Clock, StickyNote, Bell, Sparkles, Zap, Trophy, Rocket, 
  ChevronRight, Palette, Settings, User
} from 'lucide-react';
import mascotDefault from '@/assets/mascot-default.webp';

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  onOpenModomoro: () => void;
}

const menuSections = [
  {
    title: 'Navigation',
    items: [
      { id: 'home', label: 'Home', icon: Home, description: 'Your productivity hub' },
      { id: 'tasks', label: 'Tasks', icon: LayoutDashboard, description: 'Manage your to-dos' },
      { id: 'kanban', label: 'Board', icon: LayoutGrid, description: 'Visual task management' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Schedule & events' },
      { id: 'goals', label: 'Goals', icon: Target, description: 'Track your objectives' },
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Analytics & insights' },
    ]
  },
  {
    title: 'Productivity Tools',
    items: [
      { id: 'timer', label: 'Focus Timer', icon: Clock, description: 'Pomodoro technique', badge: 'Popular' },
      { id: 'notes', label: 'Quick Notes', icon: StickyNote, description: 'Capture your thoughts' },
      { id: 'reminders', label: 'Reminders', icon: Bell, description: 'Never forget anything' },
    ]
  },
  {
    title: 'Special Features',
    items: [
      { id: 'modomoro', label: 'Pomodoro Mode', icon: Sparkles, description: 'Immersive focus experience', badge: 'New', special: true },
      { id: 'streak', label: 'Streak Tracker', icon: Zap, description: 'Build consistency' },
      { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Your productivity wins' },
    ]
  }
];

const SidebarMenu = ({ 
  open, 
  onOpenChange, 
  activeView, 
  onNavigate, 
  onOpenSettings,
  onOpenModomoro 
}: SidebarMenuProps) => {
  
  const handleItemClick = (id: string) => {
    if (id === 'modomoro') {
      onOpenModomoro();
      onOpenChange(false);
    } else if (['home', 'tasks', 'kanban', 'calendar', 'goals', 'dashboard'].includes(id)) {
      onNavigate(id);
      onOpenChange(false);
    }
    // Other items can be expanded with more functionality
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 h-full w-full max-w-sm bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 via-lavender/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-coral/5 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="relative p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <img 
                      src={mascotDefault} 
                      alt="Time to Changing" 
                      className="w-14 h-14 object-contain relative z-10" 
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold spirit-gradient-text">Now is your time</h2>
                    <p className="text-xs text-muted-foreground">Your Productivity Partner</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* User Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-lavender/10 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-spirit-gradient flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Welcome back!</p>
                      <p className="text-xs text-muted-foreground">Ready to be productive?</p>
                    </div>
                  </div>
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
              </motion.div>
            </div>

            {/* Navigation Content */}
            <div className="overflow-y-auto h-[calc(100vh-280px)] p-4 space-y-6">
              {menuSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + sectionIndex * 0.1 }}
                  className="space-y-2"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                    {section.title}
                  </h3>
                  
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const isActive = activeView === item.id;
                      const isSpecial = 'special' in item && item.special;
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + sectionIndex * 0.1 + itemIndex * 0.03 }}
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                              : isSpecial
                                ? 'bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20'
                                : 'hover:bg-secondary/60'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive 
                              ? 'bg-primary-foreground/20' 
                              : isSpecial
                                ? 'bg-gradient-to-br from-primary to-accent'
                                : 'bg-secondary group-hover:bg-primary/10'
                          }`}>
                            <item.icon className={`w-4 h-4 ${
                              isActive 
                                ? 'text-primary-foreground' 
                                : isSpecial
                                  ? 'text-primary-foreground'
                                  : 'text-muted-foreground group-hover:text-primary'
                            }`} />
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                isActive ? 'text-primary-foreground' : 'text-foreground'
                              }`}>
                                {item.label}
                              </span>
                              {'badge' in item && item.badge && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  item.badge === 'New' 
                                    ? 'bg-coral text-white' 
                                    : 'bg-primary/20 text-primary'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs ${
                              isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                          
                          <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/80 backdrop-blur-lg">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onOpenSettings();
                    onOpenChange(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Settings</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                >
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Themes</span>
                </motion.button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-3">
                Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">⌘K</kbd> for quick actions
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarMenu;
