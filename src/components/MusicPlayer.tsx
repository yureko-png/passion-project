import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  Music,
  ListMusic,
  Shuffle,
  Repeat,
  X,
} from 'lucide-react';

interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

const STORAGE_KEY = 'pomodoro-music-playlist';

const DEFAULT_TRACKS: Track[] = [
  { id: 'lofi-1', name: '☕ Lofi Study Beats', url: '' },
  { id: 'lofi-2', name: '🌧️ Rain & Piano', url: '' },
  { id: 'lofi-3', name: '🌸 Sakura Afternoon', url: '' },
];

const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Save tracks
  useEffect(() => {
    // Only save metadata, not base64 data (too large)
    const metadata = tracks.map(t => ({ id: t.id, name: t.name, url: t.url.startsWith('blob:') ? '' : t.url }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  }, [tracks]);

  // Audio progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [repeat, currentTrackIndex]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    if (shuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
  }, [tracks.length, shuffle]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
  }, [tracks.length]);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const newTrack: Track = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
        };
        setTracks(prev => [...prev, newTrack]);
      }
    });
  };

  const deleteTrack = (id: string) => {
    const idx = tracks.findIndex(t => t.id === id);
    if (idx === currentTrackIndex) {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
    setTracks(prev => prev.filter(t => t.id !== id));
    if (idx <= currentTrackIndex && currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack?.url || ''} preload="metadata" />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Main Player */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
        {/* Now Playing */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {currentTrack?.name || 'No track selected'}
            </p>
            <p className="text-white/50 text-xs">
              {tracks.length} track{tracks.length !== 1 ? 's' : ''} in playlist
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:text-white'}`}
          >
            <ListMusic className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/50 w-8 text-right">{formatTime(progress)}</span>
          <div
            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group"
            onClick={seekTo}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent relative"
              style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
          <span className="text-[10px] text-white/50 w-8">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-1.5 rounded-lg transition-colors ${shuffle ? 'text-primary' : 'text-white/40 hover:text-white/70'}`}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={prevTrack} className="p-1.5 text-white/70 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              disabled={tracks.length === 0}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center disabled:opacity-30"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" />
              )}
            </motion.button>
            <button onClick={nextTrack} className="p-1.5 text-white/70 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setRepeat(!repeat)}
              className={`p-1.5 rounded-lg transition-colors ${repeat ? 'text-primary' : 'text-white/40 hover:text-white/70'}`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white/50 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
            className="flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>

      {/* Playlist Panel */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-white text-sm font-medium">Playlist</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Add Music
              </motion.button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`max-h-48 overflow-y-auto ${dragOver ? 'bg-primary/10' : ''}`}
            >
              {tracks.length === 0 ? (
                <div className="p-6 text-center">
                  <Music className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">No tracks yet</p>
                  <p className="text-white/30 text-xs mt-1">Drop audio files here or click Add Music</p>
                </div>
              ) : (
                tracks.map((track, idx) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer group ${
                      idx === currentTrackIndex ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => playTrack(idx)}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      idx === currentTrackIndex && isPlaying ? 'bg-primary' : 'bg-white/10'
                    }`}>
                      {idx === currentTrackIndex && isPlaying ? (
                        <Pause className="w-3 h-3 text-white" />
                      ) : (
                        <Play className="w-3 h-3 text-white/60 ml-0.5" />
                      )}
                    </div>
                    <span className={`text-sm flex-1 truncate ${
                      idx === currentTrackIndex ? 'text-primary font-medium' : 'text-white/70'
                    }`}>
                      {track.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPlayer;