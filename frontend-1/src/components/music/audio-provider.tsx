"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface SongItem {
  id: string;
  title: string;
  filename: string;
  url: string;
  duration?: number;
  format?: string;
}

export interface AudioContextValue {
  playlist: SongItem[];
  currentIndex: number;
  currentTrack: SongItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  selectTrack: (index: number) => void;
  refreshPlaylist: () => Promise<void>;
}

const DEFAULT_TRACK: SongItem = {
  id: "default_fallback",
  title: "Sakura Ambient Harmony",
  filename: "sakura.mp3",
  url: "/audio/sakura.mp3",
  duration: 214,
  format: "MP3",
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<SongItem[]>([DEFAULT_TRACK]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentIndex] || DEFAULT_TRACK;

  // Fetch playlist from server
  const refreshPlaylist = useCallback(async () => {
    try {
      const res = await fetch("/api/music");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.songs) && data.songs.length > 0) {
          setPlaylist(data.songs);
        }
      }
    } catch {
      // Fallback already in place
    }
  }, []);

  useEffect(() => {
    refreshPlaylist();
  }, [refreshPlaylist]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load new track when index or track changes
  const currentTrackUrl = currentTrack?.url;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackUrl) return;

    const currentSrc = audio.currentSrc || audio.src;
    const isSame =
      Boolean(currentSrc) &&
      (currentSrc.endsWith(currentTrackUrl) || currentSrc === currentTrackUrl);

    if (!isSame) {
      const wasPlaying = isPlaying;
      audio.src = currentTrackUrl;
      audio.load();
      setCurrentTime(0);
      setHasError(false);

      if (wasPlaying) {
        setIsLoading(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
            setHasError(true);
          });
      }
    }
  }, [currentIndex, currentTrackUrl, isPlaying]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if ((!audio.src || audio.src === "") && currentTrack?.url) {
        audio.src = currentTrack.url;
        audio.load();
      }
      setIsLoading(true);
      setHasError(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentTrack?.url]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextTrack = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const prevTrack = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const selectTrack = useCallback(
    (index: number) => {
      if (index >= 0 && index < playlist.length) {
        const audio = audioRef.current;
        const target = playlist[index];
        setCurrentIndex(index);
        if (audio && target) {
          audio.src = target.url;
          audio.load();
          setCurrentTime(0);
          setHasError(false);
          setIsLoading(true);
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
              setHasError(true);
            });
        }
      }
    },
    [playlist]
  );

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(time, audio.duration || 0));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Audio element events
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onEnded = () => {
    nextTrack();
  };

  const onError = () => {
    setHasError(true);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const onWaiting = () => {
    setIsLoading(true);
  };

  const onCanPlay = () => {
    setIsLoading(false);
  };

  return (
    <AudioContext.Provider
      value={{
        playlist,
        currentIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLoading,
        hasError,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        selectTrack,
        refreshPlaylist,
      }}
    >
      {/* Hidden single global audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onError={onError}
        onWaiting={onWaiting}
        onCanPlay={onCanPlay}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
