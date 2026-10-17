"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function FloatingMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio volume and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
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
  }, [volume]);

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
        })
        .catch(() => {
          // Autoplay policy or interaction needed
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

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
      <audio ref={audioRef} src="/audio/sakura.mp3" preload="metadata" />

      {/* Floating container positioned at bottom right */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm w-[calc(100vw-3rem)] sm:w-80 select-none">
        {isExpanded ? (
          // Expanded Player
          <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-elevated p-4 animate-fade-in text-foreground">
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
                  <p className="text-xs font-semibold truncate">Sakura Ambient</p>
                  <p className="text-[11px] text-muted truncate">Adithyen K Audio</p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                aria-label="Collapse music player"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

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
                  className="w-16 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                  aria-label="Volume slider"
                />
              </div>

              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95 shadow-sm"
                aria-label={isPlaying ? "Pause music" : "Play music"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {hasError && (
              <p className="text-[10px] text-destructive mt-2 text-center">
                Audio source unavailable or failed to load.
              </p>
            )}
          </div>
        ) : (
          // Collapsed Floating Pill
          <div className="flex items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border border-border rounded-full px-3.5 py-2 shadow-card-hover hover:border-foreground/30 transition-all duration-200">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-left min-w-0"
              aria-label="Expand music player"
            >
              {/* Dynamic waveform visualizer bars when playing */}
              <div className="flex items-center gap-0.5 h-4 shrink-0">
                <span
                  className={`w-0.5 bg-foreground rounded-full transition-all ${
                    isPlaying ? "h-3.5 animate-pulse" : "h-1.5"
                  }`}
                />
                <span
                  className={`w-0.5 bg-accent rounded-full transition-all ${
                    isPlaying ? "h-4 animate-[pulse_0.7s_infinite]" : "h-2"
                  }`}
                />
                <span
                  className={`w-0.5 bg-foreground rounded-full transition-all ${
                    isPlaying ? "h-2.5 animate-[pulse_0.9s_infinite]" : "h-1"
                  }`}
                />
              </div>

              <div className="truncate">
                <span className="text-xs font-medium text-foreground block truncate">
                  {isPlaying ? "Sakura Ambient" : "Music"}
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
