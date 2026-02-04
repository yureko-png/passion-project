import { useState, useEffect, useCallback, useRef } from 'react';
import defaultTimerSound from '@/assets/timer-complete.mp3';

export type SoundType = 'timer' | 'reminder' | 'tick' | 'ambience';

export interface SoundSettings {
  masterVolume: number;
  timerSoundEnabled: boolean;
  reminderSoundEnabled: boolean;
  tickingSoundEnabled: boolean;
  ambienceSoundEnabled: boolean;
  timerSoundData: string | null;
  timerSoundName: string;
  reminderSoundData: string | null;
  reminderSoundName: string;
}

const defaultSettings: SoundSettings = {
  masterVolume: 80,
  timerSoundEnabled: true,
  reminderSoundEnabled: true,
  tickingSoundEnabled: false,
  ambienceSoundEnabled: false,
  timerSoundData: null,
  timerSoundName: 'Default',
  reminderSoundData: null,
  reminderSoundName: 'Default',
};

const STORAGE_KEY = 'sound-settings';

const loadSettings = (): SoundSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load sound settings:', e);
  }
  return defaultSettings;
};

const saveSettings = (settings: SoundSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    listeners.forEach((listener) => listener());
  } catch (e) {
    console.error('Failed to save sound settings:', e);
  }
};

let globalSettings = loadSettings();
const listeners = new Set<() => void>();

// Audio instance cache
const audioCache: Map<string, HTMLAudioElement> = new Map();

const getAudioInstance = (soundType: SoundType, settings: SoundSettings): HTMLAudioElement | null => {
  const cacheKey = soundType;
  
  let audioSrc: string | null = null;
  
  switch (soundType) {
    case 'timer':
      audioSrc = settings.timerSoundData || defaultTimerSound;
      break;
    case 'reminder':
      audioSrc = settings.reminderSoundData || defaultTimerSound;
      break;
    default:
      return null;
  }
  
  if (!audioSrc) return null;
  
  // Check if we have a cached instance with the same source
  const cached = audioCache.get(cacheKey);
  if (cached && cached.src === audioSrc) {
    return cached;
  }
  
  // Create new audio instance
  const audio = new Audio(audioSrc);
  audio.volume = settings.masterVolume / 100;
  audioCache.set(cacheKey, audio);
  
  return audio;
};

export const useSoundStore = () => {
  const [settings, setLocalSettings] = useState<SoundSettings>(globalSettings);
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

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

  // Update audio cache when settings change
  useEffect(() => {
    // Update volume on all cached audio instances
    audioCache.forEach((audio) => {
      audio.volume = settings.masterVolume / 100;
    });
  }, [settings.masterVolume]);

  const updateSettings = useCallback((updates: Partial<SoundSettings>) => {
    globalSettings = { ...globalSettings, ...updates };
    saveSettings(globalSettings);
    setLocalSettings(globalSettings);
  }, []);

  const playSound = useCallback((soundType: SoundType) => {
    const currentSettings = globalSettings;
    
    // Check if sound is enabled for this type
    switch (soundType) {
      case 'timer':
        if (!currentSettings.timerSoundEnabled) return;
        break;
      case 'reminder':
        if (!currentSettings.reminderSoundEnabled) return;
        break;
      case 'tick':
        if (!currentSettings.tickingSoundEnabled) return;
        break;
      case 'ambience':
        if (!currentSettings.ambienceSoundEnabled) return;
        break;
    }
    
    const audio = getAudioInstance(soundType, currentSettings);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = currentSettings.masterVolume / 100;
      audio.play().catch((e) => console.warn('Audio play failed:', e));
    }
  }, []);

  const previewSound = useCallback((soundType: SoundType) => {
    const audio = getAudioInstance(soundType, globalSettings);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = globalSettings.masterVolume / 100;
      audio.play().catch((e) => console.warn('Audio preview failed:', e));
    }
  }, []);

  const importSound = useCallback((soundType: 'timer' | 'reminder', file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        if (soundType === 'timer') {
          updateSettings({
            timerSoundData: base64,
            timerSoundName: file.name,
          });
        } else {
          updateSettings({
            reminderSoundData: base64,
            reminderSoundName: file.name,
          });
        }
        
        // Clear cache to force reload
        audioCache.delete(soundType);
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [updateSettings]);

  const exportSound = useCallback((soundType: 'timer' | 'reminder') => {
    const data = soundType === 'timer' 
      ? globalSettings.timerSoundData 
      : globalSettings.reminderSoundData;
    const name = soundType === 'timer'
      ? globalSettings.timerSoundName
      : globalSettings.reminderSoundName;
    
    if (data) {
      const link = document.createElement('a');
      link.href = data;
      link.download = name || `${soundType}-sound.mp3`;
      link.click();
    }
  }, []);

  const clearSound = useCallback((soundType: 'timer' | 'reminder') => {
    if (soundType === 'timer') {
      updateSettings({
        timerSoundData: null,
        timerSoundName: 'Default',
      });
    } else {
      updateSettings({
        reminderSoundData: null,
        reminderSoundName: 'Default',
      });
    }
    // Clear cache
    audioCache.delete(soundType);
  }, [updateSettings]);

  const resetToDefaults = useCallback(() => {
    globalSettings = { ...defaultSettings };
    saveSettings(globalSettings);
    setLocalSettings(globalSettings);
    audioCache.clear();
  }, []);

  return {
    settings,
    updateSettings,
    playSound,
    previewSound,
    importSound,
    exportSound,
    clearSound,
    resetToDefaults,
  };
};

// Export a singleton play function for use outside of React
export const playSoundGlobal = (soundType: SoundType) => {
  const audio = getAudioInstance(soundType, globalSettings);
  if (audio) {
    switch (soundType) {
      case 'timer':
        if (!globalSettings.timerSoundEnabled) return;
        break;
      case 'reminder':
        if (!globalSettings.reminderSoundEnabled) return;
        break;
      case 'tick':
        if (!globalSettings.tickingSoundEnabled) return;
        break;
      case 'ambience':
        if (!globalSettings.ambienceSoundEnabled) return;
        break;
    }
    audio.currentTime = 0;
    audio.volume = globalSettings.masterVolume / 100;
    audio.play().catch(() => {});
  }
};
