import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  // Profile
  displayName: string;
  dailyGoalHours: number;
  
  // Notifications
  pushNotifications: boolean;
  soundAlerts: boolean;
  breakReminders: boolean;
  
  // Timer
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  longBreakInterval: number;
  
  // Goals & Tracking
  trackScreenTime: boolean;
  weeklyReports: boolean;
  streakNotifications: boolean;
  
  // Appearance
  darkMode: boolean;
  reduceAnimations: boolean;
  compactMode: boolean;
  
  // Sound
  timerCompleteSound: boolean;
  backgroundAmbience: boolean;
  tickingSound: boolean;
  volume: number;
  
  // Focus Mode
  blockDistractions: boolean;
  hideNotifications: boolean;
  fullscreenFocus: boolean;
  
  // Data
  autoBackup: boolean;
  syncAcrossDevices: boolean;
}

const defaultSettings: AppSettings = {
  displayName: 'User',
  dailyGoalHours: 4,
  pushNotifications: true,
  soundAlerts: true,
  breakReminders: true,
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  longBreakInterval: 4,
  trackScreenTime: true,
  weeklyReports: true,
  streakNotifications: true,
  darkMode: false,
  reduceAnimations: false,
  compactMode: false,
  timerCompleteSound: true,
  backgroundAmbience: false,
  tickingSound: false,
  volume: 80,
  blockDistractions: false,
  hideNotifications: false,
  fullscreenFocus: false,
  autoBackup: true,
  syncAcrossDevices: false,
};

const STORAGE_KEY = 'app-settings';

const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
};

const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Notify all listeners
    listeners.forEach((listener) => listener());
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

let globalSettings = loadSettings();
const listeners = new Set<() => void>();

export const useSettingsStore = () => {
  const [settings, setLocalSettings] = useState<AppSettings>(globalSettings);

  useEffect(() => {
    const listener = () => {
      globalSettings = loadSettings();
      setLocalSettings(globalSettings);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    globalSettings = { ...globalSettings, ...updates };
    saveSettings(globalSettings);
    setLocalSettings(globalSettings);
    
    // Apply dark mode immediately
    if ('darkMode' in updates) {
      if (updates.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Apply reduce animations
    if ('reduceAnimations' in updates) {
      if (updates.reduceAnimations) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, []);

  const resetSettings = useCallback(() => {
    globalSettings = { ...defaultSettings };
    saveSettings(globalSettings);
    setLocalSettings(globalSettings);
    document.documentElement.classList.remove('dark', 'reduce-motion');
  }, []);

  return { settings, updateSettings, resetSettings };
};

// Initialize dark mode on load
if (globalSettings.darkMode) {
  document.documentElement.classList.add('dark');
}
if (globalSettings.reduceAnimations) {
  document.documentElement.classList.add('reduce-motion');
}
