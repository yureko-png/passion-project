import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useAmbientSound } from '@/hooks/useAmbientSound';

interface AmbientSoundPanelProps {
  variant?: 'compact' | 'full';
}

const categoryLabels = {
  nature: '🌿 Nature',
  cafe: '☕ Café',
  white_noise: '📡 White Noise',
  asmr: '🎧 ASMR',
};

const AmbientSoundPanel = ({ variant = 'full' }: AmbientSoundPanelProps) => {
  const { sounds, activeSound, volume, isPlaying, toggleSound, setVolume } = useAmbientSound();

  const groupedSounds = sounds.reduce((acc, sound) => {
    if (!acc[sound.category]) {
      acc[sound.category] = [];
    }
    acc[sound.category].push(sound);
    return acc;
  }, {} as Record<string, typeof sounds>);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {sounds.slice(0, 4).map((sound) => (
            <motion.button
              key={sound.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSound(sound)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                activeSound?.id === sound.id && isPlaying
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title={sound.name}
            >
              {sound.icon}
            </motion.button>
          ))}
        </div>
        
        {activeSound && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-primary"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Ambient Sounds</h3>
        </div>
        {activeSound && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isPlaying ? (
              <Volume2 className="w-3 h-3 text-primary animate-pulse" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
            <span>{activeSound.name}</span>
          </div>
        )}
      </div>

      {/* Volume Control */}
      {activeSound && (
        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 accent-primary rounded-full"
          />
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Sound Grid by Category */}
      <div className="space-y-3">
        {Object.entries(groupedSounds).map(([category, categorySounds]) => (
          <div key={category}>
            <p className="text-xs text-muted-foreground mb-2">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {categorySounds.map((sound) => (
                <motion.button
                  key={sound.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSound(sound)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    activeSound?.id === sound.id && isPlaying
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-[10px] truncate w-full text-center">
                    {sound.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbientSoundPanel;
