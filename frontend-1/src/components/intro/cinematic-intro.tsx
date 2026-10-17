"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { getProfile, getProjects } from "@/lib/content";

interface StatusStep {
  id: string;
  label: string;
  status: "idle" | "running" | "done" | "ready";
  detail?: string;
}

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [lettersSettled, setLettersSettled] = useState(false);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    { id: "init", label: "INITIALIZING EXPERIENCE", status: "running" },
    { id: "profile", label: "LOADING PROFILE", status: "idle" },
    { id: "projects", label: "FETCHING PROJECTS", status: "idle" },
    { id: "interactions", label: "PREPARING INTERACTIONS", status: "idle" },
  ]);
  const [canEnter, setCanEnter] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check reduced motion and session storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = sessionStorage.getItem("adithyen_portfolio_intro_seen");
    if (seen === "true") {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setIsReducedMotion(true);
      }
      setSessionChecked(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Execute real loading steps
  useEffect(() => {
    if (!sessionChecked) return;

    let isMounted = true;

    async function executeRealChecks() {
      // Step 1: Environment & CSS 3D check
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "init" ? { ...s, status: "done" } : s))
      );
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "profile" ? { ...s, status: "running" } : s))
      );

      // Step 2: Real Profile data verification
      await new Promise((resolve) => setTimeout(resolve, 300));
      const profile = getProfile();
      if (!isMounted) return;
      if (profile && profile.name) {
        setStatusSteps((prev) =>
          prev.map((s) => (s.id === "profile" ? { ...s, status: "done" } : s))
        );
      }
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "projects" ? { ...s, status: "running" } : s))
      );

      // Step 3: Real Projects data verification
      await new Promise((resolve) => setTimeout(resolve, 320));
      const projects = getProjects();
      if (!isMounted) return;
      if (projects && projects.length > 0) {
        setStatusSteps((prev) =>
          prev.map((s) => (s.id === "projects" ? { ...s, status: "done" } : s))
        );
      }
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "interactions" ? { ...s, status: "running" } : s))
      );

      // Step 4: Real Document & Fonts readiness check
      try {
        if ("fonts" in document) {
          await document.fonts.ready;
        }
      } catch {
        // Fallback gracefully if fonts API is unavailable
      }

      await new Promise((resolve) => setTimeout(resolve, 280));
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "interactions" ? { ...s, status: "done" } : s))
      );
      setCanEnter(true);
    }

    executeRealChecks();

    return () => {
      isMounted = false;
    };
  }, [sessionChecked]);

  // Handle finish
  const handleProceed = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("adithyen_portfolio_intro_seen", "true");
    }
    onComplete();
  }, [onComplete]);

  // Keyboard shortcut: Space or Enter to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        handleProceed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleProceed]);

  if (!sessionChecked) {
    return null;
  }

  // Words for the 3D block name
  const firstName = "ADITHYEN".split("");
  const lastName = "K".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#F8F8F6] text-foreground p-6 sm:p-12 md:p-16 select-none overflow-hidden"
    >
      {/* Top Header info */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-muted tracking-wider uppercase">
            Interactive Experience / v1.0
          </span>
        </div>

        <button
          onClick={handleProceed}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono text-muted hover:text-foreground hover:border-foreground/30 transition-all duration-200"
          aria-label="Skip introduction"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Center-Left 3D Block Letter Area */}
      <div className="w-full max-w-7xl mx-auto my-auto py-10 perspective-1200">
        <div className="max-w-4xl text-left">
          {/* Subtitle pre-badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-border-subtle border border-border text-xs font-mono text-muted"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>PORTFOLIO INITIALIZATION</span>
          </motion.div>

          {/* 3D Block Name Display */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
            {/* First Name Blocks */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {firstName.map((char, index) => (
                <motion.div
                  key={`first-${index}`}
                  initial={
                    isReducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          rotateX: -110,
                          rotateY: 25,
                          y: -70,
                          z: -120,
                          scale: 0.7,
                        }
                  }
                  animate={{
                    opacity: 1,
                    rotateX: 0,
                    rotateY: 0,
                    y: 0,
                    z: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15 + index * 0.07,
                    ease: [0.2, 0.9, 0.3, 1.1],
                  }}
                  onAnimationComplete={() => {
                    if (index === firstName.length - 1) {
                      setLettersSettled(true);
                    }
                  }}
                  className="letter-3d-block w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 bg-gradient-to-b from-[#FFFFFF] to-[#ECECE8] rounded-xl border border-[#D5D5CF] text-foreground font-bold text-2xl sm:text-4xl md:text-5xl flex items-center justify-center cursor-default"
                >
                  <span className="drop-shadow-sm">{char}</span>
                </motion.div>
              ))}
            </div>

            {/* Last Name Blocks */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {lastName.map((char, index) => (
                <motion.div
                  key={`last-${index}`}
                  initial={
                    isReducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          rotateX: -110,
                          rotateY: -25,
                          y: -70,
                          z: -120,
                          scale: 0.7,
                        }
                  }
                  animate={{
                    opacity: 1,
                    rotateX: 0,
                    rotateY: 0,
                    y: 0,
                    z: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15 + (firstName.length + index) * 0.07,
                    ease: [0.2, 0.9, 0.3, 1.1],
                  }}
                  className="letter-3d-block w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 bg-gradient-to-b from-[#FFFFFF] to-[#ECECE8] rounded-xl border border-[#D5D5CF] text-foreground font-bold text-2xl sm:text-4xl md:text-5xl flex items-center justify-center cursor-default"
                >
                  <span className="drop-shadow-sm">{char}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Developer subtitle revealed after letters settle */}
          <AnimatePresence>
            {lettersSettled && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-6 sm:mt-8 space-y-2"
              >
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-foreground tracking-tight">
                  AI/ML Engineer & Full-Stack Developer
                </p>
                <p className="text-sm sm:text-base text-muted max-w-xl">
                  Building intelligent computer vision systems, low-latency LLM voice
                  architectures, and high-performance modern web applications.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Loading Status & Enter Action */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pt-4 border-t border-border/80">
        {/* Terminal Status Panel */}
        <div className="bg-[#1C1C1E] text-[#E5E5EA] rounded-xl p-4 sm:p-5 w-full md:max-w-xl font-mono text-xs shadow-lg border border-neutral-800">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800 text-neutral-400">
            <TerminalIcon className="w-3.5 h-3.5 text-accent" />
            <span className="uppercase tracking-wider font-semibold">System Diagnostics</span>
          </div>

          <div className="space-y-1.5">
            {statusSteps.map((step) => {
              const dotsCount = Math.max(2, 28 - step.label.length);
              const dots = ".".repeat(dotsCount);

              return (
                <div key={step.id} className="flex items-center justify-between">
                  <span className="text-neutral-300">
                    {step.label} {dots}
                  </span>
                  <span
                    className={`font-semibold ml-2 ${
                      step.status === "done"
                        ? "text-emerald-400"
                        : step.status === "running"
                        ? "text-amber-400 animate-pulse"
                        : "text-neutral-600"
                    }`}
                  >
                    {step.status === "done"
                      ? "DONE"
                      : step.status === "running"
                      ? "IN PROGRESS"
                      : "WAITING"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enter Button or Status Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
          <AnimatePresence>
            {canEnter && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-medium text-sm shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98]"
              >
                <span>Enter Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
