"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const GLYPHS = "ABCDEF0123456789!<>-_\\/[]{}—=+*^?#";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleOnMount?: boolean;
}

export function ScrambleText({
  text,
  className,
  scrambleOnMount = false,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const animatingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  const triggerScramble = useCallback(() => {
    // Check reduced motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;
    }

    if (animatingRef.current) return;
    animatingRef.current = true;

    const target = text;
    const duration = 650; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedLength = Math.floor(progress * target.length);

      let scrambled = "";
      for (let i = 0; i < target.length; i++) {
        if (target[i] === " ") {
          scrambled += " ";
        } else if (i < revealedLength) {
          scrambled += target[i];
        } else {
          scrambled += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(target);
        animatingRef.current = false;
      }
    };

    frameRef.current = requestAnimationFrame(update);
  }, [text]);

  useEffect(() => {
    if (scrambleOnMount) {
      triggerScramble();
    }
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scrambleOnMount, triggerScramble]);

  return (
    <span
      className={className}
      onMouseEnter={triggerScramble}
      onTouchStart={triggerScramble}
      aria-label={text}
      role="text"
    >
      {displayText}
    </span>
  );
}
