"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Send,
  Bot,
  User,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAudio } from "@/components/music/audio-provider";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What AI/ML models has Adithyen worked with?",
  "Tell me about the sub-200ms voice pipeline",
  "What is his full-stack engineering experience?",
  "How can I download his resume or contact him?",
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FloatingDock() {
  const {
    playlist,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading: isAudioLoading,
    hasError,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    selectTrack,
  } = useAudio();

  const reducedMotion = useReducedMotion();

  // Dock states: "idle" | "options" | "music" | "chat"
  const [isOpenOptions, setIsOpenOptions] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am Adithyen K's AI Portfolio Assistant. Ask me anything about his projects, experience, skills, or resume!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);

  const dockContainerRef = useRef<HTMLDivElement>(null);

  // Close options on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dockContainerRef.current &&
        !dockContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpenOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard escape handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isChatOpen) setIsChatOpen(false);
        else if (isMusicOpen) setIsMusicOpen(false);
        else if (isOpenOptions) setIsOpenOptions(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatOpen, isMusicOpen, isOpenOptions]);

  // Scroll chat messages to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Open music bar
  const handleOpenMusic = () => {
    setIsOpenOptions(false);
    setIsMusicOpen(true);
  };

  // Open chat panel (collapse music on mobile)
  const handleOpenChat = () => {
    setIsOpenOptions(false);
    setIsChatOpen(true);
    if (window.innerWidth < 768) {
      setIsMusicOpen(false);
    }
  };

  // Send message to AI
  const handleSendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isChatLoading) return;

    idCounter.current += 1;
    const userMsg: Message = {
      id: `usr-${idCounter.current}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Assistant response failed");

      const data = await res.json();
      idCounter.current += 1;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${idCounter.current}`,
          role: "assistant",
          content: data.content || "I could not find an answer to that question.",
        },
      ]);
    } catch {
      idCounter.current += 1;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${idCounter.current}`,
          role: "assistant",
          content:
            "I encountered a connection issue. You can explore [Projects](#projects) or connect directly via [Contact](#contact).",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Conversation history cleared. How can I help you explore Adithyen's portfolio?",
      },
    ]);
  };

  // Spring transition presets according to master specification
  const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  };

  // Format basic markdown links in chat
  const renderFormattedMarkdown = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const text = match[1];
        const href = match[2];
        const isAnchor = href.startsWith("#");
        return (
          <a
            key={index}
            href={href}
            onClick={() => {
              if (isAnchor) setIsChatOpen(false);
            }}
            className="text-accent hover:underline font-semibold"
            {...(!isAnchor ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {text}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Seek bar interaction
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={dockContainerRef}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end pb-[env(safe-area-inset-bottom)]"
      data-ui="floating-dock"
    >
      {/* 1. SATELLITE BUBBLE (Shown only when a song is playing and the music player bar is closed) */}
      <AnimatePresence>
        {isPlaying && !isMusicOpen && (
          <motion.button
            key="music-satellite"
            initial={{ opacity: 0, scale: 0.6, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 15 }}
            transition={springTransition}
            onClick={handleOpenMusic}
            aria-label="Open playing music bar"
            className="mb-3.5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-accent/40  text-accent hover:border-accent hover:scale-105 active:scale-95 transition-all group"
          >
            <Music className="w-3.5 h-3.5 animate-pulse text-accent" />
            <div className="flex items-end gap-[3px] h-3.5 px-0.5">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    "w-[2.5px] rounded-full bg-accent transition-all",
                    reducedMotion
                      ? "h-2"
                      : "animate-equalizer"
                  )}
                  style={{
                    animationDelay: `${bar * 120}ms`,
                    height: reducedMotion ? "8px" : undefined,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-foreground max-w-[100px] truncate tracking-tight">
              {currentTrack?.title || "Audio Playing"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. CHAT PANEL MODAL (Expands from dock) */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="dock-chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={springTransition}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-96 max-h-[75vh] flex flex-col bg-surface border border-border rounded-2xl  overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-surface border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-accent">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-none flex items-center gap-1.5 text-foreground">
                    Adithyen AI Assistant
                    <span className="text-[9px] py-0.5 px-1.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-medium">
                      Online
                    </span>
                  </h3>
                  <span className="text-[10px] text-muted font-mono">Portfolio Knowledge</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChatHistory}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {chatMessages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser
                          ? "bg-accent/20 text-accent border border-accent/40"
                          : "bg-surface-elevated border border-border text-accent"
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3 text-accent" /> : <Bot className="w-3 h-3 text-accent" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[84%] leading-relaxed ${
                        isUser
                          ? "bg-accent text-white rounded-tr-xs "
                          : "bg-surface-elevated border border-border text-foreground rounded-tl-xs whitespace-pre-wrap"
                      }`}
                    >
                      {renderFormattedMarkdown(m.content)}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-muted text-xs p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Suggested Chips */}
            {chatMessages.length <= 2 && (
              <div className="p-3 bg-background/50 border-t border-border/60 shrink-0">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Suggested Questions
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSendChatMessage(q)}
                      className="text-left text-[11px] text-muted hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:border-foreground/30 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{q}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage(chatInput);
              }}
              className="p-3 border-t border-border bg-surface flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about projects, skills, ML work..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 rounded-xl bg-foreground text-background hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0 "
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MUSIC BAR (Grows out of dock) */}
      <AnimatePresence>
        {isMusicOpen && (
          <motion.div
            key="dock-music-bar"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={springTransition}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-84 bg-surface/95  border border-border rounded-2xl  overflow-hidden flex flex-col"
          >
            {/* Main playback control row */}
            <div className="p-3 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                disabled={isAudioLoading}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 hover:bg-foreground/90 active:scale-95 transition-transform"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isAudioLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              {/* Title & Timeline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="truncate font-semibold text-xs text-foreground">
                    {currentTrack?.title || "Sakura Ambient Harmony"}
                  </div>
                  <span className="text-[10px] text-muted font-mono shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Seek Bar */}
                <div className="relative w-full h-1 bg-border-subtle rounded-full overflow-hidden group cursor-pointer">
                  <div
                    className="h-full bg-accent transition-all duration-100"
                    style={{ width: `${seekProgress}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    aria-label="Seek track position"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Action buttons: Prev, Next, Expand, Close */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={prevTrack}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextTrack}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Next track"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMusicExpanded((prev) => !prev)}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Toggle playlist & volume drawer"
                  aria-expanded={isMusicExpanded}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMusicOpen(false)}
                  className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-border-subtle transition-colors"
                  aria-label="Close music bar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Playlist & Volume Drawer */}
            <AnimatePresence>
              {isMusicExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/60 bg-background/50 px-3 py-2.5 space-y-2.5 overflow-hidden"
                >
                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-muted hover:text-foreground transition-colors p-1"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volume slider"
                      className="w-full accent-accent h-1 cursor-pointer"
                    />
                  </div>

                  {/* Playlist Items */}
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                    {playlist.map((track, idx) => {
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={track.id || idx}
                          type="button"
                          onClick={() => selectTrack(idx)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors",
                            isCurrent
                              ? "bg-accent/15 text-accent font-semibold"
                              : "hover:bg-surface text-muted hover:text-foreground"
                          )}
                        >
                          <span className="truncate pr-2">{track.title}</span>
                          <span className="text-[10px] opacity-60 font-mono shrink-0">
                            {track.duration ? formatTime(track.duration) : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SPRING-OUT POP-UP OPTIONS (Hover / Tap) */}
      <AnimatePresence>
        {isOpenOptions && !isMusicOpen && !isChatOpen && (
          <motion.div
            key="dock-options"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={springTransition}
            className="mb-3 flex flex-col items-end gap-2.5"
          >
            {/* Music Option */}
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 5 }}
              transition={{ delay: 0.04, ...springTransition }}
              onClick={handleOpenMusic}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-surface border border-border  hover:bg-surface-elevated hover:border-accent/40 active:scale-95 transition-all group"
              aria-label="Open Music Player"
            >
              <span className="text-xs font-semibold text-foreground tracking-tight">Music Player</span>
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Music className="w-4 h-4" />
              </div>
            </motion.button>

            {/* AI Option */}
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 5 }}
              transition={{ delay: 0.08, ...springTransition }}
              onClick={handleOpenChat}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-surface border border-border  hover:bg-surface-elevated hover:border-accent/40 active:scale-95 transition-all group"
              aria-label="Open AI Assistant"
            >
              <span className="text-xs font-semibold text-foreground tracking-tight">AI Assistant</span>
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN DOCK ROUND BUTTON (Bottom-Right) */}
      <button
        type="button"
        onClick={() => {
          if (isChatOpen) {
            setIsChatOpen(false);
          } else if (isMusicOpen) {
            setIsMusicOpen(false);
          } else {
            setIsOpenOptions((prev) => !prev);
          }
        }}
        onMouseEnter={() => {
          if (!isChatOpen && !isMusicOpen) {
            setIsOpenOptions(true);
          }
        }}
        aria-label={
          isChatOpen || isMusicOpen
            ? "Close floating dock"
            : isOpenOptions
              ? "Close dock options"
              : "Open dock options"
        }
        aria-expanded={isOpenOptions || isMusicOpen || isChatOpen}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center  border transition-all active:scale-95 group focus-visible:ring-2 focus-visible:ring-accent",
          isChatOpen || isMusicOpen || isOpenOptions
            ? "bg-surface border-accent text-accent"
            : "bg-foreground text-background border-border hover:bg-neutral-800 hover:scale-105"
        )}
      >
        {isChatOpen || isMusicOpen ? (
          <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <div className="relative">
            <Sparkles className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
}
