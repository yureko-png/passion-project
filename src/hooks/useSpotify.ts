import { useState, useEffect, useCallback, useRef } from 'react';

const CLIENT_ID = '6ed72bf7ab63450580b46c4e6ab433e9';
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-top-read',
  'user-read-recently-played',
].join(' ');

const TOKEN_KEY = 'spotify-access-token';
const EXPIRY_KEY = 'spotify-token-expiry';
const VERIFIER_KEY = 'spotify-code-verifier';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  uri: string;
  preview_url: string | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SpotifyPlayerState {
  trackId: string | null;
  trackName: string;
  artistName: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
}

const generateCodeVerifier = () => {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string) => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const useSpotify = () => {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const exp = localStorage.getItem(EXPIRY_KEY);
    if (t && exp && Date.now() < parseInt(exp)) return t;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return null;
  });

  const [isConnected, setIsConnected] = useState(!!token);
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    trackId: null, trackName: '', artistName: '', albumArt: '',
    isPlaying: false, progress: 0, duration: 0, volume: 50,
  });
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const verifier = localStorage.getItem(VERIFIER_KEY);
      if (verifier) {
        exchangeToken(code, verifier);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const exchangeToken = async (code: string, verifier: string) => {
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        const expiry = Date.now() + data.expires_in * 1000;
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(EXPIRY_KEY, expiry.toString());
        localStorage.removeItem(VERIFIER_KEY);
        setToken(data.access_token);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Spotify token exchange failed:', err);
    }
  };

  const login = useCallback(async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setToken(null);
    setIsConnected(false);
    setDeviceId(null);
    player?.disconnect();
    setPlayer(null);
  }, [player]);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!token) return;

    if (document.getElementById('spotify-sdk')) {
      if ((window as any).Spotify) setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => setSdkReady(true);
  }, [token]);

  // Initialize player when SDK ready
  useEffect(() => {
    if (!sdkReady || !token || player) return;

    const SpotifyPlayer = (window as any).Spotify.Player;
    const p = new SpotifyPlayer({
      name: 'StudyQuest Player',
      getOAuthToken: (cb: (t: string) => void) => cb(token),
      volume: 0.5,
    });

    p.addListener('ready', ({ device_id }: { device_id: string }) => {
      setDeviceId(device_id);
    });

    p.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      const track = state.track_window.current_track;
      setPlayerState({
        trackId: track?.id || null,
        trackName: track?.name || '',
        artistName: track?.artists?.map((a: any) => a.name).join(', ') || '',
        albumArt: track?.album?.images?.[0]?.url || '',
        isPlaying: !state.paused,
        progress: state.position,
        duration: state.duration,
        volume: 50,
      });
    });

    p.connect();
    setPlayer(p);

    return () => {
      p.disconnect();
    };
  }, [sdkReady, token]);

  // Progress tracker
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (playerState.isPlaying) {
      progressInterval.current = setInterval(() => {
        setPlayerState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 1000, prev.duration),
        }));
      }, 1000);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [playerState.isPlaying]);

  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token) return null;
    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 204) return null;
    if (!res.ok) {
      if (res.status === 401) logout();
      return null;
    }
    return res.json();
  }, [token, logout]);

  const play = useCallback(async (uri?: string, contextUri?: string) => {
    if (!deviceId) return;
    const body: any = {};
    if (contextUri) {
      body.context_uri = contextUri;
      if (uri) body.offset = { uri };
    } else if (uri) {
      body.uris = [uri];
    }
    await apiFetch(`/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }, [deviceId, apiFetch]);

  const pause = useCallback(async () => {
    await player?.pause();
  }, [player]);

  const resume = useCallback(async () => {
    await player?.resume();
  }, [player]);

  const togglePlayback = useCallback(async () => {
    if (playerState.isPlaying) await pause();
    else await resume();
  }, [playerState.isPlaying, pause, resume]);

  const nextTrack = useCallback(async () => {
    await player?.nextTrack();
  }, [player]);

  const prevTrack = useCallback(async () => {
    await player?.previousTrack();
  }, [player]);

  const seek = useCallback(async (ms: number) => {
    await player?.seek(ms);
    setPlayerState(prev => ({ ...prev, progress: ms }));
  }, [player]);

  const setVolume = useCallback(async (vol: number) => {
    await player?.setVolume(vol / 100);
    setPlayerState(prev => ({ ...prev, volume: vol }));
  }, [player]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
      setSearchResults(data?.tracks?.items || []);
    } finally {
      setIsSearching(false);
    }
  }, [apiFetch]);

  const fetchPlaylists = useCallback(async () => {
    const data = await apiFetch('/me/playlists?limit=50');
    setPlaylists(data?.items || []);
  }, [apiFetch]);

  const fetchRecentTracks = useCallback(async () => {
    const data = await apiFetch('/me/player/recently-played?limit=20');
    setRecentTracks(data?.items?.map((i: any) => i.track) || []);
  }, [apiFetch]);

  const getPlaylistTracks = useCallback(async (playlistId: string) => {
    const data = await apiFetch(`/playlists/${playlistId}/tracks?limit=50`);
    return data?.items?.map((i: any) => i.track).filter(Boolean) || [];
  }, [apiFetch]);

  const saveTrack = useCallback(async (trackId: string) => {
    await apiFetch(`/me/tracks?ids=${trackId}`, { method: 'PUT' });
  }, [apiFetch]);

  const removeTrack = useCallback(async (trackId: string) => {
    await apiFetch(`/me/tracks?ids=${trackId}`, { method: 'DELETE' });
  }, [apiFetch]);

  const checkSaved = useCallback(async (trackIds: string[]) => {
    const data = await apiFetch(`/me/tracks/contains?ids=${trackIds.join(',')}`);
    return data || [];
  }, [apiFetch]);

  // Auto-fetch playlists and recent tracks when connected
  useEffect(() => {
    if (isConnected && token) {
      fetchPlaylists();
      fetchRecentTracks();
    }
  }, [isConnected, token]);

  return {
    isConnected,
    token,
    login,
    logout,
    deviceId,
    playerState,
    play,
    pause,
    resume,
    togglePlayback,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    search,
    searchResults,
    isSearching,
    playlists,
    recentTracks,
    fetchPlaylists,
    fetchRecentTracks,
    getPlaylistTracks,
    saveTrack,
    removeTrack,
    checkSaved,
  };
};
