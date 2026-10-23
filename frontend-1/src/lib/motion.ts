import type { Transition, Variants } from "motion/react";

/**
 * Standard spring configuration according to the Master Project Brief
 * "Spring around stiffness 400, damping 30"
 */
export const defaultSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 20,
};

/**
 * Master easing curve matching CSS variable --ease-out-expo
 */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const defaultEaseTransition: Transition = {
  duration: 0.56,
  ease: easeOutExpo,
};

export const fastEaseTransition: Transition = {
  duration: 0.25,
  ease: easeOutExpo,
};

/**
 * Reusable motion variants for consistent layout animations
 */
export const fadeInUpVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: defaultEaseTransition,
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: fastEaseTransition,
  },
};

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: defaultEaseTransition,
  },
  exit: {
    opacity: 0,
    transition: fastEaseTransition,
  },
};

export const scaleUpVariants: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: defaultSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 16,
    transition: gentleSpring,
  },
};

export const popOverVariants: Variants = {
  initial: { opacity: 0, scale: 0.85, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: defaultSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 10,
    transition: gentleSpring,
  },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};
