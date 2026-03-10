import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Upload, Trash2, Music, ListMusic, Shuffle, Repeat, Heart,
} from 'lucide-react';

interface Track {
  id: string;
  name: string;
  url: string;
  artist?: string;
}

const STORAGE_KEY = 'pomodoro-music-playlist';

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
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  // Store blob URLs mapped by track id so they persist across renders
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Save track metadata (not blob URLs)
  useEffect(() => {
    const metadata = tracks.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artist || '',
      url: '', // Don't persist blob URLs
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  }, [tracks]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!isNaN(audio.duration)) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeat, currentTrackIndex, isPlaying]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // When track changes, load and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const url = currentTrack.url || blobUrlsRef.current.get(currentTrack.id) || '';
    if (url) {
      audio.src = url;
      audio.load();
    }
  }, [currentTrackIndex, currentTrack?.id]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const url = currentTrack.url || blobUrlsRef.current.get(currentTrack.id) || '';
    if (!url) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = url;
        audio.load();
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const playable = tracks.filter(t => t.url || blobUrlsRef.current.has(t.id));
    if (playable.length === 0) return;

    if (shuffle) {
      const idx = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(idx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  }, [tracks, shuffle]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
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
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        blobUrlsRef.current.set(id, url);
        const newTrack: Track = {
          id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url, // Set the url on the track object too
          artist: 'Local File',
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
    // Revoke blob URL
    const blobUrl = blobUrlsRef.current.get(id);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrlsRef.current.delete(id);
    }
    setTracks(prev => prev.filter(t => t.id !== id));
    if (idx <= currentTrackIndex && currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
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

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio ref={audioRef} preload="metadata" />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Spotify-like Player */}
      <div className="bg-gradient-to-b from-[#282828] to-[#181818] rounded-2xl border border-white/5 overflow-hidden">
        {/* Album Art & Info */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {currentTrack?.name || 'No track selected'}
              </p>
              <p className="text-[#b3b3b3] text-xs truncate">
                {currentTrack?.artist || 'Upload music to start'}
              </p>
            </div>
            <button
              onClick={() => currentTrack && setLiked(prev => {
                const next = new Set(prev);
                next.has(currentTrack.id) ? next.delete(currentTrack.id) : next.add(currentTrack.id);
                return next;
              })}
              className={`p-2 transition-colors ${currentTrack && liked.has(currentTrack.id) ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${currentTrack && liked.has(currentTrack.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 flex items-center gap-2">
          <span className="text-[10px] text-[#b3b3b3] w-8 text-right tabular-nums">{formatTime(progress)}</span>
          <div
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group relative"
            onClick={seekTo}
          >
            <div
              className="h-full rounded-full bg-white group-hover:bg-[#1db954] transition-colors relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[10px] text-[#b3b3b3] w-8 tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`p-1.5 transition-colors ${shuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <button onClick={prevTrack} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              disabled={tracks.length === 0}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" />
              )}
            </motion.button>
            <button onClick={nextTrack} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setRepeat(!repeat)}
            className={`p-1.5 transition-colors ${repeat ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Playlist Toggle */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
              className="w-24 h-1 appearance-none bg-[#4d4d4d] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <ListMusic className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Playlist Panel */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-[#181818] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">Queue</span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1db954] text-black text-xs font-bold hover:bg-[#1ed760] transition-colors"
              >
                <Upload className="w-3 h-3" />
                Add Music
              </motion.button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`max-h-48 overflow-y-auto ${dragOver ? 'bg-[#1db954]/10' : ''}`}
            >
              {tracks.length === 0 ? (
                <div className="p-8 text-center">
                  <Music className="w-8 h-8 text-[#535353] mx-auto mb-2" />
                  <p className="text-[#b3b3b3] text-sm font-medium">No tracks yet</p>
                  <p className="text-[#535353] text-xs mt-1">Drop audio files here or click Add Music</p>
                </div>
              ) : (
                tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer group transition-colors hover:bg-white/5 ${
                      idx === currentTrackIndex ? 'bg-white/10' : ''
                    }`}
                    onClick={() => playTrack(idx)}
                  >
                    <span className="w-5 text-right text-xs text-[#b3b3b3] tabular-nums">
                      {idx === currentTrackIndex && isPlaying ? (
                        <span className="text-[#1db954] text-lg">♫</span>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${idx === currentTrackIndex ? 'text-[#1db954] font-medium' : 'text-white'}`}>
                        {track.name}
                      </p>
                      <p className="text-[10px] text-[#b3b3b3] truncate">{track.artist || 'Local File'}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
