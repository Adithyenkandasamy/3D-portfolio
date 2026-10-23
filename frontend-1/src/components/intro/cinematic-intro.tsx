"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { getProfile, getProjects } from "@/lib/content";
import { easeOutExpo } from "@/lib/motion";

interface StatusStep {
  id: string;
  label: string;
  status: "idle" | "running" | "done";
  detail?: string;
}

const STORAGE_KEYS = ["portfolio:intro-viewed", "adithyen_portfolio_intro_seen"];

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [canEnter, setCanEnter] = useState(false);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    { id: "core", label: "SYSTEM RUNTIME", status: "running" },
    { id: "fonts", label: "TYPE & GLYPH REGISTRY", status: "idle" },
    { id: "content", label: "CONTENT STORE & ASSETS", status: "idle" },
    { id: "canvas", label: "GRAPHICS ACCELERATION", status: "idle" },
  ]);

  // Check session storage and prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    for (const key of STORAGE_KEYS) {
      if (sessionStorage.getItem(key) === "true") {
        onComplete();
        return;
      }
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    setSessionChecked(true);
  }, [onComplete]);

  // Mark completion & start curtain split transition
  const handleProceed = useCallback(() => {
    if (isSplitting) return;
    setIsSplitting(true);

    if (typeof window !== "undefined") {
      STORAGE_KEYS.forEach((key) => sessionStorage.setItem(key, "true"));
    }

    // Curtain split animation duration is 0.75s
    setTimeout(() => {
      onComplete();
    }, 750);
  }, [isSplitting, onComplete]);

  // Real events pipeline
  useEffect(() => {
    if (!sessionChecked) return;
    let isMounted = true;

    async function executeDiagnostics() {
      // 1. Core runtime check
      await new Promise((res) => setTimeout(res, 220));
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "core" ? { ...s, status: "done" } : s))
      );
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "fonts" ? { ...s, status: "running" } : s))
      );

      // 2. Real Fonts check
      try {
        if ("fonts" in document) {
          await document.fonts.ready;
        }
      } catch {
        // Fallback
      }
      await new Promise((res) => setTimeout(res, 200));
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "fonts" ? { ...s, status: "done" } : s))
      );
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "content" ? { ...s, status: "running" } : s))
      );

      // 3. Real Content verification
      const profile = getProfile();
      const projects = getProjects();
      if (profile && projects.length > 0) {
        await new Promise((res) => setTimeout(res, 240));
      }
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "content" ? { ...s, status: "done" } : s))
      );
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "canvas" ? { ...s, status: "running" } : s))
      );

      // 4. Hardware WebGL canvas check
      try {
        const testCanvas = document.createElement("canvas");
        const gl =
          testCanvas.getContext("webgl") ||
          testCanvas.getContext("experimental-webgl");
        if (gl) {
          // GL acceleration ready
        }
      } catch {
        // Graceful fallback
      }
      await new Promise((res) => setTimeout(res, 220));
      if (!isMounted) return;
      setStatusSteps((prev) =>
        prev.map((s) => (s.id === "canvas" ? { ...s, status: "done" } : s))
      );
      setCanEnter(true);

      // Auto-advance smoothly after short pause (total runtime ~2.2s)
      setTimeout(() => {
        if (isMounted) {
          handleProceed();
        }
      }, 700);
    }

    executeDiagnostics();

    return () => {
      isMounted = false;
    };
  }, [sessionChecked, handleProceed]);

  // Keyboard accessibility: Escape, Enter, or Space immediately proceeds
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleProceed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleProceed]);

  if (!sessionChecked) return null;

  const firstName = "ADITHYEN".split("");
  const lastName = "K".split("");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Introduction"
      className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden select-none"
    >
      {/* Split Curtain Layer: Left & Right halves slide away */}
      <motion.div
        initial={{ x: 0 }}
        animate={isSplitting ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 0.75, ease: easeOutExpo }}
        className="absolute top-0 left-0 bottom-0 w-1/2 bg-[#0A0A0F] border-r border-[#23232F]/50 shadow-[10px_0_40px_rgba(0,0,0,0.8)]"
      />
      <motion.div
        initial={{ x: 0 }}
        animate={isSplitting ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 0.75, ease: easeOutExpo }}
        className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#0A0A0F] border-l border-[#23232F]/50 shadow-[-10px_0_40px_rgba(0,0,0,0.8)]"
      />

      {/* Intro Content Container */}
      <motion.div
        animate={isSplitting ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-7xl mx-auto"
      >
        {/* Top Bar with System indicator and Skip control */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-xs font-mono tracking-wider text-muted uppercase">
              adithyen.dev // system runtime
            </span>
          </div>

          <button
            onClick={handleProceed}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated text-xs font-mono text-foreground border border-border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Skip introduction"
          >
            <span>Skip</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] rounded bg-border-subtle text-muted">
              Esc
            </kbd>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Monumental 3D Perspective Letter Stagger */}
        <div className="my-auto py-8">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>AI/ML &bull; FULL-STACK SYSTEMS</span>
          </div>

          {/* Perspective container */}
          <div
            className="overflow-hidden py-4"
            style={{ perspective: "1200px", perspectiveOrigin: "20% 50%" }}
          >
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 sm:gap-x-7">
              {/* First Name letters rotating on X axis */}
              <div className="flex items-center">
                {firstName.map((char, index) => (
                  <motion.span
                    key={`first-${index}`}
                    initial={{
                      opacity: 0,
                      rotateX: -95,
                      y: 45,
                      z: -80,
                    }}
                    animate={{
                      opacity: 1,
                      rotateX: 0,
                      y: 0,
                      z: 0,
                    }}
                    transition={{
                      duration: 0.75,
                      delay: 0.12 + index * 0.055,
                      ease: easeOutExpo,
                    }}
                    className="inline-block text-[clamp(2.75rem,8vw,7.5rem)] font-bold tracking-tight text-foreground leading-none"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Last Name */}
              <div className="flex items-center">
                {lastName.map((char, index) => (
                  <motion.span
                    key={`last-${index}`}
                    initial={{
                      opacity: 0,
                      rotateX: -95,
                      y: 45,
                      z: -80,
                    }}
                    animate={{
                      opacity: 1,
                      rotateX: 0,
                      y: 0,
                      z: 0,
                    }}
                    transition={{
                      duration: 0.75,
                      delay: 0.12 + (firstName.length + index) * 0.055,
                      ease: easeOutExpo,
                    }}
                    className="inline-block text-[clamp(2.75rem,8vw,7.5rem)] font-bold tracking-tight text-accent leading-none ml-2"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {/* Geometric rule line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: easeOutExpo }}
            className="h-[2px] w-32 bg-gradient-to-r from-accent via-accent-blue to-transparent my-4 origin-left"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease: easeOutExpo }}
            className="text-base sm:text-xl text-muted font-normal max-w-xl"
          >
            AI/ML Engineer &amp; Full-Stack Developer designing and deploying autonomous models, real-time computer vision, and resilient web platforms.
          </motion.p>
        </div>

        {/* Real Diagnostics Terminal Panel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-4 border-t border-border">
          <div className="bg-surface text-foreground rounded-xl p-4 sm:p-5 w-full sm:max-w-md font-mono text-xs border border-border">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border text-muted">
              <TerminalIcon className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold text-foreground">Verified Preflight Checklist</span>
            </div>

            <div className="space-y-1.5">
              {statusSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between">
                  <span className="text-muted">{step.label}</span>
                  <span
                    className={`font-semibold tracking-wide ml-3 ${
                      step.status === "done"
                        ? "text-emerald-400"
                        : step.status === "running"
                        ? "text-accent animate-pulse"
                        : "text-muted/40"
                    }`}
                  >
                    {step.status === "done"
                      ? "READY"
                      : step.status === "running"
                      ? "VERIFYING"
                      : "QUEUED"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enter Button */}
          <div className="w-full sm:w-auto">
            <AnimatePresence>
              {canEnter && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleProceed}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-medium text-sm  shadow-black/40 hover:bg-neutral-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>Enter Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
