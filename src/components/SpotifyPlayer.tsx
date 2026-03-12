import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Search, Heart, ListMusic, Music, LogIn, LogOut,
  Disc3, ChevronRight, Loader2, ExternalLink,
} from 'lucide-react';
import { useSpotify, SpotifyTrack, SpotifyPlaylist } from '@/hooks/useSpotify';

interface SpotifyPlayerProps {
  variant?: 'full' | 'compact' | 'mini';
}

const SpotifyPlayer = ({ variant = 'full' }: SpotifyPlayerProps) => {
  const {
    isConnected, login, logout, deviceId,
    playerState, play, togglePlayback, nextTrack, prevTrack,
    seek, setVolume, search, searchResults, isSearching,
    playlists, recentTracks, getPlaylistTracks,
    saveTrack, removeTrack, checkSaved,
  } = useSpotify();

  const [activeTab, setActiveTab] = useState<'search' | 'playlists' | 'recent'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQueue, setShowQueue] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<SpotifyPlaylist | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [localVolume, setLocalVolume] = useState(50);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(q), 400);
  }, [search]);

  const handlePlayTrack = (track: SpotifyTrack) => {
    play(track.uri);
  };

  const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
    setActivePlaylist(playlist);
    const tracks = await getPlaylistTracks(playlist.id);
    setPlaylistTracks(tracks);
    play(undefined, `spotify:playlist:${playlist.id}`);
  };

  const handleOpenPlaylistTracks = async (playlist: SpotifyPlaylist) => {
    setActivePlaylist(playlist);
    const tracks = await getPlaylistTracks(playlist.id);
    setPlaylistTracks(tracks);
  };

  const toggleLike = async (trackId: string) => {
    if (savedMap[trackId]) {
      await removeTrack(trackId);
      setSavedMap(prev => ({ ...prev, [trackId]: false }));
    } else {
      await saveTrack(trackId);
      setSavedMap(prev => ({ ...prev, [trackId]: true }));
    }
  };

  // Check saved status for visible tracks
  useEffect(() => {
    const tracks = activeTab === 'search' ? searchResults : activeTab === 'recent' ? recentTracks : playlistTracks;
    const ids = tracks.map(t => t.id).filter(id => savedMap[id] === undefined);
    if (ids.length > 0 && isConnected) {
      checkSaved(ids.slice(0, 50)).then(results => {
        const map: Record<string, boolean> = {};
        ids.slice(0, 50).forEach((id, i) => { map[id] = results[i]; });
        setSavedMap(prev => ({ ...prev, ...map }));
      });
    }
  }, [searchResults, recentTracks, playlistTracks, activeTab, isConnected]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.floor(pct * playerState.duration));
  };

  const handleVolume = (val: number) => {
    setLocalVolume(val);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const progressPct = playerState.duration ? (playerState.progress / playerState.duration) * 100 : 0;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-b from-[#282828] to-[#181818] rounded-2xl border border-white/5 p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#1db954] mx-auto flex items-center justify-center">
            <Music className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Connect to Spotify</h3>
            <p className="text-[#b3b3b3] text-sm mt-1">
              Stream music directly from your Spotify account
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={login}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-[#1db954] text-black font-bold text-sm hover:bg-[#1ed760] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login with Spotify
          </motion.button>
        </div>
      </div>
    );
  }

  // Mini variant — just a bar
  if (variant === 'mini') {
    return (
      <div className="bg-[#181818] rounded-xl border border-white/5 px-3 py-2 flex items-center gap-3">
        {playerState.albumArt ? (
          <img src={playerState.albumArt} className="w-8 h-8 rounded" alt="" />
        ) : (
          <div className="w-8 h-8 rounded bg-[#282828] flex items-center justify-center">
            <Disc3 className="w-4 h-4 text-[#b3b3b3]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{playerState.trackName || 'Not playing'}</p>
          <p className="text-[#b3b3b3] text-[10px] truncate">{playerState.artistName}</p>
        </div>
        <button onClick={togglePlayback} className="text-white p-1">
          {playerState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-b from-[#282828] to-[#181818] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          {playerState.albumArt ? (
            <img src={playerState.albumArt} className="w-12 h-12 rounded-lg shadow-lg" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1db954]/30 to-[#191414] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-[#1db954]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{playerState.trackName || 'Spotify'}</p>
            <p className="text-[#b3b3b3] text-xs truncate">{playerState.artistName || 'Connect & play'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevTrack} className="text-[#b3b3b3] hover:text-white"><SkipBack className="w-4 h-4" /></button>
            <button onClick={togglePlayback} className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              {playerState.isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-[#b3b3b3] hover:text-white"><SkipForward className="w-4 h-4" /></button>
          </div>
        </div>
        {/* Mini progress */}
        <div className="px-4 pb-3">
          <div className="h-1 bg-[#4d4d4d] rounded-full cursor-pointer" onClick={handleSeek}>
            <div className="h-full rounded-full bg-[#1db954]" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="w-full">
      {/* Now Playing Card */}
      <div className="bg-gradient-to-b from-[#282828] to-[#181818] rounded-2xl border border-white/5 overflow-hidden">
        {/* Album Art & Info */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-4">
            {playerState.albumArt ? (
              <motion.img
                key={playerState.trackId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={playerState.albumArt}
                className="w-14 h-14 rounded-xl shadow-lg"
                alt=""
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1db954]/40 to-[#191414] flex items-center justify-center shadow-lg">
                <Disc3 className="w-7 h-7 text-[#1db954]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {playerState.trackName || 'No track playing'}
              </p>
              <p className="text-[#b3b3b3] text-xs truncate">
                {playerState.artistName || 'Search or pick a playlist'}
              </p>
            </div>
            {playerState.trackId && (
              <button
                onClick={() => toggleLike(playerState.trackId!)}
                className={`p-2 transition-colors ${savedMap[playerState.trackId] ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
              >
                <Heart className={`w-4 h-4 ${savedMap[playerState.trackId] ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 flex items-center gap-2">
          <span className="text-[10px] text-[#b3b3b3] w-8 text-right tabular-nums">{formatMs(playerState.progress)}</span>
          <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group" onClick={handleSeek}>
            <div className="h-full rounded-full bg-white group-hover:bg-[#1db954] transition-colors relative" style={{ width: `${progressPct}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[10px] text-[#b3b3b3] w-8 tabular-nums">{formatMs(playerState.duration)}</span>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex items-center justify-center gap-5">
          <button onClick={prevTrack} className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={togglePlayback}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {playerState.isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
          </motion.button>
          <button onClick={nextTrack} className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume & Queue */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button onClick={() => { setIsMuted(!isMuted); setVolume(isMuted ? localVolume : 0); }} className="text-[#b3b3b3] hover:text-white transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range" min="0" max="100" step="1"
              value={isMuted ? 0 : localVolume}
              onChange={(e) => handleVolume(parseInt(e.target.value))}
              className="w-24 h-1 appearance-none bg-[#4d4d4d] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-lg transition-colors ${showQueue ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
            >
              <ListMusic className="w-4 h-4" />
            </motion.button>
            <button onClick={logout} className="p-2 text-[#b3b3b3] hover:text-red-400 transition-colors" title="Disconnect Spotify">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!deviceId && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting to Spotify player...
            </div>
          </div>
        )}
      </div>

      {/* Browse Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-[#181818] rounded-2xl border border-white/5 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {(['search', 'playlists', 'recent'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActivePlaylist(null); }}
                  className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                    activeTab === tab ? 'text-[#1db954] border-b-2 border-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            {activeTab === 'search' && (
              <div>
                <div className="p-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#282828] rounded-lg">
                    <Search className="w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search songs, artists..."
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-[#535353] focus:outline-none"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 text-[#1db954] animate-spin" />}
                  </div>
                </div>
                <TrackList tracks={searchResults} onPlay={handlePlayTrack} savedMap={savedMap} onToggleLike={toggleLike} currentTrackId={playerState.trackId} isPlaying={playerState.isPlaying} />
              </div>
            )}

            {/* Playlists */}
            {activeTab === 'playlists' && !activePlaylist && (
              <div className="max-h-60 overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="text-[#535353] text-sm text-center py-8">No playlists found</p>
                ) : (
                  playlists.map(pl => (
                    <div
                      key={pl.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => handleOpenPlaylistTracks(pl)}
                    >
                      {pl.images?.[0] ? (
                        <img src={pl.images[0].url} className="w-10 h-10 rounded" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center"><Music className="w-5 h-5 text-[#535353]" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{pl.name}</p>
                        <p className="text-[#b3b3b3] text-[10px]">{pl.tracks.total} tracks</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlayPlaylist(pl); }}
                        className="p-2 rounded-full bg-[#1db954] text-black opacity-0 group-hover:opacity-100 hover:bg-[#1ed760] transition-all"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-[#535353]" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Playlist tracks */}
            {activeTab === 'playlists' && activePlaylist && (
              <div>
                <div className="p-3 border-b border-white/5 flex items-center gap-2">
                  <button onClick={() => setActivePlaylist(null)} className="text-[#b3b3b3] hover:text-white text-xs">← Back</button>
                  <span className="text-white text-sm font-semibold truncate">{activePlaylist.name}</span>
                  <button
                    onClick={() => handlePlayPlaylist(activePlaylist)}
                    className="ml-auto px-3 py-1 rounded-full bg-[#1db954] text-black text-xs font-bold hover:bg-[#1ed760]"
                  >
                    Play All
                  </button>
                </div>
                <TrackList tracks={playlistTracks} onPlay={handlePlayTrack} savedMap={savedMap} onToggleLike={toggleLike} currentTrackId={playerState.trackId} isPlaying={playerState.isPlaying} />
              </div>
            )}

            {/* Recent */}
            {activeTab === 'recent' && (
              <TrackList tracks={recentTracks} onPlay={handlePlayTrack} savedMap={savedMap} onToggleLike={toggleLike} currentTrackId={playerState.trackId} isPlaying={playerState.isPlaying} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable track list
const TrackList = ({
  tracks, onPlay, savedMap, onToggleLike, currentTrackId, isPlaying,
}: {
  tracks: SpotifyTrack[];
  onPlay: (t: SpotifyTrack) => void;
  savedMap: Record<string, boolean>;
  onToggleLike: (id: string) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
}) => (
  <div className="max-h-60 overflow-y-auto">
    {tracks.length === 0 ? (
      <p className="text-[#535353] text-sm text-center py-8">No tracks</p>
    ) : (
      tracks.map((track, idx) => (
        <div
          key={`${track.id}-${idx}`}
          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer group transition-colors"
          onClick={() => onPlay(track)}
        >
          {track.album.images?.[0] ? (
            <img src={track.album.images[track.album.images.length - 1]?.url} className="w-10 h-10 rounded" alt="" />
          ) : (
            <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center"><Music className="w-4 h-4 text-[#535353]" /></div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm truncate ${track.id === currentTrackId ? 'text-[#1db954] font-medium' : 'text-white'}`}>
              {track.name}
            </p>
            <p className="text-[10px] text-[#b3b3b3] truncate">
              {track.artists.map(a => a.name).join(', ')}
            </p>
          </div>
          <span className="text-[10px] text-[#535353] tabular-nums">
            {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLike(track.id); }}
            className={`p-1 transition-colors ${savedMap[track.id] ? 'text-[#1db954]' : 'text-[#535353] opacity-0 group-hover:opacity-100 hover:text-white'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedMap[track.id] ? 'fill-current' : ''}`} />
          </button>
        </div>
      ))
    )}
  </div>
);

export default SpotifyPlayer;
