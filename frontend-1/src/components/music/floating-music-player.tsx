"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  ChevronUp,
  SkipForward,
  SkipBack,
  ListMusic,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SongItem {
  id: string;
  title: string;
  filename: string;
  url: string;
  duration?: number;
  format?: string;
}

const DEFAULT_FALLBACK_TRACK: SongItem = {
  id: "default_sakura",
  title: "Sakura Ambient Harmony",
  filename: "sakura.mp3",
  url: "/audio/sakura.mp3",
  duration: 214,
  format: "MP3",
};

export function FloatingMusicPlayer() {
  const [playlist, setPlaylist] = useState<SongItem[]>([DEFAULT_FALLBACK_TRACK]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentIndex] || DEFAULT_FALLBACK_TRACK;

  // Fetch public songs from /api/music
  useEffect(() => {
    let ignore = false;
    void (async () => {
      try {
        const res = await fetch("/api/music");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (Array.isArray(data.songs) && data.songs.length > 0) {
            setPlaylist(data.songs);
          }
        }
      } catch {
        // Retain fallback song on error
      } finally {
        if (!ignore) setIsLoadingPlaylist(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    audio.src = currentTrack.url;
    audio.load();
    setCurrentTime(0);
    setHasError(false);

    if (wasPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setHasError(true);
        });
    }
  }, [currentIndex, currentTrack.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup audio listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack.duration || 0);
      setHasError(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      // Move to next track automatically
      if (playlist.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [volume, playlist.length, currentTrack.duration]);

  // Toggle playback
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setHasError(true);
        });
    }
  }, [isPlaying]);

  // Next track
  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  // Previous track
  const handlePrevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  // Handle volume change
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const val = Number(e.target.value);
    setVolume(val);
    if (audio) {
      audio.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.7;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Format seconds -> mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="metadata"
      />

      {/* Floating container positioned at bottom right */}
      <div
        data-ui="music-player"
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none",
          isExpanded ? "max-w-sm w-[calc(100vw-2rem)] sm:w-88" : "w-auto"
        )}
      >
        {isExpanded ? (
          // Expanded Player
          <div className="bg-surface/95 backdrop-blur-xl rounded-2xl shadow-elevated p-4 animate-fade-in text-foreground">
            {/* Header with track info & collapse button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className={`w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 ${
                    isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                  }`}
                >
                  <Music className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    Track {currentIndex + 1} of {playlist.length} • {currentTrack.format || "Audio"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showPlaylist
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground hover:bg-border-subtle"
                  }`}
                  aria-label="Toggle playlist drawer"
                  title="Playlist"
                >
                  <ListMusic className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Collapse music player"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Playlist Drawer (When toggled) */}
            {showPlaylist && (
              <div className="mb-3 p-2 bg-border-subtle/40 rounded-xl border border-border max-h-36 overflow-y-auto space-y-1">
                <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] text-muted font-mono uppercase">
                  <span>Playlist ({playlist.length})</span>
                  {isLoadingPlaylist && <Loader2 className="w-3 h-3 animate-spin" />}
                </div>
                {playlist.map((song, idx) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                      if (audioRef.current) {
                        audioRef.current.src = song.url;
                        audioRef.current.play().catch(() => {});
                      }
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      idx === currentIndex
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-border-subtle text-foreground"
                    }`}
                  >
                    <span className="truncate max-w-[190px]">{song.title}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {song.duration ? formatTime(song.duration) : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Scrubber progress bar */}
            <div className="space-y-1 mb-3">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                aria-label="Audio progress slider"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls & Volume */}
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-14 sm:w-16 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                  aria-label="Volume slider"
                />
              </div>

              {/* Prev / Play / Next */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevTrack}
                  disabled={playlist.length <= 1}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors disabled:opacity-30"
                  aria-label="Previous track"
                  title="Previous song"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95 shadow-xs"
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  disabled={playlist.length <= 1}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors disabled:opacity-30"
                  aria-label="Next track"
                  title="Next song"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {hasError && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-destructive mt-2 text-center">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Audio source unavailable or failed to load.</span>
              </div>
            )}
          </div>
        ) : (
          // Collapsed Floating Pill
          <div className="flex items-center justify-between gap-3 bg-surface/95 backdrop-blur-md rounded-full px-4 py-2 shadow-card-hover transition-colors">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-left min-w-0"
              aria-label="Expand music player"
            >
              {/* Dynamic waveform visualizer bars when playing */}
              <div className="flex items-center gap-0.5 h-4 shrink-0">
                <span
                  className={`w-0.5 bg-foreground rounded-full transition-all duration-300 ${
                    isPlaying ? "h-3.5" : "h-1.5"
                  }`}
                />
                <span
                  className={`w-0.5 bg-accent rounded-full transition-all duration-300 ${
                    isPlaying ? "h-4" : "h-2"
                  }`}
                />
                <span
                  className={`w-0.5 bg-foreground rounded-full transition-all duration-300 ${
                    isPlaying ? "h-2.5" : "h-1"
                  }`}
                />
              </div>

              <div className="truncate">
                <span className="text-xs font-medium text-foreground block truncate">
                  {isPlaying ? currentTrack.title : "Music"}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-transform active:scale-95"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 text-muted hover:text-foreground"
                aria-label="Expand player"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
