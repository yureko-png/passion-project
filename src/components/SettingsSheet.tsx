import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Clock, Target, Palette, Volume2, Shield, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const settingsSections = [
  {
    title: 'Profile',
    icon: User,
    items: [
      { label: 'Display Name', type: 'input', value: 'User' },
      { label: 'Daily Goal (hours)', type: 'number', value: 4 },
    ]
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Push Notifications', type: 'toggle', value: true },
      { label: 'Sound Alerts', type: 'toggle', value: true },
      { label: 'Break Reminders', type: 'toggle', value: true },
    ]
  },
  {
    title: 'Timer Settings',
    icon: Clock,
    items: [
      { label: 'Default Focus Duration (min)', type: 'number', value: 25 },
      { label: 'Default Break Duration (min)', type: 'number', value: 5 },
      { label: 'Long Break Duration (min)', type: 'number', value: 15 },
      { label: 'Auto-start Breaks', type: 'toggle', value: false },
    ]
  },
  {
    title: 'Goals & Tracking',
    icon: Target,
    items: [
      { label: 'Track Screen Time', type: 'toggle', value: true },
      { label: 'Weekly Reports', type: 'toggle', value: true },
      { label: 'Streak Notifications', type: 'toggle', value: true },
    ]
  },
  {
    title: 'Appearance',
    icon: Palette,
    items: [
      { label: 'Dark Mode', type: 'toggle', value: false },
      { label: 'Reduce Animations', type: 'toggle', value: false },
    ]
  },
  {
    title: 'Sound',
    icon: Volume2,
    items: [
      { label: 'Timer Complete Sound', type: 'toggle', value: true },
      { label: 'Background Ambience', type: 'toggle', value: false },
    ]
  },
];

const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const [settings, setSettings] = useState<Record<string, any>>({});

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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-80px)] p-6 space-y-6">
              {settingsSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.05, duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIndex * 0.05) + (itemIndex * 0.02) }}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        
                        {item.type === 'toggle' && (
                          <Switch defaultChecked={item.value as boolean} />
                        )}
                        
                        {item.type === 'number' && (
                          <input
                            type="number"
                            defaultValue={item.value as number}
                            className="w-20 px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}
                        
                        {item.type === 'input' && (
                          <input
                            type="text"
                            defaultValue={item.value as string}
                            className="w-32 px-3 py-1.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Help & Support */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-4 border-t border-border"
              >
                <button className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-secondary/50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Help & Support</span>
                </button>
                <button className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-secondary/50 transition-colors">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Privacy Policy</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsSheet;