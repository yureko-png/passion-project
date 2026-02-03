import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Bell, Clock, Target, Palette, Volume2, Shield, HelpCircle, 
  Zap, Database, RefreshCw, Sparkles, Moon, Sun, Eye, EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { toast } from 'sonner';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ [key]: value });
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleNumberChange = (key: string, value: number) => {
    updateSettings({ [key]: value });
  };

  const handleTextChange = (key: string, value: string) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    resetSettings();
    toast.success('Settings reset to defaults');
  };

  const settingsSections = [
    {
      title: 'Profile',
      icon: User,
      color: 'from-primary to-primary/70',
      items: [
        { key: 'displayName', label: 'Display Name', type: 'input' },
        { key: 'dailyGoalHours', label: 'Daily Goal (hours)', type: 'number', min: 1, max: 12 },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'from-coral to-coral/70',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', type: 'toggle', description: 'Get notified about important updates' },
        { key: 'soundAlerts', label: 'Sound Alerts', type: 'toggle', description: 'Audio cues for timer events' },
        { key: 'breakReminders', label: 'Break Reminders', type: 'toggle', description: 'Gentle reminders to take breaks' },
        { key: 'streakNotifications', label: 'Streak Alerts', type: 'toggle', description: 'Celebrate your consistency' },
      ]
    },
    {
      title: 'Timer Settings',
      icon: Clock,
      color: 'from-mint to-mint/70',
      items: [
        { key: 'focusDuration', label: 'Focus Duration', type: 'slider', min: 5, max: 60, unit: 'min' },
        { key: 'breakDuration', label: 'Break Duration', type: 'slider', min: 1, max: 15, unit: 'min' },
        { key: 'longBreakDuration', label: 'Long Break', type: 'slider', min: 10, max: 30, unit: 'min' },
        { key: 'longBreakInterval', label: 'Long Break After', type: 'number', min: 2, max: 8, suffix: 'sessions' },
        { key: 'autoStartBreaks', label: 'Auto-start Breaks', type: 'toggle', description: 'Automatically begin break timer' },
        { key: 'autoStartFocus', label: 'Auto-start Focus', type: 'toggle', description: 'Jump back into work after breaks' },
      ]
    },
    {
      title: 'Focus Mode',
      icon: Zap,
      color: 'from-warm to-warm/70',
      items: [
        { key: 'blockDistractions', label: 'Block Distractions', type: 'toggle', description: 'Hide non-essential UI elements' },
        { key: 'hideNotifications', label: 'Hide Notifications', type: 'toggle', description: 'No popups during focus' },
        { key: 'fullscreenFocus', label: 'Fullscreen Mode', type: 'toggle', description: 'Immersive focus experience' },
      ]
    },
    {
      title: 'Goals & Tracking',
      icon: Target,
      color: 'from-lavender to-lavender/70',
      items: [
        { key: 'trackScreenTime', label: 'Track Screen Time', type: 'toggle', description: 'Monitor your usage patterns' },
        { key: 'weeklyReports', label: 'Weekly Reports', type: 'toggle', description: 'Get productivity insights' },
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      color: 'from-spirit to-spirit/70',
      items: [
        { key: 'darkMode', label: 'Dark Mode', type: 'toggle', description: 'Easy on the eyes', icon: settings.darkMode ? Moon : Sun },
        { key: 'reduceAnimations', label: 'Reduce Animations', type: 'toggle', description: 'Less motion for accessibility' },
        { key: 'compactMode', label: 'Compact Mode', type: 'toggle', description: 'Fit more content on screen' },
      ]
    },
    {
      title: 'Sound',
      icon: Volume2,
      color: 'from-primary to-lavender',
      items: [
        { key: 'volume', label: 'Master Volume', type: 'volume-slider', min: 0, max: 100 },
        { key: 'timerCompleteSound', label: 'Timer Complete', type: 'toggle', description: 'Play sound when timer ends' },
        { key: 'tickingSound', label: 'Ticking Sound', type: 'toggle', description: 'Ambient clock ticking' },
        { key: 'backgroundAmbience', label: 'Background Ambience', type: 'toggle', description: 'Relaxing background sounds' },
      ]
    },
    {
      title: 'Data & Sync',
      icon: Database,
      color: 'from-mint to-primary',
      items: [
        { key: 'autoBackup', label: 'Auto Backup', type: 'toggle', description: 'Automatically save your data' },
        { key: 'syncAcrossDevices', label: 'Sync Devices', type: 'toggle', description: 'Coming soon - sync everywhere' },
      ]
    },
  ];

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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-md z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-lavender flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Settings</h2>
                  <p className="text-xs text-muted-foreground">Customize your experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-100px)] p-6 space-y-8">
              {settingsSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.05, duration: 0.4 }}
                  className="space-y-4"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                      <section.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      {section.title}
                    </h3>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-2 ml-11">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIndex * 0.05) + (itemIndex * 0.02) }}
                        className="group flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-primary/20"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {'icon' in item && item.icon && (
                              <item.icon className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium text-foreground">{item.label}</span>
                          </div>
                          {'description' in item && item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-shrink-0">
                          {item.type === 'toggle' && (
                            <Switch 
                              checked={settings[item.key as keyof typeof settings] as boolean}
                              onCheckedChange={(checked) => handleToggle(item.key, checked)}
                            />
                          )}
                          
                          {item.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={settings[item.key as keyof typeof settings] as number}
                                onChange={(e) => handleNumberChange(item.key, parseInt(e.target.value) || 0)}
                                min={item.min}
                                max={item.max}
                                className="w-16 px-2 py-1 rounded-lg bg-background border border-border text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                              {'suffix' in item && item.suffix && (
                                <span className="text-xs text-muted-foreground">{item.suffix}</span>
                              )}
                            </div>
                          )}
                          
                          {item.type === 'input' && (
                            <input
                              type="text"
                              value={settings[item.key as keyof typeof settings] as string}
                              onChange={(e) => handleTextChange(item.key, e.target.value)}
                              className="w-28 px-3 py-1.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          )}

                          {item.type === 'slider' && (
                            <div className="flex items-center gap-3 w-40">
                              <Slider
                                value={[settings[item.key as keyof typeof settings] as number]}
                                onValueChange={([val]) => handleNumberChange(item.key, val)}
                                min={item.min}
                                max={item.max}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {settings[item.key as keyof typeof settings]}{item.unit}
                              </span>
                            </div>
                          )}

                          {item.type === 'volume-slider' && (
                            <div className="flex items-center gap-3 w-40">
                              <Slider
                                value={[settings[item.key as keyof typeof settings] as number]}
                                onValueChange={([val]) => handleNumberChange(item.key, val)}
                                min={0}
                                max={100}
                                step={5}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {settings[item.key as keyof typeof settings]}%
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Help & Support */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-border/50 space-y-2"
              >
                <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-foreground block">Help & Support</span>
                    <span className="text-xs text-muted-foreground">Get assistance and FAQs</span>
                  </div>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-foreground block">Privacy Policy</span>
                    <span className="text-xs text-muted-foreground">Your data is protected</span>
                  </div>
                </button>
              </motion.div>

              {/* Version */}
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">Time to Changing v1.0.0</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Made with 💙 for productivity</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsSheet;
