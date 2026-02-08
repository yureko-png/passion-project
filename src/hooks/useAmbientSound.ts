import { useState, useCallback, useRef, useEffect } from 'react';
import { ambientSounds, AmbientSound } from '@/data/akoPersonality';

interface AmbientSoundState {
  activeSound: AmbientSound | null;
  volume: number;
  isPlaying: boolean;
}

const STORAGE_KEY = 'ako-ambient-settings';

const loadSettings = (): { volume: number; lastSoundId: string | null } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load ambient settings:', e);
  }
  return { volume: 0.5, lastSoundId: null };
};

const saveSettings = (volume: number, soundId: string | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, lastSoundId: soundId }));
  } catch (e) {
    console.error('Failed to save ambient settings:', e);
  }
};

export const useAmbientSound = () => {
  const settings = loadSettings();
  const [state, setState] = useState<AmbientSoundState>({
    activeSound: null,
    volume: settings.volume,
    isPlaying: false,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number, duration: number = 1000) => {
    audio.volume = 0;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      }
    }, stepTime);
  }, []);

  const fadeOut = useCallback((audio: HTMLAudioElement, duration: number = 500): Promise<void> => {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const steps = 10;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        
        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          resolve();
        }
      }, stepTime);
    });
  }, []);

  const playSound = useCallback(async (sound: AmbientSound) => {
    // Stop current sound if playing
    if (audioRef.current) {
      await fadeOut(audioRef.current);
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play new audio
    const audio = new Audio(sound.url);
    audio.loop = true;
    audioRef.current = audio;

    try {
      await audio.play();
      fadeIn(audio, state.volume);
      
      setState(prev => ({
        ...prev,
        activeSound: sound,
        isPlaying: true,
      }));
      
      saveSettings(state.volume, sound.id);
    } catch (error) {
      console.error('Failed to play ambient sound:', error);
    }
  }, [state.volume, fadeIn, fadeOut]);

  const stopSound = useCallback(async () => {
    if (audioRef.current) {
      await fadeOut(audioRef.current);
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      activeSound: null,
      isPlaying: false,
    }));
    
    saveSettings(state.volume, null);
  }, [state.volume, fadeOut]);

  const toggleSound = useCallback(async (sound: AmbientSound) => {
    if (state.activeSound?.id === sound.id && state.isPlaying) {
      await stopSound();
    } else {
      await playSound(sound);
    }
  }, [state.activeSound, state.isPlaying, playSound, stopSound]);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    
    saveSettings(volume, state.activeSound?.id || null);
  }, [state.activeSound]);

  const pauseSound = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.isPlaying]);

  const resumeSound = useCallback(async () => {
    if (audioRef.current && !state.isPlaying) {
      try {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } catch (error) {
        console.error('Failed to resume ambient sound:', error);
      }
    }
  }, [state.isPlaying]);

  return {
    sounds: ambientSounds,
    activeSound: state.activeSound,
    volume: state.volume,
    isPlaying: state.isPlaying,
    playSound,
    stopSound,
    toggleSound,
    setVolume,
    pauseSound,
    resumeSound,
  };
};
